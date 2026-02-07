/**
 * @file firebase.ts
 * @description Firebase initialization boot file.
 * @author Vasile Chifeac (AI Agent)
 * @created 2026-02-06
 * @modified 2026-02-06
 *
 * @dependencies
 * - firebase/app
 * - firebase/auth
 * - firebase/firestore
 */

import { boot } from 'quasar/wrappers';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { useSecureLogger } from 'src/shared/logger';

// Firebase configuration from environment
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const logger = useSecureLogger();

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export default boot(() => {
  // Make firebase available globally if needed, or primarily via imports
  // vueApp.config.globalProperties.$firebase = { auth, db, storage };
  logger.info('Firebase initialized');
});

export { auth, db, storage };
