import React from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

/**
 * GallerySection — gallery fotografica con filtri e lightbox
 * Props:
 *   galleryImages       {array}
 *   activeFilter        {string}
 *   setActiveFilter     {function}
 *   lightboxIndex       {number|null}
 *   setLightboxIndex    {function}
 *   openLightbox        {function(index)}
 *   navigateLightbox    {function(direction)}
 */
export default function GallerySection({
  galleryImages,
  activeFilter,
  setActiveFilter,
  lightboxIndex,
  setLightboxIndex,
  openLightbox,
  navigateLightbox,
}) {
  const filteredGallery = activeFilter === 'Tutti'
    ? galleryImages
    : galleryImages.filter(img => img.category === activeFilter);

  return (
    <>
      <section id="gallery" className="section-padding" style={{ background: '#f8fafc' }}>
        <div className="container">

          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="badge">📸 GALLERIA ATTIVITÀ</span>
            <h2 className="section-title" style={{ margin: '8px 0 0 0' }}>Momenti di Felicità Cinofila</h2>
            <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '560px', margin: '8px auto 0 auto' }}>
              Fotografie scattate durante le nostre attività all'aperto, nei percorsi educativi ed eventi di socializzazione.
            </p>
          </div>

          {/* Category Filters */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
            {['Tutti', 'Passeggiate', 'Dog Sitting', 'Educazione', 'Eventi', 'I Miei Sport'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                style={{
                  border: 'none',
                  background: activeFilter === cat ? '#0f766e' : 'white',
                  color: activeFilter === cat ? 'white' : '#64748b',
                  padding: '8px 18px', borderRadius: '9999px',
                  fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Image Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {filteredGallery.map((img, index) => (
              <div
                key={img.id}
                onClick={() => openLightbox(index)}
                className="glass-card"
                style={{ overflow: 'hidden', cursor: 'pointer', borderRadius: '16px', position: 'relative' }}
              >
                <div style={{ overflow: 'hidden', aspectRatio: '4/3' }}>
                  <img
                    src={img.src}
                    alt={img.title}
                    loading="lazy"
                    decoding="async"
                    style={{
                      width: '100%', height: '100%', objectFit: 'cover',
                      display: 'block', transition: 'transform 0.5s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
                  />
                </div>
                <div style={{ padding: '16px' }}>
                  <span className="badge" style={{ fontSize: '0.65rem', padding: '2px 8px', marginBottom: '6px' }}>
                    {img.category}
                  </span>
                  <h4 style={{ fontWeight: 800, fontSize: '1rem', color: '#042f2e' }}>{img.title}</h4>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{img.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Overlay */}
      {lightboxIndex !== null && (
        <div className="lightbox" onClick={() => setLightboxIndex(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>

            <button className="lightbox-close" onClick={() => setLightboxIndex(null)}>
              <X size={32} />
            </button>

            <button className="lightbox-nav lightbox-prev" onClick={() => navigateLightbox(-1)}>
              <ChevronLeft size={24} />
            </button>
            <button className="lightbox-nav lightbox-next" onClick={() => navigateLightbox(1)}>
              <ChevronRight size={24} />
            </button>

            <img
              className="lightbox-img"
              src={filteredGallery[lightboxIndex].src}
              alt={filteredGallery[lightboxIndex].title}
              decoding="async"
            />

            <div style={{ marginTop: '16px', textAlign: 'center', color: 'white' }}>
              <span className="badge" style={{ color: '#2dd4bf', background: 'rgba(45, 212, 191, 0.1)', borderColor: 'rgba(45, 212, 191, 0.2)', marginBottom: '8px' }}>
                {filteredGallery[lightboxIndex].category}
              </span>
              <h3 style={{ fontWeight: 700, fontSize: '1.25rem' }}>{filteredGallery[lightboxIndex].title}</h3>
              <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginTop: '4px' }}>{filteredGallery[lightboxIndex].desc}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
