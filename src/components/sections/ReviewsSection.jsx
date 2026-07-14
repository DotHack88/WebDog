import React from 'react';
import { Star } from 'lucide-react';

/**
 * ReviewsSection — feed recensioni + form invio
 * Props:
 *   reviews                {array}
 *   reviewForm             {object}
 *   setReviewForm          {function}
 *   handleReviewSubmit     {function}
 *   handleReviewPhotoUpload {function}
 *   averageStars           {string|number}
 */
export default function ReviewsSection({
  reviews,
  reviewForm,
  setReviewForm,
  handleReviewSubmit,
  handleReviewPhotoUpload,
  averageStars,
}) {
  return (
    <section id="recensioni" className="section-padding" style={{ background: 'white' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="badge">⭐ RECENSIONI CLIENTI</span>
          <h2 className="section-title" style={{ margin: '8px 0 0 0' }}>La Parola ai Nostri Clienti</h2>
          <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '560px', margin: '8px auto 0 auto' }}>
            Leggi le opinioni di chi ha già provato i nostri servizi cinofili. La felicità del cane è la nostra migliore referenza.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'start' }}>

          {/* Left — Stats + Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Rating aggregate */}
            <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>VALUTAZIONE COMPLESSIVA</span>
              <h3 style={{ fontSize: '3rem', fontWeight: 800, color: '#0f766e', margin: '4px 0' }}>
                {averageStars} <span style={{ fontSize: '1.25rem', color: '#cbd5e1' }}>/ 5.0</span>
              </h3>
              <div className="star-rating" style={{ justifyContent: 'center', marginBottom: '12px' }}>
                {[...Array(5)].map((_, idx) => (
                  <Star key={idx} size={20} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                ))}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Basato su {reviews.length} feedback spontanei.</p>
            </div>

            {/* Review form */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <form onSubmit={handleReviewSubmit}>
                <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f2d2a', marginBottom: '16px' }}>
                  Lascia la tua Recensione
                </h4>

                <div style={{ marginBottom: '12px' }}>
                  <label className="form-label">NOME CLIENTE</label>
                  <input type="text" placeholder="Alessandro N." required className="form-input"
                    value={reviewForm.name} onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label className="form-label">NOME CANE</label>
                    <input type="text" placeholder="Thor" required className="form-input"
                      value={reviewForm.dogName} onChange={(e) => setReviewForm({ ...reviewForm, dogName: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label">RAZZA</label>
                    <input type="text" placeholder="Golden" required className="form-input"
                      value={reviewForm.dogBreed} onChange={(e) => setReviewForm({ ...reviewForm, dogBreed: e.target.value })} />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label">VALUTAZIONE (1-5 STELLE)</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map((val) => (
                      <Star
                        key={val}
                        size={24}
                        onClick={() => setReviewForm({ ...reviewForm, rating: val })}
                        style={{
                          cursor: 'pointer',
                          color: val <= reviewForm.rating ? '#fbbf24' : '#cbd5e1',
                          fill: val <= reviewForm.rating ? '#fbbf24' : 'transparent',
                          transition: 'all 0.1s'
                        }}
                        className="star-interactive"
                      />
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label className="form-label">IL TUO COMMENTO</label>
                  <textarea
                    placeholder="Raccontaci la tua esperienza con il servizio cinofilo..."
                    required rows="3" className="form-input" style={{ resize: 'none' }}
                    value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label className="form-label">ALLEGA FOTO (OPZIONALE)</label>
                  <input type="file" accept="image/*" onChange={handleReviewPhotoUpload}
                    className="form-input" style={{ padding: '8px' }} />
                  {reviewForm.photo && (
                    <div style={{ marginTop: '10px' }}>
                      <img src={reviewForm.photo} alt="Anteprima" loading="lazy" decoding="async"
                        style={{ height: '80px', borderRadius: '8px', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Pubblica Recensione
                </button>
              </form>
            </div>
          </div>

          {/* Right — Reviews feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reviews.map((rev) => (
              <div key={rev.id} className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{
                      background: '#ccfbf1', color: '#0f766e',
                      width: '40px', height: '40px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.9rem'
                    }}>
                      {rev.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h5 style={{ fontWeight: 800, fontSize: '0.95rem' }}>{rev.name}</h5>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Proprietario di <strong>{rev.dogName}</strong> ({rev.dogBreed})
                      </span>
                    </div>
                  </div>
                  <div className="star-rating">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} style={{
                        color: i < rev.rating ? '#fbbf24' : '#cbd5e1',
                        fill: i < rev.rating ? '#fbbf24' : 'transparent'
                      }} />
                    ))}
                  </div>
                </div>

                <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }}>
                  "{rev.comment}"
                </p>

                {rev.photo && (
                  <div style={{ marginTop: '16px' }}>
                    <img src={rev.photo} alt={`Foto caricata da ${rev.name}`} loading="lazy" decoding="async"
                      style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '12px' }} />
                  </div>
                )}

                <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', textAlign: 'right', marginTop: '12px' }}>
                  Data recensione: {rev.date}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
