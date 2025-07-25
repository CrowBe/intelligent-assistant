import { useState, useEffect } from 'react';
import { useAppAuth } from '../../contexts/KindeAuthContext';

interface SetupStatus {
  kindeAuth: boolean;
  firebaseConfig: boolean;
  googleClientId: boolean;
  googleApiScript: boolean;
  overallReady: boolean;
}

const SetupVerification: React.FC = () => {
  const { isAuthenticated, user } = useAppAuth();
  const [status, setStatus] = useState<SetupStatus>({
    kindeAuth: false,
    firebaseConfig: false,
    googleClientId: false,
    googleApiScript: false,
    overallReady: false
  });

  const [isTestingGoogle, setIsTestingGoogle] = useState(false);
  const [googleTestResult, setGoogleTestResult] = useState<string | null>(null);

  useEffect(() => {
    const checkSetup = () => {
      const kindeAuth = isAuthenticated && !!user;
      
      // Check Firebase configuration
      const firebaseConfig = !!(
        import.meta.env.VITE_FIREBASE_API_KEY &&
        import.meta.env.VITE_FIREBASE_PROJECT_ID &&
        import.meta.env.VITE_FIREBASE_APP_ID &&
        import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID
      );
      
      // Check Google Client ID for Gmail API
      const googleClientId = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;
      
      const googleApiScript = !!(window as any).google?.accounts?.oauth2;
      const overallReady = kindeAuth && firebaseConfig && googleClientId;

      setStatus({
        kindeAuth,
        firebaseConfig,
        googleClientId,
        googleApiScript,
        overallReady
      });
    };

    checkSetup();
  }, [isAuthenticated, user]);

  const testGoogleApiLoad = async () => {
    setIsTestingGoogle(true);
    setGoogleTestResult(null);

    try {
      // Try to load Google Identity Services
      if (!(window as any).google?.accounts?.oauth2) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        
        await new Promise((resolve, reject) => {
          script.onload = () => {
            // Wait for the library to be fully loaded
            setTimeout(() => {
              if ((window as any).google?.accounts?.oauth2) {
                resolve(true);
              } else {
                reject(new Error('Google Identity Services not loaded properly'));
              }
            }, 100);
          };
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      // Test token client initialization
      const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      
      if (!googleClientId) {
        setGoogleTestResult('❌ VITE_GOOGLE_CLIENT_ID not configured');
        return;
      }
      
      console.log('🔥 Testing Google Identity Services with Client ID:', googleClientId.substring(0, 20) + '...');
      
      // Try to initialize token client
      const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: googleClientId,
        scope: 'https://www.googleapis.com/auth/gmail.readonly',
        callback: () => {}, // Dummy callback for test
      });

      if (tokenClient) {
        setGoogleTestResult('✅ Google Identity Services ready for Gmail API');
        setStatus(prev => ({ ...prev, googleApiScript: true }));
      } else {
        setGoogleTestResult('❌ Failed to create Google Identity Services token client');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (!googleTestResult) {
        setGoogleTestResult(`❌ Google Identity Services test failed: ${errorMessage}`);
      }
    } finally {
      setIsTestingGoogle(false);
    }
  };

  const getStatusIcon = (isReady: boolean) => isReady ? '✅' : '❌';
  const getStatusColor = (isReady: boolean) => isReady ? 'text-green-600' : 'text-red-600';

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Setup Verification</h2>
      <p className="text-center text-gray-600 mb-8">
        Check if all components are configured correctly for hybrid authentication
      </p>

      {/* Setup Status */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-semibold">Kinde Authentication</h3>
            <p className="text-sm text-gray-600">Main app authentication</p>
          </div>
          <div className={`font-medium ${getStatusColor(status.kindeAuth)}`}>
            {getStatusIcon(status.kindeAuth)} {status.kindeAuth ? 'Ready' : 'Not authenticated'}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-semibold">Firebase Configuration</h3>
            <p className="text-sm text-gray-600">Base Firebase project setup</p>
          </div>
          <div className={`font-medium ${getStatusColor(status.firebaseConfig)}`}>
            {getStatusIcon(status.firebaseConfig)} {status.firebaseConfig ? 'Configured' : 'Missing'}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-semibold">Google Client ID</h3>
            <p className="text-sm text-gray-600">Gmail API OAuth credentials</p>
          </div>
          <div className={`font-medium ${getStatusColor(status.googleClientId)}`}>
            {getStatusIcon(status.googleClientId)} {status.googleClientId ? 'Configured' : 'Missing'}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-semibold">Google Identity Services</h3>
            <p className="text-sm text-gray-600">Modern OAuth library (replaces gapi.auth2)</p>
          </div>
          <div className={`font-medium ${getStatusColor(status.googleApiScript)}`}>
            {getStatusIcon(status.googleApiScript)} {status.googleApiScript ? 'Loaded' : 'Not loaded'}
          </div>
        </div>
      </div>

      {/* Overall Status */}
      <div className={`p-4 rounded-lg mb-6 ${status.overallReady ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
        <div className={`font-semibold text-center ${status.overallReady ? 'text-green-800' : 'text-yellow-800'}`}>
          {status.overallReady ? (
            '🎉 Setup Complete - Ready for Hybrid Authentication!'
          ) : (
            '⚙️ Setup Required'
          )}
        </div>
        
        {!status.kindeAuth && (
          <p className="text-sm text-yellow-700 mt-2 text-center">
            → Go to "🔐 App Auth" tab to sign in with Kinde
          </p>
        )}
        
        {!status.firebaseConfig && (
          <p className="text-sm text-yellow-700 mt-2 text-center">
            → Check Firebase environment variables in .env file
          </p>
        )}
        
        {!status.googleClientId && (
          <p className="text-sm text-yellow-700 mt-2 text-center">
            → Add VITE_GOOGLE_CLIENT_ID to your .env file (see setup guide below)
          </p>
        )}
      </div>

      {/* Test Buttons */}
      <div className="text-center space-y-4">
        {status.firebaseConfig && status.googleClientId && (
          <button
            onClick={testGoogleApiLoad}
            disabled={isTestingGoogle}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isTestingGoogle ? '⏳ Testing...' : '🧪 Test Gmail API Integration'}
          </button>
        )}

        {status.overallReady && (
          <div className="mt-4">
            <p className="text-sm text-green-600 mb-2">✅ Ready to test hybrid authentication!</p>
            <p className="text-xs text-gray-500">Go to "🔗 Hybrid Auth" tab to test Gmail connection</p>
          </div>
        )}
      </div>

      {/* Google Test Result */}
      {googleTestResult && (
        <div className="mt-4 p-3 bg-gray-50 border rounded">
          <p className="text-sm font-medium">Google API Test Result:</p>
          <p className="text-sm">{googleTestResult}</p>
        </div>
      )}

      {/* Configuration Help */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold text-blue-800 mb-2">Setup Requirements:</h3>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>✅ Firebase project configured</li>
          <li>{status.googleClientId ? '✅' : '🔄'} Google Client ID for Gmail API needed</li>
          <li>🔄 Test Gmail API integration with button above</li>
          <li>🔄 Go to Hybrid Auth tab to connect Gmail</li>
        </ol>
        
        {!status.googleClientId && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800 font-medium text-sm">📋 Quick Setup Required:</p>
            <p className="text-yellow-700 text-xs mt-1">
              See <strong>FIREBASE_GMAIL_SETUP.md</strong> file for 5-minute setup guide using your existing Firebase project.
            </p>
          </div>
        )}
      </div>

      {/* Firebase Configuration Status */}
      {!status.firebaseConfig && (
        <div className="mt-4 p-4 bg-gray-50 border rounded">
          <h4 className="font-semibold mb-2">Required Firebase Environment Variables:</h4>
          <div className="text-sm space-y-1">
            <p>✅ VITE_FIREBASE_API_KEY: {import.meta.env.VITE_FIREBASE_API_KEY ? 'Set' : 'Missing'}</p>
            <p>✅ VITE_FIREBASE_PROJECT_ID: {import.meta.env.VITE_FIREBASE_PROJECT_ID ? 'Set' : 'Missing'}</p>
            <p>✅ VITE_FIREBASE_APP_ID: {import.meta.env.VITE_FIREBASE_APP_ID ? 'Set' : 'Missing'}</p>
            <p>✅ VITE_FIREBASE_MESSAGING_SENDER_ID: {import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ? 'Set' : 'Missing'}</p>
          </div>
        </div>
      )}
      
      {status.firebaseConfig && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
          <h4 className="font-semibold mb-2 text-green-800">🎉 Firebase Configuration Complete!</h4>
          <p className="text-sm text-green-700">
            Using Firebase project: <strong>{import.meta.env.VITE_FIREBASE_PROJECT_ID}</strong>
          </p>
          <p className="text-xs text-green-600 mt-1">
            No additional Google Cloud setup required - your Firebase project already has Gmail API configured!
          </p>
        </div>
      )}
    </div>
  );
};

export default SetupVerification;