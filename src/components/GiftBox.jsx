import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, ContactShadows, Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MousePointerClick } from 'lucide-react';
import Starfield from './Starfield';
import { LETTER } from '../config';
import { playChime, playPop } from '../utils/audio';

const PINK = '#ff9ebb';
const ROSE = '#f5c6d6';
const GOLD = '#ffd98e';

function Burst() {
  const ref = useRef();
  const life = useRef(0);
  const { positions, velocities } = (() => {
    const n = 160;
    const positions = new Float32Array(n * 3);
    const velocities = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const dir = new THREE.Vector3().randomDirection();
      const speed = 2 + Math.random() * 4;
      velocities.set([dir.x * speed, Math.abs(dir.y) * speed + 1.5, dir.z * speed], i * 3);
    }
    return { positions, velocities };
  })();

  useFrame((_, delta) => {
    life.current += delta;
    const pos = ref.current.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      pos.array[i * 3] += velocities[i * 3] * delta;
      pos.array[i * 3 + 1] += velocities[i * 3 + 1] * delta - life.current * delta * 2.2;
      pos.array[i * 3 + 2] += velocities[i * 3 + 2] * delta;
    }
    pos.needsUpdate = true;
    ref.current.material.opacity = Math.max(0, 1 - life.current / 1.8);
  });

  return (
    <points ref={ref} position={[0, 1, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.09} color={GOLD} transparent depthWrite={false} />
    </points>
  );
}

function Gift({ opened, onOpen }) {
  const group = useRef();
  const lid = useRef();
  const ribbonV = useRef();
  const ribbonH = useRef();
  const bowL = useRef();
  const bowR = useRef();
  const glow = useRef();
  const progress = useRef(0);
  const rot = useRef({ y: 0.4, vel: 0 });
  const drag = useRef(null);
  const pull = useRef(null);
  const { gl } = useThree();

  useEffect(() => {
    const el = gl.domElement;
    const down = (e) => { drag.current = { x: e.clientX ?? e.touches?.[0]?.clientX ?? 0 }; };
    const move = (e) => {
      const cx = e.clientX ?? e.touches?.[0]?.clientX;
      const cy = e.clientY ?? e.touches?.[0]?.clientY;
      if (pull.current != null && cy != null) {
        if (Math.abs(cy - pull.current) > 110) {
          pull.current = null;
          onOpen();
        }
      }
      if (drag.current && cx != null) {
        rot.current.vel = (cx - drag.current.x) * 0.005;
        rot.current.y += rot.current.vel;
        drag.current.x = cx;
      }
    };
    const up = () => { drag.current = null; pull.current = null; };
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [gl, onOpen]);

  useFrame((_, delta) => {
    const p = THREE.MathUtils.damp(progress.current, opened ? 1 : 0, 3.2, delta);
    progress.current = p;

    if (!drag.current) {
      rot.current.vel *= 0.94;
      rot.current.y += rot.current.vel + delta * 0.08;
    }
    group.current.rotation.y = rot.current.y;
    group.current.position.y = Math.sin(Date.now() * 0.0012) * 0.06;

    lid.current.position.y = 1.06 + p * 1.7;
    lid.current.rotation.z = p * 0.55;
    lid.current.rotation.x = -p * 0.35;

    const fly = (mesh, dir) => {
      mesh.position.set(dir[0] * p * 2.4, dir[1] * p * 2.4, dir[2] * p * 2.4);
      mesh.rotation.x = p * 3 * dir[0];
      mesh.rotation.z = p * 3 * dir[2];
      mesh.material.opacity = Math.max(0, 1 - p * 1.4);
    };
    fly(ribbonV.current, [0.4, 1.4, 0.6]);
    fly(ribbonH.current, [-0.9, 1.2, -0.5]);
    fly(bowL.current, [-1.2, 1.8, 0.4]);
    fly(bowR.current, [1.2, 1.8, -0.4]);

    glow.current.intensity = p * 26;
  });

  const ribbonMat = (
    <meshStandardMaterial color={GOLD} metalness={0.55} roughness={0.3} transparent />
  );

  return (
    <group ref={group} position={[0, -0.2, 0]}>
      {/* Box body */}
      <RoundedBox args={[2, 1.9, 2]} radius={0.12} smoothness={6} position={[0, 0, 0]}>
        <meshStandardMaterial color={PINK} roughness={0.35} metalness={0.1} />
      </RoundedBox>

      {/* Lid */}
      <group ref={lid} position={[0, 1.06, 0]}>
        <RoundedBox args={[2.2, 0.42, 2.2]} radius={0.1} smoothness={6}>
          <meshStandardMaterial color={ROSE} roughness={0.3} metalness={0.15} />
        </RoundedBox>
      </group>

      {/* Ribbons + bow (pull to open) */}
      <mesh
        ref={ribbonV}
        onPointerDown={(e) => { e.stopPropagation(); pull.current = e.clientY; }}
        position={[0, 0, 0]}
      >
        <boxGeometry args={[0.34, 2.02, 2.02]} />
        {ribbonMat}
      </mesh>
      <mesh
        ref={ribbonH}
        onPointerDown={(e) => { e.stopPropagation(); pull.current = e.clientY; }}
      >
        <boxGeometry args={[2.02, 2.02, 0.34]} />
        {ribbonMat}
      </mesh>
      <mesh ref={bowL} position={[-0.22, 1.42, 0]} rotation={[0, 0, 0.5]}>
        <torusGeometry args={[0.2, 0.09, 12, 24]} />
        {ribbonMat}
      </mesh>
      <mesh ref={bowR} position={[0.22, 1.42, 0]} rotation={[0, 0, -0.5]}>
        <torusGeometry args={[0.2, 0.09, 12, 24]} />
        {ribbonMat}
      </mesh>

      {/* Inner glow revealed on open */}
      <pointLight ref={glow} position={[0, 1, 0]} color={GOLD} intensity={0} distance={9} />
      {opened && (
        <Sparkles count={70} scale={[1.8, 2.6, 1.8]} position={[0, 1.2, 0]} size={4} speed={1.4} color={GOLD} />
      )}
      {opened && <Burst />}
    </group>
  );
}

export default function GiftBox({ onBack }) {
  const [opened, setOpened] = useState(false);
  const [showLetter, setShowLetter] = useState(false);

  const open = () => {
    setOpened((was) => {
      if (!was) {
        playChime(4);
        setTimeout(() => setShowLetter(true), 1400);
      }
      return true;
    });
  };

  return (
    <div className="screen">
      <Starfield camera={{ position: [0, 1.4, 7.5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 6, 4]} intensity={1.1} color="#fff0f5" />
        <pointLight position={[-4, 2, -3]} intensity={6} color="#b8a9ff" />
        <Float speed={1.2} rotationIntensity={0} floatIntensity={0.4}>
          <Gift opened={opened} onOpen={open} />
        </Float>
        {/* Glass pedestal */}
        <mesh position={[0, -1.75, 0]}>
          <cylinderGeometry args={[2.2, 2.5, 0.28, 48]} />
          <meshPhysicalMaterial color="#ffffff" transparent opacity={0.14} roughness={0.1} metalness={0.1} />
        </mesh>
        <ContactShadows position={[0, -1.6, 0]} opacity={0.55} scale={12} blur={2.6} color="#000010" />
      </Starfield>

      <button className="btn-ghost top-left" onClick={() => { playPop(); onBack(); }}>
        <ArrowLeft size={16} /> กลับ
      </button>

      {!opened && (
        <div className="overlay" style={{ justifyContent: 'flex-end', paddingBottom: 110 }}>
          <motion.p
            className="glass-pill hint-pill"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <MousePointerClick size={16} /> ลากเพื่อหมุน · ดึงริบบิ้นเพื่อเปิดของขวัญ
          </motion.p>
        </div>
      )}

      <AnimatePresence>
        {showLetter && (
          <motion.div
            className="overlay letter-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass letter-card"
              initial={{ opacity: 0, y: 60, scale: 0.85, rotateX: 14 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, y: 40, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 130, damping: 18 }}
            >
              <h2 className="accent letter-title">{LETTER.title}</h2>
              <p className="letter-body">{LETTER.body}</p>
              <button className="btn" onClick={() => { playPop(); setShowLetter(false); }}>
                เก็บจดหมายไว้ในใจ 💖
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
