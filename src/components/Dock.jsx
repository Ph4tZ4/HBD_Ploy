import { motion } from 'framer-motion';
import { Home, Gift, Cake, Star, Heart, Lock } from 'lucide-react';
import { playPop } from '../utils/audio';

const ITEMS = [
  { id: 'hub', icon: Home, label: 'หน้าหลัก' },
  { id: 'gift', icon: Gift, label: 'ของขวัญ' },
  { id: 'cake', icon: Cake, label: 'เค้ก' },
  { id: 'game', icon: Star, label: 'เก็บดาว' },
  { id: 'finale', icon: Heart, label: 'ความทรงจำ', locked: true },
];

export default function Dock({ active, onSelect, gameWon }) {
  return (
    <motion.nav
      className="dock glass-pill"
      initial={{ y: 90, opacity: 0, x: '-50%' }}
      animate={{ y: 0, opacity: 1, x: '-50%' }}
      transition={{ delay: 0.4, type: 'spring', stiffness: 160, damping: 20 }}
    >
      {ITEMS.map(({ id, icon: Icon, label, locked }) => {
        const isLocked = locked && !gameWon;
        const isActive = active === id;
        return (
          <motion.button
            key={id}
            className={`dock-item ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
            onClick={() => { if (!isLocked) { playPop(); onSelect(id); } }}
            whileHover={isLocked ? {} : { scale: 1.22, y: -6 }}
            whileTap={isLocked ? {} : { scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            aria-label={label}
            title={isLocked ? 'ชนะเกมเพื่อปลดล็อก' : label}
          >
            {isLocked ? <Lock size={20} strokeWidth={1.8} /> : <Icon size={22} strokeWidth={1.8} />}
            <span className="dock-dot" />
          </motion.button>
        );
      })}
    </motion.nav>
  );
}
