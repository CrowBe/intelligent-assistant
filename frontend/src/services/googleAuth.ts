// Google OAuth 2.0 Service for Gmail API
// This service handles direct Google OAuth for Gmail API access
// Used alongside Kinde for app authentication

import { useEffect, useState } from 'react';
import { useAppAuth } from '../contexts/KindeAuthContext';

// Google OAuth 2.0 configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.metadata'
].join(' ');

export interface GoogleAuthTokens {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
}

export class GoogleAuthService {
  private static instance: GoogleAuthService;
  private gapi: any = null;
  private isInitialized = false;

  static getInstance(): GoogleAuthService {
    if (!GoogleAuthService.instance) {
      GoogleAuthService.instance = new GoogleAuthService();
    }
    return GoogleAuthService.instance;
  }

  // Initialize Google API client
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load Google API script
      await this.loadGoogleApi();
      
      // Initialize gapi
      await new Promise<void>((resolve, reject) => {
        (window as any).gapi.load('auth2', {
          callback: () => {
            (window as any).gapi.auth2.init({
              client_id: GOOGLE_CLIENT_ID,
              scope: GMAIL_SCOPES,
            }).then(() => {
              this.gapi = (window as any).gapi;
              this.isInitialized = true;
              resolve();
            }).catch(reject);
          },
          onerror: reject,
        });
      });

      console.log('✅ Google API initialized for Gmail access');
    } catch (error) {
      console.error('❌ Failed to initialize Google API:', error);
      throw error;
    }
  }

  // Load Google API script
  private loadGoogleApi(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).gapi) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google API script'));
      document.head.appendChild(script);
    });
  }

  // Sign in with Google for Gmail access
  async signInForGmail(): Promise<GoogleAuthTokens> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const authInstance = this.gapi.auth2.getAuthInstance();
      const googleUser = await authInstance.signIn({
        scope: GMAIL_SCOPES,
      });

      const authResponse = googleUser.getAuthResponse(true);
      
      // Store tokens securely
      const tokens: GoogleAuthTokens = {
        access_token: authResponse.access_token,
        expires_in: authResponse.expires_in,
        refresh_token: authResponse.refresh_token,
        scope: authResponse.scope,
        token_type: 'Bearer',
      };

      // Store in localStorage for persistence
      localStorage.setItem('google_gmail_tokens', JSON.stringify(tokens));
      localStorage.setItem('google_gmail_tokens_expiry', (Date.now() + (tokens.expires_in * 1000)).toString());

      console.log('✅ Google Gmail authentication successful');
      return tokens;
    } catch (error) {
      console.error('❌ Google Gmail authentication failed:', error);
      throw error;
    }
  }

  // Get current Gmail access token
  async getGmailAccessToken(): Promise<string | null> {
    try {
      // Check if we have stored tokens
      const storedTokens = localStorage.getItem('google_gmail_tokens');
      const storedExpiry = localStorage.getItem('google_gmail_tokens_expiry');

      if (storedTokens && storedExpiry) {
        const tokens: GoogleAuthTokens = JSON.parse(storedTokens);
        const expiry = parseInt(storedExpiry);

        // Check if token is still valid (with 5 minute buffer)
        if (Date.now() < (expiry - 300000)) {
          return tokens.access_token;
        }
      }

      // If no valid token, try to get fresh one silently
      if (!this.isInitialized) {
        await this.initialize();
      }

      const authInstance = this.gapi.auth2.getAuthInstance();
      if (authInstance.isSignedIn.get()) {
        const googleUser = authInstance.currentUser.get();
        const authResponse = googleUser.getAuthResponse(true);
        return authResponse.access_token;
      }

      return null;
    } catch (error) {
      console.error('❌ Failed to get Gmail access token:', error);
      return null;
    }
  }

  // Check if user has Gmail permissions
  async hasGmailPermissions(): Promise<boolean> {
    try {
      const token = await this.getGmailAccessToken();
      if (!token) return false;

      // Test token by making a simple Gmail API call
      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('❌ Failed to check Gmail permissions:', error);
      return false;
    }
  }

  // Sign out from Google Gmail
  async signOutGmail(): Promise<void> {
    try {
      if (this.isInitialized) {
        const authInstance = this.gapi.auth2.getAuthInstance();
        await authInstance.signOut();
      }

      // Clear stored tokens
      localStorage.removeItem('google_gmail_tokens');
      localStorage.removeItem('google_gmail_tokens_expiry');

      console.log('✅ Google Gmail sign-out successful');
    } catch (error) {
      console.error('❌ Google Gmail sign-out failed:', error);
    }
  }
}

// React hook for Google Gmail authentication
export const useGoogleGmailAuth = () => {
  const { isAuthenticated: isKindeAuthenticated } = useAppAuth();
  const [isGmailAuthenticated, setIsGmailAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const googleAuth = GoogleAuthService.getInstance();

  // Check Gmail authentication status on mount
  useEffect(() => {
    const checkGmailAuth = async () => {
      if (isKindeAuthenticated) {
        const hasPermissions = await googleAuth.hasGmailPermissions();
        setIsGmailAuthenticated(hasPermissions);
      }
    };

    checkGmailAuth();
  }, [isKindeAuthenticated]);

  const signInForGmail = async () => {
    if (!isKindeAuthenticated) {
      setError('Please authenticate with Kinde first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await googleAuth.signInForGmail();
      setIsGmailAuthenticated(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gmail authentication failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const signOutGmail = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await googleAuth.signOutGmail();
      setIsGmailAuthenticated(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gmail sign-out failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getGmailAccessToken = async (): Promise<string | null> => {
    return googleAuth.getGmailAccessToken();
  };

  return {
    isGmailAuthenticated,
    isLoading,
    error,
    signInForGmail,
    signOutGmail,
    getGmailAccessToken,
  };
};