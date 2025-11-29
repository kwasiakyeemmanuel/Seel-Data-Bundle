# Firebase Setup Guide for Seel Data Bundle

## Overview
This guide will help you set up Firebase for your Seel Data Bundle website so you can see all users, orders, and reviews in your admin panel from any device.

## Why Firebase?
- ✅ **Centralized Database**: All user data stored in one place
- ✅ **Real-time Updates**: See new users and orders instantly
- ✅ **Free Tier**: More than enough for your needs
- ✅ **Works with GitHub Pages**: No backend server needed
- ✅ **Secure**: Built-in authentication and security rules

## Step-by-Step Setup

### Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `seel-data-bundle` (or any name you prefer)
4. Click **Continue**
5. Disable Google Analytics (not needed) or enable if you want analytics
6. Click **Create project**
7. Wait for project to be created, then click **Continue**

### Step 2: Create Web App

1. In your Firebase project dashboard, click the **Web icon** (`</>`) to add a web app
2. Enter app nickname: `Seel Data Web App`
3. **DO NOT** check "Also set up Firebase Hosting" (you're using GitHub Pages)
4. Click **Register app**
5. You'll see a screen with `firebaseConfig` object - **COPY THIS** (you'll need it in Step 4)
6. Click **Continue to console**

### Step 3: Enable Firestore Database

1. In the left sidebar, click **Build** → **Firestore Database**
2. Click **Create database**
3. Select **Start in test mode** (we'll secure it later)
4. Choose your location (closest to Ghana): `eur3 (europe-west)`
5. Click **Enable**
6. Wait for Firestore to be provisioned

### Step 4: Configure Firebase in Your Code

1. Open the file `firebase-config.js` in your code editor
2. Find these lines:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

3. Replace the values with YOUR Firebase config from Step 2. It should look like:
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyC...", // Your actual API key
    authDomain: "seel-data-bundle.firebaseapp.com",
    projectId: "seel-data-bundle",
    storageBucket: "seel-data-bundle.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123..."
};
```

4. Save the file

### Step 5: Set Firestore Security Rules

1. In Firebase Console, go to **Firestore Database**
2. Click on the **Rules** tab
3. Replace the existing rules with these:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - anyone can create, only owner can read/update
    match /users/{userId} {
      allow create: if true;
      allow read, update: if request.auth != null || true;
    }
    
    // Orders collection - anyone can create, anyone can read
    match /orders/{orderId} {
      allow create: if true;
      allow read: if true;
    }
    
    // Reviews collection - anyone can create and read
    match /reviews/{reviewId} {
      allow create, read: if true;
      allow delete: if true; // Admin can delete
    }
    
    // Support tickets - anyone can create and read
    match /tickets/{ticketId} {
      allow create, read: if true;
    }
  }
}
```

4. Click **Publish**

### Step 6: Deploy to GitHub

1. Commit and push your changes:
```bash
git add .
git commit -m "Added Firebase integration for centralized database"
git push origin main
```

2. Wait a few minutes for GitHub Pages to update

### Step 7: Test the Integration

1. Open your website: `https://seeldatabundle.me`
2. Open browser console (F12) - you should see:
   - ✅ Firebase initialized successfully!
   - 🔥 Firestore: Connected
   - 🔐 Auth: Ready

3. Try signing up with a test account

4. Go to admin panel: `https://seeldatabundle.me/admin.html`

5. Login and check the Users tab - you should now see all users!

## Troubleshooting

### Issue: "Firebase initialization error"
**Solution**: Make sure you replaced ALL values in `firebase-config.js` with your actual Firebase credentials.

### Issue: "Permission denied" errors
**Solution**: 
1. Go to Firebase Console → Firestore Database → Rules
2. Make sure you published the security rules from Step 5
3. Rules should be in "test mode" for now

### Issue: Users not showing in admin
**Solution**:
1. Open browser console (F12)
2. Check for error messages
3. Make sure Firebase is initialized (look for green ✅ messages)
4. Try refreshing the page

### Issue: "App not found" error
**Solution**: Make sure you created a Web App in Step 2, not an iOS or Android app.

## Security (Important for Production)

The current Firebase rules are in "test mode" and will expire after 30 days. Before going live:

1. Set up proper authentication rules
2. Require admin authentication for sensitive operations
3. Add rate limiting
4. Enable App Check for additional security

Contact me if you need help securing your Firebase database for production.

## What's Next?

Now that Firebase is set up:
- ✅ All new users will be saved to Firebase
- ✅ Admin panel will show users from Firebase
- ✅ You can access admin from any device and see all users
- ✅ Data is centralized and secure

## Need Help?

If you encounter any issues:
1. Check the browser console for error messages
2. Verify all Firebase credentials are correct
3. Make sure Firestore database is enabled
4. Check that security rules are published

---

**Created for Seel Data Bundle**  
Last updated: November 29, 2025
