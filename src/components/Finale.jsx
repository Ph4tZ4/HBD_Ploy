import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, Play } from 'lucide-react';
import Starfield from './Starfield';
import { FINALE, FINALE_VIDEO, MEMORIES } from '../config';
import { playChime, playPop } from '../utils/audio';

const GOLD = '#ffd98e';
const ROSE = '#ff9ebb';

/* Heart curve (parametric), 7 nodes */
function useHeartPoints() {
  return useMemo(() => {
    const pts = [];
    const n = MEMORIES.length;
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2 - Math.PI / 2;
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      pts.push(new THREE.Vector3(x * 0.22, y * 0.2 + 0.4, 0));
    }
    return pts;
  }, []);
}

function MemoryStar({ position, index, onOpen }) {
  const ref = useRef();
  const halo = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    ref.current.position.y = position.y + Math.sin(t * 1.3 + index * 1.7) * 0.1;
    const s = 1 + Math.sin(t * 2.2 + index) * 0.12;
    ref.current.scale.setScalar(s);
    halo.current.scale.setScalar(s * 2.1);
    halo.current.material.opacity = 0.14 + Math.sin(t * 2.2 + index) * 0.06;
  });

  return (
    <group position={[position.x, 0, position.z]}>
      <mesh
        ref={ref}
        position={[0, position.y, 0]}
        onClick={(e) => { e.stopPropagation(); onOpen(index); }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'default'; }}
      >
        <octahedronGeometry args={[0.28, 0]} />
        <meshBasicMaterial color={GOLD} />
      </mesh>
      <mesh ref={halo} position={[0, position.y, 0]}>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshBasicMaterial color={ROSE} transparent opacity={0.14} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Constellation({ onOpen }) {
  const points = useHeartPoints();
  const group = useRef();

  useFrame((state, delta) => {
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      state.pointer.x * 0.22,
      3,
      delta
    );
    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      -state.pointer.y * 0.12,
      3,
      delta
    );
  });

  const loop = [...points, points[0]];
  return (
    <group ref={group}>
      <Line points={loop} color={ROSE} transparent opacity={0.35} lineWidth={1.2} />
      {points.map((p, i) => (
        <MemoryStar key={i} position={p} index={i} onOpen={onOpen} />
      ))}
      <Sparkles count={60} scale={[9, 6, 3]} size={2.4} speed={0.3} opacity={0.5} color={GOLD} />
    </group>
  );
}

export default function Finale({ onBack }) {
  const [openIndex, setOpenIndex] = useState(null);
  const [showVideo, setShowVideo] = useState(false);

  const openMemory = (i) => {
    playChime(i % 5);
    setOpenIndex(i);
  };

  const active = openIndex != null ? MEMORIES[openIndex] : null;

  return (
    <div className="screen">
      <Starfield camera={{ position: [0, 0.4, 8.5], fov: 52 }}>
        <ambientLight intensity={0.4} />
        <Constellation onOpen={openMemory} />
      </Starfield>

      <button className="btn-ghost top-left" onClick={() => { playPop(); onBack(); }}>
        <ArrowLeft size={16} /> กลับ
      </button>

      <div className="overlay" style={{ justifyContent: 'flex-start', paddingTop: 84, pointerEvents: 'none' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ textAlign: 'center' }}
        >
          <h1 className="display chapter-title">{FINALE.title}</h1>
          <p className="chapter-sub">{FINALE.subtitle}</p>
        </motion.div>
      </div>

      <motion.div
        className="finale-banner glass-pill"
        initial={{ y: 60, opacity: 0, x: '-50%' }}
        animate={{ y: 0, opacity: 1, x: '-50%' }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 140, damping: 17 }}
      >
        {FINALE.banner}
      </motion.div>

      <motion.button
        className="btn finale-video-btn"
        initial={{ opacity: 0, y: 30, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        transition={{ delay: 0.8 }}
        onClick={() => { playPop(); setShowVideo(true); }}
      >
        <Play size={16} /> {FINALE_VIDEO.label}
      </motion.button>

      {/* Memory modal */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="overlay letter-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenIndex(null)}
          >
            <motion.div
              className="glass memory-card"
              initial={{ opacity: 0, scale: 0.6, rotateY: 24 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ type: 'spring', stiffness: 170, damping: 19 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="memory-close" onClick={() => setOpenIndex(null)} aria-label="ปิด">
                <X size={17} />
              </button>
              {active.type === 'video' ? (
                <video className="memory-media" src={active.src} controls autoPlay loop playsInline />
              ) : (
                <img className="memory-media" src={active.img} alt={active.label} />
              )}
              <p className="memory-label accent">{active.label}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Featured video modal */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            className="overlay letter-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowVideo(false)}
          >
            <motion.div
              className="glass memory-card finale-video-card"
              initial={{ opacity: 0, y: 60, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: 'spring', stiffness: 150, damping: 18 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="memory-close" onClick={() => setShowVideo(false)} aria-label="ปิด">
                <X size={17} />
              </button>
              <video className="memory-media" src={FINALE_VIDEO.src} controls autoPlay playsInline />
              <p className="memory-label accent">{FINALE_VIDEO.label}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
