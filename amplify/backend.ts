import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { emailDiscovery } from './functions/emailDiscovery/resource';
import { RestApi, LambdaIntegration, Cors, GatewayResponse, ResponseType } from 'aws-cdk-lib/aws-apigateway';

const backend = defineBackend({
  auth,
  emailDiscovery,
});

const apiStack = backend.createStack('CruitorApiStack');

const api = new RestApi(apiStack, 'CruitorApi', {
  restApiName: 'cruitor-api',
  defaultCorsPreflightOptions: {
    allowOrigins: Cors.ALL_ORIGINS,
    allowMethods: Cors.ALL_METHODS,
    allowHeaders: ['Content-Type', 'Authorization'],
  },
});

// ← Add this — fixes CORS on error responses (4xx, 5xx)
new GatewayResponse(apiStack, 'CorsDefault4xx', {
  restApi: api,
  type: ResponseType.DEFAULT_4XX,
  responseHeaders: {
    'Access-Control-Allow-Origin': "'*'",
    'Access-Control-Allow-Headers': "'Content-Type,Authorization'",
  },
});

new GatewayResponse(apiStack, 'CorsDefault5xx', {
  restApi: api,
  type: ResponseType.DEFAULT_5XX,
  responseHeaders: {
    'Access-Control-Allow-Origin': "'*'",
    'Access-Control-Allow-Headers': "'Content-Type,Authorization'",
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