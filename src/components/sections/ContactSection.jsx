import React from 'react';
import { Phone, Mail, MapPin, Send } from 'lucide-react';

/**
 * ContactSection — form contatti + mappa
 * Props:
 *   contactForm         {object}
 *   setContactForm      {function}
 *   handleContactSubmit {function}
 *   contactRateLimit    {object}  — { canSubmit, remainingSeconds }
 */
export default function ContactSection({
  contactForm,
  setContactForm,
  handleContactSubmit,
  contactRateLimit,
}) {
  return (
    <section id="contatti" className="section-padding" style={{ background: 'white' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="badge">📞 SCRIVIMI E PRENOTA</span>
          <h2 className="section-title" style={{ margin: '8px 0 0 0' }}>Sono Sempre Disponibili</h2>
          <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '560px', margin: '8px auto 0 auto' }}>
            Hai domande sui percorsi educativi o di dog sitting? Contattami direttamente o compila il form.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'start' }}>

          {/* Left — Recapiti + Mappa */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '28px' }}>
              <h4 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#042f2e', marginBottom: '20px' }}>Recapiti Diretti</h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { bg: '#ccfbf1', color: '#0f766e', icon: <Phone size={18} />, label: 'TELEFONO & WHATSAPP', value: '+39 346 7251989', href: 'tel:+393467251989' },
                  { bg: '#e0f2fe', color: '#0284c7', icon: <Mail size={18} />, label: 'EMAIL CONTATTO', value: 'info@webdog.it', href: 'mailto:info@webdog.it' },
                ].map(({ bg, color, icon, label, value, href }) => (
                  <div key={label} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ background: bg, color, width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {icon}
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', fontWeight: 600 }}>{label}</span>
                      <strong style={{ fontSize: '0.95rem' }}>{value}</strong>
                    </div>
                  </div>
                ))}

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ background: '#f1f5f9', color: '#475569', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', fontWeight: 600 }}>INDIRIZZO SEDE & CAMPO</span>
                    <a
                      href="https://www.google.com/maps/place/Smart+Dog+Napoli/@40.8381864,14.1673849,17z"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                      target="_blank" rel="noopener noreferrer"
                    >
                      <strong style={{ fontSize: '0.95rem' }}>Via Raffaele Ruggiero, 219, 80126 Napoli (NA)</strong>
                    </a>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <a href="tel:+393467251989" className="btn btn-primary" style={{ flex: 1, padding: '10px', fontSize: '0.8rem', borderRadius: '8px' }}>📞 Chiama</a>
                <a href="https://wa.me/393467251989" className="btn btn-secondary" style={{ flex: 1, padding: '10px', fontSize: '0.8rem', borderRadius: '8px', background: '#25d366', color: 'white', borderColor: 'transparent' }}>💬 WhatsApp</a>
                <a href="mailto:info@webdog.it" className="btn btn-outline" style={{ flex: 1, padding: '10px', fontSize: '0.8rem', borderRadius: '8px' }}>📧 Scrivi</a>
              </div>
            </div>

            {/* Mappa */}
            <div className="glass-panel" style={{ padding: '24px', overflow: 'hidden' }}>
              <h4 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#042f2e', marginBottom: '12px' }}>Area Copertura Servizi</h4>
              <div style={{ width: '100%', height: '220px', background: '#e2e8f0', borderRadius: '12px', border: '1px solid #cbd5e1', overflow: 'hidden', position: 'relative' }}>
                <iframe
                  width="100%" height="100%" frameBorder="0"
                  scrolling="no" marginHeight="0" marginWidth="0"
                  src="https://maps.google.com/maps?width=100%25&height=100%25&hl=it&q=Napoli+(Area%20Copertura)&t=&z=10&ie=UTF8&iwloc=B&output=embed"
                  style={{ border: 0 }} allowFullScreen="" loading="lazy"
                />
                <span style={{
                  position: 'absolute', bottom: '8px', left: '8px',
                  fontSize: '0.65rem', fontWeight: 700,
                  background: 'rgba(255, 255, 255, 0.9)', padding: '4px 8px',
                  borderRadius: '4px', border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  📍 Copertura: Napoli e Provincia
                </span>
              </div>
            </div>
          </div>

          {/* Right — Form */}
          <div className="glass-panel" style={{ padding: '30px' }}>
            <form onSubmit={handleContactSubmit}>
              <h4 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#042f2e', marginBottom: '20px' }}>Modulo Messaggi</h4>

              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">NOME & COGNOME</label>
                <input type="text" placeholder="Alessandro Neri" required className="form-input"
                  value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">E-MAIL</label>
                <input type="email" placeholder="alessandro.n@example.com" required className="form-input"
                  value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">TELEFONO CELLULARE</label>
                <input type="tel" placeholder="3334567890" required className="form-input"
                  value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="form-label">IL TUO MESSAGGIO</label>
                <textarea placeholder="Scrivi qui la tua richiesta..." required rows="4"
                  className="form-input" style={{ resize: 'none' }}
                  value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} />
              </div>

              <button
                type="submit" className="btn btn-primary"
                disabled={!contactRateLimit.canSubmit}
                style={{ width: '100%', gap: '10px', opacity: contactRateLimit.canSubmit ? 1 : 0.6, cursor: contactRateLimit.canSubmit ? 'pointer' : 'not-allowed' }}
              >
                <Send size={16} />
                {contactRateLimit.canSubmit ? 'Invia Messaggio' : `Attendi ${contactRateLimit.remainingSeconds}s…`}
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}
