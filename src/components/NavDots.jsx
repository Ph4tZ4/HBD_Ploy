import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './NavDots.css';

const SECTIONS = [
  { id: 'hero', label: 'Home' },
  { id: 'wishes', label: 'Wishes' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'game', label: 'Game' },
  { id: 'cake', label: 'Make a Wish' },
];

export default function NavDots() {
  const [active, setActive] = useState('hero');
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { threshold: 0.4 }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav className="nav-dots">
      {SECTIONS.map(({ id, label }) => (
        <motion.a
          key={id}
          href={`#${id}`}
          className="nav-dot"
          animate={{
            background: active === id ? '#ff6b9d' : 'rgba(255,107,157,0.25)',
            borderColor: active === id ? '#ff9ab8' : 'rgba(255,107,157,0.4)',
            boxShadow:
              active === id
                ? '0 0 12px #ff6b9d, 0 0 24px rgba(255,107,157,0.3)'
                : '0 0 0 transparent',
            scale: active === id ? 1.3 : 1,
          }}
          whileHover={{ scale: 1.4 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onMouseEnter={() => setHovered(id)}
          onMouseLeave={() => setHovered(null)}
          onClick={(e) => {
            e.preventDefault();
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <AnimatePresence>
            {hovered === id && (
              <motion.span
                className="nav-dot-tooltip"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.a>
      ))}
    </nav>
  );
}
