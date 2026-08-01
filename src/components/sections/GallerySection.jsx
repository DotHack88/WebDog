import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

/**
 * GallerySection — gallery fotografica con filtri, album e lightbox
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

  // Album lightbox state: when opening an album card we track the album and slide index separately
  const [albumLightbox, setAlbumLightbox] = useState(null); // { images: [], slideIdx: 0, title, desc, category }

  const openAlbum = (img, startIdx = 0) => {
    const albumImages = (img.album && img.album.length > 1) ? img.album : [img.src];
    setAlbumLightbox({ images: albumImages, slideIdx: startIdx, title: img.title, desc: img.desc, category: img.category });
  };

  const closeAlbum = () => setAlbumLightbox(null);

  const navigateAlbum = (dir) => {
    setAlbumLightbox(prev => {
      if (!prev) return prev;
      const total = prev.images.length;
      const newIdx = (prev.slideIdx + dir + total) % total;
      return { ...prev, slideIdx: newIdx };
    });
  };

  const handleCardClick = (img, index) => {
    if (img.album && img.album.length > 1) {
      openAlbum(img, 0);
    } else {
      openLightbox(index);
    }
  };

  // Graceful fallback placeholder for broken/CORS-blocked images (e.g. old Firebase bucket)
  const handleImgError = (e) => {
    e.currentTarget.style.display = 'none';
    const placeholder = e.currentTarget.nextSibling;
    if (placeholder && placeholder.classList.contains('img-placeholder')) {
      placeholder.style.display = 'flex';
    }
  };

  // Dynamically extract unique categories from gallery images
  const dynamicCategories = ['Tutti', ...Array.from(new Set(galleryImages.map(img => img.category)))];

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

          {/* Category Filters — dynamic from galleryImages */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
            {dynamicCategories.map((cat) => (
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
            {filteredGallery.map((img, index) => {
              const isAlbum = img.album && img.album.length > 1;
              return (
                <div
                  key={img.id}
                  onClick={() => handleCardClick(img, index)}
                  className="glass-card"
                  style={{ overflow: 'hidden', cursor: 'pointer', borderRadius: '16px', position: 'relative' }}
                >
                  <div style={{ overflow: 'hidden', aspectRatio: '4/3', position: 'relative' }}>
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
                      onError={handleImgError}
                    />
                    {/* Fallback placeholder for broken/CORS-blocked images */}
                    <div
                      className="img-placeholder"
                      style={{
                        display: 'none', width: '100%', height: '100%',
                        background: 'linear-gradient(135deg, #f0fdf4, #d1fae5)',
                        alignItems: 'center', justifyContent: 'center',
                        flexDirection: 'column', gap: '8px',
                        position: 'absolute', top: 0, left: 0
                      }}
                    >
                      <span style={{ fontSize: '2.5rem' }}>🐾</span>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'center', padding: '0 12px' }}>
                        Immagine non disponibile
                      </span>
                    </div>
                    {/* Album badge */}
                    {isAlbum && (
                      <div style={{
                        position: 'absolute', bottom: '10px', right: '10px',
                        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
                        color: 'white', borderRadius: '999px',
                        display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700
                      }}>
                        📷 {img.album.length} foto
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '16px' }}>
                    <span className="badge" style={{ fontSize: '0.65rem', padding: '2px 8px', marginBottom: '6px' }}>
                      {img.category}
                    </span>
                    <h4 style={{ fontWeight: 800, fontSize: '1rem', color: '#042f2e' }}>{img.title}</h4>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{img.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Standard Lightbox (single image) */}
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
              onError={handleImgError}
            />
            {/* Placeholder inside lightbox */}
            <div
              className="img-placeholder"
              style={{
                display: 'none', minHeight: '200px',
                alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', gap: '10px', color: '#94a3b8'
              }}
            >
              <span style={{ fontSize: '3rem' }}>🐾</span>
              <span>Immagine non disponibile</span>
            </div>

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

      {/* Album Lightbox (slideshow) */}
      {albumLightbox && (
        <div className="lightbox" onClick={closeAlbum}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>

            <button className="lightbox-close" onClick={closeAlbum}>
              <X size={32} />
            </button>

            {albumLightbox.images.length > 1 && (
              <>
                <button className="lightbox-nav lightbox-prev" onClick={() => navigateAlbum(-1)}>
                  <ChevronLeft size={24} />
                </button>
                <button className="lightbox-nav lightbox-next" onClick={() => navigateAlbum(1)}>
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            <img
              className="lightbox-img"
              src={albumLightbox.images[albumLightbox.slideIdx]}
              alt={`${albumLightbox.title} — foto ${albumLightbox.slideIdx + 1}`}
              decoding="async"
              key={albumLightbox.slideIdx}
              style={{ animation: 'fadeIn 0.3s ease' }}
              onError={handleImgError}
            />
            {/* Placeholder inside album lightbox */}
            <div
              className="img-placeholder"
              style={{
                display: 'none', minHeight: '200px',
                alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', gap: '10px', color: '#94a3b8'
              }}
            >
              <span style={{ fontSize: '3rem' }}>🐾</span>
              <span>Immagine non disponibile</span>
            </div>

            <div style={{ marginTop: '16px', textAlign: 'center', color: 'white' }}>
              <span className="badge" style={{ color: '#2dd4bf', background: 'rgba(45, 212, 191, 0.1)', borderColor: 'rgba(45, 212, 191, 0.2)', marginBottom: '8px' }}>
                {albumLightbox.category}
              </span>
              <h3 style={{ fontWeight: 700, fontSize: '1.25rem' }}>{albumLightbox.title}</h3>
              {albumLightbox.desc && (
                <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginTop: '4px' }}>{albumLightbox.desc}</p>
              )}
              {albumLightbox.images.length > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                  {albumLightbox.images.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => setAlbumLightbox(prev => ({ ...prev, slideIdx: idx }))}
                      style={{
                        width: '44px', height: '44px', padding: 0, border: 'none',
                        borderRadius: '6px', overflow: 'hidden', cursor: 'pointer',
                        outline: idx === albumLightbox.slideIdx ? '2px solid #2dd4bf' : '2px solid transparent',
                        outlineOffset: '2px', transition: 'outline 0.15s',
                        opacity: idx === albumLightbox.slideIdx ? 1 : 0.55,
                        position: 'relative'
                      }}
                    >
                      <img
                        src={url}
                        alt={`Miniatura ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={handleImgError}
                      />
                      <div
                        className="img-placeholder"
                        style={{ display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', background: '#f0fdf4', fontSize: '1rem', position: 'absolute', top: 0, left: 0 }}
                      >🐾</div>
                    </button>
                  ))}
                </div>
              )}
              {albumLightbox.images.length > 1 && (
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '8px' }}>
                  {albumLightbox.slideIdx + 1} / {albumLightbox.images.length}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
