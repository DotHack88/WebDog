import React, { useState, useEffect, useMemo } from 'react';
import { useRealtimeBookings } from './hooks/useRealtimeBookings';
import {
  Dog, Activity, Calendar, DollarSign, Phone, Shield, Heart, Award,
  FileText, Check, ChevronLeft, ChevronRight, Star, MapPin, Mail,
  Send, MessageSquare, Menu, X, Sliders, Eye, Sparkles, Copy
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
  { id: 6, src: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=600', category: 'Dog Sitting', title: 'Coccole a domicilio', desc: 'Assistenza affettuosa e personalizzata.' },
  { id: 7, src: '/albums/IMG_20260322_121538.jpg', category: 'I Miei Sport', title: 'Gara di Rally-O', desc: 'Freya & Na\'vi.' },
  { id: 8, src: '/albums/IMG-20260413-WA0017.jpg', category: 'I Miei Sport', title: 'Gara di Agility', desc: 'Esordio.' },
  { id: 9, src: '/albums/IMG_20260509_121459.jpg', category: 'I Miei Sport', title: 'Gara di Agility', desc: 'Freya 🥈 2° Posto e 🥉 3° Posto in combinata.' }, 
];

export default function App() {
  // Main Navigation View: 'client' or 'admin'
  // Persisted in sessionStorage so pull-to-refresh doesn't reset to home
  const [viewMode, setViewMode] = useState(() => {
    return sessionStorage.getItem('webdog_view') || 'client';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync viewMode to sessionStorage on every change
  useEffect(() => {
    sessionStorage.setItem('webdog_view', viewMode);
  }, [viewMode]);

  // Bookings — Firebase Realtime Database with localStorage fallback
  const { bookings, addBooking, updateBooking, deleteBookingById, syncStatus } = useRealtimeBookings(defaultBookings);

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
    service: 'Dog Walking (30m)',
    date: '',
    time: '10:00',
    notes: '',
    gdpr: false,
    paymentMethod: 'contanti', // 'contanti', 'paypal', 'revolut', 'iban'
  });

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  // Email/Message Modal state
  const [emailModalData, setEmailModalData] = useState(null);

  // Notification Logs State
  const [notificationLogs, setNotificationLogs] = useState(() => {
    const saved = localStorage.getItem('webdog_notification_logs');
    return saved ? JSON.parse(saved) : [
      { title: 'Conferma Prenotazione Inviata', details: 'A: marco.rossi@gmail.com - Servizio: Dog Sitting - Stato: Successo', time: '5 minuti fa', chan: 'Email' },
      { title: 'Nuovo Messaggio Contatto', details: 'A: info@webdog.it - Da: alessandro.n@example.com - Stato: Successo', time: '12 minuti fa', chan: 'Email' },
      { title: 'Modifica Appuntamento Spedito', details: 'A: giulia.b@domain.com - Data: 12/06 - Stato: Letto', time: '1 ora fa', chan: 'Email' },
      { title: 'Promemoria Appuntamento (24h pre)', details: 'A: lorenzo.v@test.it - Stato: Eseguito', time: 'Ieri, 18:30', chan: 'Telegram Bot' }
    ];
  });

  const addNotificationLog = (title, details, chan = 'Email') => {
    const newLog = {
      title,
      details,
      time: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) + ' (Oggi)',
      chan
    };
    setNotificationLogs((prev) => {
      const updated = [newLog, ...prev.slice(0, 19)];
      localStorage.setItem('webdog_notification_logs', JSON.stringify(updated));
      return updated;
    });
  };

  // Client Review Form State
  const [reviewForm, setReviewForm] = useState({
    name: '',
    dogName: '',
    dogBreed: '',
    rating: 5,
    comment: '',
    photo: null
  });

  // Selected date on calendar
  const [calendarDate, setCalendarDate] = useState(new Date(2026, 5, 2)); // June 2026
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(null);

  // Auto-Save reviews to localStorage (bookings are now handled by Firebase hook)
  // Note: bookings localStorage write is handled inside useRealtimeBookings hook

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

  /**
   * Silent fire-and-forget EmailJS send.
   * Used at form submission so mobile users (who may never see/close the modal)
   * always trigger the admin notification automatically.
   */
  const sendEmailJSSilent = async (emailData) => {
    try {
      const saved = localStorage.getItem('webdog_email_config');
      const config = saved ? JSON.parse(saved) : {
        method: 'emailjs',
        emailjsServiceId: 'service_77dn8u2',
        emailjsTemplateId: 'template_k3sc8sn',
        emailjsPublicKey: '6n8JEdiKSucjPCKmR',
        adminEmail: 'emanuelebarese@gmail.com'
      };

      if (config.method !== 'emailjs') return; // only auto-send when EmailJS is configured
      if (!config.emailjsServiceId || !config.emailjsTemplateId || !config.emailjsPublicKey) return;

      const adminEmail = config.adminEmail || 'emanuelebarese@gmail.com';
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: config.emailjsServiceId,
          template_id: config.emailjsTemplateId,
          user_id: config.emailjsPublicKey,
          template_params: {
            to_name: 'Admin WebDog',
            to_email: adminEmail,
            reply_to: emailData.clientEmail || emailData.toEmail,
            subject: emailData.subject,
            message: emailData.bodyText,
            message_html: emailData.bodyHtml
          }
        })
      });

      if (response.ok) {
        addNotificationLog(
          emailData.subject,
          `A: ${adminEmail} (da: ${emailData.toEmail}) - Metodo: EmailJS Auto - Stato: Successo`,
          'Email'
        );
        triggerToast('📧 Notifica Inviata', `Email di riepilogo inviata automaticamente a ${adminEmail}.`, 'success', 'EmailJS');
      }
    } catch (_err) {
      // Silent fail — user already sees the booking success message
      // The modal is still available as fallback on desktop
    }
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

    // ✅ Firebase real-time sync — appears on admin panel on any device instantly
    addBooking(newBooking);

    // Define the email data (used both for silent send and modal)
    const emailData = {
      type: 'booking',
      toEmail: bookingForm.email,
      toName: `${bookingForm.firstName} ${bookingForm.lastName}`,
      subject: `Conferma Prenotazione WebDog - ${bookingForm.service}`,
      clientEmail: bookingForm.email,
      bodyText: `Gentile ${bookingForm.firstName} ${bookingForm.lastName},

Grazie per aver effettuato una prenotazione con WebDog! Di seguito trovi i dettagli della tua richiesta di appuntamento in attesa di approvazione:

🐾 DETTAGLI CLIENTE:
Nome: ${bookingForm.firstName} ${bookingForm.lastName}
Telefono: ${bookingForm.phone}
Email: ${bookingForm.email}

🐶 DETTAGLI CANE:
Nome Cane: ${bookingForm.dogName}
Razza: ${bookingForm.dogBreed}
Età: ${bookingForm.dogAge}

📅 DETTAGLI APPUNTAMENTO:
Servizio: ${bookingForm.service}
Data: ${new Date(bookingForm.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
Orario: ${bookingForm.time}
Pagamento selezionato: ${bookingForm.paymentMethod.toUpperCase()}
Note speciali: ${bookingForm.notes || 'Nessuna'}

Ti ricontatteremo a breve per confermare la disponibilità definitiva dello slot temporale.

Cordiali saluti,
Staff WebDog
Napoli e Provincia
info@webdog.it`,
      bodyHtml: `<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#0f766e 0%,#14b8a6 60%,#2dd4bf 100%);padding:36px 32px;text-align:center;">
            <div style="font-size:48px;margin-bottom:8px;">🐾</div>
            <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">WebDog</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;font-weight:500;">Educazione · Benessere · Cura del Tuo Cane</p>
            <div style="margin-top:16px;display:inline-block;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);border-radius:20px;padding:6px 18px;">
              <span style="color:#ffffff;font-size:13px;font-weight:700;">📋 CONFERMA PRENOTAZIONE</span>
            </div>
          </td>
        </tr>

        <!-- GREETING -->
        <tr>
          <td style="padding:32px 32px 0;">
            <h2 style="margin:0 0 8px;color:#0f2d2a;font-size:22px;font-weight:700;">Ciao ${bookingForm.firstName}! 👋</h2>
            <p style="margin:0;color:#475569;font-size:15px;line-height:1.6;">
              La tua richiesta di appuntamento con <strong style="color:#0f766e;">WebDog</strong> è stata ricevuta con successo.<br/>
              Sei in ottima compagnia — sia tu che <strong>${bookingForm.dogName}</strong>! 🐶
            </p>
          </td>
        </tr>

        <!-- STATUS BADGE -->
        <tr>
          <td style="padding:20px 32px 0;">
            <div style="background:#fef9c3;border:1px solid #fde68a;border-radius:10px;padding:14px 18px;display:flex;align-items:center;gap:10px;">
              <span style="font-size:20px;">⏳</span>
              <div>
                <strong style="color:#92400e;font-size:14px;">STATO: IN ATTESA DI CONFERMA</strong>
                <p style="margin:2px 0 0;color:#78350f;font-size:13px;">Ti contatteremo entro 24h per confermare la disponibilità.</p>
              </div>
            </div>
          </td>
        </tr>

        <!-- SECTION: CLIENTE -->
        <tr>
          <td style="padding:24px 32px 0;">
            <div style="background:#f8fafc;border-radius:12px;padding:20px;border-left:4px solid #0f766e;">
              <h3 style="margin:0 0 14px;color:#0f766e;font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;">🐾 Dettagli Cliente</h3>
              <table width="100%" cellpadding="4" cellspacing="0">
                <tr><td style="color:#64748b;font-size:13px;width:120px;">Nome completo</td><td style="color:#0f2d2a;font-size:14px;font-weight:600;">${bookingForm.firstName} ${bookingForm.lastName}</td></tr>
                <tr><td style="color:#64748b;font-size:13px;">Telefono</td><td style="color:#0f2d2a;font-size:14px;font-weight:600;">${bookingForm.phone}</td></tr>
                <tr><td style="color:#64748b;font-size:13px;">Email</td><td style="color:#0f2d2a;font-size:14px;font-weight:600;">${bookingForm.email}</td></tr>
              </table>
            </div>
          </td>
        </tr>

        <!-- SECTION: CANE -->
        <tr>
          <td style="padding:16px 32px 0;">
            <div style="background:#f0fdf4;border-radius:12px;padding:20px;border-left:4px solid #22c55e;">
              <h3 style="margin:0 0 14px;color:#15803d;font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;">🐶 Il Tuo Amico a 4 Zampe</h3>
              <table width="100%" cellpadding="4" cellspacing="0">
                <tr><td style="color:#64748b;font-size:13px;width:120px;">Nome</td><td style="color:#0f2d2a;font-size:14px;font-weight:600;">${bookingForm.dogName}</td></tr>
                <tr><td style="color:#64748b;font-size:13px;">Razza</td><td style="color:#0f2d2a;font-size:14px;font-weight:600;">${bookingForm.dogBreed}</td></tr>
                <tr><td style="color:#64748b;font-size:13px;">Età</td><td style="color:#0f2d2a;font-size:14px;font-weight:600;">${bookingForm.dogAge}</td></tr>
              </table>
            </div>
          </td>
        </tr>

        <!-- SECTION: APPUNTAMENTO -->
        <tr>
          <td style="padding:16px 32px 0;">
            <div style="background:#eff6ff;border-radius:12px;padding:20px;border-left:4px solid #3b82f6;">
              <h3 style="margin:0 0 14px;color:#1d4ed8;font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;">📅 Dettagli Appuntamento</h3>
              <table width="100%" cellpadding="4" cellspacing="0">
                <tr><td style="color:#64748b;font-size:13px;width:120px;">Servizio</td><td style="color:#0f2d2a;font-size:14px;font-weight:700;">${bookingForm.service}</td></tr>
                <tr><td style="color:#64748b;font-size:13px;">Data</td><td style="color:#0f2d2a;font-size:14px;font-weight:700;">${new Date(bookingForm.date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</td></tr>
                <tr><td style="color:#64748b;font-size:13px;">Orario</td><td style="color:#0f2d2a;font-size:14px;font-weight:700;">${bookingForm.time}</td></tr>
                <tr><td style="color:#64748b;font-size:13px;">Pagamento</td><td style="color:#0f2d2a;font-size:14px;font-weight:600;">${bookingForm.paymentMethod.toUpperCase()}</td></tr>
                ${bookingForm.notes ? `<tr><td style="color:#64748b;font-size:13px;">Note</td><td style="color:#0f2d2a;font-size:14px;font-style:italic;">${bookingForm.notes}</td></tr>` : ''}
              </table>
            </div>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:28px 32px 0;text-align:center;">
            <p style="margin:0 0 12px;color:#475569;font-size:14px;">Hai domande? Contattaci direttamente!</p>
            <a href="https://wa.me/393467251989" style="display:inline-block;background:linear-gradient(135deg,#25D366,#128C7E);color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px;margin-right:8px;">💬 WhatsApp</a>
            <a href="mailto:info@webdog.it" style="display:inline-block;background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px;">📧 Email</a>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:32px;text-align:center;border-top:1px solid #e2e8f0;margin-top:24px;">
            <p style="margin:0 0 4px;font-size:20px;">🐕</p>
            <p style="margin:0;color:#94a3b8;font-size:12px;">© 2026 WebDog · Napoli e Provincia · info@webdog.it</p>
            <p style="margin:4px 0 0;color:#cbd5e1;font-size:11px;">Questa email è stata inviata automaticamente a seguito della tua prenotazione.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
      whatsappText: `Nuova Prenotazione WebDog!
Cliente: ${bookingForm.firstName} ${bookingForm.lastName}
Telefono: ${bookingForm.phone}
Email: ${bookingForm.email}
Cane: ${bookingForm.dogName} (${bookingForm.dogBreed}, ${bookingForm.dogAge})
Servizio: ${bookingForm.service}
Data: ${bookingForm.date} alle ${bookingForm.time}
Pagamento: ${bookingForm.paymentMethod}
Note: ${bookingForm.notes || 'Nessuna nota'}`
    };

    // ✅ FIX: Silent background send — works on Android/iOS without user interaction
    sendEmailJSSilent(emailData);

    // Show modal only on desktop as secondary/manual option
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) {
      setEmailModalData(emailData);
    }

    // Confirmation toast to the user
    triggerToast(
      '✅ Prenotazione Inviata!',
      `Grazie ${bookingForm.firstName}! La tua richiesta è stata registrata e la notifica è stata inviata al gestore.`,
      'success',
      'System'
    );

    // Operator alert toast
    setTimeout(() => {
      triggerToast(
        'Nuova Prenotazione Ricevuta',
        `Nuovo appuntamento da approvare: ${bookingForm.firstName} ${bookingForm.lastName} — ${bookingForm.dogName}.`,
        'warning',
        'EmailJS'
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
      service: 'Dog Walking (30m)',
      date: '',
      time: '10:00',
      notes: '',
      gdpr: false,
      paymentMethod: 'contanti'
    });
    setSelectedCalendarDay(null);
  };

  const handleReviewPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReviewForm((prev) => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
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
      comment: '',
      photo: null
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
    
    // Define the email modal parameters
    const emailData = {
      type: 'contact',
      toEmail: contactForm.email,
      toName: contactForm.name,
      subject: `Richiesta Informazioni WebDog - ${contactForm.name}`,
      clientEmail: contactForm.email,
      bodyText: `Gentile ${contactForm.name},

Grazie per averci contattato tramite il Modulo Messaggi di WebDog. Abbiamo ricevuto la tua richiesta e un nostro operatore ti risponderà il prima possibile.

Di seguito un riepilogo del tuo messaggio:

👤 NOME & COGNOME:
${contactForm.name}

📧 INDIRIZZO EMAIL:
${contactForm.email}

📞 TELEFONO CELLULARE:
${contactForm.phone}

💬 IL TUO MESSAGGIO:
"${contactForm.message}"

Ti risponderemo via email o sul numero di cellulare fornito entro poche ore.

Cordiali saluti,
Staff WebDog
Napoli e Provincia
info@webdog.it`,
      bodyHtml: `<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#0f766e 0%,#14b8a6 60%,#2dd4bf 100%);padding:36px 32px;text-align:center;">
            <div style="font-size:48px;margin-bottom:8px;">🐾</div>
            <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">WebDog</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;font-weight:500;">Educazione · Benessere · Cura del Tuo Cane</p>
            <div style="margin-top:16px;display:inline-block;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);border-radius:20px;padding:6px 18px;">
              <span style="color:#ffffff;font-size:13px;font-weight:700;">✉️ MESSAGGIO RICEVUTO</span>
            </div>
          </td>
        </tr>

        <!-- GREETING -->
        <tr>
          <td style="padding:32px 32px 0;">
            <h2 style="margin:0 0 8px;color:#0f2d2a;font-size:22px;font-weight:700;">Ciao ${contactForm.name}! 👋</h2>
            <p style="margin:0;color:#475569;font-size:15px;line-height:1.6;">
              Grazie per averci scritto! Il tuo messaggio è stato ricevuto e il nostro team lo leggerà con tutta l'attenzione che merita. 🐕
            </p>
          </td>
        </tr>

        <!-- MESSAGE BOX -->
        <tr>
          <td style="padding:24px 32px 0;">
            <div style="background:#f8fafc;border-radius:12px;padding:20px;border-left:4px solid #0f766e;">
              <h3 style="margin:0 0 12px;color:#0f766e;font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;">💬 Il tuo messaggio</h3>
              <p style="margin:0;color:#334155;font-size:15px;line-height:1.7;font-style:italic;">"${contactForm.message}"</p>
            </div>
          </td>
        </tr>

        <!-- CONTACT DETAILS -->
        <tr>
          <td style="padding:16px 32px 0;">
            <div style="background:#eff6ff;border-radius:12px;padding:20px;border-left:4px solid #3b82f6;">
              <h3 style="margin:0 0 14px;color:#1d4ed8;font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;">👤 I Tuoi Contatti</h3>
              <table width="100%" cellpadding="4" cellspacing="0">
                <tr><td style="color:#64748b;font-size:13px;width:120px;">Nome</td><td style="color:#0f2d2a;font-size:14px;font-weight:600;">${contactForm.name}</td></tr>
                <tr><td style="color:#64748b;font-size:13px;">Email</td><td style="color:#0f2d2a;font-size:14px;font-weight:600;">${contactForm.email}</td></tr>
                <tr><td style="color:#64748b;font-size:13px;">Telefono</td><td style="color:#0f2d2a;font-size:14px;font-weight:600;">${contactForm.phone}</td></tr>
              </table>
            </div>
          </td>
        </tr>

        <!-- RESPONSE TIME -->
        <tr>
          <td style="padding:20px 32px 0;">
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 18px;text-align:center;">
              <span style="font-size:18px;">⚡</span>
              <strong style="color:#15803d;font-size:14px;display:block;margin:4px 0;">Ti rispondiamo entro poche ore</strong>
              <p style="margin:0;color:#4ade80;font-size:13px;">via Email o al numero di telefono fornito</p>
            </div>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:28px 32px 0;text-align:center;">
            <p style="margin:0 0 12px;color:#475569;font-size:14px;">Non vedi l'ora? Scrivici direttamente!</p>
            <a href="https://wa.me/393467251989" style="display:inline-block;background:linear-gradient(135deg,#25D366,#128C7E);color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px;margin-right:8px;">💬 WhatsApp</a>
            <a href="mailto:info@webdog.it" style="display:inline-block;background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px;">📧 Email</a>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:32px;text-align:center;border-top:1px solid #e2e8f0;margin-top:24px;">
            <p style="margin:0 0 4px;font-size:20px;">🐕</p>
            <p style="margin:0;color:#94a3b8;font-size:12px;">© 2026 WebDog · Napoli e Provincia · info@webdog.it</p>
            <p style="margin:4px 0 0;color:#cbd5e1;font-size:11px;">Questa email è stata generata automaticamente dal modulo messaggi del sito.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
      whatsappText: `Nuovo Messaggio da WebDog!
Nome: ${contactForm.name}
Telefono: ${contactForm.phone}
Email: ${contactForm.email}
Messaggio: ${contactForm.message}`
    };

    // ✅ FIX: Silent background send — works on Android/iOS without user interaction
    sendEmailJSSilent(emailData);

    // Show modal only on desktop as secondary option
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) {
      setEmailModalData(emailData);
    }

    triggerToast('✅ Messaggio Inviato!', `Grazie ${contactForm.name}! Il tuo messaggio è stato consegnato al gestore WebDog.`, 'success', 'System');
    
    // Reset Contact Form
    setContactForm({
      name: '',
      email: '',
      phone: '',
      message: ''
    });
  };

  // Admin database controls — all mutations go through Firebase sync hook
  const updateBookingStatus = (id, newStatus) => {
    updateBooking(id, { status: newStatus });
    const b = bookings.find((bk) => bk.id === id);
    if (b) {
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
    }
  };

  const updateBookingDetails = (id, updatedFields) => {
    updateBooking(id, updatedFields);
    const b = bookings.find((bk) => bk.id === id);
    if (b) {
      triggerToast(
        'Appuntamento Spostato',
        `Nuovi dettagli inviati a ${b.firstName}: ${updatedFields.date} ore ${updatedFields.time}.`,
        'success',
        'WhatsApp API'
      );
    }
  };

  const deleteBooking = (id) => {
    deleteBookingById(id);
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

  // Dynamic calendar — always shows current month
  const now = new Date();
  const calYear = now.getFullYear();
  const calMonth = now.getMonth();
  const calDaysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const calMonthName = now.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
  const calMonthNameCapitalized = calMonthName.charAt(0).toUpperCase() + calMonthName.slice(1);
  const todayDate = now.getDate();

  const calendarDays = [];
  for (let d = 1; d <= calDaysInMonth; d++) {
    const mm = String(calMonth + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    const dateStr = `${calYear}-${mm}-${dd}`;
    let status = 'available';
    const bookingOnDay = bookings.find((b) => b.date === dateStr);
    if (bookingOnDay) {
      status = bookingOnDay.status === 'confirmed' ? 'occupied' : 'pending';
    }
    calendarDays.push({ dayNum: d, dateStr, status });
  }

  const handleCalendarDayClick = (day) => {
    if (day.dayNum < todayDate) {
      triggerToast(
        'Data Passata',
        'Non è possibile effettuare prenotazioni retrodatate (prima di oggi).',
        'error',
        'Calendario'
      );
      return;
    }
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
      `Hai scelto il ${day.dayNum} ${calMonthNameCapitalized} per il tuo appuntamento.`,
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
          notificationLogs={notificationLogs}
          setNotificationLogs={setNotificationLogs}
          syncStatus={syncStatus}
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
                <Sparkles size={14} /> Educatore Cinofilo a Napoli e Provincia
              </span>
              <h2 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, color: '#042f2e', marginBottom: '20px', letterSpacing: '-0.03em' }}>
                Dog Sitting, Passeggiate ed Educazione a Napoli 🐾
              </h2>
              <p style={{ fontSize: '1.2rem', color: '#334155', marginBottom: '32px', lineHeight: 1.6 }}>
                Servizi cinofili professionali a Napoli e Provincia — dog sitting, passeggiate educative, navetta veterinario ed educazione base con educatore certificato CSEN.
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
                  src="/chi_sono_profile.jpg"
                  alt="Emanuele Barese — Educatore Cinofilo Certificato CSEN a Napoli"
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
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>CSEN</p>
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

      {/* -------------------- COUNTER STATS -------------------- */}
      <AnimatedCounters reviews={reviews} />

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
                  src="/chi_sono_profile.jpg"
                  alt="Emanuele Barese — Educatore Cinofilo a Napoli e Provincia"
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
                    { name: 'Educazione di base', desc: 'Costruzione di un solido binomio cane-proprietario.' },
                    { name: 'Dog Sitting & Cura h24', desc: 'Custodia attenta presso il domicilio del proprietario.' },
                    { name: 'Passeggiate Educative', desc: 'Uscite in natura focalizzate su stimoli olfattivi e calma.' },
                    { name: 'Gestione Cuccioli (Puppy Classes)', desc: 'Prevenzione problemi comportamentali e socializzazione.' },
                    { name: 'Supporto ai Proprietari', desc: 'Consulenze mirate per comprendere al meglio i comportamenti.' },
                    { name: 'Asilo', desc: 'Operatore presso centro cinofilo.' },
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
                    <strong style={{ fontSize: '0.85rem', display: 'block' }}>Diploma Nazionale Educatore Cinofilo CSEN</strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Anno di conseguimento: 2026 • Riconosciuto CONI</span>
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
              {/* Servizio Matrimonio */}
              <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontWeight: 800, fontSize: '1.15rem', color: '#042f2e' }}>💍 Wedding Dog Sitter</h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '8px 0 14px 0' }}>
                    Il tuo migliore amico può esserci anche il giorno del tuo matrimonio! Servizio dedicato per i momenti più importanti della cerimonia.
                  </p>
                  <div style={{ fontSize: '0.85rem', background: '#f1f5f9', padding: '10px', borderRadius: '8px', marginBottom: '16px' }}>
                    <p>⏱️ Durata: <strong>Mezza Giornata / Giornata intera</strong></p>
                    <p style={{ marginTop: '4px' }}>💰 Prezzo: <strong>A Partire da €150 mezza giornata / €250 giornata intera</strong></p>
                    <p style={{ marginTop: '4px' }}> 🐾 Servizio personalizzato in base alle tue esigenze e alle necessità del tuo cane.</p>
                  </div>
                </div>
                <button onClick={() => handleServiceSelect('Wedding Dog Sitter')} className="btn btn-primary" style={{ width: '100%' }}>
                  Prenota Ora
                </button>
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
                  <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f2d2a' }}>{calMonthNameCapitalized}</h4>
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
                      style={{
                        opacity: day.dayNum < todayDate ? 0.4 : 1,
                        cursor: day.dayNum < todayDate ? 'not-allowed' : 'pointer'
                      }}
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
                    <label className="form-label">ETÀ CANE (ANNI O MESI)</label>
                    <input
                      type="text"
                      placeholder="es: 3 anni, 6 mesi"
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
                      <optgroup label="👑 Wedding Dog Sitter">
                        <option value="Wedding Dog Sitter">💍 Wedding Dog Sitter — Da €150</option>
                        <option value="Wedding Dog Sitter">💍 Wedding Dog Sitter — Da €250</option>
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
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '12px' }}>
                    MODALITÀ DI PAGAMENTO
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                      <input type="radio" name="payment" value="contanti" checked={bookingForm.paymentMethod === 'contanti'} onChange={() => setBookingForm({ ...bookingForm, paymentMethod: 'contanti' })} /> Contanti
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                      <input type="radio" name="payment" value="paypal" checked={bookingForm.paymentMethod === 'paypal'} onChange={() => setBookingForm({ ...bookingForm, paymentMethod: 'paypal' })} /> PayPal
                    </label>
                    {bookingForm.paymentMethod === 'paypal' && <div style={{marginLeft: '24px', fontSize: '0.8rem', color: '#0f766e'}}>Email PayPal: <strong>tidus291@hotmail.com</strong></div>}

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                      <input type="radio" name="payment" value="revolut" checked={bookingForm.paymentMethod === 'revolut'} onChange={() => setBookingForm({ ...bookingForm, paymentMethod: 'revolut' })} /> Revolut
                    </label>
                    {bookingForm.paymentMethod === 'revolut' && <div style={{marginLeft: '24px', fontSize: '0.8rem', color: '#0f766e'}}>Link: <a href="https://revolut.me/emanuebh6m" target="_blank" rel="noreferrer" style={{color: '#0284c7'}}>revolut.me/emanuebh6m</a></div>}

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                      <input type="radio" name="payment" value="iban" checked={bookingForm.paymentMethod === 'iban'} onChange={() => setBookingForm({ ...bookingForm, paymentMethod: 'iban' })} /> Bonifico (IBAN)
                    </label>
                    {bookingForm.paymentMethod === 'iban' && <div style={{marginLeft: '24px', fontSize: '0.8rem', color: '#0f766e'}}>IBAN: <strong>IT58M0329601601000067602411</strong></div>}
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
                    type="checkbox"
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

                  <div style={{ marginBottom: '20px' }}>
                    <label className="form-label">ALLEGA FOTO (OPZIONALE)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReviewPhotoUpload}
                      className="form-input"
                      style={{ padding: '8px' }}
                    />
                    {reviewForm.photo && (
                      <div style={{ marginTop: '10px' }}>
                        <img src={reviewForm.photo} alt="Anteprima" style={{ height: '80px', borderRadius: '8px', objectFit: 'cover' }} />
                      </div>
                    )}
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

                  {rev.photo && (
                    <div style={{ marginTop: '16px' }}>
                      <img src={rev.photo} alt={`Foto caricata da ${rev.name}`} style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '12px' }} />
                    </div>
                  )}

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
            {['Tutti', 'Passeggiate', 'Dog Sitting', 'Educazione', 'Eventi', 'I Miei Sport', ].map((cat) => (
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


      {/* -------------------- ZONE SERVITE -------------------- */}
      <section style={{ background: 'white', padding: '64px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="badge">📍 COPERTURA TERRITORIALE</span>
            <h2 className="section-title" style={{ margin: '8px 0 0 0' }}>Zone Servite — 50 km da Arzano</h2>
            <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '680px', margin: '8px auto 0 auto' }}>
              Con base ad <strong style={{ color: '#0f766e' }}>Arzano (NA)</strong>, copriamo <strong style={{ color: '#0f766e' }}>67 zone</strong> tra Napoli e Provincia in un raggio di 50 km — dall'area flegrea e casertana al Vesuvio, dall'area nolana alla costa.
            </p>
          </div>

          {/* Epicenter badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '36px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '12px',
              background: 'linear-gradient(135deg, #f0fdfa, #e0f2fe)',
              border: '2px solid rgba(15,118,110,0.25)',
              borderRadius: '16px', padding: '14px 28px',
              boxShadow: '0 4px 16px rgba(15,118,110,0.1)'
            }}>
              <span style={{ fontSize: '1.8rem' }}>📍</span>
              <div>
                <p style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: '#042f2e' }}>Arzano (NA) — Base Operativa</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>67 zone coperte · Raggio 50 km · Napoli e Provincia</p>
              </div>
            </div>
          </div>

          {/* Grouped areas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              {
                area: '⭐ Area Nord — Immediata (Base)',
                color: '#0f766e', bg: '#f0fdfa',
                cities: ['Arzano', 'Frattamaggiore', 'Frattaminore', 'Aversa', "Sant'Arpino", 'Casoria', 'Casavatore', 'Afragola', 'Cardito', 'Caivano', 'Crispano', 'Grumo Nevano', "Sant'Antimo", 'Melito di Napoli', 'Casandrino', 'Mugnano di Napoli', 'Calvizzano', 'Napoli']
              },
              {
                area: '🏙️ Napoli Città',
                color: '#1d4ed8', bg: '#eff6ff',
                cities: ['Napoli (tutti i quartieri)', 'Posillipo', 'San Giovanni a Teduccio']
              },
              {
                area: '🌊 Area Flegrea & Ovest',
                color: '#0369a1', bg: '#f0f9ff',
                cities: ['Giugliano in Campania', 'Lago Patria', 'Varcaturo', 'Licola', 'Quarto', 'Monterusciello', 'Qualiano', 'Villaricca', 'Marano di Napoli', 'Pozzuoli', 'Bacoli', 'Baia', 'Miseno', 'Torregaveta', 'Monte di Procida', 'Pisani']
              },
              {
                area: '🏭 Area Est & Nolana',
                color: '#7c3aed', bg: '#faf5ff',
                cities: ["Pomigliano d'Arco", 'Acerra', 'Casalnuovo di Napoli', 'Marigliano', 'Mariglianella', 'Brusciano', 'Nola', 'Carbonara di Nola', 'Cicciano', 'Scisciano', 'San Vitaliano', 'San Paolo Bel Sito', 'San Gennaro Vesuviano', 'San Giuseppe Vesuviano', 'Saviano', 'Ottaviano']
              },
              {
                area: '🌋 Area Vesuviana',
                color: '#b45309', bg: '#fffbeb',
                cities: ['Portici', 'San Giorgio a Cremano', 'San Sebastiano al Vesuvio', 'Ercolano', 'Cercola', 'Volla', 'Pollena Trocchia', "Sant'Anastasia", 'Somma Vesuviana', 'Torre del Greco', 'Torre Annunziata', 'Boscoreale', 'Boscotrecase', 'Trecase', 'Terzigno', 'Poggiomarino']
              },
            ].map(({ area, color, bg, cities }) => (
              <div key={area} style={{ background: bg, borderRadius: '16px', padding: '20px 24px', border: `1px solid ${color}22` }}>
                <h3 style={{ fontWeight: 800, fontSize: '0.95rem', color, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {area}
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {cities.map(city => (
                    <span key={city} style={{
                      background: 'white',
                      border: `1px solid ${color}33`,
                      color: '#334155',
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}>
                      {city}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '16px' }}>
              Non trovi il tuo comune? Contattaci — valutiamo sempre ogni richiesta!
            </p>
            <a href="https://wa.me/393467251989" className="btn btn-primary" style={{ gap: '8px' }}>
              💬 Chiedi disponibilità su WhatsApp
            </a>
          </div>
        </div>
      </section>


      {/* -------------------- FAQ -------------------- */}
      <section style={{ background: '#f0fdfa', padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="badge">❓ DOMANDE FREQUENTI</span>
            <h2 className="section-title" style={{ margin: '8px 0 0 0' }}>Hai Domande? Abbiamo le Risposte</h2>
            <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '560px', margin: '8px auto 0 auto' }}>
              Tutto quello che devi sapere prima di prenotare un servizio WebDog a Napoli e Provincia.
            </p>
          </div>
          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { q: 'Quanto costa il dog sitting a Napoli?', a: 'Il dog sitting diurno parte da €20 a mezza giornata presso il tuo domicilio, o €25 presso casa nostra. Il pernottamento (pensione) è da €35 a notte. Ogni servizio è personalizzabile in base alle tue esigenze.' },
              { q: 'Quali zone di Napoli coprite?', a: 'Con base ad Arzano (NA), opero in un raggio di 35 km che copre tutta Napoli e provincia: Casoria, Afragola, Frattamaggiore, Giugliano, Acerra, Aversa, Pozzuoli, Portici, Ercolano, Torre del Greco, Nola, Caserta, Pompei e Castellammare di Stabia. Per qualsiasi altro comune contattaci direttamente.' },
              { q: 'Come faccio a prenotare?', a: 'Puoi prenotare direttamente dal sito cliccando "Prenota Ora", selezionando un giorno verde disponibile nel calendario e compilando il modulo. Riceverai conferma via email e verrai contattato entro 24 ore.' },
              { q: 'Emanuele è un educatore certificato?', a: 'Sì! Emanuele Barese è Educatore Cinofilo Certificato CSEN (Iscrizione Albo Nazionale n. 42081, riconosciuto CONI) e usa esclusivamente metodi basati sul rinforzo positivo, senza coercizione.' },
              { q: 'Gestite anche cuccioli?', a: 'Certo! Gestiamo cuccioli di tutte le età. Offriamo sessioni specifiche di Puppy Class per cuccioli dai 3 ai 6 mesi, fondamentali per la socializzazione precoce e la prevenzione di problemi comportamentali.' },
              { q: 'Fate il servizio navetta ?', a: 'Sì, il Servizio Navetta è disponibile per trasportare il tuo cane in sicurezza presso veterinari, toelettatori o centri specializzati a Napoli e Provincia. Il prezzo parte da €15.' },
            ].map(({ q, a }, idx) => (
              <div key={idx} className="glass-card" style={{ padding: '20px 24px' }}>
                <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#042f2e', marginBottom: '8px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#0f766e', flexShrink: 0 }}>Q.</span> {q}
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.65, margin: 0, paddingLeft: '22px' }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
                      <a href="https://www.google.com/maps/place/Smart+Dog+Napoli/@40.8381864,14.1673849,17z/data=!3m1!4b1!4m6!3m5!1s0x133b0eddfa13099d:0xfe5131a0f30b3f4e!8m2!3d40.8381824!4d14.1699598!16s%2Fg%2F11cp09wn6m?entry=ttu&g_ep=EgoyMDI2MDYxMC4wIKXMDSoASAFQAw%3D%3D" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <strong style={{ fontSize: '0.95rem' }}>Via Raffaele Ruggiero, 219, 80126 Napoli (NA)</strong>
                      </a>
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

                {/* Google Maps Embed */}
                <div style={{
                  width: '100%',
                  height: '220px',
                  background: '#e2e8f0',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight="0" 
                    marginWidth="0" 
                    src="https://maps.google.com/maps?width=100%25&amp;height=100%25&amp;hl=it&amp;q=Napoli+(Area%20Copertura)&amp;t=&amp;z=10&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                  ></iframe>

                  {/* Floating legend tag */}
                  <span style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '8px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    background: 'rgba(255, 255, 255, 0.9)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    📍 Copertura: Napoli e Provincia
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
                  <input 
                    type="text" 
                    placeholder="Alessandro Neri" 
                    required 
                    className="form-input" 
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label">E-MAIL</label>
                  <input 
                    type="email" 
                    placeholder="alessandro.n@example.com" 
                    required 
                    className="form-input" 
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label">TELEFONO CELLULARE</label>
                  <input 
                    type="tel" 
                    placeholder="3334567890" 
                    required 
                    className="form-input" 
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label className="form-label">IL TUO MESSAGGIO</label>
                  <textarea 
                    placeholder="Scrivi qui la tua richiesta o perplessità cinofila..." 
                    required 
                    rows="4" 
                    className="form-input" 
                    style={{ resize: 'none' }} 
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  />
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
      <footer style={{ background: '#042f2e', color: 'white', padding: '56px 0 24px 0' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '36px',
            marginBottom: '40px'
          }}>
            {/* Brand + Social */}
            <div>
              <h4 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '8px' }}>🐾 WebDog Napoli</h4>
              <p style={{ fontSize: '0.8rem', color: '#99f6e4', lineHeight: 1.6, marginBottom: '20px' }}>
                Educatore cinofilo certificato CSEN a Napoli e Provincia. Dog sitting, passeggiate, navetta ed educazione base con amore.
              </p>
              {/* ── Social Links ── inserisci i tuoi URL nei commenti ── */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  {
                    label: '📸 Instagram',
                    /* ← SOSTITUIRE con il tuo link Instagram, es: https://www.instagram.com/webdog.napoli */
                    href: 'https://www.instagram.com/',
                    hoverBg: 'rgba(225,48,108,0.35)'
                  },
                  {
                    label: '👍 Facebook',
                    /* ← SOSTITUIRE con la tua pagina Facebook, es: https://www.facebook.com/webdognapoli */
                    href: 'https://www.facebook.com/',
                    hoverBg: 'rgba(24,119,242,0.35)'
                  },
                  {
                    label: '🎵 TikTok',
                    /* ← SOSTITUIRE con il tuo profilo TikTok, es: https://www.tiktok.com/@webdognapoli */
                    href: 'https://www.tiktok.com/',
                    hoverBg: 'rgba(255,255,255,0.2)'
                  }
                ].map(({ label, href, hoverBg }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.18)',
                      color: '#f0fdfa', padding: '6px 12px',
                      borderRadius: '8px', fontSize: '0.78rem',
                      fontWeight: 700, textDecoration: 'none',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = hoverBg}
                    onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h5 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '16px', color: '#2dd4bf' }}>Link Rapidi</h5>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                <li><a href="#home" style={{ color: '#99f6e4', textDecoration: 'none' }}>🏠 Home</a></li>
                <li><a href="#about" style={{ color: '#99f6e4', textDecoration: 'none' }}>👤 Chi Sono</a></li>
                <li><a href="#servizi" style={{ color: '#99f6e4', textDecoration: 'none' }}>🐾 Servizi</a></li>
                <li><a href="#prenotazioni" style={{ color: '#99f6e4', textDecoration: 'none' }}>📅 Prenotazioni</a></li>
                <li><a href="#recensioni" style={{ color: '#99f6e4', textDecoration: 'none' }}>⭐ Recensioni</a></li>
                <li><a href="#contatti" style={{ color: '#99f6e4', textDecoration: 'none' }}>📞 Contatti</a></li>
              </ul>
            </div>

            {/* Orari */}
            <div>
              <h5 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '16px', color: '#2dd4bf' }}>Orari Servizi</h5>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: '#99f6e4' }}>
                <li>🕗 Lunedì - Venerdì: 08:00 – 20:00</li>
                <li>🕗 Sabato: 09:00 – 18:00</li>
                <li>🕗 Domenica: Su prenotazione</li>
              </ul>
              <p style={{ fontSize: '0.75rem', color: '#5eead4', marginTop: '14px' }}>
                📍 Napoli e Provincia
              </p>
              <a
                href="tel:+393467251989"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '10px', color: '#2dd4bf', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}
              >
                📞 +39 346 7251989
              </a>
            </div>

            {/* Note legali */}
            <div>
              <h5 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '16px', color: '#2dd4bf' }}>Note Legali</h5>
              <p style={{ fontSize: '0.75rem', color: '#5eead4', lineHeight: 1.6 }}>
                WebDog di Emanuele Barese<br />
                Educatore CSEN Albo n. 42081
              </p>
              <a
                href="https://business.google.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-block', marginTop: '12px', fontSize: '0.72rem', color: '#2dd4bf', textDecoration: 'underline' }}
              >
                ⭐ Lascia una recensione su Google
              </a>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '24px',
            textAlign: 'center',
            fontSize: '0.78rem',
            color: '#5eead4'
          }}>
            © 2026 WebDog Napoli · Tutti i diritti riservati · Sviluppato con amore cinofilo 🐾
          </div>
        </div>
      </footer>

      {/* ── WHATSAPP FLOATING ACTION BUTTON ─────────────────── */}
      <a
        href="https://wa.me/393467251989?text=Ciao%20Emanuele!%20Ho%20visto%20il%20sito%20WebDog%20e%20vorrei%20informazioni%20sui%20servizi."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chatta su WhatsApp"
        title="Scrivici su WhatsApp"
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          zIndex: 1050,
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: '#25D366',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(37,211,102,0.45)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          textDecoration: 'none'
        }}
        onMouseOver={e => {
          e.currentTarget.style.transform = 'scale(1.12)';
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(37,211,102,0.6)';
        }}
        onMouseOut={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(37,211,102,0.45)';
        }}
      >
        {/* WhatsApp SVG icon */}
        <svg width="30" height="30" viewBox="0 0 32 32" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 2C8.268 2 2 8.268 2 16c0 2.46.644 4.766 1.77 6.77L2 30l7.43-1.746A13.93 13.93 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.6a11.55 11.55 0 01-5.88-1.604l-.42-.25-4.41 1.037 1.057-4.303-.274-.44A11.558 11.558 0 014.4 16C4.4 9.592 9.592 4.4 16 4.4S27.6 9.592 27.6 16 22.408 27.6 16 27.6zm6.39-8.67c-.35-.174-2.07-1.02-2.39-1.137-.32-.116-.553-.174-.785.174-.233.347-.9 1.137-1.103 1.37-.203.232-.406.26-.756.087-.35-.174-1.478-.545-2.815-1.738-1.04-.928-1.742-2.074-1.946-2.423-.203-.348-.022-.537.152-.71.157-.156.35-.406.524-.61.175-.202.233-.347.35-.578.116-.232.058-.434-.029-.61-.087-.174-.785-1.892-1.075-2.59-.283-.682-.57-.59-.785-.6l-.669-.012c-.232 0-.61.087-.928.434-.319.348-1.218 1.19-1.218 2.9 0 1.71 1.247 3.363 1.421 3.596.174.232 2.454 3.747 5.948 5.256.832.36 1.481.574 1.987.734.834.267 1.594.229 2.195.139.67-.1 2.07-.847 2.362-1.664.29-.817.29-1.517.203-1.664-.087-.145-.32-.232-.669-.406z"/>
        </svg>
      </a>

      {/* ── COOKIE BANNER (GDPR + Italian Cookie Law) ────────── */}
      <CookieBanner />

      {/* EMAIL / MESSAGE SUBMISSION MODAL */}
      {emailModalData !== null && (
        <EmailModal
          data={emailModalData}
          onClose={() => setEmailModalData(null)}
          triggerToast={triggerToast}
          addNotificationLog={addNotificationLog}
        />
      )}

      {/* REAL-TIME NOTIFICATION MANAGER STACK */}
      <NotificationToast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}


// ── AnimatedCounters ───────────────────────────────────────────────────────
function AnimatedCounters({ reviews }) {
  const ref = React.useRef(null);
  const [started, setStarted] = React.useState(false);
  const [counts, setCounts] = React.useState({ comuni: 0, clienti: 0, stelle: 0, anni: 0 });

  const targets = {
    comuni: 58,
    clienti: 100,
    stelle: 5,
    anni: 3
  };

  React.useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.4 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!started) return;
    const duration = 1800;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCounts({
        comuni: Math.round(targets.comuni * ease),
        clienti: Math.round(targets.clienti * ease),
        stelle: Math.round(targets.stelle * ease * 10) / 10,
        anni: Math.round(targets.anni * ease)
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [started]);

  const stats = [
    { value: counts.comuni, suffix: '', label: 'Comuni Coperti', icon: '📍', sub: 'Napoli e Provincia' },
    { value: counts.clienti, suffix: '+', label: 'Clienti Soddisfatti', icon: '❤️', sub: '100% recensioni positive' },
    { value: counts.stelle, suffix: '★', label: 'Valutazione Media', icon: '⭐', sub: 'Su Google e Facebook' },
    { value: counts.anni, suffix: '+', label: 'Anni di Esperienza', icon: '🎓', sub: 'Certificato CSEN' },
  ];

  return (
    <div
      ref={ref}
      style={{
        background: 'linear-gradient(135deg, #042f2e 0%, #0c4a6e 100%)',
        padding: '48px 0'
      }}
    >
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '32px',
          textAlign: 'center'
        }}>
          {stats.map(({ value, suffix, label, icon, sub }) => (
            <div key={label} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px'
            }}>
              <span style={{ fontSize: '2rem' }}>{icon}</span>
              <div style={{
                fontWeight: 900,
                fontSize: '2.8rem',
                color: '#2dd4bf',
                lineHeight: 1,
                letterSpacing: '-0.03em',
                fontVariantNumeric: 'tabular-nums'
              }}>
                {value}{suffix}
              </div>
              <p style={{ margin: 0, fontWeight: 700, color: '#f0fdfa', fontSize: '0.95rem' }}>{label}</p>
              <p style={{ margin: 0, color: '#5eead4', fontSize: '0.75rem' }}>{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Admin floating toggle (restored) ──────────────────────────────────────
function AdminToggle({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="admin-badge-toggle"
      title="Clicca per aprire la dashboard gestionale amministratore"
    >
      <Eye size={16} /> <span>Operatore Dashboard</span>
    </button>
  );
}

// ── CookieBanner — GDPR + Italian Cookie Law ───────────────────────────────
const GA4_ID = 'G-XXXXXXXXXX'; // ← SOSTITUIRE con il tuo Google Analytics 4 Measurement ID

function CookieBanner() {
  const STORAGE_KEY = 'webdog_cookie_consent';
  const [visible, setVisible] = React.useState(() => !localStorage.getItem(STORAGE_KEY));
  const [showDetails, setShowDetails] = React.useState(false);

  const loadGA4 = () => {
    if (GA4_ID === 'G-XXXXXXXXXX') return; // skip if not configured
    if (document.getElementById('ga4-script')) return; // already loaded
    const s = document.createElement('script');
    s.id = 'ga4-script';
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA4_ID, { anonymize_ip: true });
  };

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
    loadGA4();
  };

  const handleReject = () => {
    localStorage.setItem(STORAGE_KEY, 'rejected');
    setVisible(false);
  };

  // Auto-load GA4 if already accepted
  React.useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === 'accepted') loadGA4();
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      zIndex: 9000,
      background: 'rgba(4, 47, 46, 0.97)',
      backdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(45,212,191,0.2)',
      padding: '20px 24px',
      animation: 'slideInUp 0.4s cubic-bezier(0.16,1,0.3,1)'
    }}>
      <style>{`
        @keyframes slideInUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px' }}>
        {/* Text */}
        <div style={{ flex: 1, minWidth: '260px' }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: 700, color: '#f0fdfa', fontSize: '0.95rem' }}>
            🍪 Questo sito usa i cookie
          </p>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#99f6e4', lineHeight: 1.5 }}>
            Utilizziamo cookie tecnici necessari e, con il tuo consenso, cookie analitici (Google Analytics) per migliorare l'esperienza e le prestazioni del sito.
            {' '}
            <button
              onClick={() => setShowDetails(!showDetails)}
              style={{ background: 'none', border: 'none', color: '#2dd4bf', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.82rem', padding: 0 }}
            >
              {showDetails ? 'Mostra meno ▲' : 'Maggiori informazioni ▼'}
            </button>
          </p>
          {showDetails && (
            <div style={{ marginTop: '10px', fontSize: '0.78rem', color: '#5eead4', lineHeight: 1.6, background: 'rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 6px 0' }}><strong style={{ color: '#f0fdfa' }}>Cookie tecnici</strong> — Necessari al funzionamento del sito (prenotazioni, sessione). Non richiedono consenso.</p>
              <p style={{ margin: 0 }}><strong style={{ color: '#f0fdfa' }}>Cookie analitici</strong> — Google Analytics 4 (con IP anonimizzato). Ci permettono di capire come gli utenti navigano il sito. Attivati solo con il tuo consenso.</p>
            </div>
          )}
        </div>
        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexShrink: 0, flexWrap: 'wrap' }}>
          <button
            onClick={handleReject}
            style={{
              background: 'transparent', border: '1px solid rgba(45,212,191,0.4)',
              color: '#99f6e4', padding: '9px 20px', borderRadius: '8px',
              fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.borderColor = '#2dd4bf'}
            onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(45,212,191,0.4)'}
          >
            Solo necessari
          </button>
          <button
            onClick={handleAccept}
            style={{
              background: '#10b981', border: 'none',
              color: 'white', padding: '9px 24px', borderRadius: '8px',
              fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16,185,129,0.35)',
              transition: 'all 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.background = '#059669'}
            onMouseOut={e => e.currentTarget.style.background = '#10b981'}
          >
            Accetta tutti ✓
          </button>
        </div>
      </div>
    </div>
  );
}

// Subcomponent: Email / Message sending module dialog
function EmailModal({ data, onClose, triggerToast, addNotificationLog }) {
  const [sendingStatus, setSendingStatus] = useState('idle'); // 'idle', 'sending', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  // Guard against React StrictMode double-invocation of useEffect
  const hasSentRef = React.useRef(false);

  const config = useMemo(() => {
    const saved = localStorage.getItem('webdog_email_config');
    return saved ? JSON.parse(saved) : {
      method: 'emailjs',
      emailjsServiceId: 'service_77dn8u2',
      emailjsTemplateId: 'template_k3sc8sn',
      emailjsPublicKey: '6n8JEdiKSucjPCKmR',
      adminEmail: 'emanuelebarese@gmail.com'
    };
  }, []);

  const handleSendEmailJS = async () => {
    setSendingStatus('sending');
    try {
      if (!config.emailjsServiceId || !config.emailjsTemplateId || !config.emailjsPublicKey) {
        throw new Error("Chiavi EmailJS non configurate. Configurale nell'Area Admin o usa il Client di posta locale.");
      }

      // Send ONE single email to admin with all client details inside
      const adminEmail = config.adminEmail || 'emanuelebarese@gmail.com';
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: config.emailjsServiceId,
          template_id: config.emailjsTemplateId,
          user_id: config.emailjsPublicKey,
          template_params: {
            to_name: 'Admin WebDog',
            to_email: adminEmail,
            reply_to: data.clientEmail || data.toEmail,
            subject: data.subject,
            message: data.bodyText,
            message_html: data.bodyHtml
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Errore HTTP ${response.status}`);
      }

      setSendingStatus('success');
      triggerToast('Email Inviata', `Notifica inviata con successo a ${adminEmail}!`, 'success', 'EmailJS API');
      addNotificationLog(data.subject, `A: ${adminEmail} (da: ${data.toEmail}) - Metodo: EmailJS - Stato: Successo`, 'Email');
    } catch (err) {
      setSendingStatus('error');
      setErrorMessage(err.message);
      triggerToast('Errore Invio', err.message, 'error', 'EmailJS API');
    }
  };

  // Auto trigger — useRef guard prevents double-fire from React StrictMode
  useEffect(() => {
    if (hasSentRef.current) return;
    hasSentRef.current = true;

    if (config.method === 'emailjs' && config.emailjsServiceId && config.emailjsTemplateId && config.emailjsPublicKey) {
      handleSendEmailJS();
    } else if (config.method === 'simulated') {
      const timer = setTimeout(() => {
        setSendingStatus('success');
        addNotificationLog(data.subject, `A: ${data.toEmail} - Metodo: Simulatore - Stato: Successo`, 'Email');
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const triggerMailto = () => {
    const adminEmail = config.adminEmail || 'info@webdog.it';
    // Send to admin with client in CC
    const mailtoUrl = `mailto:${adminEmail}?cc=${encodeURIComponent(data.toEmail)}&subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(data.bodyText)}`;
    window.location.href = mailtoUrl;
    addNotificationLog(data.subject, `A: ${adminEmail} (CC: ${data.toEmail}) - Metodo: Mailto`, 'Email');
  };

  const triggerWhatsApp = () => {
    const waText = encodeURIComponent(data.whatsappText || data.bodyText);
    window.open(`https://wa.me/393467251989?text=${waText}`, '_blank');
    addNotificationLog(`WhatsApp: ${data.subject}`, `A: Gestore - Stato: Aperto`, 'WhatsApp');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(data.bodyText);
    triggerToast('Copiato', 'Testo dell\'email copiato negli appunti.', 'info', 'System');
  };

  return (
    <div className="lightbox" style={{ zIndex: 9999 }}>
      <div className="glass-panel" style={{
        width: '95%',
        maxWidth: '600px',
        padding: '30px',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
        animation: 'fadeIn 0.3s ease-out',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#64748b'
          }}
        >
          <X size={24} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            background: '#ccfbf1',
            color: '#0f766e',
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Mail size={22} style={{ color: '#0f766e' }} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f2d2a', margin: 0 }}>
              {data.type === 'booking' ? 'Invio Dettagli Appuntamento' : 'Invio Messaggio Contatto'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
              Gestisci l'invio delle informazioni al cliente e all'operatore.
            </p>
          </div>
        </div>

        {/* Status Alert Banner */}
        <div style={{
          background: sendingStatus === 'sending' ? '#f0f9ff' :
                      sendingStatus === 'success' ? '#ecfdf5' :
                      sendingStatus === 'error' ? '#fef2f2' : '#f8fafc',
          border: `1px solid ${
            sendingStatus === 'sending' ? '#bae6fd' :
            sendingStatus === 'success' ? '#a7f3d0' :
            sendingStatus === 'error' ? '#fecaca' : '#e2e8f0'
          }`,
          color: sendingStatus === 'sending' ? '#0369a1' :
                 sendingStatus === 'success' ? '#047857' :
                 sendingStatus === 'error' ? '#b91c1c' : '#475569',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          textAlign: 'left'
        }}>
          <span>
            {sendingStatus === 'sending' && '⏳ Invio automatico tramite EmailJS in corso...'}
            {sendingStatus === 'success' && (
              config.method === 'emailjs' 
                ? '🟢 Email inviata automaticamente al cliente con successo!' 
                : config.method === 'simulated'
                ? '💻 Invio simulato completato (dettagli salvati nel log admin).'
                : '📬 Pronto per l\'invio manuale tramite la tua applicazione email.'
            )}
            {sendingStatus === 'error' && `❌ Errore EmailJS: ${errorMessage}`}
            {sendingStatus === 'idle' && '📬 Scegli una delle opzioni sottostanti per inviare.'}
          </span>
          {sendingStatus === 'error' && (
            <button 
              onClick={handleSendEmailJS}
              className="btn btn-primary"
              style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '4px' }}
            >
              Riprova
            </button>
          )}
        </div>

        {/* Preview Panel */}
        <div style={{ marginBottom: '24px', textAlign: 'left' }}>
          <span className="badge" style={{ marginBottom: '8px' }}>ANTEPRIMA EMAIL</span>
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px',
            fontSize: '0.85rem',
            lineHeight: 1.6,
            maxHeight: '180px',
            overflowY: 'auto'
          }}>
            <p style={{ margin: '0 0 8px 0', borderBottom: '1px dashed #cbd5e1', paddingBottom: '6px' }}>
              <strong>A:</strong> {data.toEmail} ({data.toName})<br />
              <strong>Oggetto:</strong> {data.subject}
            </p>
            <pre style={{ margin: 0, fontFamily: 'inherit', whiteSpace: 'pre-wrap' }}>
              {data.bodyText}
            </pre>
          </div>
        </div>

        {/* Interactive Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <button 
            onClick={triggerMailto}
            className="btn btn-outline"
            style={{ 
              padding: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px', 
              fontSize: '0.9rem',
              borderColor: '#0f766e',
              color: '#0f766e'
            }}
          >
            <Mail size={16} /> Apri Client Mail
          </button>
          <button 
            onClick={triggerWhatsApp}
            className="btn btn-secondary"
            style={{ 
              padding: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px', 
              fontSize: '0.9rem',
              background: '#25D366',
              color: 'white',
              border: 'none'
            }}
          >
            <MessageSquare size={16} /> WhatsApp Gestore
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={handleCopyText}
            className="btn btn-outline"
            style={{ 
              flex: 1,
              padding: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '6px', 
              fontSize: '0.85rem'
            }}
          >
            <Copy size={14} /> Copia Testo Email
          </button>
          <button 
            onClick={onClose}
            className="btn btn-primary"
            style={{ 
              flex: 1,
              padding: '10px', 
              fontSize: '0.85rem'
            }}
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}
