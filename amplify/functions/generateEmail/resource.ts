import { defineFunction, secret } from '@aws-amplify/backend';

export const generateEmail = defineFunction({
  name: 'generateEmail',
  entry: './handler.ts',
  timeoutSeconds: 30,
  memoryMB: 256,
  environment: {
    GEMINI_API_KEY: secret('GEMINI_API_KEY'),
  },
});