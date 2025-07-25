import { useState, useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { initializeMessaging } from '../config/firebase';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export const useFirebaseMessaging = () => {
  const [messaging, setMessaging] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationPayload | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAndSetupMessaging = async () => {
      try {
        // Initialize Firebase messaging
        const messagingInstance = await initializeMessaging();
        
        if (messagingInstance) {
          setMessaging(messagingInstance);
          setIsSupported(true);

          // Set up foreground message listener
          const unsubscribe = onMessage(messagingInstance, (payload) => {
            console.log('Foreground message received:', payload);
            setNotification({
              title: payload.notification?.title || 'Notification',
              body: payload.notification?.body || 'You have a new message',
              data: payload.data,
            });
          });

          // Return cleanup function
          return unsubscribe;
        } else {
          setIsSupported(false);
          setError('Firebase messaging not supported or failed to initialize');
        }
      } catch (err) {
        console.error('Error initializing Firebase messaging:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsSupported(false);
      }
    };

    initializeAndSetupMessaging();
  }, []);

  const requestPermission = async (): Promise<string | null> => {
    if (!messaging) {
      setError('Messaging not initialized');
      return null;
    }

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('Notification permission granted');
        
        // Get FCM token
        const fcmToken = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY, // You'll need to add this to your env
        });
        
        if (fcmToken) {
          console.log('FCM Token:', fcmToken);
          setToken(fcmToken);
          setError(null);
          return fcmToken;
        } else {
          const errorMsg = 'No registration token available';
          setError(errorMsg);
          console.warn(errorMsg);
          return null;
        }
      } else {
        const errorMsg = 'Notification permission denied';
        setError(errorMsg);
        console.warn(errorMsg);
        return null;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to get notification permission';
      setError(errorMsg);
      console.error('Error getting notification permission:', err);
      return null;
    }
  };

  const clearNotification = () => {
    setNotification(null);
  };

  const sendTokenToServer = async (fcmToken: string) => {
    try {
      const response = await fetch('/api/v1/user/fcm-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // Adjust based on your auth setup
        },
        body: JSON.stringify({ fcmToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to save FCM token to server');
      }

      console.log('FCM token saved to server successfully');
      return true;
    } catch (err) {
      console.error('Error saving FCM token to server:', err);
      setError(err instanceof Error ? err.message : 'Failed to save token to server');
      return false;
    }
  };

  return {
    messaging,
    token,
    notification,
    isSupported,
    error,
    requestPermission,
    clearNotification,
    sendTokenToServer,
  };
};