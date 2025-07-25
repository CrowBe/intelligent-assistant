// Firebase messaging service worker (Static fallback)
// Note: This is a fallback file. The dynamic service worker with environment variables
// is preferred and will be registered programmatically from the main app.

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in service worker
// These values will be replaced by the dynamic service worker in production
const firebaseConfig = {
  apiKey: 'AIzaSyDXDoj4ITnxuqahEEPi91xbmCsH3fhAMlw',
  authDomain: 'intelligent-admin.firebaseapp.com',
  projectId: 'intelligent-admin',
  storageBucket: 'intelligent-admin.firebasestorage.app',
  messagingSenderId: '449025553834',
  appId: '1:449025553834:web:8f352bd9b0820715f8e7d3',
};

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
          if (client.url.includes('localhost') && 'focus' in client) {
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
