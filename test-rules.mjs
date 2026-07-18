import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, push } from 'firebase/database';

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

async function run() {
  console.log('Testing unauthenticated read to bookings...');
  try {
    await get(ref(database, 'bookings'));
    console.log('Read success!');
  } catch (err) {
    console.log('Read failed:', err.message);
  }

  console.log('Testing unauthenticated write to bookings...');
  try {
    await push(ref(database, 'bookings'), { test: true });
    console.log('Write success!');
  } catch (err) {
    console.log('Write failed:', err.message);
  }
  process.exit(0);
}
run();
