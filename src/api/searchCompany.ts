// src/api/searchCompany.ts
import outputs from '../../amplify_outputs.json';

export async function searchCompany(company: string) {
    const outputsAny = outputs as any;
    const endpoint = outputsAny.custom.apiEndpoint;

  const res = await fetch(`${endpoint}search-company`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ company }),
  });

  return res.json();
}