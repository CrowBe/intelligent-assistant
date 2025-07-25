import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { config } from './index.js';
import { logger } from '../utils/logger.js';

let firebaseApp: App | null = null;

// Initialize Firebase Admin SDK
export const initializeFirebase = (): App => {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    // Check if Firebase is already initialized
    const existingApps = getApps();
    if (existingApps.length > 0) {
      firebaseApp = existingApps[0];
      logger.info('Using existing Firebase app instance');
      return firebaseApp;
    }

    // Initialize new Firebase app
    const serviceAccount = config.FIREBASE_SERVICE_ACCOUNT_KEY 
      ? JSON.parse(config.FIREBASE_SERVICE_ACCOUNT_KEY)
      : null;

    if (!serviceAccount && !config.FIREBASE_PROJECT_ID) {
      throw new Error('Firebase configuration missing: either service account key or project ID required');
    }

    const firebaseConfig: any = {};

    if (serviceAccount) {
      // Use service account key for authentication
      firebaseConfig.credential = cert(serviceAccount);
      firebaseConfig.projectId = serviceAccount.project_id;
    } else {
      // Use project ID for default credentials (useful in Google Cloud environments)
      firebaseConfig.projectId = config.FIREBASE_PROJECT_ID;
    }

    firebaseApp = initializeApp(firebaseConfig);
    logger.info('Firebase Admin SDK initialized successfully', {
      projectId: firebaseConfig.projectId,
    });

    return firebaseApp;
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin SDK', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
};

// Get Firebase Messaging instance
export const getFirebaseMessaging = () => {
  const app = initializeFirebase();
  return getMessaging(app);
};

// Send push notification
export const sendPushNotification = async (
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
) => {
  try {
    const messaging = getFirebaseMessaging();
    const message = {
      token,
      notification: {
        title,
        body,
      },
      data: data || {},
    };

    const response = await messaging.send(message);
    logger.info('Push notification sent successfully', {
      messageId: response,
      token: token.substring(0, 10) + '...',
    });
    return response;
  } catch (error) {
    logger.error('Failed to send push notification', {
      error: error instanceof Error ? error.message : 'Unknown error',
      token: token.substring(0, 10) + '...',
    });
    throw error;
  }
};

export default firebaseApp;