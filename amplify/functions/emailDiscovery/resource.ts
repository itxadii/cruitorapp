import { defineFunction, secret } from '@aws-amplify/backend';

export const emailDiscovery = defineFunction({
  name: 'email-discovery',
  runtime: 20, // Node 20
  timeoutSeconds: 30,
  environment: {
    SERPAPI_KEY: secret('SERPAPI_KEY'), // move to Secrets Manager later
  }
});