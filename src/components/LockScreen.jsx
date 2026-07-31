import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, Lock } from 'lucide-react';
import { HER_NAME, LOCK_SCREEN, BIRTHDAY_YEAR } from '../config';
import { playPop } from '../utils/audio';
import { useTheme, sceneBackground } from '../theme';
import PloyMascot from './PloyMascot';

function useNow() {
  return useMemo(() => {
    const d = new Date();
    const time = d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false });
    const date = d.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' });
    return { time, date };
  }, []);
}

export default function LockScreen({ onUnlock }) {
  const { time, date } = useNow();
  const theme = useTheme();

  return (
    <motion.div
      className="screen lockscreen"
      style={{ background: sceneBackground(theme) }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.6, bottom: 0 }}
      onDragEnd={(_, info) => {
        if (info.offset.y < -90 || info.velocity.y < -500) {
          playPop();
          onUnlock();
        }
      }}
    >
      <div className="lockscreen-stars" aria-hidden />
      <div className="lockscreen-content">
        <motion.div
          className="lockscreen-lock glass-pill"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 16 }}
        >
          <Lock size={16} strokeWidth={2.2} />
        </motion.div>

        <motion.p
          className="lockscreen-date"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          {date}
        </motion.p>

        <motion.h1
          className="lockscreen-time"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          {time}
        </motion.h1>

        <motion.div
          className="lockscreen-mascot"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.55, type: 'spring', stiffness: 140, damping: 15 }}
        >
          <PloyMascot />
        </motion.div>

        <motion.div
          className="lockscreen-hero"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, type: 'spring', stiffness: 120, damping: 18 }}
        >
          <p className="lockscreen-greeting accent">{LOCK_SCREEN.greeting}</p>
          <h2 className="display lockscreen-name">{HER_NAME}</h2>
          <p className="lockscreen-year">{BIRTHDAY_YEAR}</p>
        </motion.div>
      </div>

      <div className="lockscreen-swipe-wrap">
        <motion.button
          className="lockscreen-swipe glass-pill"
          onClick={() => { playPop(); onUnlock(); }}
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          whileTap={{ scale: 0.94 }}
        >
          <ChevronUp size={20} />
          <span>{LOCK_SCREEN.hint}</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
