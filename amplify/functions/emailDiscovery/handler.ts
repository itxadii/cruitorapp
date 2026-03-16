import type { APIGatewayProxyHandler } from 'aws-lambda';

const SERPAPI_KEY = process.env.SERPAPI_KEY!;
const SNOV_CLIENT_ID = process.env.SNOV_CLIENT_ID!;
const SNOV_CLIENT_SECRET = process.env.SNOV_CLIENT_SECRET!;
const EMAIL_REGEX = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

// ─── Step 1: Get company domain ───────────────────────────────────────────────
async function getCompanyDomain(company: string): Promise<string> {
  const query = `${company} official site`;
  const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${SERPAPI_KEY}&num=5`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.organic_results?.length) {
    throw new Error(`Could not find domain for: ${company}`);
  }

  const companyLower = company.toLowerCase();

  for (const result of data.organic_results) {
    try {
      const domain = new URL(result.link).hostname.replace('www.', '');
      const domainRoot = domain.split('.')[0].toLowerCase();
      if (domainRoot.includes(companyLower) || companyLower.includes(domainRoot)) {
        return domain;
      }
    } catch {}
  }

  return new URL(data.organic_results[0].link).hostname.replace('www.', '');
}

// ─── Step 2a: Snov.io get access token ───────────────────────────────────────
async function getSnovToken(): Promise<string> {
  const res = await fetch('https://api.snov.io/v1/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: SNOV_CLIENT_ID,
      client_secret: SNOV_CLIENT_SECRET,
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('Failed to get Snov token');
  return data.access_token;
}

// ─── Step 2b: Snov.io domain search (primary) ────────────────────────────────
async function searchSnov(domain: string): Promise<string[]> {
  try {
    const token = await getSnovToken();

    const res = await fetch('https://api.snov.io/v1/get-emails-from-domain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: token,
        domain: domain,
        type: 'all',
        limit: 10,
      }),
    });

    const data = await res.json();
    console.log('Snov response:', JSON.stringify(data));

    if (!data.emails?.length) return [];

    return data.emails
      .filter((e: any) => e.email)
      .map((e: any) => e.email.toLowerCase() as string);

  } catch (err) {
    console.log('Snov failed:', err);
    return [];
  }
}

// ─── Step 3a: Find HR pages via SerpApi (fallback) ───────────────────────────
async function findHRPages(domain: string): Promise<string[]> {
  const queries = [
    `site:${domain} careers email`,
    `site:${domain} hr contact`,
  ];

  const commonPaths = ['careers', 'jobs', 'contact', 'about'];
  const urls = new Set<string>();

  for (const q of queries) {
    try {
      const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(q)}&api_key=${SERPAPI_KEY}&num=5`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.organic_results) {
        data.organic_results.forEach((r: any) => urls.add(r.link));
      }
    } catch {
      console.log(`Search failed: ${q}`);
    }
  }

  commonPaths.forEach(path => urls.add(`https://${domain}/${path}`));
  return [...urls];
}

// ─── Step 3b: Crawl and extract emails (fallback) ────────────────────────────
async function crawlAndExtract(urls: string[], domain: string): Promise<string[]> {
  const allEmails = new Set<string>();

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        signal: AbortSignal.timeout(3000),
      });

      if (!res.ok) continue;

      const html = await res.text();
      const matches = html.match(EMAIL_REGEX) || [];

      matches.forEach(email => {
        const clean = email.toLowerCase();
        if (clean.includes(domain) && isValidEmail(clean)) {
          allEmails.add(clean);
        }
      });
    } catch {
      // skip failed URLs
    }
  }

  return [...allEmails];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isValidEmail(email: string): boolean {
  if (email.includes('%')) return false;
  if (email.length > 100) return false;
  if (email.startsWith('.') || email.endsWith('.')) return false;
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  if (parts[0].length < 1 || parts[1].length < 3) return false;
  return true;
}

function filterHREmails(emails: string[], domain: string): string[] {
  const hrKeywords = [
    'hr', 'careers', 'jobs', 'recruit', 'hiring', 'talent',
    'people', 'apply', 'work', 'join', 'team',
  ];

  const spamPatterns = ['noreply', 'no-reply'];

  const valid = emails.filter(e =>
    isValidEmail(e) &&
    e.includes(domain) &&
    !spamPatterns.some(p => e.includes(p))
  );

  const hrEmails = valid.filter(e => hrKeywords.some(k => e.includes(k)));
  const otherEmails = valid.filter(e => !hrEmails.includes(e));

  return [...new Set([...hrEmails, ...otherEmails])].slice(0, 10);
}

// ─── Main Handler ─────────────────────────────────────────────────────────────
export const handler: APIGatewayProxyHandler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { company } = body;

    if (!company) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'company name is required' }),
      };
    }

    console.log(`Searching emails for: ${company}`);

    // Step 1 — get domain
    const domain = await getCompanyDomain(company);
    console.log(`Domain: ${domain}`);

    // Step 2 — try Snov.io first
    let emails = await searchSnov(domain);
    console.log(`Snov found: ${emails.length} emails`);

    // Step 3 — fall back to crawler if Snov returns < 3
    if (emails.length < 3) {
      console.log('Falling back to crawler...');
      const pages = await findHRPages(domain);
      const crawled = await crawlAndExtract(pages, domain);
      const crawlerEmails = filterHREmails(crawled, domain);
      emails = [...new Set([...emails, ...crawlerEmails])];
      console.log(`After crawler: ${emails.length} emails`);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        company,
        domain,
        emails: emails.slice(0, 10),
        total: Math.min(emails.length, 10),
      }),
    };

  } catch (err: any) {
    console.error('Lambda error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};