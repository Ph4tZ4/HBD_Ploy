import { useCallback, useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Star } from 'lucide-react';
import Starfield from './Starfield';
import { GAME } from '../config';
import { playChime, playPop } from '../utils/audio';

const GOLD = '#ffd98e';
const GREY = '#5a5a7a';
const ROSE = '#ff9ebb';
const BASKET_Y = -2.9;

let starId = 0;

function FallingStar({ data, basketXRef, flyUp, onCatch, onMiss }) {
  const ref = useRef();
  const pos = useRef({ x: data.x, y: 4.6 });
  const done = useRef(false);

  useFrame((state, delta) => {
    const m = ref.current;
    const t = state.clock.elapsedTime;
    if (flyUp.current) {
      pos.current.y += delta * 9;
      m.material.opacity = Math.max(0, m.material.opacity - delta * 1.4);
    } else {
      pos.current.y -= data.speed * delta;
      pos.current.x = data.x + Math.sin(t * data.swayFreq + data.seed) * data.swayAmp;
    }
    m.position.set(pos.current.x, pos.current.y, 0);
    m.rotation.z += delta * 1.5;

    if (!flyUp.current && !done.current) {
      const dx = Math.abs(pos.current.x - basketXRef.current);
      if (dx < 0.95 && pos.current.y < BASKET_Y + 0.55 && pos.current.y > BASKET_Y - 0.9) {
        done.current = true;
        onCatch(data, pos.current);
      } else if (pos.current.y < -4.4) {
        done.current = true;
        onMiss(data.id);
      }
    }
  });

  const color = data.type === 'gold' ? GOLD : data.type === 'super' ? ROSE : GREY;
  const size = data.type === 'super' ? 0.3 : 0.22;

  return (
    <group>
      <mesh ref={ref}>
        <octahedronGeometry args={[size, 0]} />
        <meshBasicMaterial color={color} transparent />
      </mesh>
    </group>
  );
}

function MoonBasket({ basketXRef }) {
  const ref = useRef();
  const prev = useRef(0);
  const { viewport } = useThree();

  useFrame((state, delta) => {
    const target = THREE.MathUtils.clamp(
      state.pointer.x * (viewport.width / 2),
      -viewport.width / 2 + 0.9,
      viewport.width / 2 - 0.9
    );
    basketXRef.current = THREE.MathUtils.damp(basketXRef.current, target, 14, delta);
    const vel = (basketXRef.current - prev.current) / Math.max(delta, 0.001);
    prev.current = basketXRef.current;
    const m = ref.current;
    m.position.x = basketXRef.current;
    m.rotation.z = THREE.MathUtils.damp(m.rotation.z, THREE.MathUtils.clamp(-vel * 0.06, -0.5, 0.5), 10, delta);
    m.position.y = BASKET_Y + Math.sin(state.clock.elapsedTime * 2) * 0.05;
  });

  return (
    <group ref={ref} position={[0, BASKET_Y, 0]}>
      {/* Crescent bowl */}
      <mesh rotation={[Math.PI, 0, 0]}>
        <sphereGeometry args={[0.85, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
        <meshPhysicalMaterial color="#e8ecff" transparent opacity={0.32} roughness={0.15} metalness={0.2} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.18, 0]}>
        <torusGeometry args={[0.85, 0.045, 12, 48]} />
        <meshBasicMaterial color={GOLD} />
      </mesh>
      <pointLight position={[0, 0.5, 0]} intensity={2.2} distance={4} color={GOLD} />
    </group>
  );
}

function CatchBurst({ pos }) {
  return (
    <Sparkles count={22} scale={[1.4, 1.4, 1]} position={[pos.x, BASKET_Y + 0.4, 0]} size={5} speed={2.4} color={GOLD} />
  );
}

function GameDriver({ playing, spawnTickRef }) {
  const { viewport } = useThree();
  const acc = useRef(0);
  useFrame((_, delta) => {
    if (!playing) return;
    acc.current += delta;
    if (acc.current > 1.05) {
      acc.current = 0;
      const maxX = viewport.width / 2 - 1;
      spawnTickRef.current(maxX);
    }
  });
  return null;
}

export default function StarGame({ onBack, onWin }) {
  const [phase, setPhase] = useState('playing');
  const [stars, setStars] = useState([]);
  const [bursts, setBursts] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME.duration);
  const streakRef = useRef(0);
  const [compliment, setCompliment] = useState(null);
  const basketXRef = useRef(0);
  const flyUp = useRef(false);
  const scoreRef = useRef(0);
  const timeRef = useRef(GAME.duration);

  const spawn = useCallback((maxX) => {
    const roll = Math.random();
    const type = roll < 0.62 ? 'gold' : roll < 0.85 ? 'grey' : 'super';
    const elapsed = GAME.duration - timeRef.current;
    setStars((prev) => [
      ...prev,
      {
        id: ++starId,
        type,
        x: THREE.MathUtils.randFloatSpread(maxX * 2),
        speed: 1.5 + elapsed * 0.022 + Math.random() * 0.5,
        swayFreq: 1 + Math.random() * 1.6,
        swayAmp: 0.2 + Math.random() * 0.5,
        seed: Math.random() * Math.PI * 2,
      },
    ]);
  }, []);
  const spawnRef = useRef(spawn);
  spawnRef.current = spawn;

  useEffect(() => {
    if (phase !== 'playing') return undefined;
    const iv = setInterval(() => {
      timeRef.current -= 1;
      setTimeLeft(timeRef.current);
      if (timeRef.current <= 0) {
        setPhase(scoreRef.current >= GAME.target ? 'won' : 'lost');
      }
    }, 1000);
    return () => clearInterval(iv);
  }, [phase]);

  useEffect(() => {
    if (phase === 'won') {
      flyUp.current = true;
      const t = setTimeout(onWin, 2700);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [phase, onWin]);

  const handleCatch = useCallback((data, pos) => {
    setStars((prev) => prev.filter((s) => s.id !== data.id));
    setBursts((prev) => [...prev, { id: data.id, pos: { ...pos } }]);
    setTimeout(() => setBursts((prev) => prev.filter((b) => b.id !== data.id)), 700);

    if (data.type === 'grey') {
      timeRef.current = Math.max(0, timeRef.current - 3);
      setTimeLeft(timeRef.current);
      streakRef.current = 0;
      playPop();
      return;
    }
    playChime(streakRef.current);
    streakRef.current += 1;
    if (data.type === 'super') {
      setCompliment(GAME.compliments[(Math.random() * GAME.compliments.length) | 0]);
      setTimeout(() => setCompliment(null), 1700);
      return;
    }
    scoreRef.current += 1;
    setScore(scoreRef.current);
    if (scoreRef.current >= GAME.target) setPhase('won');
  }, []);

  const handleMiss = useCallback((id) => {
    setStars((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const retry = () => {
    playPop();
    flyUp.current = false;
    scoreRef.current = 0;
    timeRef.current = GAME.duration;
    setStars([]);
    setBursts([]);
    setScore(0);
    streakRef.current = 0;
    setTimeLeft(GAME.duration);
    setPhase('playing');
  };

  const progress = (score / GAME.target) * 100;
  const ringR = 13;
  const ringC = 2 * Math.PI * ringR;

  return (
    <div className="screen">
      <Starfield camera={{ position: [0, 0, 9], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <GameDriver playing={phase === 'playing'} spawnTickRef={spawnRef} />
        <MoonBasket basketXRef={basketXRef} />
        {stars.map((s) => (
          <FallingStar
            key={s.id}
            data={s}
            basketXRef={basketXRef}
            flyUp={flyUp}
            onCatch={handleCatch}
            onMiss={handleMiss}
          />
        ))}
        {bursts.map((b) => <CatchBurst key={b.id} pos={b.pos} />)}
        {phase === 'won' && (
          <Sparkles count={180} scale={[12, 10, 6]} size={5} speed={1.8} color={GOLD} />
        )}
      </Starfield>

      <button className="btn-ghost top-left" onClick={() => { playPop(); onBack(); }}>
        <ArrowLeft size={16} /> กลับ
      </button>

      {/* HUD */}
      <motion.div
        className="game-hud glass-pill"
        initial={{ y: -70, opacity: 0, x: '-50%' }}
        animate={{ y: 0, opacity: 1, x: '-50%' }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 160, damping: 18 }}
      >
        <div className="game-ring">
          <svg width="34" height="34" viewBox="0 0 34 34">
            <circle cx="17" cy="17" r={ringR} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
            <circle
              cx="17" cy="17" r={ringR} fill="none"
              stroke={timeLeft <= 10 ? '#ff6b6b' : GOLD}
              strokeWidth="3" strokeLinecap="round"
              strokeDasharray={ringC}
              strokeDashoffset={ringC * (1 - timeLeft / GAME.duration)}
              transform="rotate(-90 17 17)"
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.4s' }}
            />
          </svg>
          <span className="game-ring-num">{timeLeft}</span>
        </div>
        <div className="game-stars">
          {Array.from({ length: GAME.target }, (_, i) => (
            <Star
              key={i}
              size={17}
              fill={i < score ? GOLD : 'none'}
              color={i < score ? GOLD : 'rgba(255,255,255,0.3)'}
            />
          ))}
        </div>
        <span className="game-score">{score}/{GAME.target}</span>
      </motion.div>

      {phase === 'playing' && (
        <div className="overlay" style={{ justifyContent: 'flex-end', paddingBottom: 106, pointerEvents: 'none' }}>
          <motion.p
            className="chapter-sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {GAME.subtitle}
          </motion.p>
        </div>
      )}

      {/* Super-star compliment */}
      <AnimatePresence>
        {compliment && (
          <motion.div
            className="game-compliment"
            initial={{ opacity: 0, scale: 0.7, y: 20, x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.85, x: '-50%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            <span className="glass-pill game-compliment-pill accent">{compliment}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Win banner */}
      <AnimatePresence>
        {phase === 'won' && (
          <motion.div
            className="game-banner glass-pill"
            initial={{ y: -80, opacity: 0, x: '-50%' }}
            animate={{ y: 0, opacity: 1, x: '-50%' }}
            transition={{ type: 'spring', stiffness: 150, damping: 16 }}
          >
            {GAME.winBanner}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lose overlay */}
      <AnimatePresence>
        {phase === 'lost' && (
          <motion.div className="overlay letter-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="glass letter-card"
              initial={{ opacity: 0, y: 50, scale: 0.88 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 140, damping: 17 }}
            >
              <h2 className="accent letter-title">💫</h2>
              <p className="letter-body" style={{ textAlign: 'center' }}>{GAME.failMessage}</p>
              <button className="btn" onClick={retry}>
                <RotateCcw size={16} /> ลองอีกครั้ง
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Score progress glow */}
      <div className="game-progress" style={{ width: `${progress}%` }} />
    </div>
  );
}
