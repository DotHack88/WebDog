import React from 'react';
import { Sliders } from 'lucide-react';

/**
 * NavBar — header fisso + overlay mobile
 * Props:
 *   mobileMenuOpen  {boolean}
 *   setMobileMenuOpen {function}
 *   onAdminClick    {function}  — apre il pannello admin
 */
export default function NavBar({ mobileMenuOpen, setMobileMenuOpen, onAdminClick }) {
  return (
    <>
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
          {['Chi Sono:#about', 'Servizi:#servizi', 'Prenotazioni:#prenotazioni', 'Recensioni:#recensioni', 'Gallery:#gallery', 'Contatti:#contatti'].map((item) => {
            const [label, href] = item.split(':');
            return (
              <a key={href} href={href} style={{ color: '#0f2d2a', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
                {label}
              </a>
            );
          })}
        </nav>

        {/* Header CTAs */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }} className="desktop-ctas">
          <button
            onClick={onAdminClick}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.8rem', gap: '6px', borderRadius: '999px' }}
          >
            <Sliders size={14} /> Gestionale Admin
          </button>
          <a href="#prenotazioni" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.8rem', borderRadius: '999px' }}>
            Prenota Ora
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button
          className={`mobile-menu-toggle ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className="line" />
          <span className="line" />
          <span className="line" />
        </button>
      </header>

      {/* Mobile Overlay */}
      <nav className={`mobile-nav-overlay ${mobileMenuOpen ? 'open' : ''}`}>
        {['Chi Sono:#about', 'Servizi:#servizi', 'Prenotazioni:#prenotazioni', 'Recensioni:#recensioni', 'Gallery:#gallery', 'Contatti:#contatti'].map((item) => {
          const [label, href] = item.split(':');
          return (
            <a key={href} href={href} className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              {label}
            </a>
          );
        })}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
          <a
            href="#prenotazioni"
            className="btn btn-primary"
            style={{ padding: '12px 20px', fontSize: '0.95rem', borderRadius: '999px', textAlign: 'center' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            Prenota Ora
          </a>
          <button
            onClick={() => { onAdminClick(); setMobileMenuOpen(false); }}
            className="btn btn-secondary"
            style={{ padding: '12px 20px', fontSize: '0.95rem', borderRadius: '999px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}
          >
            <Sliders size={16} /> Gestionale Admin
          </button>
        </div>
      </nav>
    </>
  );
}
