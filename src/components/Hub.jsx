import { motion } from 'framer-motion';
import { Gift, Cake, Star, Heart, Lock } from 'lucide-react';
import Starfield from './Starfield';
import { CHAPTERS, HER_NAME } from '../config';
import { playPop } from '../utils/audio';

const ICONS = { gift: Gift, cake: Cake, star: Star, heart: Heart };

export default function Hub({ onSelect, gameWon }) {
  return (
    <div className="screen">
      <Starfield />
      <div className="overlay hub-overlay">
        <motion.p
          className="hub-kicker accent"
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          ยินดีต้อนรับสู่จักรวาลของ
        </motion.p>
        <motion.h1
          className="display hub-title"
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
        >
          {HER_NAME}
        </motion.h1>

        <div className="hub-cards">
          {CHAPTERS.map(({ id, icon, title, desc, locked }, i) => {
            const Icon = ICONS[icon];
            const isLocked = locked && !gameWon;
            return (
              <motion.button
                key={id}
                className={`hub-card glass ${isLocked ? 'locked' : ''}`}
                initial={{ opacity: 0, y: 40, rotateX: 12 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 0.45 + i * 0.1, type: 'spring', stiffness: 120, damping: 16 }}
                whileHover={isLocked ? {} : { y: -10, scale: 1.04 }}
                whileTap={isLocked ? {} : { scale: 0.95 }}
                onClick={() => { if (!isLocked) { playPop(); onSelect(id); } }}
              >
                <span className="hub-card-icon">
                  {isLocked ? <Lock size={26} strokeWidth={1.6} /> : <Icon size={28} strokeWidth={1.6} />}
                </span>
                <span className="hub-card-title">{title}</span>
                <span className="hub-card-desc">{isLocked ? 'ชนะเกมเพื่อปลดล็อก 🔒' : desc}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
