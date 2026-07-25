import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GALLERY_ITEMS } from '../config';
import './Gallery.css';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.9 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 70, damping: 14 },
  },
};

export default function Gallery() {
  const [lightbox, setLightbox] = useState(null);

  const open = useCallback((i) => setLightbox(i), []);
  const close = useCallback(() => setLightbox(null), []);
  const prev = useCallback(
    () => setLightbox((i) => (i - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length),
    []
  );
  const next = useCallback(
    () => setLightbox((i) => (i + 1) % GALLERY_ITEMS.length),
    []
  );

  const handleVideoRef = useCallback((node) => {
    if (node) {
      node.muted = false;
      node.play().catch(e => console.log('Autoplay prevented by browser:', e));
    }
  }, []);

  return (
    <section id="gallery" className="section gallery-section">
      <div className="section-container">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 60 }}
        >
          📸 แกลเลอรีช่วงเวลาแห่งความสุข
        </motion.h2>

        <motion.p
          className="section-subtitle"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          รูปภาพและรอยยิ้มแสนหวานของเรา
        </motion.p>

        <motion.div
          className="gallery-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
        >
          {GALLERY_ITEMS.map((item, i) => (
            <motion.div
              key={i}
              className={`gallery-item${item.wide ? ' gallery-item--wide' : ''}${item.tall ? ' gallery-item--tall' : ''}`}
              variants={itemVariants}
              whileHover={{
                y: -10,
                scale: 1.04,
                rotate: i % 2 === 0 ? 2 : -2,
                boxShadow: '0 20px 45px rgba(255,107,151,0.25)',
              }}
              whileTap={{ scale: 0.96 }}
              onClick={() => open(i)}
              layout
            >
              {item.type === 'video' ? (
                <div className="gallery-img-wrapper">
                  <video src={item.src} className="gallery-img" loop muted playsInline autoPlay />
                  <div className="gallery-overlay">
                    <span className="gallery-label-overlay">{item.label}</span>
                  </div>
                </div>
              ) : item.img || item.src ? (
                <div className="gallery-img-wrapper">
                  <img src={item.img || item.src} alt={item.label} className="gallery-img" loading="lazy" />
                  <div className="gallery-overlay">
                    <span className="gallery-label-overlay">{item.label}</span>
                  </div>
                </div>
              ) : (
                <div
                  className="gallery-placeholder"
                  style={{
                    background: `linear-gradient(135deg, hsl(${item.hue}, 90%, 94%), hsl(${item.hue + 20}, 100%, 88%))`,
                  }}
                >
                  <span className="gallery-icon">{item.emoji || '📷'}</span>
                  <span className="gallery-label">{item.label}</span>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Lightbox Overlay */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            className="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <motion.div
              className="lightbox-inner"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {GALLERY_ITEMS[lightbox].type === 'video' ? (
                <div className="lightbox-img-wrapper">
                  <video
                    key={GALLERY_ITEMS[lightbox].src}
                    ref={handleVideoRef}
                    src={GALLERY_ITEMS[lightbox].src}
                    className="lightbox-img"
                    controls
                    loop
                    playsInline
                  />
                  <div className="lightbox-caption">{GALLERY_ITEMS[lightbox].label}</div>
                </div>
              ) : GALLERY_ITEMS[lightbox].img || GALLERY_ITEMS[lightbox].src ? (
                <div className="lightbox-img-wrapper">
                  <img
                    src={GALLERY_ITEMS[lightbox].img || GALLERY_ITEMS[lightbox].src}
                    alt={GALLERY_ITEMS[lightbox].label}
                    className="lightbox-img"
                  />
                  <div className="lightbox-caption">{GALLERY_ITEMS[lightbox].label}</div>
                </div>
              ) : (
                <div
                  className="lightbox-placeholder"
                  style={{
                    background: `linear-gradient(135deg, hsl(${GALLERY_ITEMS[lightbox].hue}, 90%, 94%), hsl(${GALLERY_ITEMS[lightbox].hue + 20}, 100%, 88%))`,
                  }}
                >
                  <span style={{ fontSize: '5rem' }}>
                    {GALLERY_ITEMS[lightbox].emoji || '📷'}
                  </span>
                  <span style={{ color: 'var(--pink-600)', fontFamily: 'var(--font-title)', fontSize: '1.4rem' }}>
                    {GALLERY_ITEMS[lightbox].label}
                  </span>
                </div>
              )}
            </motion.div>

            <motion.button
              className="lightbox-close"
              whileHover={{ rotate: 90, scale: 1.1 }}
              onClick={close}
            >
              ×
            </motion.button>

            <motion.button
              className="lightbox-nav lightbox-prev"
              whileHover={{ scale: 1.15 }}
              onClick={(e) => { e.stopPropagation(); prev(); }}
            >
              ‹
            </motion.button>
            <motion.button
              className="lightbox-nav lightbox-next"
              whileHover={{ scale: 1.15 }}
              onClick={(e) => { e.stopPropagation(); next(); }}
            >
              ›
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
