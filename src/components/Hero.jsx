import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { BIRTHDAY_MONTH, BIRTHDAY_DAY } from '../config';
import './Hero.css';

const EMOJIS = ['🎂', '🎁', '🎈', '🌸', '💖'];
const FLOATING_DECOS = [
  { left: '8%', top: '18%', icon: '🌸', delay: 0 },
  { left: '86%', top: '16%', icon: '✨', delay: 0.5 },
  { left: '14%', top: '75%', icon: '🎀', delay: 1 },
];

function getCountdown() {
  const now = new Date();
  const year = now.getFullYear();
  let bday = new Date(year, BIRTHDAY_MONTH, BIRTHDAY_DAY);

  const isToday =
    now.getMonth() === BIRTHDAY_MONTH && now.getDate() === BIRTHDAY_DAY;

  if (isToday) return { isToday: true, d: 0, h: 0, m: 0, s: 0 };

  if (now > bday) bday = new Date(year + 1, BIRTHDAY_MONTH, BIRTHDAY_DAY);

  const diff = bday - now;
  return {
    isToday: false,
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff / 3600000) % 24),
    m: Math.floor((diff / 60000) % 60),
    s: Math.floor((diff / 1000) % 60),
  };
}

export default function Hero() {
  const [cd, setCd] = useState(getCountdown);

  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  useEffect(() => {
    const id = setInterval(() => setCd(getCountdown()), 1000);
    return () => clearInterval(id);
  }, []);

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 15 } },
  };

  return (
    <section id="hero" className="section hero-section">
      {/* Floating Petals / Icons */}
      {FLOATING_DECOS.map((item, i) => (
        <motion.span
          key={i}
          className="floating-ribbon"
          style={{ left: item.left, top: item.top }}
          animate={{
            y: [0, -15, 0],
            rotate: [0, 10, -10, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: item.delay,
            ease: 'easeInOut',
          }}
        >
          {item.icon}
        </motion.span>
      ))}

      <motion.div
        className="hero-content"
        style={{ y: heroY, opacity: heroOpacity }}
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.p className="hero-subtitle" variants={fadeUp}>
          🌸 วันพิเศษของคนสำคัญ 🌸
        </motion.p>

        <motion.h1 variants={fadeUp}>
          <span className="title-line">Happy Birthday</span>
          <motion.span
            className="title-name"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            Ploy
          </motion.span>
        </motion.h1>

        <motion.div className="hero-emoji-row" variants={fadeUp}>
          {EMOJIS.map((e, i) => (
            <motion.span
              key={i}
              className="bounce-emoji"
              animate={{ y: [0, -12, 0] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            >
              {e}
            </motion.span>
          ))}
        </motion.div>

        {cd.isToday ? (
          <motion.div
            variants={fadeUp}
            style={{
              marginBottom: 36,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <motion.span
              className="glow-text"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              🎉 It&apos;s Your Special Day! 🎉
            </motion.span>
            <span className="hero-birthday-msg">
              🎂 วันนี้เป็นวันเกิดของพลอยแล้ว ขอให้เป็นวันที่ยอดเยี่ยมที่สุดเลยนะ! ✨
            </span>
          </motion.div>
        ) : (
          <motion.div className="countdown" variants={fadeUp}>
            {[
              { val: cd.d, label: 'Days' },
              { val: cd.h, label: 'Hours' },
              { val: cd.m, label: 'Minutes' },
              { val: cd.s, label: 'Seconds' },
            ].map(({ val, label }, i) => (
              <div key={label} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {i > 0 && (
                  <motion.span
                    className="countdown-separator"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    :
                  </motion.span>
                )}
                <motion.div
                  className="countdown-item"
                  whileHover={{ scale: 1.08, borderColor: '#ff6b9d' }}
                >
                  <span className="countdown-number">
                    {String(val).padStart(2, '0')}
                  </span>
                  <span className="countdown-label">{label}</span>
                </motion.div>
              </div>
            ))}
          </motion.div>
        )}

        <motion.button
          className="enter-btn"
          variants={fadeUp}
          whileHover={{ scale: 1.08, y: -4, boxShadow: '0 14px 40px rgba(255,71,126,0.45)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() =>
            document.getElementById('wishes')?.scrollIntoView({ behavior: 'smooth' })
          }
        >
          <span>💕 เข้าสู่วันแสนพิเศษ</span>
        </motion.button>
      </motion.div>
    </section>
  );
}
