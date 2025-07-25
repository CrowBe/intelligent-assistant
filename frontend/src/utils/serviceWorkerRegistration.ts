import { generateServiceWorkerContent } from './firebase-sw-config';

// Register Firebase messaging service worker with dynamic configuration
export const registerFirebaseServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported');
    return null;
  }

  try {
    // Create a blob with the service worker content including environment variables
    const swContent = generateServiceWorkerContent();
    const blob = new Blob([swContent], { type: 'application/javascript' });
    const swUrl = URL.createObjectURL(blob);

    // Register the service worker
    const registration = await navigator.serviceWorker.register(swUrl, {
      scope: '/',
    });

    console.log('Firebase Service Worker registered successfully:', registration);

    // Clean up the blob URL
    URL.revokeObjectURL(swUrl);

    // Handle service worker updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('New Firebase Service Worker installed');
            // Optionally show user a notification about update
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.error('Firebase Service Worker registration failed:', error);
    return null;
  }
};

// Alternative: Register static file service worker (fallback)
export const registerStaticServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    });

    console.log('Static Firebase Service Worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('Static Service Worker registration failed:', error);
    return null;
  }
};

// Unregister service worker
export const unregisterServiceWorker = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const result = await registration.unregister();
      console.log('Service Worker unregistered:', result);
      return result;
    }
    return false;
  } catch (error) {
    console.error('Service Worker unregistration failed:', error);
    return false;
  }
};