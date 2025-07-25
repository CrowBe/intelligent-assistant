// Hybrid Authentication Service
// Combines Kinde app authentication with Google OAuth for Gmail API access
// Uses Google Identity Services (GIS) - the modern replacement for gapi.auth2

import { useEffect, useState } from 'react';
import { useAppAuth } from '../contexts/KindeAuthContext';

// Use explicit Google Client ID for Gmail API (same project as Firebase)
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const FIREBASE_PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID;

const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.metadata',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
].join(' ');

export interface GmailAuthStatus {
  isConnected: boolean;
  userEmail: string | null;
  accessToken: string | null;
  expiresAt: number | null;
}

export class HybridAuthService {
  private static instance: HybridAuthService;
  private tokenClient: any = null;
  private isInitialized = false;

  static getInstance(): HybridAuthService {
    if (!HybridAuthService.instance) {
      HybridAuthService.instance = new HybridAuthService();
    }
    return HybridAuthService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.loadGoogleIdentityServices();
      
      if (!GOOGLE_CLIENT_ID) {
        throw new Error('VITE_GOOGLE_CLIENT_ID not configured');
      }
      
      console.log('🔥 Using modern Google Identity Services with Firebase project:', {
        projectId: FIREBASE_PROJECT_ID,
        clientId: GOOGLE_CLIENT_ID.substring(0, 20) + '...'
      });
      
      // Initialize the Google Identity Services token client
      this.tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: GMAIL_SCOPES,
        callback: '', // Will be set per request
      });
      
      this.isInitialized = true;
      console.log('✅ Google Identity Services initialized for Gmail access');
      
    } catch (error) {
      console.error('❌ Failed to initialize Google Identity Services:', error);
      throw error;
    }
  }

  private loadGoogleIdentityServices(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).google?.accounts?.oauth2) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => {
        // Wait a bit for the library to be fully loaded
        setTimeout(() => {
          if ((window as any).google?.accounts?.oauth2) {
            resolve();
          } else {
            reject(new Error('Google Identity Services not loaded properly'));
          }
        }, 100);
      };
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });
  }

  // Connect Gmail using the same Google account from Kinde
  async connectGmail(kindeUserEmail?: string): Promise<GmailAuthStatus> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      try {
        // Set up the callback for this specific request
        this.tokenClient.callback = (response: any) => {
          if (response.error) {
            console.error('❌ Gmail OAuth error:', response.error);
            reject(new Error(`OAuth failed: ${response.error}`));
            return;
          }

          // We got the access token, but we need user info
          this.getUserInfo(response.access_token).then(userInfo => {
            const gmailAuth: GmailAuthStatus = {
              isConnected: true,
              userEmail: userInfo.email,
              accessToken: response.access_token,
              expiresAt: Date.now() + (response.expires_in * 1000),
            };

            // Store Gmail auth status
            localStorage.setItem('gmail_auth', JSON.stringify(gmailAuth));
            
            console.log('✅ Gmail connected successfully:', {
              email: gmailAuth.userEmail,
              matchesKinde: gmailAuth.userEmail === kindeUserEmail
            });

            resolve(gmailAuth);
          }).catch(reject);
        };

        // Request access token
        if (kindeUserEmail) {
          this.tokenClient.requestAccessToken({ login_hint: kindeUserEmail });
        } else {
          this.tokenClient.requestAccessToken();
        }
        
      } catch (error) {
        console.error('❌ Gmail connection failed:', error);
        reject(error);
      }
    });
  }

  // Get user info from access token
  private async getUserInfo(accessToken: string): Promise<{ email: string; name: string }> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    return await response.json();
  }

  // Get current Gmail auth status
  async getGmailAuthStatus(): Promise<GmailAuthStatus> {
    const stored = localStorage.getItem('gmail_auth');
    if (!stored) {
      return { isConnected: false, userEmail: null, accessToken: null, expiresAt: null };
    }

    const gmailAuth: GmailAuthStatus = JSON.parse(stored);
    
    // Check if token is expired (with 5 minute buffer)
    if (gmailAuth.expiresAt && Date.now() >= (gmailAuth.expiresAt - 300000)) {
      console.warn('⚠️ Gmail token expired, user will need to reconnect');
      gmailAuth.isConnected = false;
      gmailAuth.accessToken = null;
      localStorage.removeItem('gmail_auth');
    }

    return gmailAuth;
  }

  // Disconnect Gmail
  async disconnectGmail(): Promise<void> {
    try {
      // With Google Identity Services, we just need to clear local storage
      // The token client doesn't maintain persistent sessions like gapi.auth2
      localStorage.removeItem('gmail_auth');
      console.log('✅ Gmail disconnected');
    } catch (error) {
      console.error('❌ Gmail disconnect failed:', error);
    }
  }

  // Check if Gmail email matches Kinde email
  async isGmailAccountMatched(kindeEmail: string): Promise<boolean> {
    const gmailAuth = await this.getGmailAuthStatus();
    return gmailAuth.isConnected && gmailAuth.userEmail === kindeEmail;
  }
}

// React hook for hybrid authentication
export const useHybridAuth = () => {
  const { user, isAuthenticated } = useAppAuth();
  const [gmailAuth, setGmailAuth] = useState<GmailAuthStatus>({
    isConnected: false,
    userEmail: null,
    accessToken: null,
    expiresAt: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hybridService = HybridAuthService.getInstance();

  // Check Gmail auth status on mount and when Kinde auth changes
  useEffect(() => {
    const checkGmailStatus = async () => {
      if (isAuthenticated) {
        const status = await hybridService.getGmailAuthStatus();
        setGmailAuth(status);
      } else {
        setGmailAuth({
          isConnected: false,
          userEmail: null,
          accessToken: null,
          expiresAt: null
        });
      }
    };

    checkGmailStatus();
  }, [isAuthenticated]);

  const connectGmail = async () => {
    if (!isAuthenticated || !user) {
      setError('Please authenticate with Kinde first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const status = await hybridService.connectGmail(user.email);
      setGmailAuth(status);
      
      // Check if Gmail account matches Kinde account
      if (status.userEmail !== user.email) {
        console.warn('⚠️ Gmail account differs from Kinde account:', {
          kinde: user.email,
          gmail: status.userEmail
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gmail connection failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectGmail = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await hybridService.disconnectGmail();
      setGmailAuth({
        isConnected: false,
        userEmail: null,
        accessToken: null,
        expiresAt: null
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gmail disconnect failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshGmailToken = async () => {
    // With Google Identity Services, tokens don't refresh automatically
    // User needs to reconnect when token expires
    const status = await hybridService.getGmailAuthStatus();
    setGmailAuth(status);
    if (!status.isConnected) {
      setError('Token expired. Please reconnect Gmail.');
    }
    return status.accessToken;
  };

  return {
    // Kinde auth status
    isKindeAuthenticated: isAuthenticated,
    kindeUser: user,
    
    // Gmail auth status
    gmailAuth,
    isGmailConnected: gmailAuth.isConnected,
    
    // Combined status
    isFullyAuthenticated: isAuthenticated && gmailAuth.isConnected,
    accountsMatch: user?.email === gmailAuth.userEmail,
    
    // Actions
    connectGmail,
    disconnectGmail,
    refreshGmailToken,
    
    // State
    isLoading,
    error,
  };
};