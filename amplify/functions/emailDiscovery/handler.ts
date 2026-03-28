import type { APIGatewayProxyHandler } from 'aws-lambda';
import * as net from 'net';
import * as dns from 'dns/promises';

const SERPAPI_KEY = process.env.SERPAPI_KEY!;
const EMAIL_REGEX = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

const HR_KEYWORDS = ['hr', 'careers', 'jobs', 'recruit', 'hiring', 'talent', 'people', 'apply', 'join', 'staffing', 'workforce'];

const NON_HR_ROLES = [
  'press', 'media', 'news', 'legal', 'finance', 'billing', 'sales',
  'support', 'help', 'info', 'hello', 'contact', 'admin', 'security',
  'privacy', 'abuse', 'copyright', 'investor', 'ir@', 'pr@',
];

const SPAM_PATTERNS = ['noreply', 'no-reply', 'donotreply', 'bounce', 'mailer', 'daemon'];

// ─── Step 1: Get company domain ───────────────────────────────────────────────
async function getCompanyDomain(company: string): Promise<string> {
  const query = `${company} official site`;
  const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${SERPAPI_KEY}&num=5`;

  const res = await fetch(url);
  const data = await res.json();
  if (!data.organic_results?.length) throw new Error(`Could not find domain for: ${company}`);

  const companyLower = company.toLowerCase().replace(/\s+/g, '');
  for (const result of data.organic_results) {
    try {
      const domain = new URL(result.link).hostname.replace('www.', '');
      const domainRoot = domain.split('.')[0].toLowerCase();
      if (domainRoot.includes(companyLower) || companyLower.includes(domainRoot)) return domain;
    } catch {}
  }
  return new URL(data.organic_results[0].link).hostname.replace('www.', '');
}

// ─── Step 2: HR-targeted search ───────────────────────────────────────────────
async function searchHREmails(company: string, domain: string): Promise<{ urls: string[]; emails: string[] }> {
  const queries = [
    `"@${domain}" recruiter OR "talent acquisition" OR "hr manager" email`,
    `${company} recruiter email site:linkedin.com OR site:apollo.io OR site:rocketreach.co`,
    `"${domain}" "hr@" OR "careers@" OR "recruit@" OR "talent@" OR "hiring@" OR "jobs@"`,
  ];

  const urls = new Set<string>();
  const emails = new Set<string>();

  await Promise.all(queries.map(async (query) => {
    try {
      const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${SERPAPI_KEY}&num=10`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.organic_results) {
        data.organic_results.forEach((r: any) => {
          if (r.link && !r.link.includes('linkedin.com') && !r.link.includes('apollo.io')) {
            urls.add(r.link);
          }
          const text = `${r.snippet || ''} ${r.title || ''} ${r.displayed_link || ''}`;
          const matches = text.match(EMAIL_REGEX) || [];
          matches.forEach((e: string) => {
            const clean = e.toLowerCase();
            if (clean.endsWith(`@${domain}`) && isValidEmail(clean)) emails.add(clean);
          });
        });
      }

      if (data.related_questions) {
        data.related_questions.forEach((q: any) => {
          const text = (q.list || []).join(' ') + (q.snippet || '');
          const matches = text.match(EMAIL_REGEX) || [];
          matches.forEach((e: string) => {
            const clean = e.toLowerCase();
            if (clean.endsWith(`@${domain}`) && isValidEmail(clean)) emails.add(clean);
          });
        });
      }
    } catch {
      console.log(`Query failed: ${query}`);
    }
  }));

  return { urls: [...urls], emails: [...emails] };
}

// ─── Step 3: Careers page search ──────────────────────────────────────────────
async function searchCareersPage(company: string, domain: string): Promise<{ urls: string[]; emails: string[] }> {
  const queries = [
    `site:${domain} careers jobs "apply" "email" OR "contact"`,
    `${company} "hr email" OR "careers email" OR "recruiting email" -site:${domain}`,
  ];

  const urls = new Set<string>();
  const emails = new Set<string>();

  await Promise.all(queries.map(async (query) => {
    try {
      const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${SERPAPI_KEY}&num=8`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.organic_results) {
        data.organic_results.forEach((r: any) => {
          if (r.link) urls.add(r.link);
          const text = `${r.snippet || ''} ${r.title || ''}`;
          const matches = text.match(EMAIL_REGEX) || [];
          matches.forEach((e: string) => {
            const clean = e.toLowerCase();
            if (clean.endsWith(`@${domain}`) && isValidEmail(clean)) emails.add(clean);
          });
        });
      }
    } catch {
      console.log(`Careers query failed: ${query}`);
    }
  }));

  return { urls: [...urls], emails: [...emails] };
}

// ─── Step 4: Crawl pages ──────────────────────────────────────────────────────
async function crawlAndExtract(urls: string[], domain: string): Promise<string[]> {
  const allEmails = new Set<string>();

  const prioritised = [
    ...urls.filter(u => /career|job|recruit|hr|people|talent|hiring/i.test(u)),
    ...urls.filter(u => !/career|job|recruit|hr|people|talent|hiring/i.test(u)),
  ];

  await Promise.all(prioritised.slice(0, 6).map(async (url) => {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(3500),
      });
      if (!res.ok) return;

      const html = await res.text();
      (html.match(EMAIL_REGEX) || []).forEach(email => {
        const clean = email.toLowerCase();
        if (clean.endsWith(`@${domain}`) && isValidEmail(clean)) allEmails.add(clean);
      });
    } catch {}
  }));

  return [...allEmails];
}

// ─── Step 5: Filter and rank ──────────────────────────────────────────────────
function filterAndRankEmails(emails: string[], domain: string): string[] {
  const valid = emails.filter(e =>
    isValidEmail(e) &&
    e.endsWith(`@${domain}`) &&
    !SPAM_PATTERNS.some(p => e.includes(p)) &&
    !NON_HR_ROLES.some(p => e.startsWith(p) || e.includes(`${p}@`))
  );

  const tier1 = valid.filter(e => {
    const local = e.split('@')[0];
    return HR_KEYWORDS.some(k => local === k || local.startsWith(k) || local.endsWith(k));
  });

  const tier2 = valid.filter(e => !tier1.includes(e));

  return [...new Set([...tier1, ...tier2])].slice(0, 10);
}

// ─── Step 5b: HR permutation fallback ────────────────────────────────────────
function generateHRPermutations(domain: string): string[] {
  const prefixes = [
    'hr', 'careers', 'jobs', 'recruit', 'recruiting', 'recruitment',
    'talent', 'hiring', 'people', 'join', 'apply',
    'hr-team', 'talent-acquisition', 'people-team',
  ];
  return prefixes.map(p => `${p}@${domain}`);
}

// ─── Step 6: SMTP Verify ──────────────────────────────────────────────────────
async function getMxHost(domain: string): Promise<string | null> {
  try {
    const records = await dns.resolveMx(domain);
    if (!records?.length) return null;
    records.sort((a, b) => a.priority - b.priority);
    return records[0].exchange;
  } catch { return null; }
}

function isCatchAllMx(mxHost: string): boolean {
  const catchAllProviders = [
    'google.com', 'googlemail.com', 'outlook.com', 'hotmail.com',
    'office365.com', 'protection.outlook.com', 'microsoft.com',
    'yahoodns.net', 'mimecast.com', 'pphosted.com', 'proofpoint.com',
  ];
  return catchAllProviders.some(p => mxHost.toLowerCase().includes(p));
}

function trySmtpPort(email: string, mxHost: string, port: number): Promise<'valid' | 'invalid' | 'blocked'> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => { socket.destroy(); resolve('blocked'); }, 4000);

    const socket = net.createConnection(port, mxHost);
    let stage = 0;
    let buffer = '';
    let gotBanner = false;

    socket.on('data', (data) => {
      buffer += data.toString();
      const lines = buffer.split('\r\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (stage === 0 && line.startsWith('220')) {
          gotBanner = true;
          socket.write(`EHLO cruitor.com\r\n`);
          stage = 1;
        } else if (stage === 1 && line.startsWith('250')) {
          socket.write(`MAIL FROM:<verify@cruitor.com>\r\n`);
          stage = 2;
        } else if (stage === 2 && line.startsWith('250')) {
          socket.write(`RCPT TO:<${email}>\r\n`);
          stage = 3;
        } else if (stage === 3) {
          clearTimeout(timeout);
          socket.write('QUIT\r\n');
          socket.destroy();
          if (line.startsWith('250') || line.startsWith('251')) resolve('valid');
          else if (line.startsWith('550') || line.startsWith('551') || line.startsWith('553')) resolve('invalid');
          else resolve('valid');
        }
      }
    });

    socket.on('error', (err: any) => {
      clearTimeout(timeout);
      resolve(err.code === 'ECONNREFUSED' || !gotBanner ? 'blocked' : 'valid');
    });

    socket.on('timeout', () => { clearTimeout(timeout); socket.destroy(); resolve('blocked'); });
  });
}

async function verifyEmails(emails: string[], domain: string): Promise<{ verified: string[]; smtpVerified: boolean }> {
  const mxHost = await getMxHost(domain);

  if (!mxHost) {
    console.log('No MX record — skipping SMTP');
    return { verified: emails, smtpVerified: false };
  }

  if (isCatchAllMx(mxHost)) {
    console.log(`Catch-all MX detected (${mxHost}) — skipping SMTP, trusting filter`);
    return { verified: emails, smtpVerified: false };
  }

  const probe25 = await trySmtpPort(emails[0], mxHost, 25);
  const probe587 = probe25 === 'blocked' ? await trySmtpPort(emails[0], mxHost, 587) : probe25;

  if (probe25 === 'blocked' && probe587 === 'blocked') {
    console.log('Both SMTP ports blocked — skipping verification');
    return { verified: emails, smtpVerified: false };
  }

  const port = probe25 !== 'blocked' ? 25 : 587;
  console.log(`Using port ${port} for SMTP verification`);

  const results = await Promise.allSettled(
    emails.map(async (email) => {
      const result = await trySmtpPort(email, mxHost, port);
      console.log(`SMTP ${email}: ${result}`);
      return { email, valid: result !== 'invalid' };
    })
  );

  const verified = results
    .filter(r => r.status === 'fulfilled' && r.value.valid)
    .map(r => (r as PromiseFulfilledResult<{ email: string; valid: boolean }>).value.email);

  return { verified, smtpVerified: true };
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

// ─── Main Handler ─────────────────────────────────────────────────────────────
export const handler: APIGatewayProxyHandler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  try {
    const body = JSON.parse(event.body || '{}');
    const { company } = body;
    if (!company) return { statusCode: 400, headers, body: JSON.stringify({ error: 'company name is required' }) };

    console.log(`Searching: ${company}`);

    // Step 1 — domain
    const domain = await getCompanyDomain(company);
    console.log(`Domain: ${domain}`);

    // Step 2 — HR-targeted search
    const { urls: hrUrls, emails: hrEmails } = await searchHREmails(company, domain);
    console.log(`HR search: ${hrEmails.length} emails, ${hrUrls.length} URLs`);

    // Step 3 — careers search if HR found < 2
    let extraUrls: string[] = [];
    let extraEmails: string[] = [];
    if (hrEmails.length < 2) {
      const careers = await searchCareersPage(company, domain);
      extraUrls = careers.urls;
      extraEmails = careers.emails;
      console.log(`Careers search: ${extraEmails.length} emails, ${extraUrls.length} URLs`);
    }

    // Step 4 — crawl pages
    const allUrls = [...new Set([...hrUrls, ...extraUrls])];
    const crawledEmails = await crawlAndExtract(allUrls, domain);
    console.log(`Crawled: ${crawledEmails.length}`);

    // Step 5 — merge, filter, rank
    const allEmails = [...new Set([...hrEmails, ...extraEmails, ...crawledEmails])];
    let finalEmails = filterAndRankEmails(allEmails, domain);
    console.log(`After filter: ${finalEmails.length}`);

    // Step 5b — permutation fallback if nothing found
    if (finalEmails.length === 0) {
      console.log('No emails found — using HR permutations as fallback');
      finalEmails = generateHRPermutations(domain);
      console.log(`Generated ${finalEmails.length} permutations`);
    }

    // Step 6 — SMTP verify
    const { verified, smtpVerified } = await verifyEmails(finalEmails, domain);
    console.log(`Final: ${verified.length} (smtpVerified: ${smtpVerified})`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        company,
        domain,
        emails: verified,
        total: verified.length,
        smtpVerified,
      }),
    };

  } catch (err: any) {
    console.error('Lambda error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};