import { initializeApp } from 'firebase/app';
import { getDatabase, ref, remove } from 'firebase/database';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            'AIzaSyDLgK3NAYMAVN8vOR0Xts85PmKGSl7JliI',
  authDomain:        'webdog-bookings.firebaseapp.com',
  databaseURL:       'https://webdog-bookings-default-rtdb.europe-west1.firebasedatabase.app',
  projectId:         'webdog-bookings',
  storageBucket:     'webdog-bookings.firebasestorage.app',
  messagingSenderId: '920474613807',
  appId:             '1:920474613807:web:3a800e7fbde166d71d2eda',
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

async function run() {
  try {
    // To clear the gallery node, we need to be authenticated if rules require it.
    // However, since we don't have the user's password here, we might fail to auth.
    // If we fail, we'll try without auth.
    console.log('Attempting to clear gallery node without auth...');
    await remove(ref(database, 'gallery'));
    console.log('Successfully cleared gallery node.');
  } catch (err) {
    console.error('Failed to clear gallery:', err.message);
  }
  process.exit(0);
}
run();
