import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Simple configuration check. If keys are missing or contain placeholder text, use fallback.
const isConfigured = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'your_api_key_here' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'your_project_id_here';

let db = null;
let useLocalStorageFallback = false;

if (isConfigured) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    console.log("Firebase (Firestore) initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Firebase, falling back to LocalStorage simulation.", error);
    useLocalStorageFallback = true;
  }
} else {
  console.warn("Firebase credentials not configured in environment variables. Running in LocalStorage Fallback mode.");
  useLocalStorageFallback = true;
}

export { db, useLocalStorageFallback };
