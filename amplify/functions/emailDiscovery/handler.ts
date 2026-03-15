import type { APIGatewayProxyHandler } from 'aws-lambda';

const SERPAPI_KEY = process.env.SERPAPI_KEY!;
const EMAIL_REGEX = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

// ─── Step 1: Get company domain ───────────────────────────────────────────────
async function getCompanyDomain(company: string): Promise<string> {
  const query = `${company} official website`;
  const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${SERPAPI_KEY}&num=1`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.organic_results?.length) {
    throw new Error(`Could not find domain for company: ${company}`);
  }

  const firstUrl = data.organic_results[0].link;
  const domain = new URL(firstUrl).hostname.replace('www.', '');
  return domain; // e.g. "stripe.com"
}

// ─── Step 2: Find HR/careers pages via SerpApi ────────────────────────────────
async function findHRPages(domain: string): Promise<string[]> {
  const queries = [
    `site:${domain} careers email`,
    `site:${domain} hr contact`,
    `site:${domain} jobs hiring contact`,
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
      console.log(`Search failed for query: ${q}`, err);
    }
  }

  // Also hardcode common paths as fallback
  const commonPaths = ['careers', 'jobs', 'contact', 'about', 'hire'];
  commonPaths.forEach(path => urls.add(`https://${domain}/${path}`));

  return [...urls];
}

// ─── Step 3: Crawl pages and extract emails ───────────────────────────────────
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

    } catch (err) {
      console.log(`Failed to crawl: ${url}`);
      // Don't crash — skip this URL
    }
  }

  return [...allEmails];
}

// ─── Step 4: Filter HR emails using basic keywords ───────────────────────────
// (You can replace this with a Claude/Bedrock LLM call later)
function filterHREmails(emails: string[]): string[] {
  const hrKeywords = ['hr', 'careers', 'jobs', 'recruit', 'hiring', 'talent', 'people'];
  const spamDomains = ['example.com', 'test.com', 'sentry.io', 'w3.org'];

  return emails.filter(email => {
    // Remove obviously bad emails
    if (spamDomains.some(d => email.includes(d))) return false;
    if (email.includes('noreply') || email.includes('no-reply')) return false;

    // Keep if it matches HR keywords
    return hrKeywords.some(keyword => email.includes(keyword));
  });
}

// ─── Main Lambda Handler ──────────────────────────────────────────────────────
export const handler: APIGatewayProxyHandler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Content-Type': 'application/json',
  };

  // Handle preflight
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

    // Run the pipeline
    const domain = await getCompanyDomain(company);
    console.log(`Domain found: ${domain}`);

    const pages = await findHRPages(domain);
    console.log(`Pages to crawl: ${pages.length}`);

    const rawEmails = await crawlAndExtract(pages);
    console.log(`Raw emails found: ${rawEmails.length}`);

    const filteredEmails = filterHREmails(rawEmails);
    console.log(`Filtered HR emails: ${filteredEmails.length}`);

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