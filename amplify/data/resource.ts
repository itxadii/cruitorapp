import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  UserCredentials: a.model({
    // Stores the email address they connected (e.g., student@gmail.com)
    gmailAddress: a.string(),
    
    // The secret token Google gives us to send emails
    refreshToken: a.string(),
    
    // Quick flag so the frontend knows to hide the "Connect Gmail" button
    isConnected: a.boolean().default(false),
  })
  .authorization(allow => [
    // CRITICAL SECURITY: This ensures a user can ONLY read/write their own row.
    // They cannot hack the API to steal another student's refresh token.
    allow.owner() 
  ]),
});

// Exports the types so your React frontend gets perfect autocomplete
export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    // TypeScript is boss. It is strictly singular: 'userPool'
    defaultAuthorizationMode: 'userPool', 
  },
});