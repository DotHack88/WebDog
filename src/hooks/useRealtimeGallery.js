import { useState, useEffect, useCallback, useRef } from 'react';
import { ref, onValue, push, update, remove } from 'firebase/database';
import { database, FIREBASE_CONFIGURED } from '../firebase';

const LS_KEY = 'webdog_gallery_v2';

const sanitizeGalleryData = (imagesArray) => {
  const badPattern = 'webdog-bookings.firebasestorage.app';
  return imagesArray.map((val) => {
    let safeSrc = val.src || '';
    if (typeof safeSrc === 'string' && safeSrc.includes(badPattern)) {
      safeSrc = 'data:image/png;base64,BROKEN';
    }
    
    let safeAlbum = val.album || [];
    if (Array.isArray(safeAlbum)) {
      safeAlbum = safeAlbum.map(url => 
        (typeof url === 'string' && url.includes(badPattern)) 
          ? 'data:image/png;base64,BROKEN'
          : url
      );
    }

    // Fix images previously saved with the literal '__new__' category sentinel
    const safeCategory = val.category === '__new__' ? 'Senza Categoria' : (val.category || 'Senza Categoria');

    return { ...val, src: safeSrc, album: safeAlbum, category: safeCategory };
  });
};

const fromFirebase = (snapshot) => {
  const data = snapshot.val();
  if (!data) return [];
  const rawArray = Object.entries(data).map(([firebaseKey, val]) => ({ ...val, firebaseKey }));
  const sanitizedArray = sanitizeGalleryData(rawArray);
  return sanitizedArray.sort((a, b) => Number(a.id || 0) - Number(b.id || 0));
};

const readLS = (defaultImages) => {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return sanitizeGalleryData(parsed);
    }
    return defaultImages;
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

  // ── Firebase real-time listener ──────────────────────────────────────
  useEffect(() => {
    if (!FIREBASE_CONFIGURED || !database) return;

    // La galleria è dati pubblici — avvia il listener subito, senza aspettare auth.
    // Le scritture (add/update/delete) richiedono auth tramite il login Admin.
    const dbRef = ref(database, 'gallery');
    let seeded = false;

    const unsubscribeOnValue = onValue(
      dbRef,
      (snapshot) => {
        const remote = fromFirebase(snapshot);

        if (remote.length === 0 && !seeded) {
          seeded = true;
          const existing = readLS(defaultImages);
          if (existing && existing.length > 0) {
            // Seed Firebase con i dati locali (solo alla prima volta)
            import('firebase/database').then(({ push: fbPush }) => {
              existing.forEach((img) => {
                const { firebaseKey: _fk, ...clean } = img;
                fbPush(dbRef, clean);
              });
            }).catch(() => {
              existing.forEach((img) => {
                const { firebaseKey: _fk, ...clean } = img;
                push(dbRef, clean);
              });
            });
            return; // onValue si riattiverà dopo il seed
          }
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

    return () => {
      unsubscribeOnValue();
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
