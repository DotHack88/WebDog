import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push } from 'firebase/database';

const firebaseConfig = {
  apiKey:            'AIzaSyBPHEet9Vzmh6EA0b4KREkYZ_Rq39A1xwc',
  authDomain:        'webdog-app.firebaseapp.com',
  databaseURL:       'https://webdog-app-default-rtdb.firebaseio.com/',
  projectId:         'webdog-app',
  storageBucket:     'webdog-app.firebasestorage.app',
  messagingSenderId: '1065242505942',
  appId:             '1:1065242505942:web:f7bbe44fefa7bfe609cf77',
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const bookingsRef = ref(database, 'bookings');

function createRange(startD, startM, endD, endM, data) {
    const start = new Date(2026, startM - 1, startD);
    const end = new Date(2026, endM - 1, endD);
    const arr = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        
        arr.push({
            ...data,
            id: 'b_' + Date.now() + Math.random().toString().slice(2, 6),
            date: `${y}-${m}-${day}`,
            status: 'confirmed'
        });
    }
    return arr;
}

const allBookings = [
    // Dalila
    ...createRange(12, 8, 18, 8, {
        firstName: 'Dalila', lastName: '', phone: '3331234567', email: 'dalila@example.com',
        dogName: 'Gatti', dogBreed: 'Gatto', dogAge: '', service: 'Visita Domicilio',
        time: '12:00', notes: ''
    }),
    // Annarita
    ...createRange(13, 8, 23, 8, {
        firstName: 'Annarita', lastName: '', phone: '3331234567', email: 'annarita@example.com',
        dogName: 'Gatti', dogBreed: 'Gatto', dogAge: '', service: 'Visita Domicilio',
        time: '11:00', notes: ''
    }),
    // Blade Passeggiata Mattina
    ...createRange(14, 8, 20, 8, {
        firstName: 'Proprietario', lastName: 'Blade', phone: '3331234567', email: 'blade@example.com',
        dogName: 'Blade', dogBreed: 'Cane', dogAge: '', service: 'Passeggiata',
        time: '08:30', notes: 'Passeggiata Mattina'
    }),
    // Blade Passeggiata Pomeriggio
    ...createRange(14, 8, 20, 8, {
        firstName: 'Proprietario', lastName: 'Blade', phone: '3331234567', email: 'blade@example.com',
        dogName: 'Blade', dogBreed: 'Cane', dogAge: '', service: 'Passeggiata', 
        time: '18:00', notes: 'Passeggiata Pomeriggio'
    }),
    // Tyson Passeggiata
    ...createRange(16, 8, 22, 8, {
        firstName: 'Proprietario', lastName: 'Tyson', phone: '3331234567', email: 'tyson@example.com',
        dogName: 'Tyson', dogBreed: 'Cane', dogAge: '', service: 'Passeggiata', 
        time: '20:30', notes: ''
    })
];

async function run() {
    try {
        console.log(`Adding ${allBookings.length} bookings...`);
        for (const b of allBookings) {
            await push(bookingsRef, b);
            console.log(`Added: ${b.firstName} ${b.dogName} - ${b.date} - ${b.time}`);
        }
        console.log('All done!');
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}

run();
