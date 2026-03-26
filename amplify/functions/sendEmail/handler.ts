import type { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const TABLE_NAME = process.env.USER_CREDENTIALS_TABLE!;

// Build a RFC 2822 raw email string, base64url encoded
function buildRawEmail(params: {
  from: string;
  to: string;
  subject: string;
  body: string;
  attachment?: { filename: string; base64: string; contentType: string };
}): string {
  const boundary = `boundary_${Date.now()}`;
  const hasAttachment = !!params.attachment;

  let raw = [
    `From: ${params.from}`,
    `To: ${params.to}`,
    `Subject: ${params.subject}`,
    `MIME-Version: 1.0`,
  ];

  if (hasAttachment) {
    raw.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
    raw.push('');
    raw.push(`--${boundary}`);
    raw.push('Content-Type: text/plain; charset="UTF-8"');
    raw.push('');
    raw.push(params.body);
    raw.push('');
    raw.push(`--${boundary}`);
    raw.push(`Content-Type: ${params.attachment!.contentType}`);
    raw.push('Content-Transfer-Encoding: base64');
    raw.push(`Content-Disposition: attachment; filename="${params.attachment!.filename}"`);
    raw.push('');
    raw.push(params.attachment!.base64);
    raw.push('');
    raw.push(`--${boundary}--`);
  } else {
    raw.push('Content-Type: text/plain; charset="UTF-8"');
    raw.push('');
    raw.push(params.body);
  }

  const rawString = raw.join('\r\n');
  // Gmail API requires base64url encoding (not standard base64)
  return Buffer.from(rawString)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export const handler: APIGatewayProxyHandler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  try {
    const body = JSON.parse(event.body || '{}');
    const { userId, emails, subject, messageBody, attachment } = body;

    // 1. Get the token from DynamoDB
    const dbResponse = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { id: userId },
    }));

    const userRecord = dbResponse.Item;
    if (!userRecord?.refreshToken) {
      throw new Error("No refresh token found. Please reconnect Gmail.");
    }

    // 2. Exchange refresh_token for a fresh access_token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: userRecord.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
      console.error("Google Token Exchange Failed:", tokenData);
      throw new Error(`Google rejected the token: ${tokenData.error_description || tokenData.error}`);
    }

    const accessToken = tokenData.access_token;

    // 3. Send each email via Gmail REST API (no Nodemailer, no SMTP)
    const sendResults = await Promise.allSettled(
      emails.map(async (to: string) => {
        const rawEmail = buildRawEmail({
          from: userRecord.gmailAddress,
          to,
          subject,
          body: messageBody,
          attachment: attachment?.base64 ? attachment : undefined,
        });

        const gmailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ raw: rawEmail }),
        });

        if (!gmailRes.ok) {
          const errBody = await gmailRes.json();
          throw new Error(`Failed to send to ${to}: ${JSON.stringify(errBody)}`);
        }
        return to;
      })
    );

    const failed = sendResults
      .filter(r => r.status === 'rejected')
      .map(r => (r as PromiseRejectedResult).reason?.message);

    if (failed.length > 0) {
      console.error('Some emails failed:', failed);
      // Still return 200 if at least some succeeded
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        sent: sendResults.filter(r => r.status === 'fulfilled').length,
        failed: failed.length,
        errors: failed,
      }),
    };

  } catch (err: any) {
    console.error('Final Send Error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};