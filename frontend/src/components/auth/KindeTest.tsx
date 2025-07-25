import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

const KindeTest: React.FC = () => {
  const {
    login,
    register,
    logout,
    isAuthenticated,
    isLoading,
    user,
    getToken,
    getUserOrganization,
    getPermissions,
    getClaim
  } = useKindeAuth();

  const handleGetTokens = async () => {
    if (isAuthenticated) {
      try {
        const accessToken = await getToken();
        console.log('Kinde Access Token:', accessToken);
        
        // Get user permissions
        const permissions = getPermissions();
        console.log('User Permissions:', permissions);
        
        // Get user organization
        const org = getUserOrganization();
        console.log('User Organization:', org);
        
        // Get custom claims (if any)
        const customClaim = getClaim('custom_claim');
        console.log('Custom Claims:', customClaim);
        
      } catch (error) {
        console.error('Error getting tokens:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading Kinde...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Kinde Authentication Test</h2>
      
      {/* Configuration Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">Configuration Status:</h3>
        <ul className="text-sm space-y-1">
          <li className="flex justify-between">
            <span>Client ID:</span>
            <span className="text-green-600">✓ {import.meta.env.VITE_KINDE_CLIENT_ID?.substring(0, 8)}...</span>
          </li>
          <li className="flex justify-between">
            <span>Domain:</span>
            <span className="text-green-600">✓ {import.meta.env.VITE_KINDE_DOMAIN}</span>
          </li>
          <li className="flex justify-between">
            <span>Redirect URI:</span>
            <span className="text-green-600">✓ {import.meta.env.VITE_KINDE_REDIRECT_URI}</span>
          </li>
        </ul>
      </div>

      {/* Authentication Status */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3">Authentication Status:</h3>
        
        {isAuthenticated ? (
          <div className="space-y-3">
            <div className="p-3 bg-green-50 rounded">
              <p className="text-sm text-green-800">
                <strong>✅ Authenticated as:</strong> {user?.given_name} {user?.family_name}
              </p>
              <p className="text-xs text-green-600">Email: {user?.email}</p>
              <p className="text-xs text-green-600">ID: {user?.id}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleGetTokens}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                🔑 Get Tokens
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-3">Not authenticated</p>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={login}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                🔐 Login
              </button>
              <button
                onClick={register}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
              >
                📝 Register
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Details */}
      {isAuthenticated && user && (
        <div className="mb-6 p-4 bg-blue-50 rounded">
          <h3 className="font-semibold mb-2 text-blue-800">User Details:</h3>
          <div className="text-sm space-y-1 text-blue-700">
            <p><strong>Name:</strong> {user.given_name} {user.family_name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Picture:</strong> {user.picture ? '✓ Available' : '✗ None'}</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-xs text-gray-500 space-y-2">
        <p><strong>Test Steps:</strong></p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Click Login or Register to test authentication</li>
          <li>Check browser console for detailed logs</li>
          <li>Click "Get Tokens" to see JWT access token</li>
          <li>Verify user details are populated correctly</li>
        </ol>
      </div>
    </div>
  );
};

export default KindeTest;