/**
 * useRealtimeBookings — Firebase Realtime Database sync hook
 *
 * Architecture:
 *  • If Firebase is configured → subscribes to `bookings/` collection via WebSocket.
 *    All writes (add/update/delete) go directly to Firebase and propagate to every
 *    connected device in <200ms.
 *  • If Firebase is NOT configured (placeholder values in firebase.js) → falls back
 *    to localStorage-only mode, which is identical to the previous behaviour.
 *
 * syncStatus values:
 *  'local'      → Firebase not configured, running offline only
 *  'connecting' → WebSocket being established
 *  'synced'     → Live, all changes are reflected everywhere in real time
 *  'error'      → Firebase reachable but a permission/network error occurred
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ref, onValue, push, update, remove
} from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, database, FIREBASE_CONFIGURED } from '../firebase';

const LS_KEY = 'webdog_bookings';

// ─── Helpers ────────────────────────────────────────────────
const fromFirebase = (snapshot) => {
  const data = snapshot.val();
  if (!data) return [];
  return Object.entries(data)
    .map(([firebaseKey, val]) => ({ ...val, firebaseKey }))
    .sort((a, b) => String(b.id || '').localeCompare(String(a.id || '')));
};

const readLS = (defaultBookings) => {
  try {
    const saved = localStorage.getItem(LS_KEY);
    return saved ? JSON.parse(saved) : defaultBookings;
  } catch {
    return defaultBookings;
  }
};

const writeLS = (bookings) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(bookings));
  } catch {
    // Quota exceeded — not critical
  }
};

// ─── Hook ───────────────────────────────────────────────────
export function useRealtimeBookings(defaultBookings) {
  const [bookings, setBookings] = useState(() => readLS(defaultBookings));
  const [syncStatus, setSyncStatus] = useState(
    FIREBASE_CONFIGURED ? 'connecting' : 'local'
  );

  // Keep a ref to bookings for use inside callbacks without stale closure
  const bookingsRef = useRef(bookings);
  useEffect(() => { bookingsRef.current = bookings; }, [bookings]);

  // ── Firebase real-time listener ──────────────────────────
  useEffect(() => {
    if (!FIREBASE_CONFIGURED || !database || !auth) return;

    let unsubscribeOnValue = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // Clean up previous listener
      if (unsubscribeOnValue) {
        unsubscribeOnValue();
        unsubscribeOnValue = null;
      }

      // Only subscribe when a user is authenticated — avoids permission_denied
      // errors when the DB rules require auth.
      if (!user) {
        return;
      }

      const dbRef = ref(database, 'bookings');
      let seeded = false;

      unsubscribeOnValue = onValue(
        dbRef,
        (snapshot) => {
          const remote = fromFirebase(snapshot);

          if (remote.length === 0 && !seeded) {
            // First run: seed Firebase with existing localStorage data so the
            // operator doesn't lose existing bookings on first connection.
            seeded = true;
            const existing = readLS(defaultBookings);
            existing.forEach((booking) => {
              const { firebaseKey: _fk, ...clean } = booking; // strip stale key
              push(dbRef, clean);
            });
            return; // onValue will fire again after the seed push
          }

          seeded = true;
          setBookings(remote);
          writeLS(remote);
          setSyncStatus('synced');
        },
        (error) => {
          console.warn('[WebDog] Firebase onValue error:', error.message);
          setSyncStatus('error');
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeOnValue) unsubscribeOnValue();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Public API ───────────────────────────────────────────

  /** Add a new booking — writes to Firebase or localStorage */
  const addBooking = useCallback(async (newBooking) => {
    if (FIREBASE_CONFIGURED && database) {
      try {
        const { firebaseKey: _fk, ...clean } = newBooking;
        await push(ref(database, 'bookings'), clean);
        // onValue listener will update state automatically
      } catch (err) {
        console.warn('[WebDog] addBooking Firebase error:', err);
        // Optimistic local fallback
        setBookings((prev) => {
          const updated = [newBooking, ...prev];
          writeLS(updated);
          return updated;
        });
      }
    } else {
      setBookings((prev) => {
        const updated = [newBooking, ...prev];
        writeLS(updated);
        return updated;
      });
    }
  }, []);

  /** Update one or more fields of an existing booking */
  const updateBooking = useCallback(async (id, changes) => {
    const booking = bookingsRef.current.find((b) => b.id === id);
    if (FIREBASE_CONFIGURED && database && booking?.firebaseKey) {
      try {
        await update(ref(database, `bookings/${booking.firebaseKey}`), changes);
      } catch (err) {
        console.warn('[WebDog] updateBooking Firebase error:', err);
        setBookings((prev) => {
          const updated = prev.map((b) => (b.id === id ? { ...b, ...changes } : b));
          writeLS(updated);
          return updated;
        });
      }
    } else {
      setBookings((prev) => {
        const updated = prev.map((b) => (b.id === id ? { ...b, ...changes } : b));
        writeLS(updated);
        return updated;
      });
    }
  }, []);

  /** Delete a booking by its app-level id */
  const deleteBookingById = useCallback(async (id) => {
    const booking = bookingsRef.current.find((b) => b.id === id);
    if (FIREBASE_CONFIGURED && database && booking?.firebaseKey) {
      try {
        await remove(ref(database, `bookings/${booking.firebaseKey}`));
      } catch (err) {
        console.warn('[WebDog] deleteBooking Firebase error:', err);
        setBookings((prev) => {
          const updated = prev.filter((b) => b.id !== id);
          writeLS(updated);
          return updated;
        });
      }
    } else {
      setBookings((prev) => {
        const updated = prev.filter((b) => b.id !== id);
        writeLS(updated);
        return updated;
      });
    }
  }, []);

  return { bookings, addBooking, updateBooking, deleteBookingById, syncStatus };
}
