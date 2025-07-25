import React, { createContext, useContext, useEffect, useState } from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

// Extended user interface that combines Kinde user with our app-specific data
interface AppUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  picture?: string;
  // App-specific fields that we'll store separately
  businessName?: string;
  businessType?: string;
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    ai: {
      personality: string;
      proactiveMode: boolean;
      autoSuggestions: boolean;
    };
    integrations: {
      autoConnect: boolean;
    };
  };
}

interface AppAuthState {
  user: AppUser | null;
  kindeUser: any; // Raw Kinde user object
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  permissions: string[];
  organization: any;
}

interface AppAuthContextType extends AppAuthState {
  login: () => void;
  register: () => void;
  logout: () => void;
  getAccessToken: () => Promise<string | null>;
  updateUserPreferences: (preferences: Partial<AppUser['preferences']>) => Promise<void>;
  updateBusinessInfo: (info: { businessName?: string; businessType?: string }) => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

// Create context
const AppAuthContext = createContext<AppAuthContextType | undefined>(undefined);

// Default user preferences
const defaultPreferences: AppUser['preferences'] = {
  notifications: { email: true, push: false, sms: false },
  ai: { personality: 'professional', proactiveMode: true, autoSuggestions: true },
  integrations: { autoConnect: false },
};

// Provider component
export function AppAuthProvider({ children }: { children: React.ReactNode }) {
  const kindeAuth = useKindeAuth();
  const {
    login: kindeLogin,
    register: kindeRegister,
    logout: kindeLogout,
    isAuthenticated: kindeIsAuthenticated,
    isLoading: kindeIsLoading,
    user: kindeUser,
    getToken,
    getPermissions,
  } = kindeAuth;

  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [organization, setOrganization] = useState<any>(null);

  // Effect to sync Kinde user with app user
  useEffect(() => {
    const syncUserData = async () => {
      if (kindeIsAuthenticated && kindeUser) {
        try {
          // Get access token
          const token = await getToken();
          setAccessToken(token);

          // Get permissions (safely)
          try {
            const userPermissions = getPermissions();
            setPermissions(userPermissions?.permissions || []);
          } catch (err) {
            console.warn('Could not get user permissions:', err);
            setPermissions([]);
          }

          // Get organization (if available in SDK version)
          try {
            const getUserOrganization = (kindeAuth as any).getUserOrganization;
            if (typeof getUserOrganization === 'function') {
              const userOrg = getUserOrganization();
              setOrganization(userOrg);
            } else {
              console.info('getUserOrganization not available in this Kinde SDK version');
              setOrganization(null);
            }
          } catch (err) {
            console.warn('Could not get user organization:', err);
            setOrganization(null);
          }

          // Create app user from Kinde user
          const newAppUser: AppUser = {
            id: kindeUser.id,
            email: kindeUser.email || '',
            firstName: kindeUser.given_name || '',
            lastName: kindeUser.family_name || '',
            fullName: `${kindeUser.given_name || ''} ${kindeUser.family_name || ''}`.trim(),
            picture: kindeUser.picture,
            // Initialize with default preferences - in real app, load from backend
            preferences: defaultPreferences,
            // These would be loaded from your backend API
            businessName: undefined,
            businessType: undefined,
          };

          // TODO: Load user preferences and business info from your backend API
          // const userProfile = await loadUserProfile(kindeUser.id);
          // newAppUser.preferences = userProfile.preferences;
          // newAppUser.businessName = userProfile.businessName;
          // newAppUser.businessType = userProfile.businessType;

          setAppUser(newAppUser);
          setError(null);
        } catch (err) {
          console.error('Error syncing user data:', err);
          setError(err instanceof Error ? err.message : 'Failed to sync user data');
        }
      } else {
        // User is not authenticated, clear state
        setAppUser(null);
        setAccessToken(null);
        setPermissions([]);
        setOrganization(null);
      }
    };

    if (!kindeIsLoading) {
      syncUserData();
    }
  }, [kindeIsAuthenticated, kindeUser, kindeIsLoading, getToken, getPermissions]);

  // Auth actions
  const login = () => {
    setError(null);
    kindeLogin();
  };

  const register = () => {
    setError(null);
    kindeRegister();
  };

  const logout = () => {
    setError(null);
    setAppUser(null);
    setAccessToken(null);
    setPermissions([]);
    setOrganization(null);
    kindeLogout();
  };

  const getAccessToken = async (): Promise<string | null> => {
    try {
      const token = await getToken();
      setAccessToken(token);
      return token;
    } catch (err) {
      console.error('Error getting access token:', err);
      setError(err instanceof Error ? err.message : 'Failed to get access token');
      return null;
    }
  };

  // App-specific user management functions
  const updateUserPreferences = async (newPreferences: Partial<AppUser['preferences']>) => {
    if (!appUser) return;

    try {
      const updatedPreferences = {
        ...appUser.preferences,
        ...newPreferences,
      };

      // TODO: Save to backend API
      // await updateUserPreferencesAPI(appUser.id, updatedPreferences);

      setAppUser({
        ...appUser,
        preferences: updatedPreferences,
      });
    } catch (err) {
      console.error('Error updating user preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    }
  };

  const updateBusinessInfo = async (info: { businessName?: string; businessType?: string }) => {
    if (!appUser) return;

    try {
      // TODO: Save to backend API
      // await updateBusinessInfoAPI(appUser.id, info);

      setAppUser({
        ...appUser,
        ...info,
      });
    } catch (err) {
      console.error('Error updating business info:', err);
      setError(err instanceof Error ? err.message : 'Failed to update business info');
    }
  };

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const contextValue: AppAuthContextType = {
    user: appUser,
    kindeUser,
    accessToken,
    isLoading: kindeIsLoading,
    isAuthenticated: kindeIsAuthenticated,
    error,
    permissions,
    organization,
    login,
    register,
    logout,
    getAccessToken,
    updateUserPreferences,
    updateBusinessInfo,
    hasPermission,
  };

  return (
    <AppAuthContext.Provider value={contextValue}>
      {children}
    </AppAuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAppAuth() {
  const context = useContext(AppAuthContext);
  if (context === undefined) {
    throw new Error('useAppAuth must be used within an AppAuthProvider');
  }
  return context;
}

// Export types for use in other components
export type { AppUser, AppAuthContextType };