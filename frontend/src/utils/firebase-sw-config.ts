// Firebase service worker configuration generator
// This creates a dynamic service worker config that can access environment variables

export const generateFirebaseConfig = () => {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  };
};

// Generate service worker content with environment variables
export const generateServiceWorkerContent = () => {
  const config = generateFirebaseConfig();
  
  return `// Firebase messaging service worker - Auto-generated
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration from environment variables
const firebaseConfig = ${JSON.stringify(config, null, 2)};

firebase.initializeApp(firebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(payload => {
  console.log('Received background message: ', payload);

  const notificationTitle = payload.notification?.title || 'Intelligent Assistant';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: 'intelligent-assistant-notification',
    requireInteraction: false,
    data: payload.data || {},
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/logo192.png',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/close.png',
      },
    ],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked: ', event);

  event.notification.close();

  if (event.action === 'open' || !event.action) {
    // Open the app
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(window.location.hostname) && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise, open new window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
  // If dismiss action, just close (already handled above)
});
`;
};