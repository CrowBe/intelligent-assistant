# Firebase Setup Guide

This guide will help you set up Firebase for the Intelligent Assistant application with Authentication, Cloud Messaging, and Gmail API integration.

## Prerequisites

- Google account
- Node.js and npm installed
- Firebase CLI (optional but recommended)

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `intelligent-assistant` (or your preferred name)
4. Enable Google Analytics (recommended)
5. Choose or create a Google Analytics account
6. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, go to **Authentication** > **Sign-in method**
2. Click on **Google** provider
3. Toggle **Enable**
4. Set the project support email
5. Click **Save**

## Step 3: Enable Cloud Messaging

1. Go to **Project Settings** (gear icon) > **Cloud Messaging**
2. Note down the **Server Key** and **Sender ID**
3. Under **Web configuration**, click **Generate key pair** if not already generated
4. Note down the **Web Push certificates** key pair

## Step 4: Set up Web App

1. In **Project Settings** > **General** tab
2. Scroll down to **Your apps** section
3. Click **Web app** icon (`</>`)
4. Enter app nickname: `intelligent-assistant-web`
5. Check **"Also set up Firebase Hosting"** (optional)
6. Click **Register app**
7. Copy the Firebase configuration object

## Step 5: Generate Service Account Key

1. Go to **Project Settings** > **Service accounts**
2. Click **Generate new private key**
3. Download the JSON file
4. Keep this file secure - it contains sensitive credentials

## Step 6: Enable Gmail API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to **APIs & Services** > **Library**
4. Search for "Gmail API"
5. Click **Enable**
6. Go to **APIs & Services** > **Credentials**
7. Ensure OAuth 2.0 client is properly configured with your domains

## Step 7: Configure Environment Variables

### Frontend (.env)

```bash
# Copy from .env.example and fill in your values
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Backend (.env)

```bash
# Firebase Admin Configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'
FIREBASE_WEB_API_KEY=your_web_api_key
```

### Service Worker Configuration

Update `frontend/public/firebase-messaging-sw.js` with your Firebase config values.

## Step 8: OAuth Consent Screen

1. In Google Cloud Console, go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type
3. Fill in required fields:
   - App name: "Intelligent Assistant"
   - User support email: your email
   - Developer contact: your email
4. Add scopes:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/gmail.compose`
5. Add test users (your email for development)

## Step 9: Security Rules (if using Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // User preferences
    match /user_preferences/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Step 10: Test Configuration

1. Start your development servers:
   ```bash
   docker-compose up -d
   ```

2. Check Firebase initialization in browser console
3. Test Google authentication
4. Verify JWT tokens are being generated

## Troubleshooting

### Common Issues

1. **"Firebase configuration object is not valid"**
   - Double-check all environment variables
   - Ensure no extra spaces in values

2. **"Auth domain not authorized"**
   - Add your domain to Authorized domains in Authentication settings
   - For development: add `localhost`

3. **"Gmail API not enabled"**
   - Enable Gmail API in Google Cloud Console
   - Wait a few minutes for propagation

4. **Push notifications not working**
   - Check service worker registration
   - Verify FCM server key
   - Ensure HTTPS for production (localhost OK for dev)

## Next Steps

After completing this setup:
1. Test authentication flow
2. Implement Gmail integration
3. Set up push notifications
4. Configure morning brief system

## Security Notes

- Never commit service account keys to version control
- Use environment variables for all sensitive data
- Implement proper user permissions
- Regular security audits of Firebase rules
- Monitor authentication logs
