// amplify/functions/sendEmail/resource.ts
import { defineFunction, secret } from '@aws-amplify/backend';

export const sendEmail = defineFunction({
  name: 'sendEmail',
  entry: './handler.ts',
  timeoutSeconds: 30, // Give it extra time in case of large attachments
  environment: {
    GOOGLE_CLIENT_ID: secret('GOOGLE_CLIENT_ID'),
    GOOGLE_CLIENT_SECRET: secret('GOOGLE_CLIENT_SECRET'),
  },
});