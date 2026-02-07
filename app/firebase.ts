// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

// ============================================
// HR Provider - Full Gmail & Calendar permissions
// ============================================
export const googleProviderHR = new GoogleAuthProvider();
googleProviderHR.addScope('https://www.googleapis.com/auth/gmail.readonly');
googleProviderHR.addScope('https://www.googleapis.com/auth/gmail.send');
googleProviderHR.addScope('https://www.googleapis.com/auth/gmail.compose');
googleProviderHR.addScope('https://www.googleapis.com/auth/calendar');
googleProviderHR.addScope('https://www.googleapis.com/auth/calendar.events');
googleProviderHR.addScope('https://www.googleapis.com/auth/userinfo.email');
// Force consent for HR to capture refresh token for background API access
googleProviderHR.setCustomParameters({
    access_type: 'offline',
    prompt: 'consent'
});

// ============================================
// User Provider - Minimal OAuth for fast login
// ============================================
export const googleProviderUser = new GoogleAuthProvider();
googleProviderUser.addScope('https://www.googleapis.com/auth/userinfo.email');
// NO consent prompt or offline access - fastest possible popup

// Legacy export for backwards compatibility
export const googleProvider = googleProviderHR;

export default app;