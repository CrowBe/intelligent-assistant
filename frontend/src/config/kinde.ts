// Kinde Authentication Configuration
import { KindeSDK } from '@kinde-oss/kinde-auth-react';

export const kindeConfig = {
  clientId: import.meta.env.VITE_KINDE_CLIENT_ID,
  domain: import.meta.env.VITE_KINDE_DOMAIN,
  redirectUri: import.meta.env.VITE_KINDE_REDIRECT_URI,
  logoutUri: import.meta.env.VITE_KINDE_LOGOUT_URI,
};

// Validate configuration
const validateKindeConfig = () => {
  const required = ['clientId', 'domain', 'redirectUri', 'logoutUri'];
  const missing = required.filter(key => !kindeConfig[key as keyof typeof kindeConfig]);
  
  if (missing.length > 0) {
    console.error('Missing Kinde configuration:', missing);
    throw new Error(`Missing Kinde environment variables: ${missing.map(k => `VITE_KINDE_${k.toUpperCase()}`).join(', ')}`);
  }
  
  console.log('✅ Kinde configuration validated:', {
    clientId: kindeConfig.clientId?.substring(0, 8) + '...',
    domain: kindeConfig.domain,
    redirectUri: kindeConfig.redirectUri,
    logoutUri: kindeConfig.logoutUri,
  });
};

// Initialize validation
validateKindeConfig();

export default kindeConfig;