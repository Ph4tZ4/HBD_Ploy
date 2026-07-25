import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './FloatingBalloons.css';

const BALLOON_COLORS = [
  'linear-gradient(135deg, #ff9ab8, #ff6b9d)',
  'linear-gradient(135deg, #ffbcd3, #ff85a2)',
  'linear-gradient(135deg, #f7d794, #ffb86c)',
  'linear-gradient(135deg, #e8a87c, #ff758c)',
  'linear-gradient(135deg, #ffc0cb, #e84393)',
];

const INITIAL_BALLOONS = [
  { id: 1, left: '12%', delay: 0, duration: 22, color: BALLOON_COLORS[0], emoji: '💖' },
  { id: 2, left: '50%', delay: 4, duration: 26, color: BALLOON_COLORS[2], emoji: '✨' },
  { id: 3, left: '85%', delay: 2, duration: 24, color: BALLOON_COLORS[4], emoji: '💝' },
];

export default function FloatingBalloons() {
  const [balloons, setBalloons] = useState(INITIAL_BALLOONS);
  const [popParticles, setPopParticles] = useState([]);

  const popBalloon = (b, e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = rect.left + rect.width / 2;
    const clickY = rect.top + rect.height / 2;

    // Create 10 heart particles popping out
    const newHearts = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: clickX,
      y: clickY,
      vx: (Math.random() - 0.5) * 120,
      vy: (Math.random() - 0.8) * 120,
      emoji: Math.random() > 0.5 ? '💖' : '✨',
    }));

    setPopParticles((prev) => [...prev, ...newHearts]);

    // Respawn balloon after 3 seconds
    setBalloons((prev) => prev.filter((item) => item.id !== b.id));
    setTimeout(() => {
      setBalloons((prev) => [
        ...prev,
        { ...b, id: Date.now(), delay: 0, left: `${Math.random() * 80 + 10}%` },
      ]);
    }, 3000);
  };

  useEffect(() => {
    if (popParticles.length > 0) {
      const timer = setTimeout(() => {
        setPopParticles((prev) => prev.slice(8));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [popParticles]);

  return (
    <div className="balloon-container">
      {balloons.map((b) => (
        <motion.div
          key={b.id}
          className="balloon"
          style={{ left: b.left }}
          initial={{ y: '105vh' }}
          animate={{
            y: ['105vh', '-20vh'],
            x: [0, 15, -15, 10, 0],
            rotate: [0, 5, -5, 3, 0],
          }}
          transition={{
            y: { duration: b.duration, repeat: Infinity, delay: b.delay, ease: 'linear' },
            x: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
          }}
          whileHover={{ scale: 1.15 }}
          onClick={(e) => popBalloon(b, e)}
        >
          <div className="balloon-body" style={{ background: b.color }}>
            <span>{b.emoji}</span>
          </div>
          <div className="balloon-knot" style={{ background: b.color }} />
          <div className="balloon-string" />
        </motion.div>
      ))}

      {/* Pop particles */}
      <AnimatePresence>
        {popParticles.map((p) => (
          <motion.span
            key={p.id}
            className="pop-heart"
            style={{ left: p.x, top: p.y }}
            initial={{ opacity: 1, scale: 0.5, x: 0, y: 0 }}
            animate={{ opacity: 0, scale: 1.5, x: p.vx, y: p.vy }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {p.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
