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
// HR PROVIDER - Full Gmail + Calendar access
// ============================================
export const hrGoogleProvider = new GoogleAuthProvider();
// Gmail permissions
hrGoogleProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');
hrGoogleProvider.addScope('https://www.googleapis.com/auth/gmail.send');
hrGoogleProvider.addScope('https://www.googleapis.com/auth/gmail.modify');
// Calendar permissions
hrGoogleProvider.addScope('https://www.googleapis.com/auth/calendar');
hrGoogleProvider.addScope('https://www.googleapis.com/auth/calendar.events');
// Basic profile
hrGoogleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
hrGoogleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');

// Force consent for HR to get refresh token (needed for Gmail/Calendar APIs)
hrGoogleProvider.setCustomParameters({
    access_type: 'offline',
    prompt: 'consent'
});

// ============================================
// USER PROVIDER - Minimal OAuth (fast login)
// ============================================
export const userGoogleProvider = new GoogleAuthProvider();
// Only basic profile - no extended permissions
userGoogleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
userGoogleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');

// Fast login - just account picker, no consent screen for returning users
userGoogleProvider.setCustomParameters({
    prompt: 'select_account'
});

// Legacy export for backward compatibility with existing login page
export const googleProvider = hrGoogleProvider;

export default app;