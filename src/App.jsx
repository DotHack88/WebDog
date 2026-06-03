import React, { useState, useEffect } from 'react';
import {
  Dog, Activity, Calendar, DollarSign, Phone, Shield, Heart, Award,
  FileText, Check, ChevronLeft, ChevronRight, Star, MapPin, Mail,
  Send, MessageSquare, Menu, X, Sliders, Eye, Sparkles
} from 'lucide-react';
import AdminPortal from './components/AdminPortal';
import NotificationToast from './components/NotificationToast';

// Default seeded reviews
const defaultReviews = [
  {
    id: 1,
    name: 'Alessandro Neri',
    dogName: 'Thor',
    dogBreed: 'Golden Retriever',
    rating: 5,
    comment: 'Professionalità e attenzione eccezionali. Il mio cane Thor si è trovato benissimo durante le passeggiate educative.',
    date: '2026-05-28'
  },
  {
    id: 2,
    name: 'Sofia Galli',
    dogName: 'Luna',
    dogBreed: 'Border Collie',
    rating: 5,
    comment: 'Il servizio navetta per andare dal toelettatore è stato utilissimo e l\'educazione base ha dato ottimi risultati in pochissime sessioni!',
    date: '2026-05-15'
  },
  {
    id: 3,
    name: 'Chiara Vanni',
    dogName: 'Oliver',
    dogBreed: 'French Bulldog',
    rating: 4,
    comment: 'Ottima esperienza di Dog Sitting Diurno. Oliver è tornato a casa rilassato, felice e stanco al punto giusto!',
    date: '2026-04-20'
  }
];

// Default seeded bookings
const defaultBookings = [
  {
    id: 'b1',
    firstName: 'Marco',
    lastName: 'Rossi',
    phone: '3331234567',
    email: 'marco.rossi@gmail.com',
    dogName: 'Buddy',
    dogBreed: 'Labrador',
    dogAge: '2',
    service: 'Passeggiata Cinofila (60m)',
    date: '2026-06-10',
    time: '10:00',
    notes: 'Buddy è molto amichevole ma tende a tirare al guinzaglio all\'inizio.',
    status: 'pending'
  },
  {
    id: 'b2',
    firstName: 'Giulia',
    lastName: 'Bianchi',
    phone: '3479876543',
    email: 'giulia.b@domain.com',
    dogName: 'Stella',
    dogBreed: 'Pastore Tedesco',
    dogAge: '4',
    service: 'Dog Sitting Diurno',
    date: '2026-06-12',
    time: '09:00',
    notes: 'Ha bisogno di fare attività all\'aperto e di giochi di attivazione mentale.',
    status: 'confirmed'
  },
  {
    id: 'b3',
    firstName: 'Lorenzo',
    lastName: 'Verdi',
    phone: '3281112223',
    email: 'lorenzo.v@test.it',
    dogName: 'Milo',
    dogBreed: 'Jack Russell',
    dogAge: '1',
    service: 'Educazione Base',
    date: '2026-06-15',
    time: '15:30',
    notes: 'Gestione del richiamo e socializzazione con altri cuccioli.',
    status: 'confirmed'
  }
];

// Image Gallery data
const galleryImages = [
  { id: 1, src: '/gallery_walk.png', category: 'Passeggiate', title: 'Passeggiata Educativa nei Boschi', desc: 'Socializzazione e movimento all\'aperto.' },
  { id: 2, src: '/gallery_sitting.png', category: 'Dog Sitting', title: 'Riposo confortevole sul divano', desc: 'Ambiente casalingo sicuro e rilassante.' },
  { id: 3, src: '/gallery_training.png', category: 'Educazione', title: 'Focalizzazione e Agility', desc: 'Addestramento stimolante con rinforzo positivo.' },
  { id: 4, src: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=600', category: 'Eventi', title: 'Puppy Class di Gruppo', desc: 'Socializzazione precoce per cuccioli dai 3 ai 6 mesi.' },
  { id: 5, src: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=600', category: 'Passeggiate', title: 'Gruppo di Passeggiata al Parco', desc: 'Attività stimolante in branco guidato.' },
  { id: 6, src: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=600', category: 'Dog Sitting', title: 'Coccole a domicilio', desc: 'Assistenza affettuosa e personalizzata.' }
];

export default function App() {
  // Main Navigation View: 'client' or 'admin'
  const [viewMode, setViewMode] = useState('client');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // States with LocalStorage backup
  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('webdog_bookings');
    return saved ? JSON.parse(saved) : defaultBookings;
  });

  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem('webdog_reviews');
    return saved ? JSON.parse(saved) : defaultReviews;
  });

  const [toasts, setToasts] = useState([]);

  // Gallery Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [activeGalleryFilter, setActiveGalleryFilter] = useState('Tutti');

  // "Chi Sono" active profile tab
  const [activeAboutTab, setActiveAboutTab] = useState('profilo');

  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    dogName: '',
    dogBreed: '',
    dogAge: '',
    service: 'Passeggiata Cinofila (30m)',
    date: '',
    time: '10:00',
    notes: '',
    gdpr: false,
    paymentMethod: 'sede', // 'sede' or 'online'
  });

  // Client Review Form State
  const [reviewForm, setReviewForm] = useState({
    name: '',
    dogName: '',
    dogBreed: '',
    rating: 5,
    comment: ''
  });

  // Selected date on calendar
  const [calendarDate, setCalendarDate] = useState(new Date(2026, 5, 2)); // June 2026
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(null);

  // Auto-Save states to localStorage
  useEffect(() => {
    localStorage.setItem('webdog_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('webdog_reviews', JSON.stringify(reviews));
  }, [reviews]);

  // Handle keyboard ESC close for mobile menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Toast helper function
  const triggerToast = (title, message, type = 'success', channel = 'Email') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, message, type, channel }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Pre-select service and scroll down
  const handleServiceSelect = (serviceName) => {
    setBookingForm((prev) => ({ ...prev, service: serviceName }));
    triggerToast(
      'Servizio Selezionato',
      `Hai scelto: ${serviceName}. Completa il modulo sottostante.`,
      'info',
      'Sito Web'
    );
    const element = document.getElementById('prenotazioni');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Form Booking handler
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!bookingForm.gdpr) {
      triggerToast('Errore Privacy', 'Devi accettare l\'informativa privacy GDPR.', 'error', 'System');
      return;
    }
    if (!bookingForm.date) {
      triggerToast('Seleziona Data', 'Fai click su un giorno verde disponibile nel calendario.', 'warning', 'Calendario');
      return;
    }

    const newBooking = {
      id: 'b_' + Date.now(),
      ...bookingForm,
      status: 'pending'
    };

    setBookings((prev) => [newBooking, ...prev]);

    // Send mock client alerts
    triggerToast(
      'Prenotazione Inviata',
      `Grazie ${bookingForm.firstName}! Appuntamento per ${bookingForm.dogName} registrato. Attendi la conferma.`,
      'success',
      'Email e SMS'
    );

    // Send mock operator notification
    setTimeout(() => {
      triggerToast(
        'Nuova Prenotazione Ricevuta',
        `Nuovo appuntamento da approvare da parte di ${bookingForm.firstName} ${bookingForm.lastName} per ${bookingForm.dogName}.`,
        'warning',
        'Telegram Bot'
      );
    }, 2500);

    // Reset Form
    setBookingForm({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      dogName: '',
      dogBreed: '',
      dogAge: '',
      service: 'Passeggiata Cinofila (30m)',
      date: '',
      time: '10:00',
      notes: '',
      gdpr: false,
      paymentMethod: 'sede'
    });
    setSelectedCalendarDay(null);
  };

  // Review Submit handler
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.comment) {
      triggerToast('Errore Recensione', 'Inserisci il tuo nome ed il commento.', 'error', 'System');
      return;
    }

    const newReview = {
      id: Date.now(),
      ...reviewForm,
      date: new Date().toISOString().split('T')[0]
    };

    setReviews((prev) => [newReview, ...prev]);
    triggerToast(
      'Recensione Pubblicata',
      'Grazie per il tuo feedback! La tua recensione è visibile online.',
      'success',
      'Sito Web'
    );

    // Alert operator of review
    setTimeout(() => {
      triggerToast(
        'Nuova Recensione Ricevuta',
        `Il cliente ${reviewForm.name} ha valutato il servizio con ${reviewForm.rating} stelle!`,
        'info',
        'Telegram Bot'
      );
    }, 2000);

    setReviewForm({
      name: '',
      dogName: '',
      dogBreed: '',
      rating: 5,
      comment: ''
    });
  };

  // Download PDF certificate simulation
  const simulateCertificateDownload = (certName) => {
    triggerToast(
      'Download Attestato',
      `Preparazione file: ${certName}.pdf...`,
      'info',
      'Download Manager'
    );
    setTimeout(() => {
      triggerToast(
        'Download Completato',
        `Il certificato "${certName}" (PDF, 420KB) è stato salvato nei tuoi download.`,
        'success',
        'System'
      );
    }, 1800);
  };

  // Quick message contact submit
  const handleContactSubmit = (e) => {
    e.preventDefault();
    triggerToast('Messaggio Spedito', 'Grazie per averci contattato. Ti risponderemo su WhatsApp o via Email entro poche ore.', 'success', 'WhatsApp / Email');
    e.target.reset();
  };

  // Admin database controls
  const updateBookingStatus = (id, newStatus) => {
    setBookings((prev) => prev.map((b) => {
      if (b.id === id) {
        const updated = { ...b, status: newStatus };
        if (newStatus === 'confirmed') {
          triggerToast(
            'Appuntamento Confermato',
            `Notifica di conferma inviata con successo al proprietario di ${b.dogName}.`,
            'success',
            'WhatsApp API'
          );
        } else if (newStatus === 'cancelled') {
          triggerToast(
            'Slot Annullato',
            `Notifica di cancellazione/rimborso inviata al cliente ${b.firstName}.`,
            'error',
            'Email Server'
          );
        }
        return updated;
      }
      return b;
    }));
  };

  const updateBookingDetails = (id, updatedFields) => {
    setBookings((prev) => prev.map((b) => {
      if (b.id === id) {
        const updated = { ...b, ...updatedFields };
        triggerToast(
          'Appuntamento Spostato',
          `Nuovi dettagli inviati a ${b.firstName}: ${updatedFields.date} ore ${updatedFields.time}.`,
          'success',
          'WhatsApp API'
        );
        return updated;
      }
      return b;
    }));
  };

  const deleteBooking = (id) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
    triggerToast(
      'Prenotazione Rimossa',
      'La prenotazione è stata eliminata definitivamente dall\'archivio storico.',
      'warning',
      'System Database'
    );
  };

  // Price & Duration calculator for Form visual preview
  const getSelectedServiceDetails = () => {
    switch (bookingForm.service) {
      case 'Dog Sitting Diurno (Sitter)': return { price: 25, duration: 'Mezza Giornata' };
      case 'Dog Sitting Pensione (Sitter)': return { price: 35, duration: '24 ore con pernottamento' };
      case 'Dog Sitting Diurno (Domicilio)': return { price: 40, duration: 'Mezza/Giornata Intera' };
      case 'Dog Sitting Pensione': return { price: 50, duration: '24 ore con pernottamento' };
      case 'Dog Walking (30m)': return { price: 20, duration: '30 minuti' };
      case 'Dog Walking (60m)': return { price: 35, duration: '60 minuti' };
      case 'Servizio Navetta': return { price: 15, duration: 'Trasporto A/R' };
      case 'Educazione Base': return { price: 30, duration: '1 Sessione (60m)' };
      case 'Consulenza Pre-Adozione': return { price: 25, duration: '1 Sessione (45m)' };
      default: return { price: 20, duration: 'Da concordare' };
    }
  };

  const selectedDetails = getSelectedServiceDetails();

  // Generate calendar days for June 2026
  // June 2026 starts on a Monday (June 1st) and has 30 days.
  const calendarDays = [];
  // Seed dates with statuses:
  // Weekends as Occupied (🔴), Some days as Pending (🟡), others as Available (🟢)
  for (let d = 1; d <= 30; d++) {
    const dateStr = `2026-06-${d < 10 ? '0' + d : d}`;
    let status = 'available';

    // Check if there is an actual booking on this day
    const bookingOnDay = bookings.find((b) => b.date === dateStr);
    if (bookingOnDay) {
      status = bookingOnDay.status === 'confirmed' ? 'occupied' : 'pending';
    } else {
      // Mock static occupancy for realism
      const dayOfWeek = new Date(2026, 5, d).getDay(); // 0 = Sun, 6 = Sat
      if (dayOfWeek === 0 || d === 14 || d === 28) {
        status = 'occupied';
      } else if (d === 8 || d === 22) {
        status = 'pending';
      }
    }

    calendarDays.push({ dayNum: d, dateStr, status });
  }

  const handleCalendarDayClick = (day) => {
    if (day.status === 'occupied') {
      triggerToast(
        'Giorno Non Disponibile',
        'Questo slot è al completo. Scegli una giornata evidenziata in verde o contattaci su WhatsApp.',
        'error',
        'Calendario'
      );
      return;
    }
    setSelectedCalendarDay(day.dayNum);
    setBookingForm((prev) => ({ ...prev, date: day.dateStr }));
    triggerToast(
      'Data Selezionata',
      `Hai scelto il ${day.dayNum} Giugno 2026 per il tuo appuntamento.`,
      'success',
      'Calendario'
    );
  };

  // Filtered Reviews logic
  const averageStars = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);

  // Gallery slideshow actions
  const filteredGallery = activeGalleryFilter === 'Tutti'
    ? galleryImages
    : galleryImages.filter(img => img.category === activeGalleryFilter);

  const openLightbox = (index) => {
    setLightboxIndex(index);
  };

  const navigateLightbox = (direction) => {
    setLightboxIndex((prevIndex) => {
      if (prevIndex === null) return null;
      let newIdx = prevIndex + direction;
      if (newIdx < 0) newIdx = filteredGallery.length - 1;
      if (newIdx >= filteredGallery.length) newIdx = 0;
      return newIdx;
    });
  };

  // Toggle view layout to Admin
  if (viewMode === 'admin') {
    return (
      <>
        <AdminPortal
          bookings={bookings}
          updateBookingStatus={updateBookingStatus}
          updateBookingDetails={updateBookingDetails}
          deleteBooking={deleteBooking}
          reviews={reviews}
          triggerToast={triggerToast}
          onClose={() => setViewMode('client')}
        />
        <NotificationToast toasts={toasts} removeToast={removeToast} />
      </>
    );
  }

  return (
    <div>
      {/* -------------------- HEADER / NAVBAR -------------------- */}
      <header className="glass-panel" style={{
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: '1200px',
        zIndex: 999,
        padding: '12px 28px',
        borderRadius: '9999px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>

        {/* Logo */}
        <a href="#home" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#0f766e' }}>
          <span style={{ fontSize: '1.8rem' }}>🐾</span>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', lineHeight: 1 }}>WebDog</h1>
            <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Servizi Cinofili Professionali
            </span>
          </div>
        </a>

        {/* Desktop Links */}
        <nav style={{ display: 'flex', gap: '24px' }} className="desktop-nav">
          <a href="#home" style={{ color: '#0f2d2a', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>Home</a>
          <a href="#about" style={{ color: '#0f2d2a', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>Chi Sono</a>
          <a href="#servizi" style={{ color: '#0f2d2a', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>Servizi</a>
          <a href="#prenotazioni" style={{ color: '#0f2d2a', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>Prenotazioni</a>
          <a href="#recensioni" style={{ color: '#0f2d2a', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>Recensioni</a>
          <a href="#gallery" style={{ color: '#0f2d2a', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>Gallery</a>
          <a href="#contatti" style={{ color: '#0f2d2a', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>Contatti</a>
        </nav>

        {/* Header CTAs */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }} className="desktop-ctas">
          <button
            onClick={() => setViewMode('admin')}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.8rem', gap: '6px', borderRadius: '999px' }}
          >
            <Sliders size={14} /> Gestionale Admin
          </button>

          <a
            href="#prenotazioni"
            className="btn btn-primary"
            style={{ padding: '8px 20px', fontSize: '0.8rem', borderRadius: '999px' }}
          >
            Prenota Ora
          </a>
        </div>

        {/* Mobile Hamburger Menu Toggle Button */}
        <button
          className={`mobile-menu-toggle ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className="line"></span>
          <span className="line"></span>
          <span className="line"></span>
        </button>
      </header>

      {/* Mobile Overlay Navigation Panel */}
      <nav className={`mobile-nav-overlay ${mobileMenuOpen ? 'open' : ''}`}>
        <a href="#home" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Home</a>
        <a href="#about" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Chi Sono</a>
        <a href="#servizi" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Servizi</a>
        <a href="#prenotazioni" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Prenotazioni</a>
        <a href="#recensioni" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Recensioni</a>
        <a href="#gallery" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Gallery</a>
        <a href="#contatti" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Contatti</a>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
          <a
            href="#prenotazioni"
            className="btn btn-primary"
            style={{ padding: '12px 20px', fontSize: '0.95rem', borderRadius: '999px', textAlign: 'center' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            Prenota Ora
          </a>
        </div>
      </nav>


      {/* -------------------- HERO SECTION -------------------- */}
      <section id="home" className="section-padding" style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%)',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: '160px'
      }}>
        {/* Animated Background Orbs */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(45, 212, 191, 0.15) 0%, rgba(255, 255, 255, 0) 70%)',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(2, 132, 199, 0.1) 0%, rgba(255, 255, 255, 0) 70%)',
          zIndex: 0
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '48px',
            alignItems: 'center'
          }}>

            {/* Left Column Text */}
            <div>
              <span className="badge" style={{ marginBottom: '16px' }}>
                <Sparkles size={14} /> Professionisti al Tuo Servizio
              </span>
              <h2 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, color: '#042f2e', marginBottom: '20px', letterSpacing: '-0.03em' }}>
                Educazione, Benessere e Cura del Tuo Cane
              </h2>
              <p style={{ fontSize: '1.2rem', color: '#334155', marginBottom: '32px', lineHeight: 1.6 }}>
                Servizi professionali dedicati al mondo cinofilo per accompagnare te e il tuo amico a quattro zampe in ogni esigenza.
              </p>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <a href="#prenotazioni" className="btn btn-primary">Prenota Ora</a>
                <a href="#servizi" className="btn btn-secondary">Scopri i Servizi</a>
              </div>

              {/* Little Live Statistics Overlay */}
              <div style={{
                display: 'flex',
                gap: '24px',
                marginTop: '48px',
                borderTop: '1px solid rgba(15, 118, 110, 0.15)',
                paddingTop: '24px'
              }}>
                <div>
                  <h4 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f766e' }}>100%</h4>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Amore & Dedizione</p>
                </div>
                <div>
                  <h4 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f766e' }}>{reviews.length}+</h4>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Recensioni 5 Stelle</p>
                </div>
                <div>
                  <h4 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f766e' }}>{bookings.length}+</h4>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Cani Felici Assistiti</p>
                </div>
              </div>
            </div>

            {/* Right Column Custom Render */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '440px',
                aspectRatio: '1',
                borderRadius: '50% 50% 30% 70% / 50% 60% 40% 50%',
                background: 'linear-gradient(135deg, #0f766e 0%, #0284c7 100%)',
                boxShadow: '0 25px 50px -12px rgba(15, 118, 110, 0.25)',
                overflow: 'hidden',
                border: '8px solid rgba(255, 255, 255, 0.4)'
              }} className="floating-icon">
                <img
                  src="/chi_sono_profile.png"
                  alt="WebDog Professional"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'scale(1.05)',
                    transition: 'all 0.3s'
                  }}
                />
              </div>

              {/* Float Card 1: Experience badge */}
              <div className="glass-panel" style={{
                position: 'absolute',
                top: '20px',
                left: '-20px',
                padding: '12px 20px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)'
              }}>
                <span style={{ fontSize: '1.5rem' }}>🐶</span>
                <div>
                  <h5 style={{ fontWeight: 800, fontSize: '0.9rem' }}>Educatore Certificato</h5>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>FISC & CSEN</p>
                </div>
              </div>

              {/* Float Card 2: Safe custody badge */}
              <div className="glass-panel" style={{
                position: 'absolute',
                bottom: '40px',
                right: '-10px',
                padding: '12px 20px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)'
              }}>
                <Heart size={20} style={{ color: '#ef4444', fill: '#ef4444' }} />
                <div>
                  <h5 style={{ fontWeight: 800, fontSize: '0.9rem' }}>Assistenza 24/7</h5>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Sempre al sicuro</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* -------------------- SEZIONE VANTAGGI -------------------- */}
      <section style={{ padding: '60px 0', background: 'white' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px'
          }}>
            {/* Card 1: Professionalità */}
            <div className="glass-card" style={{ padding: '32px', textAlign: 'center', border: '1px solid rgba(15, 118, 110, 0.08)' }}>
              <div style={{
                fontSize: '2.5rem',
                background: '#f0fdfa',
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto'
              }}>🐶</div>
              <h4 style={{ fontWeight: 800, fontSize: '1.15rem', color: '#042f2e', marginBottom: '12px' }}>
                Esperienza e Professionalità
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Competenze certificate per comprendere i bisogni etologici del tuo cane e migliorarne la relazione con te.
              </p>
            </div>

            {/* Card 2: Navetta */}
            <div className="glass-card" style={{ padding: '32px', textAlign: 'center', border: '1px solid rgba(15, 118, 110, 0.08)' }}>
              <div style={{
                fontSize: '2.5rem',
                background: '#e0f2fe',
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto'
              }}>🚗</div>
              <h4 style={{ fontWeight: 800, fontSize: '1.15rem', color: '#042f2e', marginBottom: '12px' }}>
                Servizio Navetta
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Trasporto in sicurezza presso veterinario, toelettatura o centro cinofilo con mezzo attrezzato e omologato.
              </p>
            </div>

            {/* Card 3: Assistenza Domicilio */}
            <div className="glass-card" style={{ padding: '32px', textAlign: 'center', border: '1px solid rgba(15, 118, 110, 0.08)' }}>
              <div style={{
                fontSize: '2.5rem',
                background: '#fef3c7',
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto'
              }}>🏡</div>
              <h4 style={{ fontWeight: 800, fontSize: '1.15rem', color: '#042f2e', marginBottom: '12px' }}>
                Assistenza a Domicilio
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Il cane rimane nel suo habitat domestico, riducendo lo stress e mantenendo inalterate le sue abitudini.
              </p>
            </div>

            {/* Card 4: Benessere */}
            <div className="glass-card" style={{ padding: '32px', textAlign: 'center', border: '1px solid rgba(15, 118, 110, 0.08)' }}>
              <div style={{
                fontSize: '2.5rem',
                background: '#fee2e2',
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto'
              }}>❤️</div>
              <h4 style={{ fontWeight: 800, fontSize: '1.15rem', color: '#042f2e', marginBottom: '12px' }}>
                Massima Attenzione
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Attenzione focalizzata al 100% sulla salute fisica e mentale del cane tramite attività fisiche ed esplorative.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* -------------------- CHI SONO (ABOUT ME) -------------------- */}
      <section id="about" className="section-padding" style={{ background: '#f8fafc' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '56px',
            alignItems: 'center'
          }}>

            {/* Left Photo panel */}
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'relative',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-lg)',
                border: '4px solid white'
              }}>
                <img
                  src="/chi_sono_profile.png"
                  alt="Chi Sono Professional Trainer"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>

              {/* floating award */}
              <div className="glass-panel" style={{
                position: 'absolute',
                bottom: '-20px',
                left: '20px',
                padding: '16px 24px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: 'var(--shadow-lg)'
              }}>
                <Award size={28} style={{ color: '#fbbf24' }} />
                <div>
                  <h5 style={{ fontWeight: 800 }}>Educatore CSEN</h5>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Iscrizione Albo Naz. n. 42081</p>
                </div>
              </div>
            </div>

            {/* Right Information panel */}
            <div>
              <span className="badge">👤 CHI SONO</span>
              <h2 className="section-title">Emanuele Barese</h2>
              <span style={{ fontWeight: 700, color: '#0f766e', fontSize: '1.1rem', display: 'block', marginBottom: '16px' }}>
                Educatore Cinofilo & Operatore del Benessere Animale
              </span>

              <p style={{ fontSize: '1.05rem', color: '#334155', marginBottom: '24px', lineHeight: 1.7 }}>
                Mi occupo di servizi cinofili con passione e dedizione, offrendo supporto ai proprietari e benessere ai loro cani attraverso attività personalizzate e professionali.
              </p>

              {/* TABS Toggles */}
              <div style={{
                display: 'flex',
                borderBottom: '2px solid #e2e8f0',
                marginBottom: '20px',
                gap: '16px'
              }}>
                {['profilo', 'competenze', 'certificazioni', 'attestati'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveAboutTab(tab)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      borderBottom: activeAboutTab === tab ? '3px solid #0f766e' : '3px solid transparent',
                      color: activeAboutTab === tab ? '#0f766e' : '#64748b',
                      padding: '8px 4px',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                      transition: 'all 0.2s'
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* TAB CONTENT: PROFILO */}
              {activeAboutTab === 'profilo' && (
                <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                  <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '14px' }}>
                    Credo in una cinofilia basata sul rispetto reciproco, sulla cognizione ed empatia. Ogni cane è un individuo a sé, con una personalità e sensibilità unica.
                  </p>
                  <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem', fontWeight: 600 }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} style={{ color: '#10b981' }} /> Pratica Gentile</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} style={{ color: '#10b981' }} /> No metodi coercitivi</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} style={{ color: '#10b981' }} /> Supporto h24</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} style={{ color: '#10b981' }} /> Assicurazione RC attiva</li> 
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} style={{ color: '#10b981' }} /> Agilista sportivo</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} style={{ color: '#10b981' }} /> Educazione di base</li>
                  </ul>
                </div>
              )}

              {/* TAB CONTENT: COMPETENZE */}
              {activeAboutTab === 'competenze' && (
                <div style={{ animation: 'fadeIn 0.3s ease-out', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { name: 'Educazione Cinofila', desc: 'Costruzione di una solida base comunicativa cane-proprietario.' },
                    { name: 'Dog Sitting & Cura h24', desc: 'Custodia attenta presso il domicilio del proprietario.' },
                    { name: 'Passeggiate Educative', desc: 'Uscite in natura focalizzate su stimoli olfattivi e calma.' },
                    { name: 'Gestione Cuccioli (Puppy Classes)', desc: 'Prevenzione problemi comportamentali e socializzazione.' },
                    { name: 'Supporto ai Proprietari', desc: 'Consulenze mirate per comprendere al meglio i comportamenti.' },
                    { name: 'Asilo', desc: 'Operatore presso asilo.' },
                  ].map((comp, idx) => (
                    <div key={idx} style={{ padding: '8px 12px', background: 'white', borderRadius: '8px', borderLeft: '3px solid #0284c7' }}>
                      <h5 style={{ fontWeight: 700, fontSize: '0.85rem', color: '#042f2e' }}>{comp.name}</h5>
                      <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{comp.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB CONTENT: CERTIFICAZIONI */}
              {activeAboutTab === 'certificazioni' && (
                <div style={{ animation: 'fadeIn 0.3s ease-out', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ padding: '10px 14px', background: 'white', borderRadius: '8px' }}>
                    <strong style={{ fontSize: '0.85rem', display: 'block' }}>Diploma Nazionale Educatore Cinofilo CSEN / FISC</strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Anno di conseguimento: 2021 • Riconosciuto CONI</span>
                  </div>
                  <div style={{ padding: '10px 14px', background: 'white', borderRadius: '8px' }}>
                    <strong style={{ fontSize: '0.85rem', display: 'block' }}>Primo Soccorso Veterinario di base</strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Certificato di idoneità per gestione emergenze cinofile</span>
                  </div>
                  <div style={{ padding: '10px 14px', background: 'white', borderRadius: '8px' }}>
                    <strong style={{ fontSize: '0.85rem', display: 'block' }}>Seminari di Aggiornamento su Ansia da Separazione</strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Relatore Dr. Simone Rossi - Etologo</span>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: ATTESTATI */}
              {activeAboutTab === 'attestati' && (
                <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '14px' }}>
                    Scarica le mie certificazioni professionali ufficiali in formato PDF ad alta definizione.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      onClick={() => simulateCertificateDownload('Diploma_Educatore_Cinofilo')}
                      className="btn btn-outline"
                      style={{ padding: '8px 16px', fontSize: '0.8rem', justifyContent: 'space-between', borderRadius: '8px' }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={16} /> Diploma Educatore Cinofilo.pdf</span>
                      <strong style={{ color: '#0f766e' }}>Scarica</strong>
                    </button>
                    <button
                      onClick={() => simulateCertificateDownload('Attestato_Primo_Soccorso')}
                      className="btn btn-outline"
                      style={{ padding: '8px 16px', fontSize: '0.8rem', justifyContent: 'space-between', borderRadius: '8px' }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={16} /> Attestato Primo Soccorso Cane.pdf</span>
                      <strong style={{ color: '#0f766e' }}>Scarica</strong>
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      </section>

      {/* -------------------- SERVIZI (SERVICES) -------------------- */}
      <section id="servizi" className="section-padding" style={{ background: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="badge">🐾 SERVIZI OFFERTI</span>
            <h2 className="section-title" style={{ margin: '8px 0 0 0' }}>Servizi Professionali su Misura</h2>
            <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '560px', margin: '8px auto 0 auto' }}>
              Ogni cane ha necessità differenti. Offriamo formule personalizzabili per la cura quotidiana e la crescita educativa.
            </p>
          </div>

          {/* ---- CATEGORIA 1: Presso la casa del Sitter ---- */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <span style={{ fontSize: '1.6rem' }}>🏡</span>
              <h3 style={{ fontWeight: 800, fontSize: '1.3rem', color: '#042f2e' }}>Presso la casa del Sitter</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {/* Dog Sitting Diurno */}
              <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontWeight: 800, fontSize: '1.15rem', color: '#042f2e' }}>☀️ Dog Sitting Diurno</h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '8px 0 14px 0' }}>
                    Il tuo cane passa la giornata a casa mia, in un ambiente sicuro e accogliente. Perfetto per non lasciarlo solo mentre sei al lavoro.
                  </p>
                  <div style={{ fontSize: '0.85rem', background: '#f1f5f9', padding: '10px', borderRadius: '8px', marginBottom: '16px' }}>
                    <p>⏱️ Durata: <strong>Mezza Giornata</strong></p>
                    <p style={{ marginTop: '4px' }}>💰 Prezzo: <strong>€25</strong></p>
                  </div>
                </div>
                <button onClick={() => handleServiceSelect('Dog Sitting Diurno (Sitter)')} className="btn btn-primary" style={{ width: '100%' }}>
                  Prenota Ora
                </button>
              </div>
              {/* Dog Sitting Pensione */}
              <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontWeight: 800, fontSize: '1.15rem', color: '#042f2e' }}>🌙 Dog Sitting Pensione</h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '8px 0 14px 0' }}>
                    Un vero e proprio soggiorno con pernottamento. Il tuo cane farà parte della famiglia per tutta la notte, circondato da comfort, affetto e attenzioni.
                  </p>
                  <div style={{ fontSize: '0.85rem', background: '#f1f5f9', padding: '10px', borderRadius: '8px', marginBottom: '16px' }}>
                    <p>⏱️ Durata: <strong>24 ore (con pernottamento incluso)</strong></p>
                    <p style={{ marginTop: '4px' }}>💰 Prezzo: <strong>€35</strong></p>
                  </div>
                </div>
                <button onClick={() => handleServiceSelect('Dog Sitting Pensione (Sitter)')} className="btn btn-primary" style={{ width: '100%' }}>
                  Prenota Ora
                </button>
              </div>
            </div>
          </div>

          {/* ---- CATEGORIA 2: Presso l'abitazione del Cliente ---- */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <span style={{ fontSize: '1.6rem' }}>🦮</span>
              <h3 style={{ fontWeight: 800, fontSize: '1.3rem', color: '#042f2e' }}>Presso l'abitazione del Cliente</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {/* Dog Sitting Diurno */}
              <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontWeight: 800, fontSize: '1.15rem', color: '#042f2e' }}>🏠 Dog Sitting Diurno</h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '8px 0 14px 0' }}>
                    Vengo io da te per accudire il tuo cane direttamente nel suo ambiente domestico durante il giorno. Meno stress per lui, massima comodità per te.
                  </p>
                  <div style={{ fontSize: '0.85rem', background: '#f1f5f9', padding: '10px', borderRadius: '8px', marginBottom: '16px' }}>
                    <p>⏱️ Durata: <strong>Mezza Giornata / Giornata intera</strong></p>
                    <p style={{ marginTop: '4px' }}>💰 Prezzo: <strong>€20 / €40</strong></p>
                  </div>
                </div>
                <button onClick={() => handleServiceSelect('Dog Sitting Diurno (Domicilio)')} className="btn btn-primary" style={{ width: '100%' }}>
                  Prenota Ora
                </button>
              </div>
              {/* Dog Sitting a domicilio Pensione */}
              <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontWeight: 800, fontSize: '1.15rem', color: '#042f2e' }}>🛌 Dog Sitting Pensione</h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '8px 0 14px 0' }}>
                    Servizio di "house-sitting". Resto a dormire a casa tua per garantire al cane la continuità delle sue abitudini e una presenza costante anche di notte.
                  </p>
                  <div style={{ fontSize: '0.85rem', background: '#f1f5f9', padding: '10px', borderRadius: '8px', marginBottom: '16px' }}>
                    <p>⏱️ Durata: <strong>24 ore (con pernottamento incluso)</strong></p>
                    <p style={{ marginTop: '4px' }}>💰 Prezzo: <strong>€50</strong></p>
                  </div>
                </div>
                <button onClick={() => handleServiceSelect('Dog Sitting Pensione')} className="btn btn-primary" style={{ width: '100%' }}>
                  Prenota Ora
                </button>
              </div>
            </div>
          </div>

          {/* ---- CATEGORIA 3: In Giro per la Città ---- */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <span style={{ fontSize: '1.6rem' }}>🌳</span>
              <h3 style={{ fontWeight: 800, fontSize: '1.3rem', color: '#042f2e' }}>In Giro per la Città</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontWeight: 800, fontSize: '1.15rem', color: '#042f2e' }}>🦮 Dog Walking (Passeggiata Cani)</h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '8px 0 14px 0' }}>
                    Un'uscita dedicata al movimento, al gioco e ai bisognini del tuo cane, per spezzare la sua giornata in totale sicurezza.
                  </p>
                  <div style={{ fontSize: '0.85rem', background: '#f1f5f9', padding: '10px', borderRadius: '8px', marginBottom: '16px' }}>
                    <p>⏱️ 30 minuti &nbsp; | &nbsp; 💰 <strong>€20</strong></p>
                    <p style={{ marginTop: '6px' }}>⏱️ 60 minuti &nbsp; | &nbsp; 💰 <strong>€35</strong></p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleServiceSelect('Dog Walking (30m)')} className="btn btn-primary" style={{ flex: 1, fontSize: '0.85rem' }}>
                    30 min
                  </button>
                  <button onClick={() => handleServiceSelect('Dog Walking (60m)')} className="btn btn-secondary" style={{ flex: 1, fontSize: '0.85rem' }}>
                    60 min
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ---- CATEGORIA 4+: Navetta, Educazione, Consulenza ---- */}
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {/* Navetta */}
              <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '1.4rem' }}>🚌</span>
                    <span style={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Servizio Navetta</span>
                  </div>
                  <h4 style={{ fontWeight: 800, fontSize: '1.15rem', color: '#042f2e' }}>🚗 Trasporto Professionale</h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '8px 0 14px 0' }}>
                    Trasporto professionale ed in sicurezza del cane presso veterinario, toelettatura o centri specializzati.
                  </p>
                  <div style={{ fontSize: '0.85rem', background: '#f1f5f9', padding: '10px', borderRadius: '8px', marginBottom: '16px' }}>
                    <p>⏱️ Destinazione: <strong>Veterinario / Toeletta / Centro</strong></p>
                    <p style={{ marginTop: '4px' }}>💰 Prezzo: <strong>Da €15</strong></p>
                  </div>
                </div>
                <button onClick={() => handleServiceSelect('Servizio Navetta')} className="btn btn-primary" style={{ width: '100%' }}>
                  Prenota Ora
                </button>
              </div>
              {/* Educazione Base */}
              <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '1.4rem' }}>🎓</span>
                    <span style={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Educazione</span>
                  </div>
                  <span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}></span>
                  <h4 style={{ fontWeight: 800, fontSize: '1.15rem', color: '#042f2e' }}>🦮Educazione Base</h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '8px 0 14px 0' }}>
                    Sessioni di educazione per migliorare l'intesa cane-conduttore, i comandi di base, il richiamo ed autocontrollo.
                  </p>
                  <div style={{ fontSize: '0.85rem', background: '#f1f5f9', padding: '10px', borderRadius: '8px', marginBottom: '16px' }}>
                    <p>⏱️ Durata: <strong>60 minuti a sessione</strong></p>
                    <p style={{ marginTop: '4px' }}>💰 Prezzo: <strong>€30 a sessione</strong></p>
                  </div>
                </div>
                <button onClick={() => handleServiceSelect('Educazione Base')} className="btn btn-primary" style={{ width: '100%' }}>
                  Prenota Ora
                </button>
              </div>
              {/* Consulenza Pre-Adozione */}
              <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '1.4rem' }}>📋</span>
                    <span style={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Consulenza</span>
                  </div>
                  <h4 style={{ fontWeight: 800, fontSize: '1.15rem', color: '#042f2e' }}>🐾 Consulenza Pre-Adozione</h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '8px 0 14px 0' }}>
                    Ti guidiamo nella scelta della razza o del cane ideale in canile in base al tuo stile di vita e spazi disponibili.
                  </p>
                  <div style={{ fontSize: '0.85rem', background: '#f1f5f9', padding: '10px', borderRadius: '8px', marginBottom: '16px' }}>
                    <p>⏱️ Durata: <strong>45 minuti a sessione</strong></p>
                    <p style={{ marginTop: '4px' }}>💰 Prezzo: <strong>€25 a sessione</strong></p>
                  </div>
                </div>
                <button onClick={() => handleServiceSelect('Consulenza Pre-Adozione')} className="btn btn-primary" style={{ width: '100%' }}>
                  Prenota Ora
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* -------------------- PRENOTAZIONI ONLINE & CALENDARIO -------------------- */}
      <section id="prenotazioni" className="section-padding" style={{ background: '#f0fdfa' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="badge" style={{ color: '#0284c7', background: 'rgba(2, 132, 199, 0.1)' }}>📅 PRENOTAZIONI ONLINE</span>
            <h2 className="section-title" style={{ margin: '8px 0 0 0' }}>Prenota un Servizio in un Click</h2>
            <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '560px', margin: '8px auto 0 auto' }}>
              Scegli una data verde disponibile sul calendario mensile ed inserisci i dati del tuo amico a quattro zampe.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            alignItems: 'start'
          }}>

            {/* LEFT COLUMN: INTERACTIVE MONTH CALENDAR */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div className="calendar-container">
                <div className="calendar-header">
                  <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f2d2a' }}>Giugno 2026</h4>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}><ChevronLeft size={20} /></button>
                    <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}><ChevronRight size={20} /></button>
                  </div>
                </div>

                {/* Calendar Grid Labels */}
                <div className="calendar-grid">
                  {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((d) => (
                    <div key={d} className="calendar-day-label">{d}</div>
                  ))}

                  {/* Monthly Days mapping */}
                  {calendarDays.map((day) => (
                    <div
                      key={day.dayNum}
                      onClick={() => handleCalendarDayClick(day)}
                      className={`calendar-cell ${selectedCalendarDay === day.dayNum ? 'selected' : ''}`}
                    >
                      <span className="calendar-cell-num">{day.dayNum}</span>

                      {/* Status indicator dot */}
                      <span className={`calendar-cell-status ${day.status === 'available' ? 'status-available' :
                          day.status === 'pending' ? 'status-pending' : 'status-occupied'
                        }`} />
                    </div>
                  ))}
                </div>

                {/* Legenda */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  marginTop: '16px',
                  borderTop: '1px solid rgba(15, 118, 110, 0.15)',
                  paddingTop: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    
                    <span>🟢 Disponibile</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🟡 In Attesa</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🔴 Occupato</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: BOOKING FORM */}
            <div className="glass-panel" style={{ padding: '30px' }}>
              <form onSubmit={handleBookingSubmit}>
                <h4 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f2d2a', marginBottom: '20px' }}>
                  Dettagli Appuntamento
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label className="form-label">NOME</label>
                    <input
                      type="text"
                      placeholder="Emanuele"
                      value={bookingForm.firstName}
                      onChange={(e) => setBookingForm({ ...bookingForm, firstName: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">COGNOME</label>
                    <input
                      type="text"
                      placeholder="Vanni"
                      value={bookingForm.lastName}
                      onChange={(e) => setBookingForm({ ...bookingForm, lastName: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label className="form-label">TELEFONO</label>
                    <input
                      type="tel"
                      placeholder="3334567890"
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">E-MAIL</label>
                    <input
                      type="email"
                      placeholder="proprietario@cane.it"
                      value={bookingForm.email}
                      onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '10px', marginBottom: '16px' }}>
                  <div>
                    <label className="form-label">NOME CANE</label>
                    <input
                      type="text"
                      placeholder="Thor"
                      value={bookingForm.dogName}
                      onChange={(e) => setBookingForm({ ...bookingForm, dogName: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">RAZZA</label>
                    <input
                      type="text"
                      placeholder="Golden"
                      value={bookingForm.dogBreed}
                      onChange={(e) => setBookingForm({ ...bookingForm, dogBreed: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">ETÀ CANE (ANNI)</label>
                    <input
                      type="number"
                      placeholder="3"
                      min="0"
                      max="25"
                      value={bookingForm.dogAge}
                      onChange={(e) => setBookingForm({ ...bookingForm, dogAge: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label className="form-label">SERVIZIO RICHIESTO</label>
                    <select
                      value={bookingForm.service}
                      onChange={(e) => setBookingForm({ ...bookingForm, service: e.target.value })}
                      className="form-input"
                    >
                      <optgroup label="🏡 Presso la casa del Sitter">
                        <option value="Dog Sitting Diurno (Sitter)">☀️ Dog Sitting Diurno — €25</option>
                        <option value="Dog Sitting Pensione (Sitter)">🌙 Dog Sitting Pensione — €35</option>
                      </optgroup>
                      <optgroup label="🦮 Presso l'abitazione del Cliente">
                        <option value="Dog Sitting Diurno (Domicilio)">🏠 Dog Sitting Diurno — €20/€40</option>
                        <option value="Dog Sitting Pensione">🛌 Dog Sitting Pensione — €50</option>
                      </optgroup>
                      <optgroup label="🌳 In Giro per la Città">
                        <option value="Dog Walking (30m)">🦮 Dog Walking 30min — €20</option>
                        <option value="Dog Walking (60m)">🦮 Dog Walking 60min — €35</option>
                      </optgroup>
                      <optgroup label="🚌 Navetta & Formazione">
                        <option value="Servizio Navetta">🚗 Servizio Navetta — Da €15</option>
                        <option value="Educazione Base">🎓 Educazione Base — €30</option>
                        <option value="Consulenza Pre-Adozione">📋 Consulenza Pre-Adozione — €25</option>
                      </optgroup>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">ORARIO</label>
                    <input
                      type="time"
                      value={bookingForm.time}
                      onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Selected calendar day highlight in form */}
                <div style={{ marginBottom: '20px' }}>
                  <label className="form-label">DATA SELEZIONATA</label>
                  <input
                    type="text"
                    value={bookingForm.date ? new Date(bookingForm.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Scegli dal calendario a sinistra 📅'}
                    disabled
                    className="form-input"
                    style={{ background: bookingForm.date ? '#d1fae5' : '#fee2e2', border: 'none', fontWeight: 700, color: '#042f2e' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label className="form-label">NOTE SPECIALI O PATOLOGIE</label>
                  <textarea
                    placeholder="Scrivi qui eventuali fobie, allergie o raccomandazioni importanti..."
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                    rows="2"
                    className="form-input"
                    style={{ resize: 'none' }}
                  />
                </div>

                {/* Option Payments Integration */}
                <div style={{
                  background: '#f8fafc',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '20px'
                }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                    MODALITÀ DI PAGAMENTO
                  </span>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="payment"
                        value="sede"
                        checked={bookingForm.paymentMethod === 'sede'}
                        onChange={() => setBookingForm({ ...bookingForm, paymentMethod: 'sede' })}
                      /> In Sede (Posticipato)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="payment"
                        value="online"
                        checked={bookingForm.paymentMethod === 'online'}
                        onChange={() => setBookingForm({ ...bookingForm, paymentMethod: 'online' })}
                      /> Online (Stripe, PayPal, CC)
                    </label>
                  </div>
                </div>

                {/* Visual pricing review panel */}
                <div style={{
                  background: '#ccfbf1',
                  padding: '14px 20px',
                  borderRadius: '12px',
                  border: '1px solid #99f6e4',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <div>
                    <h5 style={{ fontWeight: 800, color: '#0f766e', fontSize: '0.95rem' }}>Riepilogo preventivato</h5>
                    <p style={{ fontSize: '0.75rem', color: '#0f766e' }}>{selectedDetails.duration}</p>
                  </div>
                  <strong style={{ fontSize: '1.5rem', color: '#0f766e', fontWeight: 800 }}>
                    €{selectedDetails.price}
                  </strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '24px' }}>
                  <input
                    type="checkbox"Area Copertura Servizi
                    id="gdpr"
                    checked={bookingForm.gdpr}
                    onChange={(e) => setBookingForm({ ...bookingForm, gdpr: e.target.checked })}
                    required
                    style={{ marginTop: '4px', cursor: 'pointer' }}
                  />
                  <label htmlFor="gdpr" style={{ fontSize: '0.75rem', color: '#64748b', cursor: 'pointer' }}>
                    Dichiaro di aver preso visione dell'informativa privacy GDPR e autorizzo il trattamento dei dati forniti e del mio cane per scopi amministrativi e di contatto.
                  </label>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px' }}>
                  Conferma Prenotazione
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* -------------------- RECENSIONI (REVIEWS) -------------------- */}
      <section id="recensioni" className="section-padding" style={{ background: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="badge">⭐ RECENSIONI CLIENTI</span>
            <h2 className="section-title" style={{ margin: '8px 0 0 0' }}>La Parola ai Nostri Clienti</h2>
            <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '560px', margin: '8px auto 0 auto' }}>
              Leggi le opinioni di chi ha già provato i nostri servizi cinofili. La felicità del cane è la nostra migliore referenza.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            alignItems: 'start'
          }}>

            {/* LEFT COLUMN: REVIEWS AGGREGATE STATS & FEEDBACK SUBMISSION */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>VALUTAZIONE COMPLESSIVA</span>
                <h3 style={{ fontSize: '3rem', fontWeight: 800, color: '#0f766e', margin: '4px 0' }}>
                  {averageStars} <span style={{ fontSize: '1.25rem', color: '#cbd5e1' }}>/ 5.0</span>
                </h3>

                {/* Stars aggregation overlay */}
                <div className="star-rating" style={{ justifyContent: 'center', marginBottom: '12px' }}>
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} size={20} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                  ))}
                </div>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Basato su un totale di {reviews.length} feedback spontanei.</p>
              </div>

              {/* Form Submission reviews */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <form onSubmit={handleReviewSubmit}>
                  <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f2d2a', marginBottom: '16px' }}>
                    Lascia la tua Recensione
                  </h4>

                  <div style={{ marginBottom: '12px' }}>
                    <label className="form-label">NOME CLIENTE</label>
                    <input
                      type="text"
                      placeholder="Alessandro N."
                      value={reviewForm.name}
                      onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label className="form-label">NOME CANE</label>
                      <input
                        type="text"
                        placeholder="Thor"
                        value={reviewForm.dogName}
                        onChange={(e) => setReviewForm({ ...reviewForm, dogName: e.target.value })}
                        required
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="form-label">RAZZA</label>
                      <input
                        type="text"
                        placeholder="Golden"
                        value={reviewForm.dogBreed}
                        onChange={(e) => setReviewForm({ ...reviewForm, dogBreed: e.target.value })}
                        required
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label className="form-label">VALUTAZIONE (1-5 STELLE)</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[1, 2, 3, 4, 5].map((val) => (
                        <Star
                          key={val}
                          size={24}
                          onClick={() => setReviewForm({ ...reviewForm, rating: val })}
                          style={{
                            cursor: 'pointer',
                            color: val <= reviewForm.rating ? '#fbbf24' : '#cbd5e1',
                            fill: val <= reviewForm.rating ? '#fbbf24' : 'transparent',
                            transition: 'all 0.1s'
                          }}
                          className="star-interactive"
                        />
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label className="form-label">IL TUO COMMENTO</label>
                    <textarea
                      placeholder="Raccontaci la tua esperienza con il servizio cinofilo..."
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      required
                      rows="3"
                      className="form-input"
                      style={{ resize: 'none' }}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    Pubblica Recensione
                  </button>
                </form>
              </div>
            </div>

            {/* RIGHT COLUMN: REVIEWS FEED */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reviews.map((rev) => (
                <div key={rev.id} className="glass-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{
                        background: '#ccfbf1',
                        color: '#0f766e',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.9rem'
                      }}>
                        {rev.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h5 style={{ fontWeight: 800, fontSize: '0.95rem' }}>{rev.name}</h5>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Proprietario di <strong>{rev.dogName}</strong> ({rev.dogBreed})
                        </span>
                      </div>
                    </div>

                    <div className="star-rating">
                      {[...Array(5)].map((_, starIdx) => (
                        <Star
                          key={starIdx}
                          size={14}
                          style={{
                            color: starIdx < rev.rating ? '#fbbf24' : '#cbd5e1',
                            fill: starIdx < rev.rating ? '#fbbf24' : 'transparent'
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }}>
                    "{rev.comment}"
                  </p>

                  <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', textAlign: 'right', marginTop: '12px' }}>
                    Data recensione: {rev.date}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* -------------------- PHOTO GALLERY WITH CATEGORIES & LIGHTBOX -------------------- */}
      <section id="gallery" className="section-padding" style={{ background: '#f8fafc' }}>
        <div className="container">

          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="badge">📸 GALLERIA ATTIVITÀ</span>
            <h2 className="section-title" style={{ margin: '8px 0 0 0' }}>Momenti di Felicità Cinofila</h2>
            <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '560px', margin: '8px auto 0 auto' }}>
              Fotografie scattate durante le nostre attività all'aperto, nei percorsi educativi ed eventi di socializzazione.
            </p>
          </div>

          {/* Categories Tab Selector */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '32px',
            flexWrap: 'wrap'
          }}>
            {['Tutti', 'Passeggiate', 'Dog Sitting', 'Educazione', 'Eventi'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveGalleryFilter(cat)}
                style={{
                  border: 'none',
                  background: activeGalleryFilter === cat ? '#0f766e' : 'white',
                  color: activeGalleryFilter === cat ? 'white' : '#64748b',
                  padding: '8px 18px',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid Layout Images */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {filteredGallery.map((img, index) => (
              <div
                key={img.id}
                onClick={() => openLightbox(index)}
                className="glass-card"
                style={{
                  overflow: 'hidden',
                  cursor: 'pointer',
                  borderRadius: '16px',
                  position: 'relative'
                }}
              >
                <div style={{ overflow: 'hidden', aspectRatio: '4/3' }}>
                  <img
                    src={img.src}
                    alt={img.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 0.5s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
                  />
                </div>

                <div style={{ padding: '16px' }}>
                  <span className="badge" style={{ fontSize: '0.65rem', padding: '2px 8px', marginBottom: '6px' }}>
                    {img.category}
                  </span>
                  <h4 style={{ fontWeight: 800, fontSize: '1rem', color: '#042f2e' }}>{img.title}</h4>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{img.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY LIGHTBOX OVERLAY */}
      {lightboxIndex !== null && (
        <div className="lightbox" onClick={() => setLightboxIndex(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>

            {/* Close button */}
            <button className="lightbox-close" onClick={() => setLightboxIndex(null)}>
              <X size={32} />
            </button>

            {/* Prev/Next buttons */}
            <button className="lightbox-nav lightbox-prev" onClick={() => navigateLightbox(-1)}>
              <ChevronLeft size={24} />
            </button>
            <button className="lightbox-nav lightbox-next" onClick={() => navigateLightbox(1)}>
              <ChevronRight size={24} />
            </button>

            {/* Slideshow image */}
            <img
              className="lightbox-img"
              src={filteredGallery[lightboxIndex].src}
              alt={filteredGallery[lightboxIndex].title}
            />

            {/* Caption */}
            <div style={{
              marginTop: '16px',
              textAlign: 'center',
              color: 'white'
            }}>
              <span className="badge" style={{ color: '#2dd4bf', background: 'rgba(45, 212, 191, 0.1)', borderColor: 'rgba(45, 212, 191, 0.2)', marginBottom: '8px' }}>
                {filteredGallery[lightboxIndex].category}
              </span>
              <h3 style={{ fontWeight: 700, fontSize: '1.25rem' }}>{filteredGallery[lightboxIndex].title}</h3>
              <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginTop: '4px' }}>{filteredGallery[lightboxIndex].desc}</p>
            </div>

          </div>
        </div>
      )}

      {/* -------------------- CONTATTI & MAPPA (CONTACTS) -------------------- */}
      <section id="contatti" className="section-padding" style={{ background: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="badge">📞 SCRIVICI O PRENOTA</span>
            <h2 className="section-title" style={{ margin: '8px 0 0 0' }}>Siamo Sempre Disponibili</h2>
            <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '560px', margin: '8px auto 0 auto' }}>
              Hai domande sui percorsi educativi o di dog sitting? Contattaci direttamente o compila il form.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            alignItems: 'start'
          }}>

            {/* Left Column Information */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="glass-panel" style={{ padding: '28px' }}>
                <h4 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#042f2e', marginBottom: '20px' }}>
                  Recapiti Diretti
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ background: '#ccfbf1', color: '#0f766e', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Phone size={18} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', fontWeight: 600 }}>TELEFONO & WHATSAPP</span>
                      <strong style={{ fontSize: '0.95rem' }}>+39 346 7251989</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ background: '#e0f2fe', color: '#0284c7', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Mail size={18} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', fontWeight: 600 }}>EMAIL CONTATTO</span>
                      <strong style={{ fontSize: '0.95rem' }}>info@webdog.it</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ background: '#f1f5f9', color: '#475569', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MapPin size={18} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', fontWeight: 600 }}>INDIRIZZO SEDE & CAMPO</span>
                      <strong style={{ fontSize: '0.95rem' }}>Via Raffaele Ruggiero, 219, (NA)</strong>
                    </div>
                  </div>
                </div>

                {/* Quick actions buttons call/WhatsApp */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                  <a href="tel:+393467251989" className="btn btn-primary" style={{ flex: 1, padding: '10px', fontSize: '0.8rem', gap: '4px', borderRadius: '8px' }}>
                    📞 Chiama
                  </a>
                  <a href="https://wa.me/393467251989" className="btn btn-secondary" style={{ flex: 1, padding: '10px', fontSize: '0.8rem', gap: '4px', borderRadius: '8px', background: '#25d366', color: 'white', borderColor: 'transparent' }}>
                    💬 WhatsApp
                  </a>
                  <a href="mailto:info@webdog.it" className="btn btn-outline" style={{ flex: 1, padding: '10px', fontSize: '0.8rem', gap: '4px', borderRadius: '8px' }}>
                    📧 Scrivi
                  </a>
                </div>
              </div>

              {/* INTERACTIVE SIMULATED MAP */}
              <div className="glass-panel" style={{ padding: '24px', overflow: 'hidden' }}>
                <h4 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#042f2e', marginBottom: '12px' }}>
                  Area Copertura Servizi
                </h4>

                {/* SVG vector custom vector styled map */}
                <div style={{
                  width: '100%',
                  height: '180px',
                  background: '#e2e8f0',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <svg viewBox="0 0 300 180" style={{ width: '100%', height: '100%' }}>
                    {/* Simulated river */}
                    <path d="M0,90 Q75,70 150,110 T300,90" fill="none" stroke="#bae6fd" strokeWidth="12" />

                    {/* Grid streets */}
                    <line x1="50" y1="0" x2="50" y2="180" stroke="#cbd5e1" strokeWidth="2" />
                    <line x1="180" y1="0" x2="180" y2="180" stroke="#cbd5e1" strokeWidth="2" />
                    <line x1="250" y1="0" x2="250" y2="180" stroke="#cbd5e1" strokeWidth="1.5" />
                    <line x1="0" y1="40" x2="300" y2="40" stroke="#cbd5e1" strokeWidth="2" />
                    <line x1="0" y1="140" x2="300" y2="140" stroke="#cbd5e1" strokeWidth="2.5" />

                    {/* Green zone (campo cinofilo) */}
                    <rect x="20" y="50" width="80" height="70" rx="10" fill="#dcfce7" opacity="0.8" stroke="#86efac" strokeWidth="1" />
                    <text x="60" y="90" fontSize="8" fontWeight="bold" fill="#15803d" textAnchor="middle">Centro Cinofilo</text>

                    {/* Sede central pin */}
                    <circle cx="180" cy="140" r="14" fill="rgba(15, 118, 110, 0.2)" />
                    <circle cx="180" cy="140" r="6" fill="#0f766e" />
                    <path d="M180,128 L180,140" stroke="#0f766e" strokeWidth="2" />
                    <text x="180" y="125" fontSize="8" fontWeight="bold" fill="#0f766e" textAnchor="middle">La Nostra Sede</text>

                    {/* Partners pins */}
                    <circle cx="250" cy="40" r="4" fill="#0284c7" />
                    <text x="250" y="32" fontSize="6" fontWeight="bold" fill="#0284c7" textAnchor="middle">Veterinario Convenz.</text>

                    <circle cx="90" cy="15" r="4" fill="#fbbf24" />
                    <text x="90" y="10" fontSize="6" fontWeight="bold" fill="#d97706" textAnchor="middle">Toelettatura</text>
                  </svg>

                  {/* Floating legend tag */}
                  <span style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '8px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    background: 'rgba(255, 255, 255, 0.9)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1'
                  }}>
                    📍 Copertura: Firenze e Limitrofi (20km)
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column Form */}
            <div className="glass-panel" style={{ padding: '30px' }}>
              <form onSubmit={handleContactSubmit}>
                <h4 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#042f2e', marginBottom: '20px' }}>
                  Modulo Messaggi
                </h4>

                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label">NOME & COGNOME</label>
                  <input type="text" placeholder="Alessandro Neri" required className="form-input" />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label">E-MAIL</label>
                  <input type="email" placeholder="alessandro.n@example.com" required className="form-input" />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label">TELEFONO CELLULARE</label>
                  <input type="tel" placeholder="3334567890" required className="form-input" />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label className="form-label">IL TUO MESSAGGIO</label>
                  <textarea placeholder="Scrivi qui la tua richiesta o perplessità cinofila..." required rows="4" className="form-input" style={{ resize: 'none' }} />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', gap: '10px' }}>
                  <Send size={16} /> Invia Messaggio
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* -------------------- FOOTER -------------------- */}
      <footer style={{ background: '#042f2e', color: 'white', padding: '48px 0 24px 0' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '32px',
            marginBottom: '40px'
          }}>
            <div>
              <h4 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '16px' }}>🐾 WebDog</h4>
              <p style={{ fontSize: '0.8rem', color: '#99f6e4', lineHeight: 1.6 }}>
                Educazione, custodia e trasporto dedicati al benessere dei cani. Soluzioni professionali su misura dei proprietari.
              </p>
            </div>

            <div>
              <h5 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '16px', color: '#2dd4bf' }}>Link Rapidi</h5>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                <li><a href="#home" style={{ color: '#99f6e4', textDecoration: 'none' }}>Home</a></li>
                <li><a href="#about" style={{ color: '#99f6e4', textDecoration: 'none' }}>Chi Sono</a></li>
                <li><a href="#servizi" style={{ color: '#99f6e4', textDecoration: 'none' }}>Servizi</a></li>
                <li><a href="#prenotazioni" style={{ color: '#99f6e4', textDecoration: 'none' }}>Prenotazioni</a></li>
              </ul>
            </div>

            <div>
              <h5 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '16px', color: '#2dd4bf' }}>Orari Servizi</h5>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: '#99f6e4' }}>
                <li>Lunedì - Venerdì: 08:00 - 20:00</li>
                <li>Sabato: 09:00 - 18:00</li>
                <li>Domenica: Solo Emergenze / Sitting</li>
              </ul>
            </div>

            <div>
              <h5 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '16px', color: '#2dd4bf' }}>Note Legali</h5>
              <p style={{ fontSize: '0.75rem', color: '#5eead4', lineHeight: 1.5 }}>
                WebDog di Emanuele Barese P.IVA 01234567890 • Tutti i diritti riservati • Assicurazione Professionale Allianz RC n. 981245.
              </p>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '24px',
            textAlign: 'center',
            fontSize: '0.8rem',
            color: '#5eead4'
          }}>
            © 2026 WebDog. Sviluppato con amore cinofilo e cura professionale.
          </div>
        </div>
      </footer>

      {/* Floating quick shortcut toggle button for Admin Mode */}
      <button
        onClick={() => setViewMode('admin')}
        className="admin-badge-toggle"
        title="Clicca per aprire la dashboard gestionale amministratore"
      >
        <Eye size={16} /> <span>Operatore Dashboard</span>
      </button>

      {/* REAL-TIME NOTIFICATION MANAGER STACK */}
      <NotificationToast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
