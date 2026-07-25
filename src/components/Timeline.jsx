import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { TIMELINE_EVENTS } from '../config';
import './Timeline.css';

const cardVariants = {
  hidden: (side) => ({
    opacity: 0,
    x: side === 'left' ? -50 : 50,
  }),
  show: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 60, damping: 15 },
  },
};

const dotVariants = {
  hidden: { scale: 0, opacity: 0 },
  show: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 200, damping: 15 },
  },
};

export default function Timeline() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 0.85], ['0%', '100%']);

  return (
    <section id="timeline" className="section timeline-section">
      <div className="section-container">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 60 }}
        >
          💕 เส้นทางความทรงจำของเรา
        </motion.h2>

        <motion.p
          className="section-subtitle"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          ทุกก้าวที่เราเดินทางผ่านไปด้วยกัน
        </motion.p>

        <div className="timeline" ref={containerRef}>
          <div className="timeline-line-track" />
          <motion.div
            className="timeline-line-fill"
            style={{ height: lineHeight }}
          />

          {TIMELINE_EVENTS.map((evt, i) => (
            <div
              key={i}
              className="timeline-item"
              data-side={evt.side}
            >
              <motion.div
                className="timeline-dot"
                variants={dotVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                whileHover={{ scale: 1.25 }}
              >
                <span>{evt.icon}</span>
              </motion.div>

              <motion.div
                className="timeline-content glass-card"
                custom={evt.side}
                variants={cardVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-50px' }}
                whileHover={{
                  boxShadow: '0 15px 40px rgba(255,107,151,0.2)',
                  borderColor: 'rgba(255,107,151,0.5)',
                  y: -5,
                }}
              >
                <span className="timeline-date">{evt.date}</span>
                <h3>{evt.title}</h3>
                <p>{evt.text}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
