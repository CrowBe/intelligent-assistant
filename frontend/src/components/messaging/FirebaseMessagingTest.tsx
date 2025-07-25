import { useFirebaseMessaging } from '../../hooks/useFirebaseMessaging';

const FirebaseMessagingTest: React.FC = () => {
  const {
    token: fcmToken,
    notification,
    isSupported: messagingSupported,
    error: messagingError,
    requestPermission,
    clearNotification
  } = useFirebaseMessaging();

  const handleRequestNotificationPermission = async () => {
    const token = await requestPermission();
    if (token) {
      console.log('FCM Token received:', token);
      // In a real app, you'd send this token to your backend
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Firebase Cloud Messaging Test</h2>
      
      {/* Configuration Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">Configuration Status:</h3>
        <ul className="text-sm space-y-1">
          <li className="flex justify-between">
            <span>Project ID:</span>
            <span className="text-green-600">✓ {import.meta.env.VITE_FIREBASE_PROJECT_ID}</span>
          </li>
          <li className="flex justify-between">
            <span>Sender ID:</span>
            <span className="text-green-600">✓ {import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID}</span>
          </li>
          <li className="flex justify-between">
            <span>VAPID Key:</span>
            <span className="text-green-600">✓ {import.meta.env.VITE_FIREBASE_VAPID_KEY?.substring(0, 10)}...</span>
          </li>
          <li className="flex justify-between">
            <span>Messaging:</span>
            <span className={messagingSupported ? "text-green-600" : "text-red-600"}>
              {messagingSupported ? "✓ Supported" : "✗ Not supported"}
            </span>
          </li>
        </ul>
      </div>

      {/* Messaging Section */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3">Push Notifications Test:</h3>
        
        {messagingSupported ? (
          <div className="space-y-3">
            {fcmToken ? (
              <div className="p-3 bg-green-50 rounded">
                <p className="text-sm text-green-800">
                  <strong>✅ FCM Token:</strong>
                </p>
                <p className="text-xs text-green-600 break-all">
                  {fcmToken.substring(0, 50)}...
                </p>
                <p className="text-xs text-green-500 mt-1">
                  Token is ready for backend integration
                </p>
              </div>
            ) : (
              <button
                onClick={handleRequestNotificationPermission}
                className="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                🔔 Request Notification Permission
              </button>
            )}
            
            {messagingError && (
              <div className="p-3 bg-red-50 rounded">
                <p className="text-sm text-red-800">{messagingError}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 bg-yellow-50 rounded">
            <p className="text-sm text-yellow-800">
              Push notifications not supported on this browser/device
            </p>
          </div>
        )}
      </div>

      {/* Active Notification */}
      {notification && (
        <div className="mb-6 p-4 bg-blue-50 rounded border-l-4 border-blue-400">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-blue-800">{notification.title}</h4>
              <p className="text-sm text-blue-600">{notification.body}</p>
            </div>
            <button
              onClick={clearNotification}
              className="text-blue-400 hover:text-blue-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-xs text-gray-500 space-y-2">
        <p><strong>Next steps:</strong></p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Click "Request Notification Permission" above</li>
          <li>Check browser console for FCM token</li>
          <li>Send token to backend for push notifications</li>
          <li>Test sending notifications from backend</li>
        </ol>
        <p className="text-xs text-blue-600 mt-2">
          ℹ️ This component only tests Firebase Cloud Messaging (FCM), not authentication
        </p>
      </div>
    </div>
  );
};

export default FirebaseMessagingTest;