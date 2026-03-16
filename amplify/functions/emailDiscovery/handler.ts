import type { APIGatewayProxyHandler } from 'aws-lambda';

const SERPAPI_KEY = process.env.SERPAPI_KEY!;
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

  const fallback = new URL(data.organic_results[0].link).hostname.replace('www.', '');
  return fallback;
}

// ─── Step 2: Find HR/careers pages ─────────────────────────────────────────
async function findHRPages(domain: string): Promise<string[]> {
  const queries = [
    `site:${domain} careers email`,
    `site:${domain} hr contact`,
    `site:${domain} jobs hiring`,
    `site:${domain} recruiting`,
    `"${domain}" hr email contact`,
  ];

  const commonPaths = [
    'careers', 'jobs', 'contact', 'about', 'hire',
    'about-us', 'contact-us', 'work-with-us', 'join-us',
    'team', 'company', 'recruiting',
  ];

  const urls = new Set<string>();

  for (const q of queries) {
    try {
      const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(q)}&api_key=${SERPAPI_KEY}&num=5`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.organic_results) {
        data.organic_results.forEach((r: any) => urls.add(r.link));
      }
    } catch (err) {
      console.log(`Search failed: ${q}`);
    }
  }

  commonPaths.forEach(path => urls.add(`https://${domain}/${path}`));
  return [...urls];
}

// ─── Step 3: Crawl and extract emails ────────────────────────────────────────
async function crawlAndExtract(urls: string[]): Promise<string[]> {
  const allEmails = new Set<string>();

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) continue;

      const html = await res.text();
      const matches = html.match(EMAIL_REGEX) || [];
      matches.forEach(email => allEmails.add(email.toLowerCase()));
    } catch {
      // Skip failed URLs silently
    }
  }

  return [...allEmails];
}

// ─── Step 4: Filter HR emails ────────────────────────────────────────────────
function filterHREmails(emails: string[], domain: string): string[] {
  const hrKeywords = [
    'hr', 'careers', 'jobs', 'recruit', 'hiring', 'talent',
    'people', 'apply', 'work', 'join', 'team', 'staffing',
    'employment', 'humanresource', 'resume', 'cv',
  ];

  const spamPatterns = [
    'noreply', 'no-reply', 'example.com', 'test.com',
    'sentry.io', 'w3.org', 'schema.org', 'googleapis.com',
    '.png', '.jpg', '.svg',
  ];

  const cleaned = emails.filter(email => {
    if (spamPatterns.some(p => email.includes(p))) return false;
    if (!email.includes('@')) return false;
    return true;
  });

  const hrEmails = cleaned.filter(email =>
    hrKeywords.some(keyword => email.includes(keyword))
  );

  const domainEmails = cleaned.filter(email =>
    email.includes(domain) && !hrEmails.includes(email)
  );

  return [...new Set([...hrEmails, ...domainEmails])].slice(0, 10);
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

    const domain = await getCompanyDomain(company);
    console.log(`Domain: ${domain}`);

    const pages = await findHRPages(domain);
    console.log(`Pages to crawl: ${pages.length}`);

    const rawEmails = await crawlAndExtract(pages);
    console.log(`Raw emails: ${rawEmails.length}`);

    const filteredEmails = filterHREmails(rawEmails, domain);
    console.log(`Filtered emails: ${filteredEmails.length}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        company,
        domain,
        emails: filteredEmails,
        total: filteredEmails.length,
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