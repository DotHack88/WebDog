import { useState, useEffect, useCallback, useRef } from 'react';
import { ref, onValue, push, update, remove } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, database, FIREBASE_CONFIGURED } from '../firebase';

const LS_KEY = 'webdog_gallery';

const fromFirebase = (snapshot) => {
  const data = snapshot.val();
  if (!data) return [];
  return Object.entries(data)
    .map(([firebaseKey, val]) => ({ ...val, firebaseKey }))
    .sort((a, b) => Number(a.id || 0) - Number(b.id || 0)); // keep numerical ordering ascending
};

const readLS = (defaultImages) => {
  try {
    const saved = localStorage.getItem(LS_KEY);
    return saved ? JSON.parse(saved) : defaultImages;
  } catch {
    return defaultImages;
  }
};

const writeLS = (images) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(images));
  } catch {
    // Quota exceeded
  }
};

export function useRealtimeGallery(defaultImages) {
  const [galleryImages, setGalleryImages] = useState(() => readLS(defaultImages));
  const [syncStatus, setSyncStatus] = useState(
    FIREBASE_CONFIGURED ? 'connecting' : 'local'
  );

  const galleryRef = useRef(galleryImages);
  useEffect(() => {
    galleryRef.current = galleryImages;
  }, [galleryImages]);

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
      // errors when the DB rules require auth (e.g. unauthenticated page visits).
      if (!user) {
        setSyncStatus('local');
        return;
      }

      const dbRef = ref(database, 'gallery');
      let seeded = false;

      unsubscribeOnValue = onValue(
        dbRef,
        (snapshot) => {
          const remote = fromFirebase(snapshot);

          if (remote.length === 0 && !seeded) {
            // First run: seed Firebase with default/localStorage images so the
            // database is initialized
            seeded = true;
            const existing = readLS(defaultImages);
            existing.forEach((img) => {
              const { firebaseKey: _fk, ...clean } = img;
              push(dbRef, clean);
            });
            return; // onValue will trigger again
          }

          seeded = true;
          setGalleryImages(remote);
          writeLS(remote);
          setSyncStatus('synced');
        },
        (error) => {
          console.warn('[WebDog] Firebase gallery onValue error:', error.message);
          setSyncStatus('error');
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeOnValue) unsubscribeOnValue();
    };
  }, [defaultImages]);

  // ── Public API ───────────────────────────────────────────

  /** Add a new gallery image */
  const addGalleryImage = useCallback(async (newImage) => {
    if (FIREBASE_CONFIGURED && database) {
      try {
        const { firebaseKey: _fk, ...clean } = newImage;
        await push(ref(database, 'gallery'), clean);
      } catch (err) {
        console.warn('[WebDog] addGalleryImage Firebase error:', err);
        setGalleryImages((prev) => {
          const updated = [...prev, newImage];
          writeLS(updated);
          return updated;
        });
      }
    } else {
      setGalleryImages((prev) => {
        const updated = [...prev, newImage];
        writeLS(updated);
        return updated;
      });
    }
  }, []);

  /** Update an existing gallery image */
  const updateGalleryImage = useCallback(async (id, changes) => {
    const img = galleryRef.current.find((i) => i.id === id);
    if (FIREBASE_CONFIGURED && database && img?.firebaseKey) {
      try {
        await update(ref(database, `gallery/${img.firebaseKey}`), changes);
      } catch (err) {
        console.warn('[WebDog] updateGalleryImage Firebase error:', err);
        setGalleryImages((prev) => {
          const updated = prev.map((i) => (i.id === id ? { ...i, ...changes } : i));
          writeLS(updated);
          return updated;
        });
      }
    } else {
      setGalleryImages((prev) => {
        const updated = prev.map((i) => (i.id === id ? { ...i, ...changes } : i));
        writeLS(updated);
        return updated;
      });
    }
  }, []);

  /** Delete a gallery image by id */
  const deleteGalleryImageById = useCallback(async (id) => {
    const img = galleryRef.current.find((i) => i.id === id);
    if (FIREBASE_CONFIGURED && database && img?.firebaseKey) {
      try {
        await remove(ref(database, `gallery/${img.firebaseKey}`));
      } catch (err) {
        console.warn('[WebDog] deleteGalleryImage Firebase error:', err);
        setGalleryImages((prev) => {
          const updated = prev.filter((i) => i.id !== id);
          writeLS(updated);
          return updated;
        });
      }
    } else {
      setGalleryImages((prev) => {
        const updated = prev.filter((i) => i.id !== id);
        writeLS(updated);
        return updated;
      });
    }
  }, []);

  return {
    galleryImages,
    addGalleryImage,
    updateGalleryImage,
    deleteGalleryImageById,
    gallerySyncStatus: syncStatus,
  };
}
