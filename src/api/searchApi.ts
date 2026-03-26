// src/api/searchApi.ts

export async function searchCompanyEmails(companyName: string): Promise<string[]> {
  const maxRetries = 3;
  let attempt = 0;

  const attemptFetch = async (): Promise<string[]> => {
    try {
      const response = await fetch('https://y3u1vnxxki.execute-api.ap-south-1.amazonaws.com/prod/search-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: companyName }),
        signal: AbortSignal.timeout(28000) 
      });

      if (response.status === 504 || !response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.emails || [];
    } catch (error) {
      if (attempt < maxRetries) {
        attempt++;
        console.log(`Attempt ${attempt} failed. Retrying in 2s...`);
        // Wait 2 seconds before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
        return attemptFetch(); 
      } else {
        throw error; // If out of retries, throw it back to the UI
      }
    }
  };

  return attemptFetch();
}