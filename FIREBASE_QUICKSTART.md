# Quick Start: Firebase Setup for Seel Data Bundle

## 🚀 What You Need to Do

### 1. Create Firebase Project (5 minutes)
Go to: https://console.firebase.google.com/
- Click "Add project"
- Name: `seel-data-bundle`
- Create project

### 2. Add Web App
- Click the Web icon `</>` 
- Nickname: `Seel Data Web App`
- Register app
- **COPY the firebaseConfig object shown**

### 3. Enable Firestore
- Go to "Firestore Database"
- Click "Create database"
- Select "Start in test mode"
- Location: `eur3 (europe-west)`
- Enable

### 4. Update Your Config
Open `firebase-config.js` and replace:
```javascript
apiKey: "YOUR_API_KEY"  // ← Paste your actual values here
```

### 5. Set Security Rules
In Firestore → Rules tab, paste this:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
Click "Publish"

### 6. Deploy
```bash
git add .
git commit -m "Updated Firebase config with credentials"
git push origin main
```

### 7. Test
- Go to seeldatabundle.me
- Press F12 (open console)
- Should see: "✅ Firebase initialized successfully!"
- Sign up with test account
- Check admin panel - user should appear!

## ✅ That's It!

Now all users will be saved to Firebase and visible in admin from any device!

Full details in FIREBASE_SETUP.md
