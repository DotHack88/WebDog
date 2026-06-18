// ============================================================
// Firebase Realtime Database — WebDog Sync Layer
// ============================================================
// HOW TO CONFIGURE:
//   1. Go to https://console.firebase.google.com/
//   2. Create a new project (e.g. "webdog-bookings")
//   3. Add a Web App and copy the config below
//   4. Enable "Realtime Database" → Start in test mode
//   5. Replace the placeholder values and restart the dev server
// ============================================================

import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDLgK3NAYMAVN8vOR0Xts85PmKGSl7JliI",
  authDomain: "webdog-bookings.firebaseapp.com",
  databaseURL: "https://webdog-bookings-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "webdog-bookings",
  storageBucket: "webdog-bookings.firebasestorage.app",
  messagingSenderId: "920474613807",
  appId: "1:920474613807:web:3a800e7fbde166d71d2eda"
};

// ─── Auto-detect if config has been filled in ──────────────
export const FIREBASE_CONFIGURED =
  firebaseConfig.apiKey !== 'AIzaSyDLgK3NAYMAVN8vOR0Xts85PmKGSl7JliI' &&
  firebaseConfig.databaseURL !== 'https://webdog-bookings-default-rtdb.europe-west1.firebasedatabase.app';

let app = null;
let database = null;

if (FIREBASE_CONFIGURED) {
  try {
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    console.info('[WebDog] ✅ Firebase Realtime DB connected — live sync active.');
  } catch (err) {
    console.warn('[WebDog] Firebase init error:', err.message);
  }
} else {
  console.info('[WebDog] ℹ️ Firebase not configured — running in localStorage-only mode.');
}

export { database };
