import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * BookingSection — calendario interattivo + form prenotazione
 * Props:
 *   bookingForm          {object}
 *   setBookingForm       {function}
 *   handleBookingSubmit  {function}
 *   bookingRateLimit     {object}  — { canSubmit, remainingSeconds }
 *   selectedDetails      {object}  — { price, duration }
 *   calendarDays         {array}
 *   calMonthNameCapitalized {string}
 *   todayDate            {number}
 *   handleCalendarDayClick {function(day)}
 *   triggerToast         {function}
 */
export default function BookingSection({
  bookingForm,
  setBookingForm,
  handleBookingSubmit,
  bookingRateLimit,
  selectedDetails,
  calendarDays,
  calMonthNameCapitalized,
  todayDate,
  handleCalendarDayClick,
  triggerToast,
}) {
  return (
    <section id="prenotazioni" className="section-padding" style={{ background: '#f0fdfa' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="badge" style={{ color: '#0284c7', background: 'rgba(2, 132, 199, 0.1)' }}>📅 PRENOTAZIONI ONLINE</span>
          <h2 className="section-title" style={{ margin: '8px 0 0 0' }}>Prenota un Servizio in un Click</h2>
          <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '560px', margin: '8px auto 0 auto' }}>
            Scegli una data verde disponibile sul calendario mensile ed inserisci i dati del tuo amico a quattro zampe.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'start' }}>

          {/* LEFT — Calendario */}
          <div className="glass-panel" style={{ padding: '24px' }}>

            {/* Range toggle */}
            <div style={{
              background: 'rgba(15, 118, 110, 0.05)', padding: '12px 16px', borderRadius: '12px',
              marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: '10px', border: '1px solid rgba(15, 118, 110, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox" id="isRangeCheckbox"
                  checked={bookingForm.isRange}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setBookingForm(prev => ({ ...prev, isRange: checked, date: '', endDate: '' }));
                    triggerToast(
                      checked ? 'Seleziona Multi-Giorno Attivo' : 'Giorno Singolo Attivo',
                      checked ? 'Ora puoi selezionare un intervallo di date nel calendario.' : 'Seleziona una singola data.',
                      'info', 'Calendario'
                    );
                  }}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="isRangeCheckbox" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#042f2e', cursor: 'pointer', userSelect: 'none' }}>
                  📅 Ho bisogno di più giorni consecutivi
                </label>
              </div>
              {(bookingForm.date || bookingForm.endDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setBookingForm(prev => ({ ...prev, date: '', endDate: '' }));
                    triggerToast('Selezione Reset', 'La selezione delle date è stata cancellata.', 'info', 'Calendario');
                  }}
                  style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  Reset 🔄
                </button>
              )}
            </div>

            {/* Calendar */}
            <div className="calendar-container">
              <div className="calendar-header">
                <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f2d2a' }}>{calMonthNameCapitalized}</h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}><ChevronLeft size={20} /></button>
                  <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}><ChevronRight size={20} /></button>
                </div>
              </div>

              <div className="calendar-grid">
                {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((d) => (
                  <div key={d} className="calendar-day-label">{d}</div>
                ))}

                {calendarDays.map((day) => {
                  const isCellSelected = bookingForm.isRange
                    ? day.dateStr === bookingForm.date ? 'selected-start'
                      : day.dateStr === bookingForm.endDate ? 'selected-end'
                      : bookingForm.date && bookingForm.endDate && day.dateStr > bookingForm.date && day.dateStr < bookingForm.endDate ? 'in-range'
                      : ''
                    : day.dateStr === bookingForm.date ? 'selected' : '';

                  return (
                    <div
                      key={day.dayNum}
                      onClick={() => handleCalendarDayClick(day)}
                      className={`calendar-cell ${isCellSelected}`}
                      style={{ opacity: day.dayNum < todayDate ? 0.4 : 1, cursor: day.dayNum < todayDate ? 'not-allowed' : 'pointer' }}
                    >
                      <span className="calendar-cell-num">{day.dayNum}</span>
                      <span className={`calendar-cell-status ${day.status === 'available' ? 'status-available' : day.status === 'pending' ? 'status-pending' : 'status-occupied'}`} />
                    </div>
                  );
                })}
              </div>

              {/* Legenda */}
              <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.8rem', fontWeight: 600, marginTop: '16px', borderTop: '1px solid rgba(15, 118, 110, 0.15)', paddingTop: '12px' }}>
                <span>🟢 Disponibile</span>
                <span>🟡 In Attesa</span>
                <span>🔴 Occupato</span>
              </div>
            </div>
          </div>

          {/* RIGHT — Form */}
          <div className="glass-panel" style={{ padding: '30px' }}>
            <form onSubmit={handleBookingSubmit}>
              <h4 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f2d2a', marginBottom: '20px' }}>Dettagli Appuntamento</h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label className="form-label">NOME</label>
                  <input type="text" placeholder="Emanuele" required className="form-input"
                    value={bookingForm.firstName} onChange={(e) => setBookingForm({ ...bookingForm, firstName: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">COGNOME</label>
                  <input type="text" placeholder="Vanni" required className="form-input"
                    value={bookingForm.lastName} onChange={(e) => setBookingForm({ ...bookingForm, lastName: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label className="form-label">TELEFONO</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      className="form-input"
                      style={{ width: 'auto', padding: '0 8px', maxWidth: '80px' }}
                      value={bookingForm.phonePrefix}
                      onChange={(e) => setBookingForm({ ...bookingForm, phonePrefix: e.target.value })}
                    >
                      <option value="+39">🇮🇹 +39</option>
                      <option value="+41">🇨🇭 +41</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+49">🇩🇪 +49</option>
                      <option value="+33">🇫🇷 +33</option>
                      <option value="+34">🇪🇸 +34</option>
                      <option value="+1">🇺🇸 +1</option>
                    </select>
                    <input type="tel" placeholder="3334567890" required className="form-input" style={{ flex: 1 }}
                      value={bookingForm.phone} onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="form-label">E-MAIL</label>
                  <input type="email" placeholder="proprietario@cane.it" required className="form-input"
                    value={bookingForm.email} onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '10px', marginBottom: '16px' }}>
                <div>
                  <label className="form-label">NOME CANE</label>
                  <input type="text" placeholder="Thor" required className="form-input"
                    value={bookingForm.dogName} onChange={(e) => setBookingForm({ ...bookingForm, dogName: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">RAZZA</label>
                  <input type="text" placeholder="Golden" required className="form-input"
                    value={bookingForm.dogBreed} onChange={(e) => setBookingForm({ ...bookingForm, dogBreed: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">ETÀ CANE (ANNI O MESI)</label>
                  <input type="text" placeholder="es: 3 anni, 6 mesi" required className="form-input"
                    value={bookingForm.dogAge} onChange={(e) => setBookingForm({ ...bookingForm, dogAge: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label className="form-label">SERVIZIO RICHIESTO</label>
                  <select value={bookingForm.service} onChange={(e) => setBookingForm({ ...bookingForm, service: e.target.value })} className="form-input">
                    <optgroup label="🏡 Presso la casa del Sitter">
                      <option value="Dog Sitting Diurno (Sitter)">☀️ Dog Sitting Diurno — €25</option>
                      <option value="Dog Sitting Pensione (Sitter)">🌙 Dog Sitting Pensione — €35</option>
                    </optgroup>
                    <optgroup label="🦮 Presso l'abitazione del Cliente">
                      <option value="Dog Sitting Diurno (Domicilio)">🏠 Dog Sitting Diurno — €20/€40</option>
                      <option value="Dog Sitting Pensione">🛌 Dog Sitting Pensione — €50</option>
                    </optgroup>
                    <optgroup label="🌳 In Giro per la Città">
                      <option value="Dog Walking (30m)">🦮 Dog Walking 30min — €20</option>
                      <option value="Dog Walking (60m)">🦮 Dog Walking 60min — €35</option>
                    </optgroup>
                    <optgroup label="🚌 Navetta & Formazione">
                      <option value="Servizio Navetta">🚗 Servizio Navetta — Da €15</option>
                      <option value="Educazione Base">🎓 Educazione Base — €30</option>
                      <option value="Consulenza Pre-Adozione">📋 Consulenza Pre-Adozione — €25</option>
                    </optgroup>
                    <optgroup label="👑 Wedding Dog Sitter">
                      <option value="Wedding Dog Sitter">💍 Wedding Dog Sitter — Da €150</option>
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="form-label">ORARIO</label>
                  <input type="time" required className="form-input"
                    value={bookingForm.time} onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })} />
                </div>
              </div>

              {/* Data selezionata */}
              <div style={{ marginBottom: '20px' }}>
                <label className="form-label">DATA SELEZIONATA</label>
                <input
                  type="text" disabled className="form-input"
                  value={
                    bookingForm.isRange
                      ? bookingForm.date
                        ? bookingForm.endDate
                          ? `Dal ${new Date(bookingForm.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })} al ${new Date(bookingForm.endDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}`
                          : `Dal ${new Date(bookingForm.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })} (seleziona la data di fine...)`
                        : 'Scegli la data di inizio dal calendario 📅'
                      : bookingForm.date
                      ? new Date(bookingForm.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
                      : 'Scegli la data dal calendario 📅'
                  }
                  style={{
                    background: bookingForm.isRange
                      ? bookingForm.date && bookingForm.endDate ? '#d1fae5' : bookingForm.date ? '#fef9c3' : '#fee2e2'
                      : bookingForm.date ? '#d1fae5' : '#fee2e2',
                    border: 'none', fontWeight: 700, color: '#042f2e'
                  }}
                />
              </div>

              {/* Note */}
              <div style={{ marginBottom: '20px' }}>
                <label className="form-label">NOTE SPECIALI O PATOLOGIE</label>
                <textarea
                  placeholder="Scrivi qui eventuali fobie, allergie o raccomandazioni importanti..."
                  rows="2" className="form-input" style={{ resize: 'none' }}
                  value={bookingForm.notes} onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })} />
              </div>

              {/* Pagamento */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '12px' }}>MODALITÀ DI PAGAMENTO</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { value: 'contanti', label: 'Contanti' },
                    { value: 'paypal', label: 'PayPal' },
                    { value: 'revolut', label: 'Revolut' },
                    { value: 'iban', label: 'Bonifico (IBAN)' },
                  ].map(({ value, label }) => (
                    <div key={value}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                        <input type="radio" name="payment" value={value}
                          checked={bookingForm.paymentMethod === value}
                          onChange={() => setBookingForm({ ...bookingForm, paymentMethod: value })} />
                        {label}
                      </label>
                      {bookingForm.paymentMethod === 'paypal' && value === 'paypal' && (
                        <div style={{ marginLeft: '24px', fontSize: '0.8rem', color: '#0f766e' }}>Email PayPal: <strong>tidus291@hotmail.com</strong></div>
                      )}
                      {bookingForm.paymentMethod === 'revolut' && value === 'revolut' && (
                        <div style={{ marginLeft: '24px', fontSize: '0.8rem', color: '#0f766e' }}>Link: <a href="https://revolut.me/emanuebh6m" target="_blank" rel="noreferrer" style={{ color: '#0284c7' }}>revolut.me/emanuebh6m</a></div>
                      )}
                      {bookingForm.paymentMethod === 'iban' && value === 'iban' && (
                        <div style={{ marginLeft: '24px', fontSize: '0.8rem', color: '#0f766e' }}>IBAN: <strong>IT58M0329601601000067602411</strong></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing preview */}
              <div style={{ background: '#ccfbf1', padding: '14px 20px', borderRadius: '12px', border: '1px solid #99f6e4', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h5 style={{ fontWeight: 800, color: '#0f766e', fontSize: '0.95rem' }}>Riepilogo preventivato</h5>
                  <p style={{ fontSize: '0.75rem', color: '#0f766e' }}>{selectedDetails.duration}</p>
                </div>
                <strong style={{ fontSize: '1.5rem', color: '#0f766e', fontWeight: 800 }}>€{selectedDetails.price}</strong>
              </div>

              {/* GDPR */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '24px' }}>
                <input type="checkbox" id="gdpr" required style={{ marginTop: '4px', cursor: 'pointer' }}
                  checked={bookingForm.gdpr} onChange={(e) => setBookingForm({ ...bookingForm, gdpr: e.target.checked })} />
                <label htmlFor="gdpr" style={{ fontSize: '0.75rem', color: '#64748b', cursor: 'pointer' }}>
                  Dichiaro di aver preso visione dell'informativa privacy GDPR e autorizzo il trattamento dei dati forniti e del mio cane per scopi amministrativi e di contatto.
                </label>
              </div>

              <button
                type="submit" className="btn btn-primary"
                disabled={!bookingRateLimit.canSubmit}
                style={{ width: '100%', padding: '16px', opacity: bookingRateLimit.canSubmit ? 1 : 0.6, cursor: bookingRateLimit.canSubmit ? 'pointer' : 'not-allowed' }}
              >
                {bookingRateLimit.canSubmit ? 'Conferma Prenotazione' : `Attendi ${bookingRateLimit.remainingSeconds}s…`}
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}
