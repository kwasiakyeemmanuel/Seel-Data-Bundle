// Firebase Configuration
// Follow these steps to set up Firebase:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project (or use existing)
// 3. Add a Web App to your project
// 4. Copy the configuration values below
// 5. Enable Firestore Database in Firebase Console
// 6. Set Firestore rules to allow authenticated access

// REPLACE THESE VALUES WITH YOUR FIREBASE PROJECT CREDENTIALS
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
let db = null;
let auth = null;

try {
    // Initialize Firebase App
    const app = firebase.initializeApp(firebaseConfig);
    
    // Initialize Firestore
    db = firebase.firestore();
    
    // Initialize Auth
    auth = firebase.auth();
    
    console.log('✅ Firebase initialized successfully!');
    console.log('🔥 Firestore:', db ? 'Connected' : 'Not connected');
    console.log('🔐 Auth:', auth ? 'Ready' : 'Not ready');
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
    console.error('⚠️ Make sure you have replaced the configuration values in firebase-config.js');
}

// Export for use in other files
window.firebaseDB = db;
window.firebaseAuth = auth;
