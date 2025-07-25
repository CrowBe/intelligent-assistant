import { initializeApp } from 'firebase/app';
import { getMessaging, isSupported } from 'firebase/messaging';

// Firebase configuration - these will be set via environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging (only if supported)
let messaging: any = null;

// Initialize messaging with service worker registration
export const initializeMessaging = async () => {
  console.log('🔍 Checking Firebase Cloud Messaging support...');
  
  const supported = await isSupported();
  console.log('📱 FCM isSupported:', supported);
  console.log('🔧 ServiceWorker available:', 'serviceWorker' in navigator);
  console.log('🌐 Protocol:', window.location.protocol);
  console.log('🏠 Hostname:', window.location.hostname);
  
  if (supported && 'serviceWorker' in navigator) {
    try {
      // Register the static Firebase service worker
      console.log('📦 Registering Firebase service worker...');
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/'
      });
      console.log('⚙️  Service worker registration successful:', registration);
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      console.log('✅ Service worker is ready');
      
      // Initialize Firebase messaging
      console.log('🔧 Attempting to get Firebase messaging instance...');
      console.log('📋 Firebase config check:', {
        apiKey: firebaseConfig.apiKey ? '✓ Set' : '✗ Missing',
        projectId: firebaseConfig.projectId,
        messagingSenderId: firebaseConfig.messagingSenderId,
        appId: firebaseConfig.appId ? '✓ Set' : '✗ Missing'
      });
      
      messaging = getMessaging(app);
      console.log('✅ Firebase Cloud Messaging initialized successfully');
      
      return messaging;
    } catch (error) {
      console.error('💥 Error initializing Firebase messaging:', error);
      console.error('Error details:', error.message);
    }
  } else {
    if (!supported) {
      console.warn('❌ Firebase Cloud Messaging not supported on this browser/environment');
    }
    if (!('serviceWorker' in navigator)) {
      console.warn('❌ Service Workers not available in this browser');
    }
  }
  
  return null;
};

export { messaging };
export default app;