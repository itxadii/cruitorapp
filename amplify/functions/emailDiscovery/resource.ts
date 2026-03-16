import { defineFunction } from '@aws-amplify/backend';

export const emailDiscovery = defineFunction({
  name: 'email-discovery',
  runtime: 20, // Node 20
  timeoutSeconds: 30,
  environment: {
    SERPAPI_KEY: '9756557bdbae75f197497e9fc88f9a15060cfeded9dd6044d608f9a33f21b1c2 ', // move to Secrets Manager later
    SNOV_CLIENT_ID: 'f9e2ff925ec0f93966cc75f6f664f86c',
    SNOV_CLIENT_SECRET: 'e1b7710dfdee16585ef574f32fe53bb7',
  }
});