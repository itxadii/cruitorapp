import { defineFunction, secret } from '@aws-amplify/backend';

export const gmailAuth = defineFunction({
  name: 'gmailAuth',
  entry: './handler.ts',
  environment: {
    // We use Amplify Secrets so your keys never touch GitHub
    GOOGLE_CLIENT_ID: secret('GOOGLE_CLIENT_ID'),
    GOOGLE_CLIENT_SECRET: secret('GOOGLE_CLIENT_SECRET'),
    REDIRECT_URI: 'http://localhost:5173/auth/callback', // Change to prod URL later
  },
});