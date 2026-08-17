import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

/**
 * HeroSection — sezione principale above-the-fold
 * Props:
 *   reviewsCount  {number}
 *   bookingsCount {number}
 */
export default function HeroSection({ reviewsCount, bookingsCount }) {
  return (
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
        position: 'absolute', top: '-10%', right: '-10%',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(45, 212, 191, 0.15) 0%, rgba(255, 255, 255, 0) 70%)',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', left: '-5%',
        width: '500px', height: '500px',
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

            {/* Live Stats */}
            <div style={{
              display: 'flex', gap: '24px', marginTop: '48px',
              borderTop: '1px solid rgba(15, 118, 110, 0.15)', paddingTop: '24px'
            }}>
              <div>
                <h4 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f766e' }}>100%</h4>
                <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Amore & Dedizione</p>
              </div>
              <div>
                <h4 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f766e' }}>{reviewsCount}+</h4>
                <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Recensioni 5 Stelle</p>
              </div>
              <div>
                <h4 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f766e' }}>{bookingsCount}+</h4>
                <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Cani Felici Assistiti</p>
              </div>
            </div>
          </div>

          {/* Right Column — Photo */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <div style={{
              position: 'relative', width: '100%', maxWidth: '440px', aspectRatio: '1',
              borderRadius: '50% 50% 30% 70% / 50% 60% 40% 50%',
              background: 'linear-gradient(135deg, #0f766e 0%, #0284c7 100%)',
              boxShadow: '0 25px 50px -12px rgba(15, 118, 110, 0.25)',
              overflow: 'hidden', border: '8px solid rgba(255, 255, 255, 0.4)'
            }} className="floating-icon">
              <img
                src="/chi_sono_profile.jpg"
                alt="Emanuele Barese — Educatore Cinofilo Certificato CSEN a Napoli"
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.05)', transition: 'all 0.3s' }}
              />
            </div>

            {/* Float Card 1 */}
            <div className="glass-panel" style={{
              position: 'absolute', top: '20px', left: '-20px',
              padding: '12px 20px', borderRadius: '16px',
              display: 'flex', alignItems: 'center', gap: '12px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)'
            }}>
              <span style={{ fontSize: '1.5rem' }}>🐶</span>
              <div>
                <h5 style={{ fontWeight: 800, fontSize: '0.9rem' }}>Educatore Certificato</h5>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>CSEN</p>
              </div>
            </div>

            {/* Float Card 2 */}
            <div className="glass-panel" style={{
              position: 'absolute', bottom: '40px', right: '-10px',
              padding: '12px 20px', borderRadius: '16px',
              display: 'flex', alignItems: 'center', gap: '12px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)'
            }}>
              <Heart size={20} style={{ color: '#ef4444', fill: '#ef4444' }} />
              <div>
                <h5 style={{ fontWeight: 800, fontSize: '0.9rem' }}>Risposta in 24h</h5>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Prenotazione facile</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
