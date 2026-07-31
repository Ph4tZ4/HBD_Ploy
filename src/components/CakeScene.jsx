import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { ContactShadows, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mic, MicOff } from 'lucide-react';
import Starfield from './Starfield';
import useMicLevel from '../hooks/useMicLevel';
import { CAKE } from '../config';
import { playChime, playPop } from '../utils/audio';

const CREAM = '#fff2e8';
const PINK = '#ffb7cd';
const LAV = '#cfc2ff';
const GOLD = '#ffd98e';

function Flame({ lit }) {
  const outer = useRef();
  const inner = useRef();
  const scale = useRef(1);

  useFrame((state, delta) => {
    scale.current = THREE.MathUtils.damp(scale.current, lit ? 1 : 0, 8, delta);
    const t = state.clock.elapsedTime;
    const flick = 1 + Math.sin(t * 17 + Math.sin(t * 31)) * 0.14;
    const leanX = -state.pointer.x * 0.09;
    [outer, inner].forEach((r, i) => {
      const m = r.current;
      m.scale.setScalar(Math.max(0.0001, scale.current * flick * (i === 0 ? 1 : 0.55)));
      m.position.x = leanX;
    });
  });

  return (
    <group position={[0, 0.32, 0]}>
      <mesh ref={outer}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshBasicMaterial color="#ff9a3c" transparent opacity={0.75} />
      </mesh>
      <mesh ref={inner} position={[0, 0.02, 0]}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshBasicMaterial color="#ffe9a8" />
      </mesh>
    </group>
  );
}

function Candle({ position, lit, onExtinguish }) {
  const pressTimer = useRef(null);
  const startPress = (e) => {
    e.stopPropagation();
    pressTimer.current = setTimeout(() => onExtinguish(), 650);
  };
  const cancelPress = () => clearTimeout(pressTimer.current);

  return (
    <group position={position}>
      <mesh
        onPointerDown={startPress}
        onPointerUp={cancelPress}
        onPointerLeave={cancelPress}
        position={[0, 0.14, 0]}
      >
        <cylinderGeometry args={[0.055, 0.055, 0.36, 16]} />
        <meshStandardMaterial color={PINK} roughness={0.4} />
      </mesh>
      <Flame lit={lit} />
    </group>
  );
}

function Cake({ litMap, onExtinguish, celebrate }) {
  const group = useRef();
  const flameLight = useRef();
  const litCount = litMap.filter(Boolean).length;

  const candlePositions = useMemo(() => {
    const n = CAKE.candleCount;
    return Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      return [Math.cos(a) * 0.45, 1.72, Math.sin(a) * 0.45];
    });
  }, []);

  useFrame((state, delta) => {
    group.current.rotation.y += delta * 0.18;
    const t = state.clock.elapsedTime;
    flameLight.current.intensity = THREE.MathUtils.damp(
      flameLight.current.intensity,
      litCount * 1.6 + Math.sin(t * 13) * 0.4 * litCount,
      6,
      delta
    );
    flameLight.current.position.x = Math.sin(t * 7) * 0.1;
  });

  const layer = (r, h, y, color) => (
    <group position={[0, y, 0]}>
      <mesh>
        <cylinderGeometry args={[r, r, h, 48]} />
        <meshStandardMaterial color={color} roughness={0.45} />
      </mesh>
      <mesh position={[0, h / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[r - 0.06, 0.075, 12, 48]} />
        <meshStandardMaterial color={CREAM} roughness={0.3} />
      </mesh>
    </group>
  );

  return (
    <group ref={group} position={[0, -1.15, 0]}>
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[2.1, 2.3, 0.14, 48]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.18} roughness={0.12} />
      </mesh>
      {layer(1.5, 0.6, 0.3, PINK)}
      {layer(1.12, 0.55, 0.88, LAV)}
      {layer(0.78, 0.5, 1.41, CREAM)}
      {candlePositions.map((pos, i) => (
        <Candle key={i} position={pos} lit={litMap[i]} onExtinguish={() => onExtinguish(i)} />
      ))}
      <pointLight ref={flameLight} position={[0, 2.4, 0]} color={GOLD} intensity={5} distance={10} />
      {celebrate && (
        <>
          <Sparkles count={140} scale={[7, 6, 7]} position={[0, 3, 0]} size={5} speed={1.6} color={GOLD} />
          <Sparkles count={100} scale={[8, 5, 8]} position={[0, 2.4, 0]} size={4} speed={1.2} color={PINK} />
        </>
      )}
    </group>
  );
}

function BlowWatcher({ micLevel, enabled, litMap, onExtinguish }) {
  const acc = useRef(0);
  useFrame((_, delta) => {
    if (!enabled) return;
    const level = micLevel.current;
    if (level > 0.3) {
      acc.current += delta * level;
      if (acc.current > 0.45) {
        acc.current = 0;
        const idx = litMap.findIndex(Boolean);
        if (idx !== -1) onExtinguish(idx);
      }
    } else {
      acc.current = Math.max(0, acc.current - delta * 0.4);
    }
  });
  return null;
}

export default function CakeScene({ onBack }) {
  const [litMap, setLitMap] = useState(() => Array(CAKE.candleCount).fill(true));
  const [phase, setPhase] = useState('blow'); // blow | wish | done
  const { levelRef, enabled, denied, enable } = useMicLevel();

  const extinguish = (i) => {
    setLitMap((prev) => {
      if (!prev[i]) return prev;
      playChime(CAKE.candleCount - prev.filter(Boolean).length);
      const next = [...prev];
      next[i] = false;
      return next;
    });
  };

  const allOut = litMap.every((l) => !l);

  useEffect(() => {
    if (allOut && phase === 'blow') {
      const t = setTimeout(() => setPhase('wish'), 900);
      return () => clearTimeout(t);
    }
  }, [allOut, phase]);

  return (
    <div className="screen">
      <Starfield camera={{ position: [0, 1.2, 7], fov: 50 }}>
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 6, 4]} intensity={0.7} color="#e8dcff" />
        <Float speed={1.1} rotationIntensity={0} floatIntensity={0.3}>
          <Cake litMap={litMap} onExtinguish={extinguish} celebrate={phase === 'done'} />
        </Float>
        <ContactShadows position={[0, -1.35, 0]} opacity={0.5} scale={12} blur={2.4} color="#000010" />
        <BlowWatcher micLevel={levelRef} enabled={enabled && phase === 'blow'} litMap={litMap} onExtinguish={extinguish} />
      </Starfield>

      <button className="btn-ghost top-left" onClick={() => { playPop(); onBack(); }}>
        <ArrowLeft size={16} /> กลับ
      </button>

      {phase === 'blow' && (
        <div className="overlay" style={{ justifyContent: 'flex-end', paddingBottom: 112 }}>
          <motion.div
            className="cake-controls"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="chapter-title display" style={{ fontSize: '1.5rem' }}>{CAKE.title}</h2>
            <p className="chapter-sub">{CAKE.hintMic}</p>
            {!enabled && !denied && (
              <button className="btn" onClick={enable}>
                <Mic size={16} /> เปิดไมค์เพื่อเป่าเทียน
              </button>
            )}
            {denied && (
              <p className="glass-pill hint-pill"><MicOff size={15} /> ไมค์ใช้ไม่ได้ — กดเทียนค้างไว้แทนนะ</p>
            )}
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {phase === 'wish' && (
          <motion.div
            className="overlay letter-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onAnimationComplete={() => setTimeout(() => setPhase('done'), 2600)}
          >
            <motion.p
              className="display wish-text"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 120, damping: 14 }}
            >
              {CAKE.wishPrompt}
            </motion.p>
          </motion.div>
        )}

        {phase === 'done' && (
          <motion.div className="overlay letter-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div
              className="glass letter-card"
              initial={{ opacity: 0, y: 50, scale: 0.88 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 140, damping: 17 }}
            >
              <h2 className="accent letter-title">🎆</h2>
              <p className="letter-body" style={{ textAlign: 'center' }}>{CAKE.wishDone}</p>
              <button className="btn" onClick={() => { playPop(); onBack(); }}>ไปต่อเลย ✨</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
