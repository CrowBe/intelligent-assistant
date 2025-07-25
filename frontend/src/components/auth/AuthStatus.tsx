import { useAppAuth } from '../../contexts/KindeAuthContext';

const AuthStatus: React.FC = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    permissions,
    organization,
    login,
    logout,
    updateUserPreferences,
    updateBusinessInfo,
    hasPermission
  } = useAppAuth();

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading authentication...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <h3 className="text-red-800 font-semibold">Authentication Error</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">App Authentication Status</h2>
      
      {isAuthenticated && user ? (
        <div className="space-y-6">
          {/* User Info */}
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <h3 className="text-green-800 font-semibold mb-2">✅ Authenticated User</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Name:</strong> {user.fullName}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>ID:</strong> {user.id}</p>
              </div>
              <div>
                <p><strong>Business:</strong> {user.businessName || 'Not set'}</p>
                <p><strong>Type:</strong> {user.businessType || 'Not set'}</p>
                {user.picture && <p><strong>Picture:</strong> ✓ Available</p>}
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="text-blue-800 font-semibold mb-2">User Preferences</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Notifications:</strong></p>
                <ul className="ml-4 list-disc">
                  <li>Email: {user.preferences.notifications.email ? '✓' : '✗'}</li>
                  <li>Push: {user.preferences.notifications.push ? '✓' : '✗'}</li>
                  <li>SMS: {user.preferences.notifications.sms ? '✓' : '✗'}</li>
                </ul>
              </div>
              <div>
                <p><strong>AI Settings:</strong></p>
                <ul className="ml-4 list-disc">
                  <li>Personality: {user.preferences.ai.personality}</li>
                  <li>Proactive: {user.preferences.ai.proactiveMode ? '✓' : '✗'}</li>
                  <li>Suggestions: {user.preferences.ai.autoSuggestions ? '✓' : '✗'}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Permissions & Organization */}
          {(permissions.length > 0 || organization) && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded">
              <h3 className="text-purple-800 font-semibold mb-2">Permissions & Organization</h3>
              {permissions.length > 0 && (
                <p className="text-sm"><strong>Permissions:</strong> {permissions.join(', ')}</p>
              )}
              {organization && (
                <p className="text-sm"><strong>Organization:</strong> {organization.name || 'N/A'}</p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => updateUserPreferences({
                notifications: { ...user.preferences.notifications, push: !user.preferences.notifications.push }
              })}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              Toggle Push Notifications
            </button>
            <button
              onClick={() => updateBusinessInfo({
                businessName: 'Updated Business Name',
                businessType: 'updated-type'
              })}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            >
              Update Business Info
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={logout}
              className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <p className="text-gray-600">Not authenticated</p>
          <div className="space-x-4">
            <button
              onClick={login}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Login
            </button>
          </div>
        </div>
      )}

      {/* Debug Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded text-xs">
        <p><strong>Debug Info:</strong></p>
        <p>Has admin permission: {hasPermission('admin') ? '✓' : '✗'}</p>
        <p>Authentication state: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
        <p>Loading state: {isLoading ? 'Loading' : 'Ready'}</p>
      </div>
    </div>
  );
};

export default AuthStatus;