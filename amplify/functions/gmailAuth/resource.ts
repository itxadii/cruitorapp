import { defineFunction, secret } from '@aws-amplify/backend';

export const gmailAuth = defineFunction({
  name: 'gmailAuth',
  entry: './handler.ts',
  environment: {
    // We use Amplify Secrets so your keys never touch GitHub
    GOOGLE_CLIENT_ID: secret('GOOGLE_CLIENT_ID'),
    GOOGLE_CLIENT_SECRET: secret('GOOGLE_CLIENT_SECRET'),
    REDIRECT_URI: 'https://main.d1e2bodt3kbd5a.amplifyapp.com/auth/callback', // Change to prod URL later
  },
});