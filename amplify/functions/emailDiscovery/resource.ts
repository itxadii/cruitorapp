import { defineFunction, secret } from '@aws-amplify/backend';

export const emailDiscovery = defineFunction({
  name: 'email-discovery',
  runtime: 20, // Node 20
  timeoutSeconds: 30,
  environment: {
    SERPAPI_KEY: secret('SERPAPI_KEY'), // move to Secrets Manager later 9756557bdbae75f197497e9fc88f9a15060cfeded9dd6044d608f9a33f21b1c2
  }
});