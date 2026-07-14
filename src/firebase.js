// ============================================================
// Firebase — WebDog Sync Layer
// ============================================================
// Tutte le chiavi vengono lette dalle variabili d'ambiente Vite
// definite in .env (mai committare .env, usare .env.example).
// ============================================================

import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL:       import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
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

if (FIREBASE_CONFIGURED) {
  try {
    app      = initializeApp(firebaseConfig);
    database = getDatabase(app);
    auth     = getAuth(app);
  } catch (err) {
    console.warn('[WebDog] Firebase init error:', err.message);
  }
}

export { database, auth };
