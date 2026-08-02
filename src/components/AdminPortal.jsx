import React, { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserSessionPersistence,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  Calendar, DollarSign, Users, Star, Trash2, Check, Clock, 
  ArrowLeft, LogOut, Download, RefreshCw, Sliders, Search, 
  Lock, Mail, FileText, Smartphone, Bell, Eye, EyeOff, Menu, X,
  Image as ImageIcon, Plus, Edit2, Upload, Loader
} from 'lucide-react';
import { auth, FIREBASE_CONFIGURED, storage } from '../firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function AdminPortal({ 
  bookings, 
  updateBookingStatus, 
  updateBookingDetails,
  deleteBooking, 
  reviews, 
  triggerToast,
  notificationLogs,
  setNotificationLogs,
  syncStatus,
  galleryImages = [],
  addGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
  gallerySyncStatus,
  onClose 
}) {

  // ── Firebase sync status badge ────────────────────────────
  const syncBadge = (() => {
    switch (syncStatus) {
      case 'synced':
        return { icon: '🟢', label: 'Live Sync', color: '#10b981', bg: '#d1fae5', title: 'Firebase Realtime DB connesso — tutte le prenotazioni sono sincronizzate in tempo reale.' };
      case 'connecting':
        return { icon: '🟡', label: 'Connessione...', color: '#f59e0b', bg: '#fef3c7', title: 'Connessione a Firebase in corso...' };
      case 'error':
        return { icon: '🔴', label: 'Sync Error', color: '#ef4444', bg: '#fee2e2', title: 'Errore di sincronizzazione Firebase. Le modifiche sono salvate localmente.' };
      default:
        return { icon: '⚪', label: 'Solo Locale', color: '#64748b', bg: '#f1f5f9', title: 'Firebase non configurato. Le prenotazioni sono salvate solo su questo dispositivo.' };
    }
  })();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(FIREBASE_CONFIGURED ? true : false);

  // Ripristina la sessione dell'operatore in caso di refresh della pagina
  useEffect(() => {
    if (!FIREBASE_CONFIGURED || !auth) {
      setAuthLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [emailConfig, setEmailConfig] = useState(() => {
    const saved = localStorage.getItem('webdog_email_config');
    return saved ? JSON.parse(saved) : {
      method: 'emailjs',
      emailjsServiceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
      emailjsTemplateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '',
      emailjsPublicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '',
      adminEmail: import.meta.env.VITE_ADMIN_EMAIL || ''
    };
  });

  const handleSaveEmailConfig = (e) => {
    e.preventDefault();
    localStorage.setItem('webdog_email_config', JSON.stringify(emailConfig));
    triggerToast('Configurazione Salvata', 'Configurazione email salvata con successo.', 'success', 'System');
  };

  // ── Gallery Management State & Handlers ───────────────────
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    desc: '',
    category: 'Passeggiate',
    src: '',
    album: []
  });
  const [editingImageId, setEditingImageId] = useState(null);
  const [editGalleryForm, setEditGalleryForm] = useState({
    title: '',
    desc: '',
    category: 'Passeggiate',
    src: '',
    album: []
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileUpload = async (e, mode = 'add') => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setIsUploading(true);
    setUploadError('');

    const targetForm = mode === 'add' ? galleryForm : editGalleryForm;
    const category = targetForm.category || 'Uncategorized';

    // Helper: read files as base64 data URIs
    const readAsBase64 = (fileList) => Promise.all(fileList.map(file => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve({ name: file.name, base64: event.target.result });
      reader.onerror = () => reject(new Error('Errore durante la lettura del file locale.'));
      reader.readAsDataURL(file);
    })));

    const applyUrls = (urls, setForm) => {
      setForm(prev => {
        const currentAlbum = prev.album || (prev.src ? [prev.src] : []);
        const newAlbum = [...currentAlbum, ...urls];
        return { ...prev, src: newAlbum[0], album: newAlbum };
      });
    };

    try {
      const imgbbKey = import.meta.env.VITE_IMGBB_API_KEY;

      if (imgbbKey) {
        // 1. Upload to ImgBB
        const urls = [];
        const fileDataList = await readAsBase64(files);
        
        for (const fileData of fileDataList) {
          const formData = new FormData();
          // Estrai solo la parte base64 pulita (dopo la virgola)
          const base64Content = fileData.base64.split(',')[1];
          formData.append('image', base64Content);
          formData.append('name', fileData.name.split('.')[0]); // Nome opzionale
          
          const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          if (data.success) {
            urls.push(data.data.url);
          } else {
            throw new Error(data.error?.message || 'Errore API ImgBB');
          }
        }
        applyUrls(urls, mode === 'add' ? setGalleryForm : setEditGalleryForm);
        triggerToast('Caricamento Completato', `${urls.length} foto salvat${urls.length > 1 ? 'e' : 'a'} su ImgBB.`, 'success', 'Storage');

      } else if (FIREBASE_CONFIGURED && storage) {
        // 2. Upload to Firebase Storage
        const urls = [];
        for (const file of files) {
          const safeName = Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
          const fileRef = storageRef(storage, `album/${category}/${safeName}`);
          await uploadBytes(fileRef, file);
          const downloadUrl = await getDownloadURL(fileRef);
          urls.push(downloadUrl);
        }
        applyUrls(urls, mode === 'add' ? setGalleryForm : setEditGalleryForm);
        triggerToast('Caricamento Completato', `${urls.length} foto salvat${urls.length > 1 ? 'e' : 'a'} sul cloud (Firebase).`, 'success', 'Storage');
        
      } else {
        // 3. Fallback to local upload (only works with vite dev server)
        const fileDataList = await readAsBase64(files);

        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            category,
            files: fileDataList
          })
        });

        if (!response.ok) {
          let errData;
          try {
            errData = await response.json();
          } catch (jsonErr) {
            throw new Error(`Errore HTTP ${response.status}: L'API locale non è disponibile. Controlla di usare il comando "npm run dev".`);
          }
          throw new Error(errData?.error || 'Errore del server durante il salvataggio.');
        }

        const { urls } = await response.json();
        applyUrls(urls, mode === 'add' ? setGalleryForm : setEditGalleryForm);
        triggerToast('Caricamento Completato', `${urls.length} foto salvat${urls.length > 1 ? 'e' : 'a'} in locale.`, 'success', 'Storage Locale');
      }
    } catch (err) {
      console.error('[WebDog] Upload failed:', err);
      setUploadError(`Caricamento fallito: ${err.message}`);
      triggerToast('Errore Caricamento', err.message, 'error', 'Storage');
    } finally {
      setIsUploading(false);
    }
  };




  const handleAddGalleryImage = async (e) => {
    e.preventDefault();
    if ((!galleryForm.src && (!galleryForm.album || galleryForm.album.length === 0)) || !galleryForm.title) {
      triggerToast('Campi Mancanti', "La foto deve avere un titolo e almeno un'immagine caricata o URL.", 'error', 'Galleria');
      return;
    }

    const newImage = {
      id: Date.now(),
      src: galleryForm.src || (galleryForm.album && galleryForm.album[0]) || '',
      album: galleryForm.album || (galleryForm.src ? [galleryForm.src] : []),
      title: galleryForm.title,
      desc: galleryForm.desc || '',
      category: galleryForm.category
    };

    await addGalleryImage(newImage);
    setGalleryForm({
      title: '',
      desc: '',
      category: 'Passeggiate',
      src: '',
      album: []
    });
  };

  const handleStartEditImage = (img) => {
    setEditingImageId(img.id);
    setEditGalleryForm({
      title: img.title,
      desc: img.desc || '',
      category: img.category,
      src: img.src,
      album: img.album || (img.src ? [img.src] : [])
    });
  };

  const handleSaveEditImage = async (e) => {
    e.preventDefault();
    if ((!editGalleryForm.src && (!editGalleryForm.album || editGalleryForm.album.length === 0)) || !editGalleryForm.title) {
      triggerToast('Campi Mancanti', "La foto deve avere un titolo e un'immagine.", 'error', 'Galleria');
      return;
    }

    await updateGalleryImage(editingImageId, {
      title: editGalleryForm.title,
      desc: editGalleryForm.desc,
      category: editGalleryForm.category,
      src: editGalleryForm.src || (editGalleryForm.album && editGalleryForm.album[0]) || '',
      album: editGalleryForm.album || (editGalleryForm.src ? [editGalleryForm.src] : [])
    });
    setEditingImageId(null);
  };

  const handleDeleteImage = async (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questa foto dalla galleria?')) {
      await deleteGalleryImage(id);
      if (editingImageId === id) {
        setEditingImageId(null);
      }
    }
  };

  // Tabs: 'dashboard', 'agenda', 'reviews', 'notifications'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [scheduleView, setScheduleView] = useState('month'); // month, week, day
  const [searchTerm, setSearchTerm] = useState('');
  const [syncingGoogle, setSyncingGoogle] = useState(false);
  const [syncingOutlook, setSyncingOutlook] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  // Handle Login — Firebase Authentication
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    if (!FIREBASE_CONFIGURED || !auth) {
      // Firebase non configurato: fallback sicuro su variabili d'ambiente
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || '';
      if (!adminEmail || email !== adminEmail) {
        setLoginError('Credenziali non valide. Verifica email e password.');
        setLoginLoading(false);
        return;
      }
      // Senza Firebase Auth non possiamo verificare la password lato client in modo sicuro.
      // Mostriamo un avviso e blocchiamo l'accesso.
      setLoginError('Firebase non è configurato. Completa la configurazione in .env per abilitare il login sicuro.');
      setLoginLoading(false);
      return;
    }

    try {
      await setPersistence(auth, browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      setIsLoggedIn(true);
      setLoginError('');
      triggerToast('Accesso Eseguito', 'Benvenuto nella tua Area Gestionale Operatore.', 'success', 'System');
    } catch (err) {
      const messages = {
        'auth/user-not-found': 'Nessun account trovato con questa email.',
        'auth/wrong-password': 'Password non corretta.',
        'auth/invalid-email': 'Indirizzo email non valido.',
        'auth/too-many-requests': 'Troppi tentativi falliti. Riprova tra qualche minuto.',
        'auth/invalid-credential': 'Credenziali non valide. Verifica email e password.',
      };
      setLoginError(messages[err.code] || `Errore di accesso: ${err.message}`);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (FIREBASE_CONFIGURED && auth) {
        await signOut(auth);
      }
    } catch (_) { /* silent */ }
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
    triggerToast('Disconnessione', 'Sessione chiusa correttamente.', 'info', 'System');
  };

  // Sync simulations
  const handleSync = (type) => {
    if (type === 'google') {
      setSyncingGoogle(true);
      setTimeout(() => {
        setSyncingGoogle(false);
        triggerToast(
          'Google Calendar Sincronizzato', 
          'Tutti gli appuntamenti WebDog sono ora sincronizzati con Google Calendar.', 
          'success', 
          'Google API'
        );
      }, 1500);
    } else {
      setSyncingOutlook(true);
      setTimeout(() => {
        setSyncingOutlook(false);
        triggerToast(
          'Outlook Calendar Sincronizzato', 
          'Integrazione completata. Nuovi slot sincronizzati.', 
          'success', 
          'Outlook Exchange'
        );
      }, 1500);
    }
  };

  // Export simulations
  const handleExport = (format) => {
    if (format === 'pdf') {
      setExportingPDF(true);
      setTimeout(() => {
        setExportingPDF(false);
        triggerToast(
          'PDF Esportato', 
          'Tabella appuntamenti ed estratto conto mensile esportato in PDF (webdog_agenda.pdf).', 
          'success', 
          'Export Service'
        );
      }, 1200);
    } else {
      setExportingExcel(true);
      setTimeout(() => {
        setExportingExcel(false);
        triggerToast(
          'Excel Esportato', 
          'Elenco clienti e tracciati finanziari salvati in Excel (webdog_database.xlsx).', 
          'success', 
          'Export Service'
        );
      }, 1200);
    }
  };

  // Calculate Dashboard Statistics
  const totalBookingsCount = bookings.length;
  
  const calculateBookingPrice = (service, booking) => {
    let basePrice = 20;
    switch (service) {
      case 'Dog Sitting Diurno (Sitter)': basePrice = 25; break;
      case 'Dog Sitting Pensione (Sitter)': basePrice = 35; break;
      case 'Dog Sitting Diurno (Domicilio)': basePrice = 40; break;
      case 'Dog Sitting Pensione': basePrice = 50; break;
      case 'Dog Walking (30m)': basePrice = 20; break;
      case 'Dog Walking (60m)': basePrice = 35; break;
      case 'Servizio Navetta': basePrice = 15; break;
      case 'Educazione Base': basePrice = 30; break;
      case 'Consulenza Pre-Adozione': basePrice = 25; break;
      case 'Wedding Dog Sitter': basePrice = 150; break;
      // Compat for legacy services names
      case 'Passeggiata Cinofila (30m)': basePrice = 15; break;
      case 'Passeggiata Cinofila (60m)': basePrice = 25; break;
      case 'Dog Sitting Diurno': basePrice = 20; break;
      case 'Dog Sitting Notturno': basePrice = 35; break;
      default: basePrice = 20; break;
    }

    if (booking?.isRange && booking?.date && booking?.endDate) {
      const start = new Date(booking.date);
      const end = new Date(booking.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return basePrice * diffDays;
    }
    return basePrice;
  };

  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + calculateBookingPrice(b.service, b), 0);


  const pendingBookingsCount = bookings.filter(b => b.status === 'pending').length;
  
  const registeredClientsCount = Array.from(new Set(bookings.map(b => b.email))).length;

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '4.9';

  // Count services demand
  const serviceCounts = bookings.reduce((acc, b) => {
    acc[b.service] = (acc[b.service] || 0) + 1;
    return acc;
  }, {});

  // Schermata di caricamento durante la verifica della sessione Firebase
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #042f2e 0%, #0f766e 100%)',
        color: 'white'
      }}>
        <Loader className="rotating" size={48} style={{ color: '#2dd4bf', marginBottom: '16px' }} />
        <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ccfbf1' }}>Verifica sessione in corso...</p>
      </div>
    );
  }

  // Pre-login state
  if (!isLoggedIn) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #042f2e 0%, #0f766e 100%)',
        padding: '24px'
      }}>
        <div className="glass-panel" style={{
          width: '100%',
          maxWidth: '460px',
          padding: '40px',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'white',
          background: 'rgba(4, 47, 46, 0.85)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Lock size={28} style={{ color: '#2dd4bf' }} />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f0fdfa' }}>Gestionale Operatore</h2>
            <p style={{ fontSize: '0.9rem', color: '#99f6e4', marginTop: '4px' }}>
              Accedi per gestire prenotazioni, agenda e visualizzare le statistiche
            </p>
          </div>

          <form onSubmit={handleLogin}>
            {loginError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                color: '#fca5a5',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                {loginError}
              </div>
            )}

            <div style={{ marginBottom: '18px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '6px',
                color: '#e2e8f0'
              }}>E-MAIL AMMINISTRATORE</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8'
                }} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="la-tua@email.it"
                  required
                  style={{
                    width: '100%',
                    padding: '14px 14px 14px 44px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    outline: 'none',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '6px',
                color: '#e2e8f0'
              }}>PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8'
                }} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '14px 44px 14px 44px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    outline: 'none',
                    fontSize: '0.95rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loginLoading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: loginLoading ? '#5eead4' : '#14b8a6',
                color: '#042f2e',
                fontWeight: 700,
                fontSize: '1rem',
                border: 'none',
                boxShadow: '0 8px 20px rgba(20, 184, 166, 0.3)',
                marginBottom: '16px',
                cursor: loginLoading ? 'not-allowed' : 'pointer',
                opacity: loginLoading ? 0.8 : 1,
                transition: 'all 0.2s'
              }}
            >
              {loginLoading ? 'Accesso in corso...' : 'Accedi all\'Agenda'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <button 
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ArrowLeft size={16} /> Torna al Sito Pubblico
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter bookings based on search
  const filteredBookings = bookings.filter(b => {
    if (b.status === 'cancelled') return false;
    
    const term = searchTerm.toLowerCase();
    return (
      (b.firstName || '').toLowerCase().includes(term) ||
      (b.lastName || '').toLowerCase().includes(term) ||
      (b.dogName || '').toLowerCase().includes(term) ||
      (b.service || '').toLowerCase().includes(term)
    );
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f8fafc', color: '#1e293b', flexDirection: 'column' }}>
      
      {/* MOBILE TOP HEADER */}
      <header className="admin-mobile-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.3rem' }}>🐾</span>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: '1rem', color: '#0f766e', lineHeight: 1 }}>WebDog</h1>
            <span style={{ fontSize: '0.6rem', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Gestionale</span>
          </div>
          {/* Sync badge — mobile */}
          <span
            title={syncBadge.title}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              background: syncBadge.bg, color: syncBadge.color,
              fontSize: '0.6rem', fontWeight: 700, padding: '2px 7px',
              borderRadius: '999px', letterSpacing: '0.04em', cursor: 'help'
            }}
          >
            {syncBadge.icon} {syncBadge.label}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}
          >
            <ArrowLeft size={16} /> Sito
          </button>
          <button
            onClick={handleLogout}
            style={{ background: '#fee2e2', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700 }}
          >
            <LogOut size={14} /> Esci
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {/* SIDEBAR PANEL — hidden on mobile */}
      <aside className="admin-glass-sidebar admin-sidebar-desktop" style={{
        width: '280px',
        padding: '30px 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div>
          {/* Logo + sync badge — desktop sidebar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
            <span style={{ fontSize: '2rem' }}>🐾</span>
            <div>
              <h1 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f766e', lineHeight: 1 }}>WebDog</h1>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em' }}>
                GESTIONALE OPERATORE
              </span>
            </div>
          </div>
          {/* Firebase sync status indicator */}
          <div
            title={syncBadge.title}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: syncBadge.bg, borderRadius: '10px',
              padding: '8px 12px', marginBottom: '24px', cursor: 'help'
            }}
          >
            <span style={{ fontSize: '0.85rem' }}>{syncBadge.icon}</span>
            <div>
              <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 800, color: syncBadge.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {syncBadge.label}
              </p>
              <p style={{ margin: 0, fontSize: '0.65rem', color: '#64748b', lineHeight: 1.3 }}>
                {syncStatus === 'synced' ? 'Prenotazioni in tempo reale' :
                 syncStatus === 'connecting' ? 'Avvio sincronizzazione...' :
                 syncStatus === 'error' ? 'Fallback su localStorage' :
                 'Configura Firebase per il sync'}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              onClick={() => setActiveTab('dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'dashboard' ? 'rgba(15, 118, 110, 0.1)' : 'transparent',
                color: activeTab === 'dashboard' ? '#0f766e' : '#64748b',
                fontWeight: 600,
                fontSize: '0.95rem',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Sliders size={18} /> Dashboard Statistiche
            </button>

            <button 
              onClick={() => setActiveTab('agenda')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'agenda' ? 'rgba(15, 118, 110, 0.1)' : 'transparent',
                color: activeTab === 'agenda' ? '#0f766e' : '#64748b',
                fontWeight: 600,
                fontSize: '0.95rem',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Calendar size={18} /> Agenda & Appuntamenti
              {pendingBookingsCount > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  background: '#ef4444',
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '999px'
                }}>
                  {pendingBookingsCount}
                </span>
              )}
            </button>

            <button 
              onClick={() => setActiveTab('reviews')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'reviews' ? 'rgba(15, 118, 110, 0.1)' : 'transparent',
                color: activeTab === 'reviews' ? '#0f766e' : '#64748b',
                fontWeight: 600,
                fontSize: '0.95rem',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Star size={18} /> Moderazione Recensioni
            </button>

            <button 
              onClick={() => setActiveTab('notifications')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'notifications' ? 'rgba(15, 118, 110, 0.1)' : 'transparent',
                color: activeTab === 'notifications' ? '#0f766e' : '#64748b',
                fontWeight: 600,
                fontSize: '0.95rem',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Bell size={18} /> Notifiche Automatiche
            </button>

            <button 
              onClick={() => setActiveTab('gallery')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'gallery' ? 'rgba(15, 118, 110, 0.1)' : 'transparent',
                color: activeTab === 'gallery' ? '#0f766e' : '#64748b',
                fontWeight: 600,
                fontSize: '0.95rem',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <ImageIcon size={18} /> Gestione Galleria
            </button>
          </nav>
        </div>

        {/* User Logged Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: '#f1f5f9',
            padding: '12px 16px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{
              background: '#0f766e',
              color: 'white',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}>OP</div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                Operatore Cinofilo
              </p>
              <p style={{ fontSize: '0.7rem', color: '#64748b', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {email || import.meta.env.VITE_ADMIN_EMAIL || 'admin@webdog.it'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={onClose}
              className="btn btn-outline"
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '10px',
                fontSize: '0.8rem',
                gap: '4px'
              }}
            >
              <ArrowLeft size={14} /> Sito Vet
            </button>

            <button 
              onClick={handleLogout}
              className="btn"
              style={{
                background: '#fee2e2',
                color: '#ef4444',
                padding: '10px',
                borderRadius: '10px',
                fontSize: '0.8rem',
                fontWeight: 700,
                gap: '4px'
              }}
            >
              <LogOut size={14} /> Esci
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto', maxHeight: '100vh' }} className="admin-main-content">
        
        {/* TOP BAR ACTION */}
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f2d2a' }}>
              {activeTab === 'dashboard' && 'Dashboard Operatore'}
              {activeTab === 'agenda' && 'Gestione Agenda & Appuntamenti'}
              {activeTab === 'reviews' && 'Moderazione Recensioni Cliente'}
              {activeTab === 'notifications' && 'Notifiche Automatiche (Email/WA/Telegram)'}
              {activeTab === 'gallery' && 'Gestione Galleria Fotografica'}
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
              {activeTab === 'dashboard' && 'Panoramica delle statistiche, del fatturato e delle metriche dei servizi.'}
              {activeTab === 'agenda' && 'Gestisci, approva, cancella e sposta le prenotazioni dei tuoi clienti.'}
              {activeTab === 'reviews' && 'Leggi, approva ed esamina le recensioni inviate per ottimizzare il brand.'}
              {activeTab === 'notifications' && 'Controlla lo stato dei canali di comunicazione automatica in tempo reale.'}
              {activeTab === 'gallery' && 'Aggiungi, modifica e rimuovi le foto visibili nella galleria pubblica del sito.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
              Sincronizzazione Calendari:
            </span>
            <button 
              onClick={() => handleSync('google')}
              disabled={syncingGoogle}
              className="btn btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.8rem', gap: '6px', borderRadius: '8px' }}
            >
              <RefreshCw size={14} className={syncingGoogle ? "rotating" : ""} /> 
              {syncingGoogle ? 'Google...' : 'Google Calendar'}
            </button>
            <button 
              onClick={() => handleSync('outlook')}
              disabled={syncingOutlook}
              className="btn btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.8rem', gap: '6px', borderRadius: '8px' }}
            >
              <RefreshCw size={14} className={syncingOutlook ? "rotating" : ""} /> 
              {syncingOutlook ? 'Outlook...' : 'Outlook Calendar'}
            </button>
          </div>
        </header>

        {/* -------------------- TAB: DASHBOARD -------------------- */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Stats Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '24px',
              marginBottom: '32px'
            }}>
              {/* Stat 1: Revenue */}
              <div className="glass-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  background: '#ccfbf1',
                  color: '#0f766e',
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <DollarSign size={22} />
                </div>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>FATTURATO MENSILE</span>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f2d2a', margin: '4px 0' }}>
                  €{totalRevenue}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                  ↑ +18% rispetto al mese scorso
                </span>
              </div>

              {/* Stat 2: Bookings */}
              <div className="glass-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  background: '#e0f2fe',
                  color: '#0284c7',
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <Calendar size={22} />
                </div>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>PRENOTAZIONI TOTALI</span>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f2d2a', margin: '4px 0' }}>
                  {totalBookingsCount}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>
                  {pendingBookingsCount} in attesa di approvazione
                </span>
              </div>

              {/* Stat 3: Clients */}
              <div className="glass-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <Users size={22} />
                </div>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>CLIENTI REGISTRATI</span>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f2d2a', margin: '4px 0' }}>
                  {registeredClientsCount}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                  Dati salvati localmente
                </span>
              </div>

              {/* Stat 4: Reviews Rating */}
              <div className="glass-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  background: '#fef3c7',
                  color: '#d97706',
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <Star size={22} style={{ fill: '#d97706' }} />
                </div>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>MEDIA RECENSIONI</span>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f2d2a', margin: '4px 0' }}>
                  {averageRating} / 5.0
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>
                  Su un totale di {reviews.length} recensioni
                </span>
              </div>
            </div>

            {/* Graphics Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
              gap: '24px',
              marginBottom: '32px'
            }}>
              
              {/* Graphic 1: Revenue Trends (SVG Curve) */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h4 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f2d2a' }}>
                    Andamento Mensile Fatturato (€)
                  </h4>
                  <span className="badge">2026</span>
                </div>

                <div style={{ width: '100%', height: '220px', display: 'flex', alignItems: 'flex-end' }}>
                  <svg viewBox="0 0 500 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Grid lines */}
                    <line x1="0" y1="50" x2="500" y2="50" stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="4 4" />
                    <line x1="0" y1="100" x2="500" y2="100" stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="4 4" />
                    <line x1="0" y1="150" x2="500" y2="150" stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="4 4" />
                    
                    {/* Curve background fill */}
                    <path 
                      d="M0,170 C50,150 80,120 120,130 C160,140 200,90 250,110 C300,130 350,60 400,50 C450,40 500,20 500,20 L500,200 L0,200 Z" 
                      fill="url(#chartGradient)" 
                    />
                    
                    {/* Main stroke line */}
                    <path 
                      d="M0,170 C50,150 80,120 120,130 C160,140 200,90 250,110 C300,130 350,60 400,50 C450,40 500,20 500,20" 
                      fill="none" 
                      stroke="#0f766e" 
                      strokeWidth="4" 
                    />
                    
                    {/* Interactive nodes */}
                    <circle cx="120" cy="130" r="6" fill="#0284c7" stroke="white" strokeWidth="2" style={{ cursor: 'pointer' }} />
                    <circle cx="250" cy="110" r="6" fill="#0284c7" stroke="white" strokeWidth="2" style={{ cursor: 'pointer' }} />
                    <circle cx="400" cy="50" r="6" fill="#0284c7" stroke="white" strokeWidth="2" style={{ cursor: 'pointer' }} />
                    <circle cx="500" cy="20" r="8" fill="#10b981" stroke="white" strokeWidth="2" style={{ cursor: 'pointer' }} />
                    
                    {/* Text values */}
                    <text x="120" y="115" fontSize="10" fontWeight="bold" fill="#0284c7" textAnchor="middle">€320</text>
                    <text x="250" y="95" fontSize="10" fontWeight="bold" fill="#0284c7" textAnchor="middle">€480</text>
                    <text x="400" y="35" fontSize="10" fontWeight="bold" fill="#0284c7" textAnchor="middle">€720</text>
                    <text x="460" y="15" fontSize="10" fontWeight="bold" fill="#10b981" textAnchor="middle">€980 (Stima)</text>
                  </svg>
                </div>
                
                {/* Months labels */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontSize: '0.8rem', 
                  color: '#64748b', 
                  fontWeight: 600,
                  marginTop: '10px' 
                }}>
                  <span>Gen</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>Mag</span>
                  <span>Giu (Attuale)</span>
                </div>
              </div>

              {/* Graphic 2: Services share (SVG Columns) */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h4 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f2d2a' }}>
                    Popolarità Servizi (Appuntamenti Registrati)
                  </h4>
                  <span className="badge" style={{ color: '#0284c7', background: 'rgba(2, 132, 199, 0.1)' }}>
                    Richieste
                  </span>
                </div>

                <div style={{ width: '100%', height: '220px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', paddingBottom: '10px' }}>
                  {/* Passeggiate Bar */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', marginBottom: '6px' }}>
                      {serviceCounts['Passeggiata Cinofila (30m)'] + serviceCounts['Passeggiata Cinofila (60m)'] || 4}
                    </span>
                    <div style={{ 
                      width: '32px', 
                      height: '140px', 
                      background: 'linear-gradient(to top, #0f766e, #2dd4bf)', 
                      borderRadius: '8px 8px 0 0',
                      transition: 'all 0.3s'
                    }} />
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', marginTop: '8px', textAlign: 'center', width: '60px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      Passeggiate
                    </span>
                  </div>

                  {/* Dog Sitting Bar */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', marginBottom: '6px' }}>
                      {(serviceCounts['Dog Sitting Diurno'] || 0) + (serviceCounts['Dog Sitting Notturno'] || 0) || 5}
                    </span>
                    <div style={{ 
                      width: '32px', 
                      height: '160px', 
                      background: 'linear-gradient(to top, #0284c7, #38bdf8)', 
                      borderRadius: '8px 8px 0 0'
                    }} />
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', marginTop: '8px', textAlign: 'center', width: '60px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      Sitting
                    </span>
                  </div>

                  {/* Educazione Bar */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', marginBottom: '6px' }}>
                      {serviceCounts['Educazione Base'] || 3}
                    </span>
                    <div style={{ 
                      width: '32px', 
                      height: '100px', 
                      background: 'linear-gradient(to top, #10b981, #34d399)', 
                      borderRadius: '8px 8px 0 0'
                    }} />
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', marginTop: '8px', textAlign: 'center', width: '60px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      Educazione
                    </span>
                  </div>

                  {/* Navetta Bar */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', marginBottom: '6px' }}>
                      {serviceCounts['Servizio Navetta'] || 2}
                    </span>
                    <div style={{ 
                      width: '32px', 
                      height: '60px', 
                      background: 'linear-gradient(to top, #f59e0b, #fbbf24)', 
                      borderRadius: '8px 8px 0 0'
                    }} />
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', marginTop: '8px', textAlign: 'center', width: '60px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      Navetta
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Popular Services table view */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f2d2a', marginBottom: '16px' }}>
                Panoramica Economica dei Servizi
              </h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
                      <th style={{ padding: '12px' }}>SERVIZIO</th>
                      <th style={{ padding: '12px' }}>TARIFFARIO</th>
                      <th style={{ padding: '12px' }}>PRENOTATI</th>
                      <th style={{ padding: '12px' }}>FATTURATO REALE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Passeggiata Cinofila', price: '€15 - €25', qty: (serviceCounts['Passeggiata Cinofila (30m)'] || 0) + (serviceCounts['Passeggiata Cinofila (60m)'] || 0), total: ((serviceCounts['Passeggiata Cinofila (30m)'] || 0) * 15) + ((serviceCounts['Passeggiata Cinofila (60m)'] || 0) * 25) },
                      { name: 'Dog Sitting Diurno', price: '€20 / giorno', qty: serviceCounts['Dog Sitting Diurno'] || 0, total: (serviceCounts['Dog Sitting Diurno'] || 0) * 20 },
                      { name: 'Dog Sitting Notturno', price: '€35 / notte', qty: serviceCounts['Dog Sitting Notturno'] || 0, total: (serviceCounts['Dog Sitting Notturno'] || 0) * 35 },
                      { name: 'Educazione Base', price: '€30 / sessione', qty: serviceCounts['Educazione Base'] || 0, total: (serviceCounts['Educazione Base'] || 0) * 30 },
                      { name: 'Servizio Navetta', price: 'Da €10', qty: serviceCounts['Servizio Navetta'] || 0, total: (serviceCounts['Servizio Navetta'] || 0) * 15 },
                      { name: 'Consulenza Pre-Adozione', price: '€25 / sessione', qty: serviceCounts['Consulenza Pre-Adozione'] || 0, total: (serviceCounts['Consulenza Pre-Adozione'] || 0) * 25 }
                    ].map((serv, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{serv.name}</td>
                        <td style={{ padding: '12px', color: '#64748b' }}>{serv.price}</td>
                        <td style={{ padding: '12px', fontWeight: 700 }}>{serv.qty}</td>
                        <td style={{ padding: '12px', color: '#0f766e', fontWeight: 700 }}>€{serv.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* -------------------- TAB: AGENDA -------------------- */}
        {activeTab === 'agenda' && (
          <div>
            {/* Filter and export panel */}
            <div className="glass-panel" style={{
              padding: '20px 24px',
              borderRadius: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '24px'
            }}>
              
              {/* Search Bar */}
              <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
                <Search size={18} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b'
                }} />
                <input 
                  type="text"
                  placeholder="Cerca per cliente, cane o servizio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '38px', borderRadius: '10px' }}
                />
              </div>

              {/* View Selector (Day/Week/Month) */}
              <div style={{
                display: 'flex',
                background: '#e2e8f0',
                padding: '4px',
                borderRadius: '8px',
                gap: '2px'
              }}>
                {['day', 'week', 'month'].map((view) => (
                  <button
                    key={view}
                    onClick={() => setScheduleView(view)}
                    style={{
                      border: 'none',
                      background: scheduleView === view ? 'white' : 'transparent',
                      color: scheduleView === view ? '#0f766e' : '#64748b',
                      padding: '6px 16px',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                      transition: 'all 0.15s'
                    }}
                  >
                    {view === 'day' && 'Giornaliera'}
                    {view === 'week' && 'Settimanale'}
                    {view === 'month' && 'Mensile'}
                  </button>
                ))}
              </div>

              {/* Exports panel */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => handleExport('pdf')}
                  disabled={exportingPDF}
                  className="btn btn-secondary"
                  style={{ padding: '10px 18px', fontSize: '0.85rem', gap: '6px', borderRadius: '10px' }}
                >
                  <Download size={14} />
                  {exportingPDF ? 'Esportazione...' : 'Esporta PDF'}
                </button>
                <button 
                  onClick={() => handleExport('excel')}
                  disabled={exportingExcel}
                  className="btn btn-secondary"
                  style={{ padding: '10px 18px', fontSize: '0.85rem', gap: '6px', borderRadius: '10px' }}
                >
                  <FileText size={14} />
                  {exportingExcel ? 'Esportazione...' : 'Esporta Excel'}
                </button>
              </div>
            </div>

            {/* Simulated schedule view alert */}
            <div style={{
              background: '#e0f2fe',
              border: '1px solid #bae6fd',
              color: '#0369a1',
              padding: '12px 18px',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: 500,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Smartphone size={16} />
              <span>
                Visualizzazione Attiva: <strong>{scheduleView === 'day' ? 'Giornaliera (Oggi)' : scheduleView === 'week' ? 'Settimanale (Mese in corso)' : 'Mensile (Mese intero)'}</strong>. Le modifiche effettuate attiveranno l'invio immediato di SMS/WA e Email automatiche ai clienti associati.
              </span>
            </div>

            {/* Bookings List Layout */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f2d2a' }}>
                  Elenco Prenotazioni ({filteredBookings.length})
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                  Mostrati ordinati per data
                </span>
              </div>

              {filteredBookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px', color: '#64748b' }}>
                  <Calendar size={48} style={{ margin: '0 auto 12px auto', opacity: 0.3 }} />
                  <p style={{ fontWeight: 600 }}>Nessun appuntamento trovato</p>
                  <p style={{ fontSize: '0.85rem' }}>Prova a modificare il testo nella barra di ricerca</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {filteredBookings.map((b) => (
                    <BookingRow 
                      key={b.id} 
                      booking={b} 
                      updateBookingStatus={updateBookingStatus}
                      updateBookingDetails={updateBookingDetails}
                      deleteBooking={deleteBooking}
                      calculatePrice={calculateBookingPrice}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* -------------------- TAB: REVIEWS -------------------- */}
        {activeTab === 'reviews' && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f2d2a', marginBottom: '20px' }}>
              Recensioni da Moderare ({reviews.length})
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reviews.map((rev) => (
                <div key={rev.id} className="glass-card" style={{
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: '#0f766e',
                      color: 'white',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      overflow: 'hidden'
                    }}>
                      {rev.name.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>{rev.name}</h4>
                        <span style={{ fontSize: '0.8rem', color: '#64748b', background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px' }}>
                          Cane: {rev.dogName} ({rev.dogBreed})
                        </span>
                      </div>
                      
                      {/* Rating stars */}
                      <div className="star-rating" style={{ margin: '4px 0' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={14} 
                            style={{ 
                              color: i < rev.rating ? '#fbbf24' : '#cbd5e1', 
                              fill: i < rev.rating ? '#fbbf24' : 'transparent' 
                            }} 
                          />
                        ))}
                      </div>

                      <p style={{ fontStyle: 'italic', color: '#475569', fontSize: '0.9rem', marginTop: '6px' }}>
                        "{rev.comment}"
                      </p>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                        Inviato in data: {rev.date}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span className="badge" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>
                      Approvata & Visibile
                    </span>
                    <button 
                      onClick={() => triggerToast('Recensione Nascondi', 'La recensione è stata occultata dal feed pubblico.', 'warning', 'Reviews Moderation')}
                      className="btn"
                      style={{
                        background: '#fee2e2',
                        color: '#ef4444',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 700
                      }}
                    >
                      Nascondi
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -------------------- TAB: NOTIFICATIONS -------------------- */}
        {activeTab === 'notifications' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Control Panel */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f2d2a', marginBottom: '16px' }}>
                Canali di Invio Abilitati
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '24px' }}>
                Configura i canali attraverso cui inviare le conferme, i promemoria e le variazioni d'agenda.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { name: 'Notifiche Email standard', desc: `Metodo attuale: ${emailConfig.method === 'emailjs' ? 'EmailJS REST API (Automatico)' : emailConfig.method === 'mailto' ? 'Client di posta locale (mailto:)' : 'Simulatore Locale'}`, active: true, channel: 'Email Server' },
                  { name: 'Integrazione WhatsApp (Stripe/Twilio APIs)', desc: 'Messaggi istantanei al cellulare inserito in fase di prenotazione', active: true, channel: 'WhatsApp API' },
                  { name: 'Alert Bot Telegram (Operatore)', desc: 'Il bot invia messaggi di notifica diretta al gruppo admin dei gestori', active: true, channel: 'Telegram Bot' }
                ].map((chan, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 20px',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{chan.name}</h4>
                      <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{chan.desc}</p>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="pulse-dot" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981' }}>ATTIVO</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Email Config Panel */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f2d2a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={20} /> Modulo Configurazione Invio Email
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '24px' }}>
                Scegli il metodo di invio delle email per il "Modulo Messaggi" e "Dettagli Appuntamento". Configura <strong>EmailJS</strong> per l'invio automatico e silenzioso al cliente.
              </p>

              <form onSubmit={handleSaveEmailConfig}>
                <div style={{ marginBottom: '20px' }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>METODO DI INVIO EMAIL</label>
                  <select 
                    value={emailConfig.method}
                    onChange={(e) => setEmailConfig({ ...emailConfig, method: e.target.value })}
                    className="form-input"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px' }}
                  >
                    <option value="simulated">Simulatore Locale (Solo Log e Notifiche Toast)</option>
                    <option value="mailto">Client di Posta Locale (mailto: con CC Cliente)</option>
                    <option value="emailjs">EmailJS REST API (Invio Automatico in Tempo Reale)</option>
                  </select>
                </div>

                {emailConfig.method === 'emailjs' && (
                  <div style={{ 
                    animation: 'fadeIn 0.3s ease-out', 
                    background: '#f8fafc', 
                    padding: '20px', 
                    borderRadius: '12px', 
                    border: '1px solid #e2e8f0', 
                    marginBottom: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}>
                    <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f766e', margin: 0 }}>Credenziali EmailJS</h4>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                      Crea un account gratuito su <a href="https://www.emailjs.com" target="_blank" rel="noreferrer" style={{ color: '#0284c7', textDecoration: 'underline' }}>emailjs.com</a>, aggiungi un Email Service e un Email Template, poi incolla i codici qui sotto.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label className="form-label">SERVICE ID</label>
                        <input 
                          type="text" 
                          placeholder="es: service_xxxxx" 
                          value={emailConfig.emailjsServiceId} 
                          onChange={(e) => setEmailConfig({ ...emailConfig, emailjsServiceId: e.target.value })}
                          required={emailConfig.method === 'emailjs'}
                          className="form-input" 
                        />
                      </div>
                      <div>
                        <label className="form-label">TEMPLATE ID</label>
                        <input 
                          type="text" 
                          placeholder="es: template_xxxxx" 
                          value={emailConfig.emailjsTemplateId} 
                          onChange={(e) => setEmailConfig({ ...emailConfig, emailjsTemplateId: e.target.value })}
                          required={emailConfig.method === 'emailjs'}
                          className="form-input" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label">PUBLIC KEY (USER ID)</label>
                      <input 
                        type="text" 
                        placeholder="es: user_xxxxxxxxxxxxx o la tua chiave pubblica" 
                        value={emailConfig.emailjsPublicKey} 
                        onChange={(e) => setEmailConfig({ ...emailConfig, emailjsPublicKey: e.target.value })}
                        required={emailConfig.method === 'emailjs'}
                        className="form-input" 
                      />
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: '20px' }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>EMAIL RICEVENTE AMMINISTRATORE</label>
                  <input 
                    type="email" 
                    placeholder="info@webdog.it" 
                    value={emailConfig.adminEmail} 
                    onChange={(e) => setEmailConfig({ ...emailConfig, adminEmail: e.target.value })}
                    required
                    className="form-input" 
                    style={{ width: '100%' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '6px' }}>
                    Le prenotazioni e i messaggi dei clienti verranno inviati in copia o direttamente a questo indirizzo.
                  </span>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Check size={16} /> Salva Configurazione Email
                </button>
              </form>
            </div>

            {/* Notification logs history */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f2d2a', marginBottom: '16px' }}>
                Registro Storico Alert Inviati (Logs Recenti)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {notificationLogs.map((log, lIdx) => (
                  <div key={lIdx} style={{
                    padding: '12px 16px',
                    borderLeft: '4px solid #0f766e',
                    background: 'rgba(15, 118, 110, 0.03)',
                    borderRadius: '0 8px 8px 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.85rem'
                  }}>
                    <div>
                      <h5 style={{ fontWeight: 700, color: '#0f2d2a' }}>{log.title}</h5>
                      <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '2px' }}>{log.details}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>{log.time}</span>
                      <span className="badge" style={{ fontSize: '0.7rem', padding: '2px 8px', marginTop: '4px' }}>{log.chan}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Sync Status Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f0fdfa',
              border: '1px solid #ccfbf1',
              borderRadius: '12px',
              padding: '10px 16px',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                fontSize: '0.75rem', fontWeight: 700,
                color: gallerySyncStatus === 'synced' ? '#10b981' : gallerySyncStatus === 'error' ? '#ef4444' : '#64748b',
                background: gallerySyncStatus === 'synced' ? '#d1fae5' : gallerySyncStatus === 'error' ? '#fee2e2' : '#f1f5f9',
                padding: '3px 10px', borderRadius: '999px'
              }}>
                {gallerySyncStatus === 'synced' ? '🟢 Live Sync' : gallerySyncStatus === 'connecting' ? '🟡 Connessione...' : gallerySyncStatus === 'error' ? '🔴 Errore Auth' : '⚪ Solo Locale'}
              </span>
              <button
                onClick={() => setEditingImageId(editingImageId === '__new__' ? null : '__new__')}
                style={{
                  background: '#0f766e', color: 'white', border: 'none', padding: '6px 12px',
                  borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                {editingImageId === '__new__' ? 'Chiudi' : <><Plus size={14} /> Nuova Foto</>}
              </button>
            </div>

            {/* Form */}
            {editingImageId && (
              <div className="glass-panel" style={{ padding: '20px' }}>
                <form
                  onSubmit={editingImageId === '__new__' ? handleAddGalleryImage : handleSaveEditImage}
                  style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Titolo</label>
                      <input
                        type="text" required placeholder="Titolo foto"
                        value={editingImageId === '__new__' ? galleryForm.title : editGalleryForm.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (editingImageId === '__new__') setGalleryForm(p => ({ ...p, title: val }));
                          else setEditGalleryForm(p => ({ ...p, title: val }));
                        }}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Categoria *</label>
                      {editingImageId === '__new__' ? (
                        galleryForm.category === '__new__' ? (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <input
                              type="text"
                              autoFocus
                              placeholder="Nome nuova categoria"
                              value={galleryForm.newCategoryName || ''}
                              onChange={(e) => setGalleryForm(p => ({ ...p, newCategoryName: e.target.value }))}
                              style={{ flex: 1, padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                            />
                            <button
                              type="button"
                              onClick={() => setGalleryForm(p => ({ ...p, category: p.newCategoryName || 'Passeggiate', newCategoryName: undefined }))}
                              style={{ padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}
                            >
                              <Check size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setGalleryForm(p => ({ ...p, category: 'Passeggiate', newCategoryName: undefined }))}
                              style={{ padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <select
                            value={galleryForm.category}
                            onChange={(e) => setGalleryForm(p => ({ ...p, category: e.target.value }))}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                          >
                            {Array.from(new Set(['Passeggiate', 'Dog Sitting', 'Educazione', 'Eventi', 'I Miei Sport', ...galleryImages.map(img => img.category)])).map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                            <option value="__new__" style={{ fontWeight: 'bold', color: '#0f766e' }}>+ Nuova Categoria...</option>
                          </select>
                        )
                      ) : (
                        editGalleryForm.category === '__new__' ? (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <input
                              type="text"
                              autoFocus
                              placeholder="Nome nuova categoria"
                              value={editGalleryForm.newCategoryName || ''}
                              onChange={(e) => setEditGalleryForm(p => ({ ...p, newCategoryName: e.target.value }))}
                              style={{ flex: 1, padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                            />
                            <button
                              type="button"
                              onClick={() => setEditGalleryForm(p => ({ ...p, category: p.newCategoryName || 'Passeggiate', newCategoryName: undefined }))}
                              style={{ padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}
                            >
                              <Check size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditGalleryForm(p => ({ ...p, category: 'Passeggiate', newCategoryName: undefined }))}
                              style={{ padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <select
                            value={editGalleryForm.category}
                            onChange={(e) => setEditGalleryForm(p => ({ ...p, category: e.target.value }))}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                          >
                            {Array.from(new Set(['Passeggiate', 'Dog Sitting', 'Educazione', 'Eventi', 'I Miei Sport', ...galleryImages.map(img => img.category)])).map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                            <option value="__new__" style={{ fontWeight: 'bold', color: '#0f766e' }}>+ Nuova Categoria...</option>
                          </select>
                        )
                      )}
                    </div>
                  </div>

                  {/* Descrizione */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Descrizione <span style={{ color: '#94a3b8', fontWeight: 400 }}>(breve testo visibile sotto il titolo)</span>
                    </label>
                    <textarea
                      placeholder="Es: Freya & Na'vi. oppure Attività stimolante in branco guidato."
                      rows={2}
                      value={editingImageId === '__new__' ? (galleryForm.desc || '') : (editGalleryForm.desc || '')}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (editingImageId === '__new__') setGalleryForm(p => ({ ...p, desc: val }));
                        else setEditGalleryForm(p => ({ ...p, desc: val }));
                      }}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    />
                  </div>


                  {/* Foto Album */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                      Foto Album ({(editingImageId === '__new__' ? galleryForm.album : editGalleryForm.album)?.length || 0} foto)
                    </label>

                    {/* Album thumbnails grid */}
                    {(() => {
                      const currentAlbum = (editingImageId === '__new__' ? galleryForm.album : editGalleryForm.album) || [];
                      const removeFromAlbum = (idx) => {
                        if (editingImageId === '__new__') {
                          setGalleryForm(p => {
                            const newAlbum = p.album.filter((_, i) => i !== idx);
                            return { ...p, album: newAlbum, src: newAlbum[0] || '' };
                          });
                        } else {
                          setEditGalleryForm(p => {
                            const newAlbum = p.album.filter((_, i) => i !== idx);
                            return { ...p, album: newAlbum, src: newAlbum[0] || '' };
                          });
                        }
                      };
                      return currentAlbum.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '8px', marginBottom: '8px' }}>
                          {currentAlbum.map((url, idx) => (
                            <div key={idx} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '1/1', border: idx === 0 ? '2px solid #14b8a6' : '1px solid #e2e8f0' }}>
                              <img src={url} alt={`Foto ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              {idx === 0 && (
                                <span style={{ position: 'absolute', bottom: '4px', left: '4px', background: '#14b8a6', color: 'white', fontSize: '0.55rem', fontWeight: 800, padding: '1px 5px', borderRadius: '999px' }}>COVER</span>
                              )}
                              <button
                                type="button"
                                onClick={() => removeFromAlbum(idx)}
                                style={{ position: 'absolute', top: '3px', right: '3px', background: 'rgba(0,0,0,0.65)', border: 'none', color: 'white', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                              >
                                <X size={11} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : null;
                    })()}

                    {/* Upload + URL row */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                      <label style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        border: '2px dashed #cbd5e1', borderRadius: '10px', padding: '10px',
                        cursor: isUploading ? 'not-allowed' : 'pointer', background: '#f8fafc',
                        fontSize: '0.78rem', fontWeight: 600, color: '#475569', textAlign: 'center'
                      }}>
                        {isUploading
                          ? <><Loader className="rotating" size={15} style={{ color: '#0f766e' }} /> Caricamento...</>
                          : <><Upload size={15} style={{ color: '#0f766e' }} /> + Aggiungi Foto</>}
                        <input
                          type="file" accept="image/*" multiple disabled={isUploading}
                          onChange={(e) => handleFileUpload(e, editingImageId === '__new__' ? 'add' : 'edit')}
                          style={{ display: 'none' }}
                        />
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 600 }}>o</div>
                      <input
                        type="text"
                        placeholder="URL immagine"
                        value={editingImageId === '__new__' ? galleryForm.src : editGalleryForm.src}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (editingImageId === '__new__') setGalleryForm(p => { const newAlbum = val ? [val, ...(p.album||[]).slice(1)] : p.album; return { ...p, src: val, album: val ? (p.album?.length > 0 ? p.album : [val]) : p.album }; });
                          else setEditGalleryForm(p => { return { ...p, src: val, album: val ? (p.album?.length > 0 ? p.album : [val]) : p.album }; });
                        }}
                        style={{ flex: 1.5, padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.8rem', outline: 'none' }}
                      />
                    </div>
                    {uploadError && <p style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: '4px' }}>{uploadError}</p>}
                  </div>

                  {/* Actions */}

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="submit"
                      disabled={isUploading}
                      className="btn btn-primary"
                      style={{ flex: 1, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRadius: '9px', fontSize: '0.85rem' }}
                    >
                      {editingImageId === '__new__' ? <><Plus size={15} /> Aggiungi</> : <><Check size={15} /> Salva</>}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingImageId(null)}
                      className="btn btn-secondary"
                      style={{ padding: '10px 16px', borderRadius: '9px', fontSize: '0.85rem' }}
                    >
                      Annulla
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Photo Grid */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                  Foto in Galleria ({galleryImages.length})
                </h3>
                {galleryImages.length > 0 && (
                  <button
                    onClick={async () => {
                      if (window.confirm('Sei sicuro di voler eliminare TUTTE le foto dalla galleria? Questa azione è irreversibile.')) {
                        for (const img of galleryImages) {
                          await deleteGalleryImage(img.id);
                        }
                        triggerToast('Galleria Svuotata', 'Tutte le foto sono state rimosse.', 'success', 'Galleria');
                      }
                    }}
                    style={{
                      background: '#fee2e2',
                      color: '#ef4444',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Trash2 size={12} /> Svuota Tutto
                  </button>
                )}
              </div>

              {galleryImages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', background: '#f8fafc', borderRadius: '14px' }}>
                  <ImageIcon size={40} style={{ margin: '0 auto 10px', display: 'block', strokeWidth: 1 }} />
                  <p style={{ fontSize: '0.85rem' }}>La galleria è vuota. Aggiungi la tua prima foto!</p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: '12px'
                }}>
                  {galleryImages.map((img) => (
                    <div
                      key={img.id}
                      style={{
                        position: 'relative',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        aspectRatio: '1 / 1',
                        border: editingImageId === img.id ? '2px solid #14b8a6' : '1px solid #e2e8f0',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        background: '#f8fafc',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                        <img
                          src={img.src}
                          alt={img.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <span style={{
                          position: 'absolute', top: '6px', left: '6px',
                          background: 'rgba(15, 118, 110, 0.95)', color: 'white',
                          fontSize: '0.6rem', fontWeight: 800, padding: '2px 8px', borderRadius: '999px'
                        }}>
                          {img.category}
                        </span>
                        {img.album && img.album.length > 1 && (
                          <span style={{
                            position: 'absolute', top: '6px', right: '6px',
                            background: 'rgba(0,0,0,0.65)', color: 'white',
                            fontSize: '0.6rem', fontWeight: 800, padding: '2px 7px', borderRadius: '999px'
                          }}>
                            📷 {img.album.length}
                          </span>
                        )}
                      </div>
                      
                      <div style={{ padding: '8px', background: 'white', borderTop: '1px solid #f1f5f9' }}>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f2d2a', margin: '0 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={img.title}>
                          {img.title}
                        </h4>
                        <p style={{ fontSize: '0.7rem', color: '#64748b', margin: '0 0 8px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {img.desc || 'Nessuna descrizione.'}
                        </p>
                        
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => handleStartEditImage(img)}
                            className="btn btn-secondary"
                            style={{
                              flex: 1,
                              padding: '5px',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              height: '28px'
                            }}
                            title="Modifica"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(img.id)}
                            className="btn"
                            style={{
                              flex: 1,
                              background: '#fee2e2',
                              color: '#ef4444',
                              padding: '5px',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              border: 'none',
                              cursor: 'pointer',
                              height: '28px'
                            }}
                            title="Elimina"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      </div> {/* end flex wrapper */}

      {/* MOBILE BOTTOM NAV BAR */}
      <nav className="admin-mobile-bottom-nav">
        {[
          { id: 'dashboard', icon: <Sliders size={22} />, label: 'Dashboard' },
          { id: 'agenda', icon: <Calendar size={22} />, label: 'Agenda', badge: pendingBookingsCount },
          { id: 'reviews', icon: <Star size={22} />, label: 'Recensioni' },
          { id: 'notifications', icon: <Bell size={22} />, label: 'Notifiche' },
          { id: 'gallery', icon: <ImageIcon size={22} />, label: 'Galleria' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`admin-bottom-nav-btn ${activeTab === item.id ? 'active' : ''}`}
          >
            <span style={{ position: 'relative', display: 'inline-flex' }}>
              {item.icon}
              {item.badge > 0 && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-8px',
                  background: '#ef4444', color: 'white', borderRadius: '999px',
                  fontSize: '0.55rem', fontWeight: 800, padding: '1px 4px',
                  lineHeight: 1.4, minWidth: '14px', textAlign: 'center'
                }}>{item.badge}</span>
              )}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// Subcomponent: Booking row for inline editing in Operator Schedule
function BookingRow({ booking, updateBookingStatus, updateBookingDetails, deleteBooking, calculatePrice }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDate, setEditedDate] = useState(booking.date);
  const [editedEndDate, setEditedEndDate] = useState(booking.endDate || booking.date);
  const [editedTime, setEditedTime] = useState(booking.time);
  const [editedService, setEditedService] = useState(booking.service);

  const price = calculatePrice(booking.service, booking);

  const handleSave = () => {
    updateBookingDetails(booking.id, {
      date: editedDate,
      endDate: booking.isRange ? editedEndDate : '',
      time: editedTime,
      service: editedService
    });
    setIsEditing(false);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'confirmed':
        return { color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' };
      case 'cancelled':
        return { color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' };
      default:
        return { color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' };
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return '🟢 Confermato';
      case 'cancelled': return '🔴 Cancellato';
      default: return '🟡 In Attesa';
    }
  };
  const getGoogleCalendarLink = () => {
    const title = encodeURIComponent(`WebDog: ${booking.service || 'Servizio'} - ${booking.dogName || 'Cane'}`);
    const startStr = booking.date || '';
    const endStr = booking.isRange && booking.endDate ? booking.endDate : startStr;
    const timeStr = booking.time || "09:00";
    const startFormatted = startStr.replace(/-/g, '');
    const hhmm = timeStr.replace(':', '');
    const startTime = `${startFormatted}T${hhmm}00`;
    const endFormatted = endStr.replace(/-/g, '');
    const endTime = booking.isRange 
      ? `${endFormatted}T180000`
      : `${startFormatted}T${String(Number(hhmm.substring(0, 2)) + 1).padStart(2, '0')}${hhmm.substring(2)}00`;
      
    const dates = `${startTime}/${endTime}`;
    const details = encodeURIComponent(
      `Cliente: ${booking.firstName || ''} ${booking.lastName || ''}\n` +
      `Cane: ${booking.dogName || ''} (${booking.dogBreed || ''}, ${booking.dogAge || ''} anni)\n` +
      `Telefono: ${booking.phone || ''}\n` +
      `Pagamento: ${(booking.paymentMethod || 'Contanti').toUpperCase()}\n` +
      `Note: ${booking.notes || 'Nessuna'}`
    );
    const location = encodeURIComponent("Napoli e Provincia");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
  };

  const downloadICSFile = () => {
    const title = `WebDog: ${booking.service || 'Servizio'} - ${booking.dogName || 'Cane'}`;
    const startStr = booking.date || '';
    const endStr = booking.isRange && booking.endDate ? booking.endDate : startStr;
    const timeStr = booking.time || "09:00";
    
    const startFormatted = startStr.replace(/-/g, '');
    const endFormatted = endStr.replace(/-/g, '');
    const hhmm = timeStr.replace(':', '');
    
    const startTime = `${startFormatted}T${hhmm}00`;
    const endTime = booking.isRange 
      ? `${endFormatted}T180000`
      : `${startFormatted}T${String(Number(hhmm.substring(0, 2)) + 1).padStart(2, '0')}${hhmm.substring(2)}00`;

    const description = `Cliente: ${booking.firstName || ''} ${booking.lastName || ''}\\nCane: ${booking.dogName || ''} (${booking.dogBreed || ''}, ${booking.dogAge || ''} anni)\\nTelefono: ${booking.phone || ''}\\nPagamento: ${(booking.paymentMethod || 'Contanti').toUpperCase()}\\nNote: ${booking.notes || 'Nessuna'}`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//WebDog//Booking System//IT',
      'BEGIN:VEVENT',
      `UID:b_${booking.id}`,
      `DTSTAMP:${startTime}`,
      `DTSTART:${startTime}`,
      `DTEND:${endTime}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      'LOCATION:Napoli e Provincia',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `appuntamento_${booking.dogName || 'Cane'}_${booking.date || 'Data'}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <div className="glass-card" style={{
      padding: '20px',
      borderLeft: `6px solid ${booking.status === 'confirmed' ? '#10b981' : booking.status === 'cancelled' ? '#ef4444' : '#f59e0b'}`,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      
      {/* Upper line: Client details, Service name, Date / Time */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h4 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f2d2a' }}>
              {booking.firstName} {booking.lastName}
            </h4>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '999px',
              ...getStatusStyle(booking.status)
            }}>
              {getStatusText(booking.status)}
            </span>
            {booking.status === 'confirmed' && (
              <div style={{ display: 'inline-flex', gap: '6px' }}>
                <a
                  href={getGoogleCalendarLink()}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: '0.7rem',
                    background: '#e0f2fe',
                    color: '#0369a1',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                    border: '1px solid #bae6fd'
                  }}
                  title="Aggiungi a Google Calendar"
                >
                  📅 Google
                </a>
                <button
                  type="button"
                  onClick={downloadICSFile}
                  style={{
                    fontSize: '0.7rem',
                    background: '#f3e8ff',
                    color: '#6b21a8',
                    border: '1px solid #e9d5ff',
                    cursor: 'pointer',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px'
                  }}
                  title="Scarica file iCal (.ics)"
                >
                  💾 iCal
                </button>
              </div>
            )}
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
            Cane: <strong>{booking.dogName}</strong> ({booking.dogBreed}, {booking.dogAge} anni) • Tel: {booking.phone}
          </p>
        </div>

        {/* Date and Time values */}
        <div style={{ textAlign: 'right' }}>
          {isEditing ? (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>INIZIO</span>
                <input 
                  type="date" 
                  value={editedDate} 
                  onChange={(e) => setEditedDate(e.target.value)}
                  className="form-input"
                  style={{ padding: '6px 10px', fontSize: '0.8rem', width: '130px', borderRadius: '6px' }}
                />
              </div>
              {booking.isRange && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>FINE</span>
                  <input 
                    type="date" 
                    value={editedEndDate} 
                    onChange={(e) => setEditedEndDate(e.target.value)}
                    className="form-input"
                    style={{ padding: '6px 10px', fontSize: '0.8rem', width: '130px', borderRadius: '6px' }}
                  />
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>ORA</span>
                <input 
                  type="time" 
                  value={editedTime} 
                  onChange={(e) => setEditedTime(e.target.value)}
                  className="form-input"
                  style={{ padding: '6px 10px', fontSize: '0.8rem', width: '90px', borderRadius: '6px' }}
                />
              </div>
            </div>
          ) : (
            <div>
              {booking.isRange && booking.endDate ? (
                <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f766e' }}>
                  📅 Dal {new Date(booking.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })} al {new Date(booking.endDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              ) : (
                <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f766e' }}>
                  📅 {new Date(booking.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              )}
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>
                🕒 Ore {booking.time}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mid Line: Service select & Notes */}
      <div style={{
        background: '#f8fafc',
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ flex: 1 }}>
          {isEditing ? (
            <select
              value={editedService}
              onChange={(e) => setEditedService(e.target.value)}
              className="form-input"
              style={{ padding: '6px 10px', fontSize: '0.85rem', width: '220px', borderRadius: '6px' }}
            >
              <optgroup label="🏡 Presso la casa del Sitter">
                <option value="Dog Sitting Diurno (Sitter)">Dog Sitting Diurno (Sitter)</option>
                <option value="Dog Sitting Pensione (Sitter)">Dog Sitting Pensione (Sitter)</option>
              </optgroup>
              <optgroup label="🦮 Presso l'abitazione del Cliente">
                <option value="Dog Sitting Diurno (Domicilio)">Dog Sitting Diurno (Domicilio)</option>
                <option value="Dog Sitting Pensione">Dog Sitting Pensione</option>
              </optgroup>
              <optgroup label="🌳 In Giro per la Città">
                <option value="Dog Walking (30m)">Dog Walking (30m)</option>
                <option value="Dog Walking (60m)">Dog Walking (60m)</option>
              </optgroup>
              <optgroup label="🚌 Navetta & Formazione">
                <option value="Servizio Navetta">Servizio Navetta</option>
                <option value="Educazione Base">Educazione Base</option>
                <option value="Consulenza Pre-Adozione">Consulenza Pre-Adozione</option>
              </optgroup>
              <optgroup label="👑 Wedding Dog Sitter">
                <option value="Wedding Dog Sitter">Wedding Dog Sitter</option>
              </optgroup>
              <optgroup label="📜 Storico/Compatibilità">
                <option value="Passeggiata Cinofila (30m)">Passeggiata Cinofila (30m)</option>
                <option value="Passeggiata Cinofila (60m)">Passeggiata Cinofila (60m)</option>
                <option value="Dog Sitting Diurno">Dog Sitting Diurno</option>
                <option value="Dog Sitting Notturno">Dog Sitting Notturno</option>
              </optgroup>
            </select>
          ) : (
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>
              Servizio: <strong style={{ color: '#0f766e' }}>{booking.service}</strong>
            </p>
          )}

          {booking.notes && (
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
              Note: <span style={{ fontStyle: 'italic' }}>"{booking.notes}"</span>
            </p>
          )}
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>TARIFFA DEL SERVIZIO</span>
          <strong style={{ fontSize: '1.1rem', color: '#0f766e' }}>€{price}</strong>
        </div>
      </div>

      {/* Bottom Line: Editing actions, status toggle, remove */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
        <div>
          {isEditing ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={handleSave}
                className="btn btn-primary" 
                style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px' }}
              >
                Salva
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                className="btn btn-secondary" 
                style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px' }}
              >
                Annulla
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="btn btn-outline" 
              style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px' }}
            >
              Sposta / Modifica
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {booking.status === 'pending' && (
            <button 
              onClick={() => updateBookingStatus(booking.id, 'confirmed')}
              className="btn" 
              style={{ 
                background: '#10b981', 
                color: 'white', 
                padding: '6px 12px', 
                fontSize: '0.8rem', 
                borderRadius: '6px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Conferma Appuntamento
            </button>
          )}

          {booking.status !== 'cancelled' && (
            <button 
              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
              className="btn" 
              style={{ 
                background: '#fee2e2', 
                color: '#ef4444', 
                padding: '6px 12px', 
                fontSize: '0.8rem', 
                borderRadius: '6px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Annulla Slot
            </button>
          )}

          <button 
            onClick={() => deleteBooking(booking.id)}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              cursor: 'pointer', 
              color: '#94a3b8', 
              padding: '6px', 
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s'
            }}
            title="Elimina prenotazione definitivamente"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
