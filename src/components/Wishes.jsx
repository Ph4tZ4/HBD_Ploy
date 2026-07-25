import { motion } from 'framer-motion';
import EnvelopeWish from './EnvelopeWish';
import GiftSurprise from './GiftSurprise';
import './Wishes.css';

export default function Wishes() {
  return (
    <section id="wishes" className="section wishes-section">
      <div className="section-container">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 60 }}
        >
          💌 ข้อความจากหัวใจ
        </motion.h2>

        <motion.p
          className="section-subtitle"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          ซองจดหมายฉบับพิเศษสำหรับพลอย
        </motion.p>

        {/* Envelope Component */}
        <EnvelopeWish />

        {/* Gift Surprise Component */}
        <GiftSurprise />
      </div>
    </section>
  );
}
