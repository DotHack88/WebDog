import React from 'react';

const FAQ_ITEMS = [
  { q: 'Quanto costa il dog sitting a Napoli?', a: 'Il dog sitting diurno parte da €20 a mezza giornata presso il tuo domicilio, o €25 presso casa nostra. Il pernottamento (pensione) è da €35 a notte. Ogni servizio è personalizzabile in base alle tue esigenze.' },
  { q: 'Quali zone di Napoli coprite?', a: 'Con base ad Arzano (NA), opero in un raggio di 35 km che copre tutta Napoli e provincia: Casoria, Afragola, Frattamaggiore, Giugliano, Acerra, Aversa, Pozzuoli, Portici, Ercolano, Torre del Greco, Nola, Caserta, Pompei e Castellammare di Stabia. Per qualsiasi altro comune contattaci direttamente.' },
  { q: 'Come faccio a prenotare?', a: 'Puoi prenotare direttamente dal sito cliccando "Prenota Ora", selezionando un giorno verde disponibile nel calendario e compilando il modulo. Riceverai conferma via email e verrai contattato entro 24 ore.' },
  { q: 'Emanuele è un educatore certificato?', a: 'Sì! Emanuele Barese è Educatore Cinofilo Certificato CSEN (Iscrizione Albo Nazionale n. 42081, riconosciuto CONI) e usa esclusivamente metodi basati sul rinforzo positivo, senza coercizione.' },
  { q: 'Gestite anche cuccioli?', a: 'Certo! Gestiamo cuccioli di tutte le età. Offriamo sessioni specifiche di Puppy Class per cuccioli dai 3 ai 6 mesi, fondamentali per la socializzazione precoce e la prevenzione di problemi comportamentali.' },
  { q: 'Fate il servizio navetta?', a: 'Sì, il Servizio Navetta è disponibile per trasportare il tuo cane in sicurezza presso veterinari, toelettatori o centri specializzati a Napoli e Provincia. Il prezzo parte da €15.' },
];

export default function FaqSection() {
  return (
    <section id="faq" style={{ background: '#f0fdfa', padding: '80px 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="badge">❓ DOMANDE FREQUENTI</span>
          <h2 className="section-title" style={{ margin: '8px 0 0 0' }}>Hai Domande? Abbiamo le Risposte</h2>
          <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '560px', margin: '8px auto 0 auto' }}>
            Tutto quello che devi sapere prima di prenotare un servizio WebDog a Napoli e Provincia.
          </p>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {FAQ_ITEMS.map(({ q, a }, idx) => (
            <div key={idx} className="glass-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#042f2e', marginBottom: '8px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ color: '#0f766e', flexShrink: 0 }}>Q.</span> {q}
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.65, margin: 0, paddingLeft: '22px' }}>{a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
