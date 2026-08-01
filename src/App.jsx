import React, { useState, useEffect, useMemo } from 'react';
import { useRealtimeBookings } from './hooks/useRealtimeBookings';
import { useRealtimeGallery } from './hooks/useRealtimeGallery';
import { useRateLimit } from './hooks/useRateLimit';
import { validateItalianPhone, validateEmail, validateRequired } from './utils/validation';
import {
  Mail,
  MessageSquare, X, Eye, Copy
} from 'lucide-react';
import AdminPortal from './components/AdminPortal';
import NotificationToast from './components/NotificationToast';
import NavBar from './components/sections/NavBar';
import ServicesSection from './components/sections/ServicesSection';
import FaqSection from './components/sections/FaqSection';
import ZoneSection from './components/sections/ZoneSection';
import FooterSection from './components/sections/FooterSection';
import HeroSection from './components/sections/HeroSection';
import AboutSection from './components/sections/AboutSection';
import GallerySection from './components/sections/GallerySection';
import BookingSection from './components/sections/BookingSection';
import ReviewsSection from './components/sections/ReviewsSection';
import ContactSection from './components/sections/ContactSection';

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

// No default bookings — real appointments come from Firebase Realtime Database.
// An empty array prevents the auto-seed logic from polluting a fresh database.
const defaultBookings = [];

const defaultGalleryImages = [];

export default function App() {
  // Main Navigation View: 'client' or 'admin'
  // Always start as 'client' — admin navigates to the portal via the UI.
  // We deliberately do NOT persist this in localStorage so that fresh page
  // visits (and other users on shared devices) always land on the public site.
  const [viewMode, setViewMode] = useState('client');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Clear stale admin view flag and any demo-data left in localStorage
  // from before Firebase was configured (one-time migration).
  useEffect(() => {
    localStorage.removeItem('webdog_view');
    // Remove demo bookings that were seeded before Firebase was connected.
    // We detect them by their hardcoded IDs (b1, b2, b3).
    const demoIds = new Set(['b1', 'b2', 'b3']);
    const saved = localStorage.getItem('webdog_bookings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const cleaned = parsed.filter((b) => !demoIds.has(b.id));
        if (cleaned.length !== parsed.length) {
          localStorage.setItem('webdog_bookings', JSON.stringify(cleaned));
        }
      } catch {
        localStorage.removeItem('webdog_bookings');
      }
    }
  }, []);

  // Bookings — Firebase Realtime Database with localStorage fallback
  const { bookings, addBooking, updateBooking, deleteBookingById, syncStatus } = useRealtimeBookings(defaultBookings);

  // Gallery — Firebase Realtime Database with localStorage fallback
  const {
    galleryImages,
    addGalleryImage,
    updateGalleryImage,
    deleteGalleryImageById,
    gallerySyncStatus
  } = useRealtimeGallery(defaultGalleryImages);

  // Rate limiting — protegge i form da invii multipli / spam
  const bookingRateLimit = useRateLimit('booking', { maxPerWindow: 3, windowMs: 15 * 60 * 1000, cooldownMs: 60 * 1000 });
  const contactRateLimit = useRateLimit('contact', { maxPerWindow: 5, windowMs: 15 * 60 * 1000, cooldownMs: 30 * 1000 });

  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem('webdog_reviews');
    return saved ? JSON.parse(saved) : defaultReviews;
  });

  const [toasts, setToasts] = useState([]);

  // Gallery Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [activeGalleryFilter, setActiveGalleryFilter] = useState('Tutti');

  // "Chi Sono" active profile tab — gestito internamente da AboutSection
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
    endDate: '',
    isRange: false,
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
        emailjsServiceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
        emailjsTemplateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '',
        emailjsPublicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '',
        adminEmail: import.meta.env.VITE_ADMIN_EMAIL || ''
      };

      if (config.method !== 'emailjs') return;
      if (!config.emailjsServiceId || !config.emailjsTemplateId || !config.emailjsPublicKey) return;

      const adminEmail = config.adminEmail || import.meta.env.VITE_ADMIN_EMAIL || '';
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

    // ── Anti-spam: rate limiting ──────────────────────────────
    if (!bookingRateLimit.canSubmit) {
      const msg = bookingRateLimit.attemptsLeft === 0
        ? `Hai raggiunto il limite di prenotazioni. Riprova tra ${bookingRateLimit.remainingSeconds}s.`
        : `Attendi ${bookingRateLimit.remainingSeconds}s prima di inviare un'altra prenotazione.`;
      triggerToast('Troppe Richieste', msg, 'error', 'Anti-Spam');
      return;
    }

    // ── Validazione campi ─────────────────────────────────────
    const phoneCheck = validateItalianPhone(bookingForm.phone);
    if (!phoneCheck.valid) {
      triggerToast('Numero non valido', phoneCheck.message, 'error', 'Validazione');
      return;
    }
    const emailCheck = validateEmail(bookingForm.email);
    if (!emailCheck.valid) {
      triggerToast('Email non valida', emailCheck.message, 'error', 'Validazione');
      return;
    }
    const nameCheck = validateRequired(bookingForm.firstName, 'Il nome', 2);
    if (!nameCheck.valid) {
      triggerToast('Nome mancante', nameCheck.message, 'error', 'Validazione');
      return;
    }
    const dogCheck = validateRequired(bookingForm.dogName, 'Il nome del cane', 2);
    if (!dogCheck.valid) {
      triggerToast('Nome cane mancante', dogCheck.message, 'error', 'Validazione');
      return;
    }

    if (!bookingForm.gdpr) {
      triggerToast('Errore Privacy', 'Devi accettare l\'informativa privacy GDPR.', 'error', 'System');
      return;
    }
    if (!bookingForm.date) {
      triggerToast('Seleziona Data', 'Fai click su un giorno verde disponibile nel calendario.', 'warning', 'Calendario');
      return;
    }
    if (bookingForm.isRange && !bookingForm.endDate) {
      triggerToast('Seleziona Data Fine', 'Seleziona la data di fine nel calendario per completare il periodo.', 'warning', 'Calendario');
      return;
    }

    // Registra l'invio per il rate limiter
    bookingRateLimit.recordSubmit();

    const newBooking = {
      id: 'b_' + Date.now(),
      ...bookingForm,
      status: 'pending'
    };
    // ✅ Firebase real-time sync — appears on admin panel on any device instantly
    addBooking(newBooking);

    // Dynamic date formatted string
    const dateFormatted = bookingForm.isRange && bookingForm.endDate
      ? `dal ${new Date(bookingForm.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })} al ${new Date(bookingForm.endDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}`
      : new Date(bookingForm.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });

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
Data: ${dateFormatted}
Orario: ${bookingForm.time}
Prezzo stimato: €${selectedDetails.price}
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
                <tr><td style="color:#64748b;font-size:13px;">Data</td><td style="color:#0f2d2a;font-size:14px;font-weight:700;">${dateFormatted}</td></tr>
                <tr><td style="color:#64748b;font-size:13px;">Orario</td><td style="color:#0f2d2a;font-size:14px;font-weight:700;">${bookingForm.time}</td></tr>
                <tr><td style="color:#64748b;font-size:13px;">Prezzo stimato</td><td style="color:#0f2d2a;font-size:14px;font-weight:700;">€${selectedDetails.price}</td></tr>
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
Data: ${dateFormatted} alle ${bookingForm.time}
Prezzo stimato: €${selectedDetails.price}
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
      endDate: '',
      isRange: false,
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

    // ── Anti-spam: rate limiting ──────────────────────────────
    if (!contactRateLimit.canSubmit) {
      const msg = contactRateLimit.attemptsLeft === 0
        ? `Hai raggiunto il limite di messaggi. Riprova tra ${contactRateLimit.remainingSeconds}s.`
        : `Attendi ${contactRateLimit.remainingSeconds}s prima di inviare un altro messaggio.`;
      triggerToast('Troppe Richieste', msg, 'error', 'Anti-Spam');
      return;
    }

    // ── Validazione campi ─────────────────────────────────────
    const nameCheck = validateRequired(contactForm.name, 'Il nome', 2);
    if (!nameCheck.valid) {
      triggerToast('Nome mancante', nameCheck.message, 'error', 'Validazione');
      return;
    }
    const emailCheck = validateEmail(contactForm.email);
    if (!emailCheck.valid) {
      triggerToast('Email non valida', emailCheck.message, 'error', 'Validazione');
      return;
    }
    const phoneCheck = validateItalianPhone(contactForm.phone);
    if (!phoneCheck.valid) {
      triggerToast('Numero non valido', phoneCheck.message, 'error', 'Validazione');
      return;
    }
    const msgCheck = validateRequired(contactForm.message, 'Il messaggio', 10);
    if (!msgCheck.valid) {
      triggerToast('Messaggio troppo breve', msgCheck.message, 'error', 'Validazione');
      return;
    }

    // Registra l'invio per il rate limiter
    contactRateLimit.recordSubmit();

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
            <p style="margin:0 0 12px;color:#475569;font-size:14px;">Non vedi l'ora? Scrivi direttamente!</p>
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
      const dateText = updatedFields.endDate 
        ? `dal ${updatedFields.date} al ${updatedFields.endDate}` 
        : `${updatedFields.date}`;
      triggerToast(
        'Appuntamento Spostato',
        `Nuovi dettagli inviati a ${b.firstName}: ${dateText} ore ${updatedFields.time}.`,
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

  const addGalleryImageWithToast = async (newImage) => {
    await addGalleryImage(newImage);
    triggerToast(
      'Foto Aggiunta',
      'La nuova immagine è stata inserita con successo nella galleria.',
      'success',
      'Galleria'
    );
  };

  const updateGalleryImageWithToast = async (id, changes) => {
    await updateGalleryImage(id, changes);
    triggerToast(
      'Foto Aggiornata',
      'I dettagli della foto sono stati salvati.',
      'success',
      'Galleria'
    );
  };

  const deleteGalleryImageWithToast = async (id) => {
    await deleteGalleryImageById(id);
    triggerToast(
      'Foto Rimossa',
      'L\'immagine è stata eliminata dalla galleria.',
      'warning',
      'Galleria'
    );
  };

  const getDaysCount = (startDateStr, endDateStr) => {
    if (!startDateStr || !endDateStr) return 1;
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Price & Duration calculator for Form visual preview
  const getSelectedServiceDetails = () => {
    let basePrice = 20;
    let duration = 'Da concordare';
    
    switch (bookingForm.service) {
      case 'Dog Sitting Diurno (Sitter)': 
        basePrice = 25; 
        duration = 'Mezza Giornata'; 
        break;
      case 'Dog Sitting Pensione (Sitter)': 
        basePrice = 35; 
        duration = '24 ore con pernottamento'; 
        break;
      case 'Dog Sitting Diurno (Domicilio)': 
        basePrice = 40; 
        duration = 'Mezza/Giornata Intera'; 
        break;
      case 'Dog Sitting Pensione': 
        basePrice = 50; 
        duration = '24 ore con pernottamento'; 
        break;
      case 'Dog Walking (30m)': 
        basePrice = 20; 
        duration = '30 minuti'; 
        break;
      case 'Dog Walking (60m)': 
        basePrice = 35; 
        duration = '60 minuti'; 
        break;
      case 'Servizio Navetta': 
        basePrice = 15; 
        duration = 'Trasporto A/R'; 
        break;
      case 'Educazione Base': 
        basePrice = 30; 
        duration = '1 Sessione (60m)'; 
        break;
      case 'Consulenza Pre-Adozione': 
        basePrice = 25; 
        duration = '1 Sessione (45m)'; 
        break;
      case 'Wedding Dog Sitter': 
        basePrice = 150; 
        duration = 'Evento'; 
        break;
      default: 
        basePrice = 20; 
        duration = 'Da concordare'; 
        break;
    }

    if (bookingForm.isRange && bookingForm.date && bookingForm.endDate) {
      const days = getDaysCount(bookingForm.date, bookingForm.endDate);
      return {
        price: basePrice * days,
        duration: `${duration} (${days} giorni)`
      };
    }

    return { price: basePrice, duration };
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
    
    // Find all bookings on this date
    const bookingsOnDay = bookings.filter((b) => {
      if (b.isRange && b.endDate) {
        return dateStr >= b.date && dateStr <= b.endDate;
      }
      return b.date === dateStr;
    });

    const confirmedBookings = bookingsOnDay.filter(b => b.status === 'confirmed');
    const pendingBookings = bookingsOnDay.filter(b => b.status === 'pending');

    const hasConfirmedFullDay = confirmedBookings.some(b => 
      b.service.includes('Sitting') || b.service.includes('Wedding')
    );

    if (hasConfirmedFullDay || confirmedBookings.length >= 3) {
      status = 'occupied'; // Red: Fully Booked / Boarding Active
    } else if (pendingBookings.length > 0 || confirmedBookings.length > 0) {
      status = 'pending';  // Yellow: appointments exist but slot space is available
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

    // Dynamic Availability Check based on current selection in the form
    const bookingsOnDay = bookings.filter((b) => {
      if (b.isRange && b.endDate) {
        return day.dateStr >= b.date && day.dateStr <= b.endDate;
      }
      return b.date === day.dateStr;
    });
    
    const confirmedBookings = bookingsOnDay.filter(b => b.status === 'confirmed');
    const hasConfirmedFullDay = confirmedBookings.some(b => 
      b.service.includes('Sitting') || b.service.includes('Wedding')
    );

    const isRequestedFullDay = bookingForm.service.includes('Sitting') || bookingForm.service.includes('Wedding');

    if (hasConfirmedFullDay) {
      triggerToast(
        'Giorno Occupato',
        'In questa data è già attivo un servizio di soggiorno/pensione a giornata intera. Scegli un altro giorno.',
        'error',
        'Calendario'
      );
      return;
    }

    if (isRequestedFullDay && confirmedBookings.length > 0) {
      triggerToast(
        'Giorno Occupato',
        'Non è possibile prenotare un soggiorno/pensione quando ci sono altri appuntamenti confermati in questo giorno.',
        'error',
        'Calendario'
      );
      return;
    }

    if (confirmedBookings.length >= 3) {
      triggerToast(
        'Limite Raggiunto',
        'L\'operatore ha raggiunto il limite massimo di 3 appuntamenti per questo giorno.',
        'error',
        'Calendario'
      );
      return;
    }

    if (bookingForm.isRange) {
      // If we don't have start date or already have both start and end: set start date
      if (!bookingForm.date || (bookingForm.date && bookingForm.endDate)) {
        setBookingForm((prev) => ({ ...prev, date: day.dateStr, endDate: '' }));
        setSelectedCalendarDay(day.dayNum);
        triggerToast(
          'Data Inizio Selezionata',
          `Data inizio impostata al ${day.dayNum} ${calMonthNameCapitalized}. Ora seleziona la data di fine.`,
          'info',
          'Calendario'
        );
      } else {
        // We have start date but no end date
        if (day.dateStr < bookingForm.date) {
          // If clicked date is before start date, make it the new start date
          setBookingForm((prev) => ({ ...prev, date: day.dateStr, endDate: '' }));
          setSelectedCalendarDay(day.dayNum);
          triggerToast(
            'Data Inizio Selezionata',
            `Nuova data inizio impostata al ${day.dayNum} ${calMonthNameCapitalized}. Ora seleziona la data di fine.`,
            'info',
            'Calendario'
          );
        } else {
          // Check if there are occupied days between start and end
          const start = new Date(bookingForm.date);
          const end = new Date(day.dateStr);
          let blockReason = null;
          
          for (let dDate = new Date(start); dDate <= end; dDate.setDate(dDate.getDate() + 1)) {
            const y = dDate.getFullYear();
            const m = String(dDate.getMonth() + 1).padStart(2, '0');
            const dateD = String(dDate.getDate()).padStart(2, '0');
            const dateStr = `${y}-${m}-${dateD}`;
            
            const bookingsOnDate = bookings.filter(b => {
              if (b.status !== 'confirmed') return false;
              if (b.isRange && b.endDate) {
                return dateStr >= b.date && dateStr <= b.endDate;
              }
              return b.date === dateStr;
            });

            const hasConfirmedFullDayOnDate = bookingsOnDate.some(b => 
              b.service.includes('Sitting') || b.service.includes('Wedding')
            );
            
            if (hasConfirmedFullDayOnDate) {
              blockReason = `Il giorno ${dDate.getDate()} è occupato da un servizio a giornata intera.`;
              break;
            }
            if (isRequestedFullDay && bookingsOnDate.length > 0) {
              blockReason = `Il giorno ${dDate.getDate()} ha già appuntamenti e non può accettare soggiorni a giornata intera.`;
              break;
            }
            if (bookingsOnDate.length >= 3) {
              blockReason = `Il giorno ${dDate.getDate()} ha raggiunto il limite massimo di appuntamenti.`;
              break;
            }
          }

          if (blockReason) {
            triggerToast(
              'Intervallo Non Disponibile',
              blockReason,
              'error',
              'Calendario'
            );
            return;
          }

          setBookingForm((prev) => ({ ...prev, endDate: day.dateStr }));
          const startDayNum = new Date(bookingForm.date).getDate();
          triggerToast(
            'Intervallo Selezionato',
            `Hai scelto dal ${startDayNum} al ${day.dayNum} ${calMonthNameCapitalized}.`,
            'success',
            'Calendario'
          );
        }
      }
    } else {
      // Single date selection
      setSelectedCalendarDay(day.dayNum);
      setBookingForm((prev) => ({ ...prev, date: day.dateStr, endDate: '', isRange: false }));
      triggerToast(
        'Data Selezionata',
        `Hai scelto il ${day.dayNum} ${calMonthNameCapitalized} per il tuo appuntamento.`,
        'success',
        'Calendario'
      );
    }
  };

  const averageStars = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);

  // Gallery slideshow actions
  // Gallery lightbox navigation
  const openLightbox = (index) => {
    setLightboxIndex(index);
  };

  const navigateLightbox = (direction) => {
    const filtered = activeGalleryFilter === 'Tutti'
      ? galleryImages
      : galleryImages.filter(img => img.category === activeGalleryFilter);
    setLightboxIndex((prevIndex) => {
      if (prevIndex === null) return null;
      let newIdx = prevIndex + direction;
      if (newIdx < 0) newIdx = filtered.length - 1;
      if (newIdx >= filtered.length) newIdx = 0;
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
          galleryImages={galleryImages}
          addGalleryImage={addGalleryImageWithToast}
          updateGalleryImage={updateGalleryImageWithToast}
          deleteGalleryImage={deleteGalleryImageWithToast}
          gallerySyncStatus={gallerySyncStatus}
          onClose={() => setViewMode('client')}
        />
        <NotificationToast toasts={toasts} removeToast={removeToast} />
      </>
    );
  }

  return (
    <div>
      {/* -------------------- HEADER / NAVBAR -------------------- */}
      <NavBar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onAdminClick={() => setViewMode('admin')}
      />


      {/* -------------------- HERO SECTION -------------------- */}
      <HeroSection reviewsCount={reviews.length} bookingsCount={bookings.length} />

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
      <AboutSection simulateCertificateDownload={simulateCertificateDownload} />

      {/* -------------------- SERVIZI (SERVICES) -------------------- */}
      <ServicesSection onServiceSelect={handleServiceSelect} />

      {/* -------------------- PRENOTAZIONI ONLINE & CALENDARIO -------------------- */}
      <BookingSection
        bookingForm={bookingForm}
        setBookingForm={setBookingForm}
        handleBookingSubmit={handleBookingSubmit}
        bookingRateLimit={bookingRateLimit}
        selectedDetails={selectedDetails}
        calendarDays={calendarDays}
        calMonthNameCapitalized={calMonthNameCapitalized}
        todayDate={todayDate}
        handleCalendarDayClick={handleCalendarDayClick}
        triggerToast={triggerToast}
      />

      {/* -------------------- RECENSIONI (REVIEWS) -------------------- */}
      <ReviewsSection
        reviews={reviews}
        reviewForm={reviewForm}
        setReviewForm={setReviewForm}
        handleReviewSubmit={handleReviewSubmit}
        handleReviewPhotoUpload={handleReviewPhotoUpload}
        averageStars={averageStars}
      />

      {/* -------------------- PHOTO GALLERY WITH CATEGORIES & LIGHTBOX -------------------- */}
      <GallerySection
        galleryImages={galleryImages}
        activeFilter={activeGalleryFilter}
        setActiveFilter={setActiveGalleryFilter}
        lightboxIndex={lightboxIndex}
        setLightboxIndex={setLightboxIndex}
        openLightbox={openLightbox}
        navigateLightbox={navigateLightbox}
      />

      {/* -------------------- ZONE SERVITE -------------------- */}
      <ZoneSection />

      {/* -------------------- FAQ -------------------- */}
      <FaqSection />

      {/* -------------------- CONTATTI & MAPPA (CONTACTS) -------------------- */}
      <ContactSection
        contactForm={contactForm}
        setContactForm={setContactForm}
        handleContactSubmit={handleContactSubmit}
        contactRateLimit={contactRateLimit}
      />

      {/* -------------------- FOOTER -------------------- */}
      <FooterSection />

      {/* ── WHATSAPP FLOATING ACTION BUTTON ─────────────────── */}
      <a
        href="https://wa.me/393467251989?text=Ciao%20Emanuele!%20Ho%20visto%20il%20sito%20WebDog%20e%20vorrei%20informazioni%20sui%20servizi."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chatta su WhatsApp"
        title="Scrivimi su WhatsApp"
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
// ── CookieBanner — GDPR + Italian Cookie Law ───────────────────────────────
// GA4 viene gestito da src/analytics.js — importato qui per coerenza
import { initGA as _initGA } from './analytics.js';

function CookieBanner() {
  const STORAGE_KEY = 'webdog_cookie_consent';
  const [visible, setVisible] = React.useState(() => !localStorage.getItem(STORAGE_KEY));
  const [showDetails, setShowDetails] = React.useState(false);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
    _initGA(); // avvia GA4 solo dopo il consenso esplicito
  };

  const handleReject = () => {
    localStorage.setItem(STORAGE_KEY, 'rejected');
    setVisible(false);
  };

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
      emailjsServiceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
      emailjsTemplateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '',
      emailjsPublicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '',
      adminEmail: import.meta.env.VITE_ADMIN_EMAIL || ''
    };
  }, []);

  const handleSendEmailJS = async () => {
    setSendingStatus('sending');
    try {
      if (!config.emailjsServiceId || !config.emailjsTemplateId || !config.emailjsPublicKey) {
        throw new Error("Chiavi EmailJS non configurate. Configurale nell'Area Admin o usa il Client di posta locale.");
      }

      // Send ONE single email to admin with all client details inside
      const adminEmail = config.adminEmail || import.meta.env.VITE_ADMIN_EMAIL || '';
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
