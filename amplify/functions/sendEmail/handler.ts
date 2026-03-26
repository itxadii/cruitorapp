import type { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import * as nodemailer from 'nodemailer';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const TABLE_NAME = process.env.USER_CREDENTIALS_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Content-Type': 'application/json',
  };

  try {
    const body = JSON.parse(event.body || '{}');
    const { userId, emails, subject, messageBody, attachment } = body;

    // 1. Get tokens from DB
    const dbResponse = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { id: userId },
    }));

    const userRecord = dbResponse.Item;
    if (!userRecord || !userRecord.refreshToken) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "No refresh token found. Please reconnect Gmail." }) };
    }

    // 2. Setup Transporter with explicit SMTP
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        type: 'OAuth2',
        user: userRecord.gmailAddress,
        clientId: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        refreshToken: userRecord.refreshToken,
      },
    });

    const mailOptions: nodemailer.SendMailOptions = {
      from: `Cruitor Pro <${userRecord.gmailAddress}>`,
      to: emails.join(','), // Using 'to' for single sends, BCC for bulk is handled by emails array
      subject: subject,
      text: messageBody,
    };

    if (attachment?.base64) {
      mailOptions.attachments = [{
        filename: attachment.filename,
        content: attachment.base64,
        encoding: 'base64'
      }];
    }

    // 3. Send
    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    };

  } catch (err: any) {
    console.error('SMTP Error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};