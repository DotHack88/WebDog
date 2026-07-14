# 🐾 WebDog Napoli

Sito web professionale per educatore cinofilo e dog sitter a Napoli e Provincia.  
Sviluppato con **React + Vite**, backend serverless con **Firebase Realtime Database** e notifiche email via **EmailJS**.

---

## Stack Tecnologico

| Layer | Tecnologia |
|---|---|
| Frontend | React 18 + Vite |
| Database | Firebase Realtime Database |
| Auth | Firebase Authentication |
| Email | EmailJS REST API |
| Analytics | Google Analytics 4 |
| Hosting | Vercel |
| CSS | Vanilla CSS custom (glassmorphism design system) |
| Icone | Lucide React |

---

## Funzionalità

- **Prenotazione online** con calendario interattivo, selezione range date e metodi di pagamento multipli
- **Sincronizzazione real-time** delle prenotazioni su Firebase (visibili istantaneamente nel pannello admin da qualsiasi dispositivo)
- **Pannello Admin** protetto da Firebase Authentication con dashboard statistiche, agenda, gestione recensioni e log notifiche
- **Invio email automatico** via EmailJS al momento della prenotazione e del contatto
- **Anti-spam** con rate limiting client-side (3 prenotazioni / 15 min) e validazione numero telefono italiano
- **Gallery** fotografica con filtri per categoria e lightbox
- **Recensioni** clienti con form di invio e moderazione admin
- **PWA installabile** con manifest, service worker cache-first e supporto offline
- **SEO avanzato**: meta tags, Open Graph, Twitter Card, Schema.org LocalBusiness, sitemap.xml, robots.txt
- **GDPR compliant**: cookie banner con consenso esplicito, GA4 attivato solo dopo accettazione
- **Responsive** e ottimizzato per mobile (lazy loading immagini, `decoding="async"`)

---

## Struttura Progetto

```
WebDog/
├── public/
│   ├── albums/               # Foto personali (gare, sport)
│   ├── manifest.json         # PWA manifest
│   ├── sw.js                 # Service Worker (cache offline)
│   ├── sitemap.xml
│   ├── robots.txt
│   └── *.jpg / *.png         # Immagini pubbliche
├── src/
│   ├── components/
│   │   ├── sections/         # Componenti sezione estratti da App.jsx
│   │   │   ├── NavBar.jsx
│   │   │   ├── ServicesSection.jsx
│   │   │   ├── FaqSection.jsx
│   │   │   ├── ZoneSection.jsx
│   │   │   └── FooterSection.jsx
│   │   ├── AdminPortal.jsx   # Pannello gestionale operatore
│   │   └── NotificationToast.jsx
│   ├── hooks/
│   │   ├── useRealtimeBookings.js  # Sync Firebase + fallback localStorage
│   │   └── useRateLimit.js         # Anti-spam rate limiting
│   ├── utils/
│   │   └── validation.js     # Validazione telefono/email/campi
│   ├── analytics.js          # GA4 — init dopo consenso cookie
│   ├── firebase.js           # Config Firebase (legge da .env)
│   ├── App.jsx               # Componente root + logica principale
│   ├── main.jsx              # Entry point + SW registration
│   ├── App.css
│   └── index.css             # Design system completo
├── .env                      # Variabili d'ambiente (NON committare)
├── .env.example              # Template con placeholder
├── index.html                # Entry HTML + meta SEO + PWA tags
└── vite.config.js
```

---

## Setup Locale

```bash
# 1. Clona il repository
git clone <repo-url>
cd WebDog

# 2. Installa le dipendenze
npm install

# 3. Crea il file .env (copia dall'esempio)
copy .env.example .env

# 4. Compila i valori in .env (vedi sezione Configurazione)

# 5. Avvia il dev server
npm run dev
```

---

## Configurazione (.env)

Rinomina `.env.example` in `.env` e compila i valori:

```env
# Firebase Realtime Database
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# EmailJS (https://www.emailjs.com)
VITE_EMAILJS_SERVICE_ID=...
VITE_EMAILJS_TEMPLATE_ID=...
VITE_EMAILJS_PUBLIC_KEY=...
VITE_ADMIN_EMAIL=tua@email.it

# Google Analytics 4 (https://analytics.google.com)
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## Firebase — Configurazione Auth

Il login del pannello admin usa **Firebase Authentication** con email/password.

1. Vai su [Firebase Console](https://console.firebase.google.com) → Progetto `webdog-bookings`
2. **Authentication** → **Sign-in method** → Abilita **Email/Password**
3. **Authentication** → **Users** → Aggiungi un nuovo utente con la tua email e una password sicura
4. Quella stessa email e password usi per accedere al pannello Admin sul sito

> Per il Realtime Database, assicurati di avere le regole di sicurezza configurate.  
> In sviluppo puoi usare "test mode"; in produzione configura regole che permettano scrittura solo agli utenti autenticati.

---

## Google Analytics 4

1. Vai su [analytics.google.com](https://analytics.google.com)
2. Crea una proprietà → Aggiungi flusso dati Web
3. Copia il **Measurement ID** (formato `G-XXXXXXXXXX`)
4. Aggiungilo in `.env` come `VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX`

GA4 si attiva **solo dopo il consenso esplicito** dell'utente nel cookie banner (GDPR compliant).

---

## EmailJS — Configurazione Notifiche

1. Crea account su [emailjs.com](https://www.emailjs.com)
2. Aggiungi un **Email Service** (Gmail, Outlook, ecc.)
3. Crea un **Email Template** con le variabili: `to_name`, `to_email`, `reply_to`, `subject`, `message`, `message_html`
4. Copia Service ID, Template ID e Public Key in `.env`
5. Nel pannello Admin → tab Notifiche → puoi aggiornare le chiavi a runtime senza rebuild

---

## Deploy su Vercel

```bash
# Build di produzione
npm run build

# Deploy (richiede Vercel CLI)
npx vercel --prod
```

**Variabili d'ambiente su Vercel**: aggiungi tutte le `VITE_*` nelle impostazioni del progetto Vercel → Environment Variables.

---

## Scripts

```bash
npm run dev      # Dev server con HMR
npm run build    # Build produzione in /dist
npm run preview  # Anteprima build locale
npm run lint     # ESLint
```

---

## Dati Seed (sviluppo)

`App.jsx` contiene `defaultBookings` e `defaultReviews` usati solo come fallback quando Firebase non è configurato o è vuoto al primo avvio. In produzione con Firebase attivo, vengono ignorati dopo il primo sync.

---

## Contatti

**Emanuele Barese** — Educatore Cinofilo Certificato CSEN  
📞 +39 346 7251989  
📧 info@webdog.it  
📍 Arzano (NA) — Napoli e Provincia  
🌐 [webdog-five.vercel.app](https://webdog-five.vercel.app)
