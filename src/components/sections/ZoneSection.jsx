import React from 'react';

const AREAS = [
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
];

export default function ZoneSection() {
  return (
    <section id="zone" style={{ background: 'white', padding: '64px 0' }}>
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {AREAS.map(({ area, color, bg, cities }) => (
            <div key={area} style={{ background: bg, borderRadius: '16px', padding: '20px 24px', border: `1px solid ${color}22` }}>
              <h3 style={{ fontWeight: 800, fontSize: '0.95rem', color, marginBottom: '14px' }}>
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
  );
}
