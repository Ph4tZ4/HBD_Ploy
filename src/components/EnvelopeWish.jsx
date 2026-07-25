import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WISH_TEXT } from '../config';
import './EnvelopeWish.css';

export default function EnvelopeWish() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="envelope-container">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="envelope-closed"
            className="envelope-wrapper closed"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0, rotateY: 90 }}
            whileHover={{ scale: 1.03, boxShadow: '0 20px 50px rgba(255, 107, 151, 0.25)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsOpen(true)}
          >
            <motion.div
              className="wax-seal"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              💌
            </motion.div>
            <h3 className="envelope-title">จดหมายอวยพรวันเกิดถึงพลอย 💌</h3>
            <p className="envelope-subtitle">✨ แตะเปิดซองจดหมายเพื่ออ่านข้อความพิเศษตรงนี้ ✨</p>
          </motion.div>
        ) : (
          <motion.div
            key="letter-open"
            className="envelope-wrapper letter-paper"
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 14 }}
          >
            <div className="letter-header">Dear Ploy... 🌹</div>
            <motion.div
              className="letter-body"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
            >
              {WISH_TEXT}
            </motion.div>
            <div className="letter-footer">— ด้วยความหวังดีและคิดถึงเสมอ 💕</div>

            <motion.button
              className="close-letter-btn"
              whileHover={{ background: 'var(--pink-100)', scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsOpen(false)}
            >
              ✉️ พับเก็บซองจดหมาย
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
