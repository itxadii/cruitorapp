import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource'; 
import { emailDiscovery } from './functions/emailDiscovery/resource';
import { gmailAuth } from './functions/gmailAuth/resource'; 
import { sendEmail } from './functions/sendEmail/resource';
import { RestApi, LambdaIntegration, Cors, GatewayResponse, ResponseType } from 'aws-cdk-lib/aws-apigateway';

const backend = defineBackend({
  auth,
  data,
  emailDiscovery,
  gmailAuth,
  sendEmail, // <-- Added to backend
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

// Route A: Email Discovery Scraper (/search-company)
const searchIntegration = new LambdaIntegration(
  backend.emailDiscovery.resources.lambda
);
const searchRoute = api.root.addResource('search-company');
searchRoute.addMethod('POST', searchIntegration);

// Route B: Gmail Auth Callback (/auth-gmail)
const authIntegration = new LambdaIntegration(
  backend.gmailAuth.resources.lambda
);
const authRoute = api.root.addResource('auth-gmail');
authRoute.addMethod('POST', authIntegration);

// Route C: Send Email with Attachment (/send-email) <-- Added new route
const sendEmailIntegration = new LambdaIntegration(
  backend.sendEmail.resources.lambda
);
const sendEmailRoute = api.root.addResource('send-email');
sendEmailRoute.addMethod('POST', sendEmailIntegration);


// ─── 4. Output the API URL to the Frontend ────────────────────────────────────
backend.addOutput({
  custom: {
    apiEndpoint: api.url,
  },
});