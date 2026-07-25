import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GIFT_SURPRISE } from '../config';
import Confetti from './Confetti';
import './GiftSurprise.css';

export default function GiftSurprise() {
  const [isOpen, setIsOpen] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [claimed, setClaimed] = useState({});

  // ล็อคการเลื่อนหน้าจอพื้นหลัง (Scroll Lock) เมื่อเปิดกล่องของขวัญ
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const openGift = () => {
    setIsOpen(true);
    setConfettiActive(true);
  };

  const closeGift = () => {
    setIsOpen(false);
    setConfettiActive(false);
  };

  const toggleClaim = (index) => {
    setClaimed((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const floatingIcons = [
    { icon: '✨', left: '-35px', top: '-10px', delay: 0 },
    { icon: '💖', left: '130px', top: '15px', delay: 0.5 },
    { icon: '🌸', left: '-25px', top: '85px', delay: 1 },
    { icon: '🌟', left: '125px', top: '95px', delay: 1.5 },
  ];

  return (
    <div className="gift-stage">
      {/* Background Ambient Glow */}
      <motion.div
        className="gift-ambient-glow"
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* 3D Luxury Present Box */}
      <motion.div
        className="luxury-gift-container"
        whileHover={{ scale: 1.08, y: -6 }}
        whileTap={{ scale: 0.95 }}
        onClick={openGift}
      >
        {/* Floating Magic Icons around Box */}
        {floatingIcons.map((item, idx) => (
          <motion.span
            key={idx}
            className="gift-floating-star"
            style={{ left: item.left, top: item.top }}
            animate={{
              y: [0, -10, 0],
              scale: [0.9, 1.2, 0.9],
              rotate: [0, 15, -15, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: item.delay,
              ease: 'easeInOut',
            }}
          >
            {item.icon}
          </motion.span>
        ))}

        <div className="luxury-gift-box">
          {/* Lid & Bow */}
          <div className="luxury-gift-lid">
            <div className="luxury-bow">
              <div className="bow-loop-left" />
              <div className="bow-loop-right" />
              <div className="bow-tail-left" />
              <div className="bow-tail-right" />
              <div className="bow-center-knot" />
            </div>
            <div className="lid-gold-rim" />
          </div>

          {/* Box Body & Ribbons */}
          <div className="luxury-gift-body">
            <div className="luxury-ribbon-v" />
            <div className="luxury-ribbon-h" />
            <div className="box-shine" />
          </div>
        </div>
      </motion.div>

      {/* Pedestal Shadow under the box */}
      <div className="gift-pedestal-shadow" />

      {/* Call To Action Badge */}
      <motion.div
        className="gift-cta-banner"
        whileHover={{ scale: 1.04, boxShadow: '0 15px 35px rgba(224,40,104,0.35)' }}
        whileTap={{ scale: 0.97 }}
        animate={{ y: [0, -4, 0] }}
        transition={{ y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } }}
        onClick={openGift}
      >
        <span className="cta-gift-icon">🎁</span>
        <span>แตะที่กล่องของขวัญเพื่อเปิดคูปองพิเศษ! ✨</span>
      </motion.div>

      {/* VIP Surprise Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="gift-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeGift}
          >
            <motion.div
              className="luxury-modal-card"
              initial={{ scale: 0.7, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 160, damping: 18 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header-badge">👑 SPECIAL PRIVILEGES FOR PLOY 👑</div>

              <h3 className="gift-modal-title">{GIFT_SURPRISE.title}</h3>
              <p className="gift-modal-subtitle">{GIFT_SURPRISE.subtitle}</p>

              <p className="claim-instruction">
                💡 <em>คลิกที่คูปองด้านล่างเพื่อกดเลือกรับสิทธิ์ได้เลยนะ!</em>
              </p>

              <div className="vip-vouchers-list">
                {GIFT_SURPRISE.vouchers.map((v, i) => {
                  const isClaimed = !!claimed[i];
                  const icons = ['🎟️', '🍦', '🎬'];
                  const ticketIcon = icons[i % icons.length];

                  return (
                    <motion.div
                      key={i}
                      className={`vip-voucher-ticket ${isClaimed ? 'claimed' : ''}`}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.15, type: 'spring', stiffness: 120 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleClaim(i)}
                    >
                      <div className="ticket-notch notch-left" />
                      <div className="ticket-notch notch-right" />

                      <div className="ticket-stub">
                        <span className="stub-icon">{ticketIcon}</span>
                        <span className="stub-label">VIP #{i + 1}</span>
                      </div>

                      <div className="ticket-divider" />

                      <div className="ticket-content">
                        <span className="ticket-text">{v}</span>
                        <div className="ticket-action">
                          {isClaimed ? (
                            <span className="badge-claimed">✅ เก็บสิทธิ์แล้ว!</span>
                          ) : (
                            <span className="badge-claim-prompt">👆 แตะเพื่อรับสิทธิ์</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <p className="gift-modal-msg">{GIFT_SURPRISE.message}</p>

              <motion.button
                className="luxury-close-btn"
                whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(224,40,104,0.45)' }}
                whileTap={{ scale: 0.95 }}
                onClick={closeGift}
              >
                💖 พับเก็บกล่องของขวัญ (ใช้เมื่อไหร่ก็ได้ตามใจพลอย!)
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Confetti active={confettiActive} />
    </div>
  );
}
