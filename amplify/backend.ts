import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource'; 
import { emailDiscovery } from './functions/emailDiscovery/resource';
import { gmailAuth } from './functions/gmailAuth/resource'; 
import { sendEmail } from './functions/sendEmail/resource';
import { generateEmail } from './functions/generateEmail/resource';
import { RestApi, LambdaIntegration, Cors, GatewayResponse, ResponseType } from 'aws-cdk-lib/aws-apigateway';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

const backend = defineBackend({
  auth,
  data,
  emailDiscovery,
  gmailAuth,
  sendEmail,
  generateEmail,
});

// ─── 1. Give Lambdas access to the Database ───────────────────────────────────

// Gmail Auth Lambda: Write tokens to DynamoDB
backend.data.resources.tables.UserCredentials.grantReadWriteData(
  backend.gmailAuth.resources.lambda
);
backend.gmailAuth.addEnvironment(
  'USER_CREDENTIALS_TABLE',
  backend.data.resources.tables.UserCredentials.tableName
);

// Send Email Lambda: Read tokens from DynamoDB
backend.data.resources.tables.UserCredentials.grantReadData(
  backend.sendEmail.resources.lambda
);
backend.sendEmail.addEnvironment(
  'USER_CREDENTIALS_TABLE',
  backend.data.resources.tables.UserCredentials.tableName
);

// Generate Email Lambda: Gemini API key
backend.generateEmail.addEnvironment(
  'GEMINI_API_KEY',
  process.env.GEMINI_API_KEY || ''
);

// ─── 2. Setup API Gateway ─────────────────────────────────────────────────────
const apiStack = backend.createStack('CruitorApiStack');

const api = new RestApi(apiStack, 'CruitorApi', {
  restApiName: 'cruitor-api',
  defaultCorsPreflightOptions: {
    allowOrigins: Cors.ALL_ORIGINS,
    allowMethods: Cors.ALL_METHODS,
    allowHeaders: ['Content-Type', 'Authorization'],
  },
});

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

// ─── 3. Define API Routes ─────────────────────────────────────────────────────

// Route A: Email Discovery (/search-company)
const searchRoute = api.root.addResource('search-company');
searchRoute.addMethod('POST', new LambdaIntegration(backend.emailDiscovery.resources.lambda));

// Route B: Gmail Auth Callback (/auth-gmail)
const authRoute = api.root.addResource('auth-gmail');
authRoute.addMethod('POST', new LambdaIntegration(backend.gmailAuth.resources.lambda));

// Route C: Send Email (/send-email)
const sendEmailRoute = api.root.addResource('send-email');
sendEmailRoute.addMethod('POST', new LambdaIntegration(backend.sendEmail.resources.lambda));

// Route D: AI Email Generation (/generate-email)
const generateEmailRoute = api.root.addResource('generate-email');
generateEmailRoute.addMethod('POST', new LambdaIntegration(backend.generateEmail.resources.lambda));

// ─── 4. Output the API URL ────────────────────────────────────────────────────
backend.addOutput({
  custom: {
    apiEndpoint: api.url,
  },
});