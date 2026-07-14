import React, { useState } from 'react';
import { Award, Check, FileText } from 'lucide-react';

/**
 * AboutSection — Chi Sono con tab profilo/competenze/certificazioni/attestati
 * Props:
 *   simulateCertificateDownload {function(certName)}
 */
export default function AboutSection({ simulateCertificateDownload }) {
  const [activeTab, setActiveTab] = useState('profilo');

  const TABS = ['profilo', 'competenze', 'certificazioni', 'attestati'];

  const COMPETENZE = [
    { name: 'Educazione di base', desc: 'Costruzione di un solido binomio cane-proprietario.' },
    { name: 'Dog Sitting & Cura h24', desc: 'Custodia attenta presso il domicilio del proprietario.' },
    { name: 'Passeggiate Educative', desc: 'Uscite in natura focalizzate su stimoli olfattivi e calma.' },
    { name: 'Gestione Cuccioli (Puppy Classes)', desc: 'Prevenzione problemi comportamentali e socializzazione.' },
    { name: 'Supporto ai Proprietari', desc: 'Consulenze mirate per comprendere al meglio i comportamenti.' },
    { name: 'Asilo', desc: 'Operatore presso centro cinofilo.' },
  ];

  return (
    <section id="about" className="section-padding" style={{ background: '#f8fafc' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '56px', alignItems: 'center' }}>

          {/* Left — Photo */}
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '4px solid white' }}>
              <img
                src="/chi_sono_profile.jpg"
                alt="Emanuele Barese — Educatore Cinofilo a Napoli e Provincia"
                loading="lazy"
                decoding="async"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>

            {/* Floating award badge */}
            <div className="glass-panel" style={{
              position: 'absolute', bottom: '-20px', left: '20px',
              padding: '16px 24px', borderRadius: '16px',
              display: 'flex', alignItems: 'center', gap: '12px',
              boxShadow: 'var(--shadow-lg)'
            }}>
              <Award size={28} style={{ color: '#fbbf24' }} />
              <div>
                <h5 style={{ fontWeight: 800 }}>Educatore CSEN</h5>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Iscrizione Albo Naz. n. 42081</p>
              </div>
            </div>
          </div>

          {/* Right — Info + Tabs */}
          <div>
            <span className="badge">👤 CHI SONO</span>
            <h2 className="section-title">Emanuele Barese</h2>
            <span style={{ fontWeight: 700, color: '#0f766e', fontSize: '1.1rem', display: 'block', marginBottom: '16px' }}>
              Educatore Cinofilo & Operatore del Benessere Animale
            </span>

            <p style={{ fontSize: '1.05rem', color: '#334155', marginBottom: '24px', lineHeight: 1.7 }}>
              Mi occupo di servizi cinofili con passione e dedizione, offrendo supporto ai proprietari e benessere ai loro cani attraverso attività personalizzate e professionali.
            </p>

            {/* Tab Nav */}
            <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', marginBottom: '20px', gap: '16px' }}>
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    background: 'transparent', border: 'none',
                    borderBottom: activeTab === tab ? '3px solid #0f766e' : '3px solid transparent',
                    color: activeTab === tab ? '#0f766e' : '#64748b',
                    padding: '8px 4px', fontWeight: 700, fontSize: '0.9rem',
                    cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.2s'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* PROFILO */}
            {activeTab === 'profilo' && (
              <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '14px' }}>
                  Credo in una cinofilia basata sul rispetto reciproco, sulla cognizione ed empatia. Ogni cane è un individuo a sé, con una personalità e sensibilità unica.
                </p>
                <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem', fontWeight: 600 }}>
                  {['Pratica Gentile', 'No metodi coercitivi', 'Supporto h24', 'Assicurazione RC attiva', 'Agilista sportivo', 'Educazione di base'].map((item) => (
                    <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Check size={16} style={{ color: '#10b981' }} /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* COMPETENZE */}
            {activeTab === 'competenze' && (
              <div style={{ animation: 'fadeIn 0.3s ease-out', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {COMPETENZE.map((comp) => (
                  <div key={comp.name} style={{ padding: '8px 12px', background: 'white', borderRadius: '8px', borderLeft: '3px solid #0284c7' }}>
                    <h5 style={{ fontWeight: 700, fontSize: '0.85rem', color: '#042f2e' }}>{comp.name}</h5>
                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{comp.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {/* CERTIFICAZIONI */}
            {activeTab === 'certificazioni' && (
              <div style={{ animation: 'fadeIn 0.3s ease-out', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ padding: '10px 14px', background: 'white', borderRadius: '8px' }}>
                  <strong style={{ fontSize: '0.85rem', display: 'block' }}>Diploma Nazionale Educatore Cinofilo CSEN</strong>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Anno di conseguimento: 2026 • Riconosciuto CONI</span>
                </div>
              </div>
            )}

            {/* ATTESTATI */}
            {activeTab === 'attestati' && (
              <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '14px' }}>
                  Scarica le mie certificazioni professionali ufficiali in formato PDF ad alta definizione.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { key: 'Diploma_Educatore_Cinofilo', label: 'Diploma Educatore Cinofilo.pdf' },
                    { key: 'Attestato_Primo_Soccorso', label: 'Attestato Primo Soccorso Cane.pdf' },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => simulateCertificateDownload(key)}
                      className="btn btn-outline"
                      style={{ padding: '8px 16px', fontSize: '0.8rem', justifyContent: 'space-between', borderRadius: '8px' }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={16} /> {label}
                      </span>
                      <strong style={{ color: '#0f766e' }}>Scarica</strong>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
}
