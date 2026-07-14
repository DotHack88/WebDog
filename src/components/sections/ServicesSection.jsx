import React from 'react';

/**
 * ServicesSection — sezione servizi con categorie
 * Props:
 *   onServiceSelect {function(serviceName)} — pre-seleziona servizio e scrolla al form
 */
export default function ServicesSection({ onServiceSelect }) {
  const ServiceCard = ({ emoji, title, description, details, serviceKey, extraButton }) => (
    <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <h4 style={{ fontWeight: 800, fontSize: '1.15rem', color: '#042f2e' }}>{emoji} {title}</h4>
        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '8px 0 14px 0' }}>{description}</p>
        <div style={{ fontSize: '0.85rem', background: '#f1f5f9', padding: '10px', borderRadius: '8px', marginBottom: '16px' }}>
          {details.map((d, i) => <p key={i} style={{ marginTop: i > 0 ? '4px' : 0 }}>{d}</p>)}
        </div>
      </div>
      {extraButton ? (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => onServiceSelect(extraButton.key)} className="btn btn-primary" style={{ flex: 1, fontSize: '0.85rem' }}>
            {extraButton.label}
          </button>
          <button onClick={() => onServiceSelect(serviceKey)} className="btn btn-secondary" style={{ flex: 1, fontSize: '0.85rem' }}>
            {extraButton.altLabel}
          </button>
        </div>
      ) : (
        <button onClick={() => onServiceSelect(serviceKey)} className="btn btn-primary" style={{ width: '100%' }}>
          Prenota Ora
        </button>
      )}
    </div>
  );

  return (
    <section id="servizi" className="section-padding" style={{ background: 'white' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="badge">🐾 SERVIZI OFFERTI</span>
          <h2 className="section-title" style={{ margin: '8px 0 0 0' }}>Servizi Professionali su Misura</h2>
          <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '560px', margin: '8px auto 0 auto' }}>
            Ogni cane ha necessità differenti. Offriamo formule personalizzabili per la cura quotidiana e la crescita educativa.
          </p>
        </div>

        {/* CATEGORIA 1: Presso la casa del Sitter */}
        <CategoryHeader emoji="🏡" title="Presso la casa del Sitter" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          <ServiceCard
            emoji="☀️" title="Dog Sitting Diurno"
            description="Il tuo cane passa la giornata a casa mia, in un ambiente sicuro e accogliente. Perfetto per non lasciarlo solo mentre sei al lavoro."
            details={['⏱️ Durata: Mezza Giornata', '💰 Prezzo: €25']}
            serviceKey="Dog Sitting Diurno (Sitter)"
          />
          <ServiceCard
            emoji="🌙" title="Dog Sitting Pensione"
            description="Un vero e proprio soggiorno con pernottamento. Il tuo cane farà parte della famiglia per tutta la notte, circondato da comfort, affetto e attenzioni."
            details={['⏱️ Durata: 24 ore (con pernottamento incluso)', '💰 Prezzo: €35']}
            serviceKey="Dog Sitting Pensione (Sitter)"
          />
        </div>

        {/* CATEGORIA 2: Presso l'abitazione del Cliente */}
        <CategoryHeader emoji="🦮" title="Presso l'abitazione del Cliente" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          <ServiceCard
            emoji="🏠" title="Dog Sitting Diurno"
            description="Vengo io da te per accudire il tuo cane direttamente nel suo ambiente domestico durante il giorno. Meno stress per lui, massima comodità per te."
            details={['⏱️ Durata: Mezza Giornata / Giornata intera', '💰 Prezzo: €20 / €40']}
            serviceKey="Dog Sitting Diurno (Domicilio)"
          />
          <ServiceCard
            emoji="🛌" title="Dog Sitting Pensione"
            description="Servizio di house-sitting. Resto a dormire a casa tua per garantire al cane la continuità delle sue abitudini e una presenza costante anche di notte."
            details={['⏱️ Durata: 24 ore (con pernottamento incluso)', '💰 Prezzo: €50']}
            serviceKey="Dog Sitting Pensione"
          />
        </div>

        {/* CATEGORIA 3: In Giro per la Città */}
        <CategoryHeader emoji="🌳" title="In Giro per la Città" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          <ServiceCard
            emoji="🦮" title="Dog Walking (Passeggiata Cani)"
            description="Un'uscita dedicata al movimento, al gioco e ai bisognini del tuo cane, per spezzare la sua giornata in totale sicurezza."
            details={['⏱️ 30 minuti  |  💰 €20', '⏱️ 60 minuti  |  💰 €35']}
            serviceKey="Dog Walking (60m)"
            extraButton={{ key: 'Dog Walking (30m)', label: '30 min', altLabel: '60 min' }}
          />
          <ServiceCard
            emoji="💍" title="Wedding Dog Sitter"
            description="Il tuo migliore amico può esserci anche il giorno del tuo matrimonio! Servizio dedicato per i momenti più importanti della cerimonia."
            details={['⏱️ Durata: Mezza Giornata / Giornata intera', '💰 Prezzo: A partire da €150 / €250']}
            serviceKey="Wedding Dog Sitter"
          />
        </div>

        {/* CATEGORIA 4: Navetta, Educazione, Consulenza */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <ServiceCard
            emoji="🚗" title="Trasporto Professionale"
            description="Trasporto professionale ed in sicurezza del cane presso veterinario, toelettatura o centri specializzati."
            details={['⏱️ Destinazione: Veterinario / Toeletta / Centro', '💰 Prezzo: Da €15']}
            serviceKey="Servizio Navetta"
          />
          <ServiceCard
            emoji="🦮" title="Educazione Base"
            description="Sessioni di educazione per migliorare l'intesa cane-conduttore, i comandi di base, il richiamo ed autocontrollo."
            details={['⏱️ Durata: 60 minuti a sessione', '💰 Prezzo: €30 a sessione']}
            serviceKey="Educazione Base"
          />
          <ServiceCard
            emoji="🐾" title="Consulenza Pre-Adozione"
            description="Ti guidiamo nella scelta della razza o del cane ideale in canile in base al tuo stile di vita e spazi disponibili."
            details={['⏱️ Durata: 45 minuti a sessione', '💰 Prezzo: €25 a sessione']}
            serviceKey="Consulenza Pre-Adozione"
          />
        </div>
      </div>
    </section>
  );
}

function CategoryHeader({ emoji, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
      <span style={{ fontSize: '1.6rem' }}>{emoji}</span>
      <h3 style={{ fontWeight: 800, fontSize: '1.3rem', color: '#042f2e' }}>{title}</h3>
    </div>
  );
}
