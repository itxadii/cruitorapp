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

  return new URL(data.organic_results[0].link).hostname.replace('www.', '');
}

// ─── Step 2: Smart targeted search ───────────────────────────────────────────
async function findTargetedPages(company: string, domain: string): Promise<string[]> {
  // These specific queries find pages most likely to have real emails
  const queries = [
    `"${domain}" "hr@" OR "careers@" OR "jobs@" OR "recruit@" OR "talent@"`,
    `site:${domain} "email" "hr" OR "careers" OR "recruiting"`,
  ];

  const urls = new Set<string>();

  for (const q of queries) {
    try {
      const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(q)}&api_key=${SERPAPI_KEY}&num=5`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.organic_results) {
        data.organic_results.forEach((r: any) => {
          urls.add(r.link);
          // Also extract emails directly from snippets
        });
      }

      // ← Extract emails directly from search snippets (no crawling needed!)
      if (data.organic_results) {
        data.organic_results.forEach((r: any) => {
          const text = `${r.snippet || ''} ${r.title || ''}`;
          const matches = text.match(EMAIL_REGEX) || [];
          matches.forEach(e => urls.add(`__email__${e.toLowerCase()}`));
        });
      }

    } catch {
      console.log(`Search failed: ${q}`);
    }
  }

  return [...urls];
}

// ─── Step 3: Crawl pages ──────────────────────────────────────────────────────
async function crawlAndExtract(urls: string[], domain: string): Promise<string[]> {
  const allEmails = new Set<string>();

  // First extract pre-found emails from search snippets
  const pageUrls = urls.filter(u => {
    if (u.startsWith('__email__')) {
      const email = u.replace('__email__', '');
      if (isValidEmail(email)) allEmails.add(email);
      return false;
    }
    return true;
  });

  // Then crawl actual pages
  const crawlPromises = pageUrls.slice(0, 8).map(async (url) => {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        signal: AbortSignal.timeout(3000),
      });

      if (!res.ok) return;

      const html = await res.text();
      const matches = html.match(EMAIL_REGEX) || [];

      matches.forEach(email => {
        const clean = email.toLowerCase();
        if (clean.endsWith(`@${domain}`) && isValidEmail(clean)) {
          allEmails.add(clean);
        }
      });
    } catch {
      // skip
    }
  });

  // Run all crawls in parallel
  await Promise.all(crawlPromises);

  return [...allEmails];
}

// ─── Step 4: Also search for emails in SerpApi snippets directly ──────────────
async function searchEmailsInSnippets(company: string, domain: string): Promise<string[]> {
  const queries = [
    `${company} careers email address contact hr`,
  ];

  const emails = new Set<string>();

  for (const q of queries) {
    try {
      const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(q)}&api_key=${SERPAPI_KEY}&num=10`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.organic_results) {
        data.organic_results.forEach((r: any) => {
          const text = `${r.snippet || ''} ${r.title || ''} ${r.displayed_link || ''}`;
          const matches = text.match(EMAIL_REGEX) || [];
          matches.forEach( (e: string) => {
            const clean = e.toLowerCase();
            if (clean.includes(domain) && isValidEmail(clean)) {
              emails.add(clean);
            }
          });
        });
      }

      // Check related questions too
      if (data.related_questions) {
        data.related_questions.forEach((q: any) => {
          const text = (q.list || []).join(' ') + (q.snippet || '');
          const matches = text.match(EMAIL_REGEX) || [];
          matches.forEach( (e: string) => {
            const clean = e.toLowerCase();
            if (clean.includes(domain) && isValidEmail(clean)) {
              emails.add(clean);
            }
          });
        });
      }

    } catch {
      console.log(`Snippet search failed: ${q}`);
    }
  }

  return [...emails];
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

function filterAndRankEmails(emails: string[], domain: string): string[] {
  const hrKeywords = [
    'hr', 'careers', 'jobs', 'recruit', 'hiring', 'talent',
    'people', 'apply', 'join', 'team', 'staffing', 'workforce',
  ];

  const spamPatterns = [
    'noreply', 'no-reply', 'donotreply',
    'bounce', 'mailer', 'daemon',
  ];

  const valid = emails.filter(e =>
    isValidEmail(e) &&
    e.includes(domain) &&
    !spamPatterns.some(p => e.includes(p))
  );

  // HR emails first, then everything else
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

    // Step 2 — run all searches in parallel
    const [targetedUrls, snippetEmails] = await Promise.all([
      findTargetedPages(company, domain),
      searchEmailsInSnippets(company, domain),
    ]);

    console.log(`Targeted URLs: ${targetedUrls.length}, Snippet emails: ${snippetEmails.length}`);

    // Step 3 — crawl pages in parallel
    const crawledEmails = await crawlAndExtract(targetedUrls, domain);
    console.log(`Crawled emails: ${crawledEmails.length}`);

    // Step 4 — merge all sources
    const allEmails = [...new Set([...snippetEmails, ...crawledEmails])];
    console.log(`Total before filter: ${allEmails.length}`);

    // Step 5 — filter and rank
    const finalEmails = filterAndRankEmails(allEmails, domain);
    console.log(`Final emails: ${finalEmails.length}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        company,
        domain,
        emails: finalEmails,
        total: finalEmails.length,
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