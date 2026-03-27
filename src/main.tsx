import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';
import { Authenticator } from '@aws-amplify/ui-react'; // <-- 1. Add this import

Amplify.configure(outputs);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* 2. Wrap the App in the Provider */}
    <Authenticator.Provider>
      <App />
    </Authenticator.Provider>
  </StrictMode>,
)