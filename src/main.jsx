import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initGA } from './analytics.js'

// Se l'utente ha già accettato i cookie analitici in una sessione precedente,
// avvia GA4 subito al caricamento della pagina.
if (localStorage.getItem('webdog_cookie_consent') === 'accepted') {
  initGA();
}

// Registra il Service Worker per le funzionalità PWA (cache offline + installabilità)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch((err) => console.warn('[WebDog] SW registration failed:', err));
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
