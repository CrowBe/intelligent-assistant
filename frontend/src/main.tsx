import React from 'react';
import ReactDOM from 'react-dom/client';
import { KindeProvider } from '@kinde-oss/kinde-auth-react';
import { AppAuthProvider } from './contexts/KindeAuthContext.tsx';
import App from './App.tsx';
import './index.css';
import kindeConfig from './config/kinde.ts';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <KindeProvider
      clientId={kindeConfig.clientId}
      domain={kindeConfig.domain}
      redirectUri={kindeConfig.redirectUri}
      logoutUri={kindeConfig.logoutUri}
    >
      <AppAuthProvider>
        <App />
      </AppAuthProvider>
    </KindeProvider>
  </React.StrictMode>,
);