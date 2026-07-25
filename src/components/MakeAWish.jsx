import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from './Confetti';
import './MakeAWish.css';

const FINAL_HEARTS = ['💖', '💗', '🌸', '🎀', '💝', '✨', '🎂'];

function Flame({ active, delay }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="flame-wrap"
          initial={{ scale: 1, opacity: 1 }}
          exit={{
            scale: 0,
            opacity: 0,
            y: -12,
            transition: { duration: 0.4, delay },
          }}
        >
          <motion.div
            className="flame-outer"
            animate={{
              scaleX: [1, 1.08, 0.92, 1],
              scaleY: [1, 0.92, 1.08, 1],
              rotate: [-2, 2, -2],
            }}
            transition={{ duration: 0.35, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="flame-inner"
            animate={{
              scaleX: [1, 0.9, 1.1, 1],
              scaleY: [1, 1.1, 0.9, 1],
            }}
            transition={{
              duration: 0.4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.1,
            }}
          />
          <motion.div
            className="flame-glow"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function MakeAWish() {
  const [flames, setFlames] = useState([true, true, true]);
  const [blown, setBlown] = useState(false);
  const [showMsg, setShowMsg] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);

  const handleBlow = () => {
    if (blown) return;
    setBlown(true);

    flames.forEach((_, i) => {
      setTimeout(() => {
        setFlames((prev) => {
          const next = [...prev];
          next[i] = false;
          return next;
        });
      }, i * 350);
    });

    setTimeout(() => {
      setConfettiActive(true);
    }, flames.length * 350 + 300);

    setTimeout(() => {
      setShowMsg(true);
    }, flames.length * 350 + 700);
  };

  const messageStagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
  };

  const messageFade = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 60 } },
  };

  return (
    <section id="cake" className="section cake-section">
      <div className="section-container">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 60 }}
        >
          🎂 อธิษฐานเป่าเค้กวันเกิด
        </motion.h2>

        <motion.p
          className="cake-description"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          หลับตาอธิษฐานสิ่งดีๆ แล้วกดเป่าเค้กเลยนะ! 🌟✨
        </motion.p>

        <motion.div
          className="cake-wrapper"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 60, damping: 12 }}
        >
          <div className="cake">
            <div className="candles-row">
              {flames.map((active, i) => (
                <div className="candle-unit" key={i}>
                  <div className="flame-placeholder">
                    <Flame active={active} delay={0} />
                  </div>
                  <div className="candle-stick" />
                </div>
              ))}
            </div>

            <div className="cake-layer cake-top-layer">
              <div className="frosting-drip-container">
                <div className="frosting-drip drip-1" />
                <div className="frosting-drip drip-2" />
                <div className="frosting-drip drip-3" />
                <div className="frosting-drip drip-4" />
                <div className="frosting-drip drip-5" />
              </div>
              <motion.div
                className="cake-strawberry"
                animate={{ y: [0, -4, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                🍓✨
              </motion.div>
            </div>
            <div className="cake-layer cake-mid-layer">
              <span className="cake-text-happy">HAPPY</span>
            </div>
            <div className="cake-layer cake-bot-layer">
              <span className="cake-text-birthday">BIRTHDAY</span>
            </div>
            <div className="cake-plate" />
          </div>
        </motion.div>

        <AnimatePresence>
          {!blown && (
            <motion.button
              className="blow-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, scale: [1, 1.04, 1] }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ scale: { duration: 2, repeat: Infinity } }}
              whileHover={{
                y: -4,
                scale: 1.08,
                boxShadow: '0 12px 35px rgba(224,40,104,0.45)',
              }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBlow}
            >
              <span>🌬️ เป่าเค้กเลย!</span>
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showMsg && (
            <motion.div
              className="final-message"
              variants={messageStagger}
              initial="hidden"
              animate="show"
            >
              <motion.h2 className="final-title" variants={messageFade}>
                🎉 สุขสันต์วันเกิดนะพลอย! 🎉
              </motion.h2>
              <motion.p className="final-text" variants={messageFade}>
                ขอให้มีความสุขในทุกๆ วัน สุขภาพแข็งแรง
                <br />
                เป็นรอยยิ้มที่สดใสและพบเจอแต่สิ่งดีๆ นะ
                <br />
                ขอให้เป็นปีที่แสนพิเศษของพลอยเลยนะ 💕🎂🎁✨
              </motion.p>
              <motion.div className="final-hearts" variants={messageFade}>
                {FINAL_HEARTS.map((h, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 30, scale: 0 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 200,
                      damping: 12,
                      delay: 0.4 + i * 0.1,
                    }}
                  >
                    {h}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Confetti active={confettiActive} />
    </section>
  );
}
