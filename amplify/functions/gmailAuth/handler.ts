import type { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB Client (defined outside handler for performance caching)
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Grab Environment Variables injected by Amplify Gen 2
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:5173/auth/callback';
const TABLE_NAME = process.env.USER_CREDENTIALS_TABLE!;

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
    const { code, userId } = body;

    if (!code || !userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing Google code or Cognito userId' }),
      };
    }

    console.log(`Exchanging code for user: ${userId}`);

    // ─── Step 1: Exchange auth_code for refresh_token ─────────────────────────
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Google Token Error:', tokenData);
      throw new Error(tokenData.error_description || 'Failed to exchange token with Google');
    }

// ─── Step 2: Get their email address for the UI ───────────────────────────
    // CHANGED: Use the standard OAuth endpoint instead of the strict Gmail API endpoint
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profileData = await profileResponse.json();

    if (!profileResponse.ok) {
      console.error('Google Profile Error:', profileData);
      throw new Error('Failed to fetch Google profile data');
    }

    // ─── Step 3: Save to DynamoDB ─────────────────────────────────────────────
    // Note: Google only issues a refresh_token on the FIRST authorization.
    if (tokenData.refresh_token) {
      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          id: userId,          
          owner: userId,       
          __typename: 'UserCredentials', // <-- CRITICAL FIX: AppSync needs this!
          firstName: profileData.given_name || '',   // ADD
     lastName: profileData.family_name || '', 
          gmailAddress: profileData.email, 
          refreshToken: tokenData.refresh_token,
          isConnected: true,
          createdAt: new Date().toISOString(), // AppSync also looks for these
          updatedAt: new Date().toISOString()
        }
      }));
      console.log(`Successfully saved new refresh token to DynamoDB for ${profileData.email}.`);
    } else {
      console.log('No refresh token received. User likely already authorized previously.');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        // CHANGED: profileData.emailAddress becomes profileData.email
        email: profileData.email 
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