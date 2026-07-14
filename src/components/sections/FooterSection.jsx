import React from 'react';

const SOCIAL_LINKS = [
  { label: '📸 Instagram', href: 'https://www.instagram.com/', hoverBg: 'rgba(225,48,108,0.35)' },
  { label: '👍 Facebook',  href: 'https://www.facebook.com/', hoverBg: 'rgba(24,119,242,0.35)' },
  { label: '🎵 TikTok',    href: 'https://www.tiktok.com/',   hoverBg: 'rgba(255,255,255,0.2)' },
];

const QUICK_LINKS = [
  { label: '🏠 Home',           href: '#home' },
  { label: '👤 Chi Sono',       href: '#about' },
  { label: '🐾 Servizi',        href: '#servizi' },
  { label: '📅 Prenotazioni',   href: '#prenotazioni' },
  { label: '⭐ Recensioni',     href: '#recensioni' },
  { label: '📞 Contatti',       href: '#contatti' },
];

export default function FooterSection() {
  return (
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
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {SOCIAL_LINKS.map(({ label, href, hoverBg }) => (
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
              {QUICK_LINKS.map(({ label, href }) => (
                <li key={href}><a href={href} style={{ color: '#99f6e4', textDecoration: 'none' }}>{label}</a></li>
              ))}
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
            <p style={{ fontSize: '0.75rem', color: '#5eead4', marginTop: '14px' }}>📍 Napoli e Provincia</p>
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
  );
}
