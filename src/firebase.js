// ============================================================
// Firebase — WebDog Sync Layer
// ============================================================
// Tutte le chiavi vengono lette dalle variabili d'ambiente Vite
// definite in .env (mai committare .env, usare .env.example).
// ============================================================

import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDLgK3NAYMAVN8vOR0Xts85PmKGSl7JliI',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'webdog-bookings.firebaseapp.com',
  databaseURL:       import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://webdog-bookings-default-rtdb.europe-west1.firebasedatabase.app',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID || 'webdog-bookings',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'webdog-bookings.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '920474613807',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID || '1:920474613807:web:3a800e7fbde166d71d2eda',
};

// Firebase è configurato se apiKey e databaseURL sono presenti
// e non sono i valori placeholder del .env.example
export const FIREBASE_CONFIGURED =
  Boolean(firebaseConfig.apiKey) &&
  firebaseConfig.apiKey !== 'your_api_key_here' &&
  Boolean(firebaseConfig.databaseURL) &&
  firebaseConfig.databaseURL !== 'https://your_project-default-rtdb.europe-west1.firebasedatabase.app';

let app      = null;
let database = null;
let auth     = null;
let storage  = null;

if (FIREBASE_CONFIGURED) {
  try {
    app      = initializeApp(firebaseConfig);
    database = getDatabase(app);
    auth     = getAuth(app);
    storage  = getStorage(app);
  } catch (err) {
    console.warn('[WebDog] Firebase init error:', err.message);
  }
}

export { database, auth, storage };
