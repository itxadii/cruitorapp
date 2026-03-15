import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { emailDiscovery } from './functions/emailDiscovery/resource';
import { RestApi, LambdaIntegration, Cors } from 'aws-cdk-lib/aws-apigateway';

const backend = defineBackend({
  auth,
  emailDiscovery,
});

// ─── API Gateway ──────────────────────────────────────────────────────────────
const apiStack = backend.createStack('CruitorApiStack');

const api = new RestApi(apiStack, 'CruitorApi', {
  restApiName: 'cruitor-api',
  defaultCorsPreflightOptions: {
    allowOrigins: Cors.ALL_ORIGINS,
    allowMethods: Cors.ALL_METHODS,
    allowHeaders: ['Content-Type', 'Authorization'],
  },
});

const lambdaIntegration = new LambdaIntegration(
  backend.emailDiscovery.resources.lambda
);

const searchRoute = api.root.addResource('search-company');
searchRoute.addMethod('POST', lambdaIntegration);

backend.addOutput({
  custom: {
    apiEndpoint: api.url,
  },
});