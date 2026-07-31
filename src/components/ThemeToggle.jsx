import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { playPop } from '../utils/audio';

export default function ThemeToggle({ theme, onToggle }) {
  return (
    <motion.button
      className="theme-toggle glass-pill"
      onClick={() => { playPop(); onToggle(); }}
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      whileTap={{ scale: 0.86 }}
      aria-label={theme === 'night' ? 'สลับเป็นธีมกลางวัน' : 'สลับเป็นธีมกลางคืน'}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          style={{ display: 'flex' }}
          initial={{ rotate: -100, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 100, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.28 }}
        >
          {theme === 'night' ? <Sun size={18} strokeWidth={1.9} /> : <Moon size={18} strokeWidth={1.9} />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
