// Firebase Configuration
// Follow these steps to set up Firebase:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project (or use existing)
// 3. Add a Web App to your project
// 4. Copy the configuration values below
// 5. Enable Firestore Database in Firebase Console
// 6. Set Firestore rules to allow authenticated access

// Firebase configuration values
const firebaseConfig = {
    apiKey: "AIzaSyCaFzPhm5DRaa7bhig0-GT69QD_s5zh6aM",
    authDomain: "seel-data-bundle.firebaseapp.com",
    projectId: "seel-data-bundle",
    storageBucket: "seel-data-bundle.firebasestorage.app",
    messagingSenderId: "48922889152",
    appId: "1:48922889152:web:f41c8b7016c69a1726d625",
    measurementId: "G-JE324SLNP4"
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
