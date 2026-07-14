/**
 * analytics.js — Google Analytics 4
 *
 * Il Measurement ID viene letto da VITE_GA4_MEASUREMENT_ID nel file .env.
 * Il tracking si avvia solo dopo il consenso cookie dell'utente (GDPR).
 *
 * Utilizzo:
 *   initGA()        — chiama al consenso cookie (es. quando l'utente accetta)
 *   trackPageView() — registra una page view (utile su SPA dopo cambio sezione)
 *   trackEvent(name, params) — invia un evento personalizzato
 */

const GA_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID;

// GA è utilizzabile solo se l'ID è configurato e non è il placeholder
const isConfigured =
  Boolean(GA_ID) &&
  GA_ID !== 'G-XXXXXXXXXX' &&
  !GA_ID.startsWith('G-XXXXX');

let initialized = false;

/**
 * Carica lo script gtag.js e inizializza GA4.
 * Chiama questa funzione quando l'utente accetta i cookie analitici.
 */
export function initGA() {
  if (!isConfigured || initialized) return;

  // Inject script tag
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, {
    anonymize_ip: true,          // GDPR: anonimizza gli IP
    send_page_view: true,        // registra la prima page view all'avvio
  });

  initialized = true;
}

/**
 * Registra una page view manuale (utile su SPA quando cambia sezione).
 * @param {string} path — es. '#servizi', '#prenotazioni'
 * @param {string} title — titolo della sezione
 */
export function trackPageView(path, title) {
  if (!initialized || typeof window.gtag !== 'function') return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title,
  });
}

/**
 * Invia un evento GA4 personalizzato.
 * @param {string} name — nome evento, es. 'booking_submitted'
 * @param {object} params — parametri opzionali, es. { service: 'Dog Walking' }
 */
export function trackEvent(name, params = {}) {
  if (!initialized || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}
