import React, { useState } from 'react';
import { 
  Calendar, DollarSign, Users, Star, Trash2, Check, Clock, 
  ArrowLeft, LogOut, Download, RefreshCw, Sliders, Search, 
  Lock, Mail, FileText, Smartphone, Bell, Eye, EyeOff, Menu, X
} from 'lucide-react';

export default function AdminPortal({ 
  bookings, 
  updateBookingStatus, 
  updateBookingDetails,
  deleteBooking, 
  reviews, 
  triggerToast,
  notificationLogs,
  setNotificationLogs,
  onClose 
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [emailConfig, setEmailConfig] = useState(() => {
    const saved = localStorage.getItem('webdog_email_config');
    return saved ? JSON.parse(saved) : {
      method: 'emailjs', // 'simulated', 'emailjs', 'mailto'
      emailjsServiceId: 'service_77dn8u2',
      emailjsTemplateId: 'template_k3sc8sn',
      emailjsPublicKey: '6n8JEdiKSucjPCKmR',
      adminEmail: 'emanuelebarese@gmail.com'
    };
  });

  const handleSaveEmailConfig = (e) => {
    e.preventDefault();
    localStorage.setItem('webdog_email_config', JSON.stringify(emailConfig));
    triggerToast('Configurazione Salvata', 'Configurazione email salvata con successo.', 'success', 'System');
  };

  // Tabs: 'dashboard', 'agenda', 'reviews', 'notifications'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [scheduleView, setScheduleView] = useState('month'); // month, week, day
  const [searchTerm, setSearchTerm] = useState('');
  const [syncingGoogle, setSyncingGoogle] = useState(false);
  const [syncingOutlook, setSyncingOutlook] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  // Handle Login validation
  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'admin@webdog.it' && password === 'password123') {
      setIsLoggedIn(true);
      setLoginError('');
      triggerToast('Accesso Eseguito', 'Benvenuto nella tua Area Gestionale Operatore.', 'success', 'System');
    } else {
      setLoginError('Email o Password non corrette. Prova admin@webdog.it / password123');
    }
  };

  const quickDemoLogin = () => {
    setEmail('admin@webdog.it');
    setPassword('password123');
    setIsLoggedIn(true);
    triggerToast('Accesso Eseguito', 'Accesso con credenziali Demo autorizzato.', 'success', 'System');
  };

  const handleLogout = () => {
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
  
  // Dynamic Revenue calculation (only count confirmed or pending ones, let's say confirmed + pending)
  const calculateBookingPrice = (service) => {
    switch (service) {
      case 'Passeggiata Cinofila (30m)': return 15;
      case 'Passeggiata Cinofila (60m)': return 25;
      case 'Dog Sitting Diurno': return 20;
      case 'Dog Sitting Notturno': return 35;
      case 'Servizio Navetta': return 15; // starting at 10-15
      case 'Educazione Base': return 30;
      case 'Consulenza Pre-Adozione': return 25;
      default: return 20;
    }
  };

  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + calculateBookingPrice(b.service), 0);

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
                  placeholder="admin@webdog.it"
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
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: '#14b8a6',
                color: '#042f2e',
                fontWeight: 700,
                fontSize: '1rem',
                border: 'none',
                boxShadow: '0 8px 20px rgba(20, 184, 166, 0.3)',
                marginBottom: '16px'
              }}
            >
              Accedi all'Agenda
            </button>

            <button 
              type="button" 
              onClick={quickDemoLogin}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '12px',
                background: 'transparent',
                color: '#2dd4bf',
                fontWeight: 600,
                fontSize: '0.85rem',
                border: '1px dashed rgba(45, 212, 191, 0.5)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Demo: Accedi con 1 Click
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
  const filteredBookings = bookings.filter(b => 
    b.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.dogName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
            <span style={{ fontSize: '2rem' }}>🐾</span>
            <div>
              <h1 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f766e', lineHeight: 1 }}>WebDog</h1>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em' }}>
                GESTIONALE OPERATORE
              </span>
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
                admin@webdog.it
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
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
              {activeTab === 'dashboard' && 'Panoramica delle statistiche, del fatturato e delle metriche dei servizi.'}
              {activeTab === 'agenda' && 'Gestisci, approva, cancella e sposta le prenotazioni dei tuoi clienti.'}
              {activeTab === 'reviews' && 'Leggi, approva ed esamina le recensioni inviate per ottimizzare il brand.'}
              {activeTab === 'notifications' && 'Controlla lo stato dei canali di comunicazione automatica in tempo reale.'}
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
      </main>
      </div> {/* end flex wrapper */}

      {/* MOBILE BOTTOM NAV BAR */}
      <nav className="admin-mobile-bottom-nav">
        {[
          { id: 'dashboard', icon: <Sliders size={22} />, label: 'Dashboard' },
          { id: 'agenda', icon: <Calendar size={22} />, label: 'Agenda', badge: pendingBookingsCount },
          { id: 'reviews', icon: <Star size={22} />, label: 'Recensioni' },
          { id: 'notifications', icon: <Bell size={22} />, label: 'Notifiche' },
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
  const [editedTime, setEditedTime] = useState(booking.time);
  const [editedService, setEditedService] = useState(booking.service);

  const price = calculatePrice(booking.service);

  const handleSave = () => {
    updateBookingDetails(booking.id, {
      date: editedDate,
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
          </div>

          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
            Cane: <strong>{booking.dogName}</strong> ({booking.dogBreed}, {booking.dogAge} anni) • Tel: {booking.phone}
          </p>
        </div>

        {/* Date and Time values */}
        <div style={{ textAlign: 'right' }}>
          {isEditing ? (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input 
                type="date" 
                value={editedDate} 
                onChange={(e) => setEditedDate(e.target.value)}
                className="form-input"
                style={{ padding: '6px 10px', fontSize: '0.8rem', width: '130px', borderRadius: '6px' }}
              />
              <input 
                type="time" 
                value={editedTime} 
                onChange={(e) => setEditedTime(e.target.value)}
                className="form-input"
                style={{ padding: '6px 10px', fontSize: '0.8rem', width: '90px', borderRadius: '6px' }}
              />
            </div>
          ) : (
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f766e' }}>
                📅 {new Date(booking.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
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
              <option value="Passeggiata Cinofila (30m)">Passeggiata Cinofila (30m)</option>
              <option value="Passeggiata Cinofila (60m)">Passeggiata Cinofila (60m)</option>
              <option value="Dog Sitting Diurno">Dog Sitting Diurno</option>
              <option value="Dog Sitting Notturno">Dog Sitting Notturno</option>
              <option value="Servizio Navetta">Servizio Navetta</option>
              <option value="Educazione Base">Educazione Base</option>
              <option value="Consulenza Pre-Adozione">Consulenza Pre-Adozione</option>
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
