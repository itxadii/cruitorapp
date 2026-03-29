import type { APIGatewayProxyHandler } from 'aws-lambda';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export const handler: APIGatewayProxyHandler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  try {
    const body = JSON.parse(event.body || '{}');
    const { resumeBase64, resumeMimeType, company, domain, userName } = body;

    if (!resumeBase64 || !company) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'resumeBase64 and company are required' }),
      };
    }

    console.log(`Generating email for ${company}`);

    const prompt = `You are an expert career coach and cold email copywriter helping a job seeker land interviews through direct HR outreach.

A job seeker is targeting ${company} (${domain || company + '.com'}) and wants to send a cold outreach email directly to their HR or recruiting team.

Your task:
1. Read the attached resume carefully and completely
2. Identify the candidate's strongest 2-3 skills and most impressive projects or achievements
3. Write a short, confident, highly personalized cold outreach email tailored to ${company}

Email writing rules:
- Subject: Specific and intriguing. Do NOT use generic subjects like "Job Application" or "Exploring Opportunities". Reference the candidate's strongest skill or a specific angle relevant to ${company}.
- Opening line: Hook immediately. Do NOT start with "My name is" or "I am writing to". Start with value or a specific observation.
- Body: Maximum 3 short paragraphs. Mention 1-2 specific skills or projects from their resume by name. Show you understand what ${company} does or needs.
- Call to action: One clear, low-friction ask. A quick call, a chat, a referral. Not "please consider my application".
- Tone: Confident, direct, human. Like a smart person reaching out to another smart person — not a desperate job seeker.
- Length: Under 150 words for the body. Recruiters don't read long emails.
- Sign off with: ${userName || '[Your Name]'}

Return ONLY a raw JSON object. No markdown. No explanation. No backticks. Just this:
{
  "subject": "subject line here",
  "body": "full email body here with actual newlines"
}`;

    const geminiPayload = {
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: resumeMimeType || 'application/pdf',
                data: resumeBase64,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
        responseMimeType: 'application/json',
      },
    };

    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('Gemini error:', err);
      throw new Error(err.error?.message || 'Gemini API failed');
    }

    const geminiData = await res.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) throw new Error('No response from Gemini');

    let parsed: { subject: string; body: string };
    try {
      parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim());
    } catch {
      const subjectMatch = rawText.match(/"subject"\s*:\s*"([^"]+)"/);
      const bodyMatch = rawText.match(/"body"\s*:\s*"([\s\S]+?)"\s*\}/) ;
      parsed = {
        subject: subjectMatch?.[1] || `Opportunity at ${company}`,
        body: bodyMatch?.[1]?.replace(/\\n/g, '\n') || rawText,
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        subject: parsed.subject,
        body: parsed.body,
      }),
    };

  } catch (err: any) {
    console.error('Generate email error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};