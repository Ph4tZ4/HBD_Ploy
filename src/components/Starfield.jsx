import { useCallback, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../theme';

/* ================= Night Sky ================= */

function Stars({ count = 1400 }) {
  const ref = useRef();
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [
      new THREE.Color('#ffffff'),
      new THREE.Color('#ffd98e'),
      new THREE.Color('#f5c6d6'),
      new THREE.Color('#b8a9ff'),
    ];
    for (let i = 0; i < count; i++) {
      const r = 22 + Math.random() * 46;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      positions[i * 3 + 2] = r * Math.cos(phi);
      const c = palette[(Math.random() * palette.length) | 0];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, colors };
  }, [count]);

  useFrame((state, delta) => {
    ref.current.rotation.y += delta * 0.012;
    const { x, y } = state.pointer;
    ref.current.rotation.x = THREE.MathUtils.damp(ref.current.rotation.x, y * 0.08, 2, delta);
    ref.current.rotation.z = THREE.MathUtils.damp(ref.current.rotation.z, x * 0.05, 2, delta);
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.14} vertexColors transparent opacity={0.9} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Moon() {
  const ref = useRef();
  useFrame((state) => {
    ref.current.position.y = 5.6 + Math.sin(state.clock.elapsedTime * 0.4) * 0.18;
  });
  return (
    <group position={[7.6, 5.6, -13]} ref={ref}>
      <mesh>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial color="#f5f2e7" emissive="#e8e4d2" emissiveIntensity={0.4} roughness={0.85} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.1, 32, 32]} />
        <meshBasicMaterial color="#fff6d8" transparent opacity={0.09} depthWrite={false} />
      </mesh>
      <pointLight intensity={3.2} distance={34} color="#dfe6ff" />
    </group>
  );
}

let meteorId = 0;

function Meteor({ data, onDone }) {
  const ref = useRef();
  const life = useRef(0);
  const quat = useMemo(() => {
    const dir = new THREE.Vector3(...data.vel).normalize();
    return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir);
  }, [data.vel]);

  useFrame((_, delta) => {
    life.current += delta;
    const m = ref.current;
    m.position.x += data.vel[0] * delta;
    m.position.y += data.vel[1] * delta;
    m.material.opacity = Math.max(0, 0.85 - life.current * 1.05);
    if (life.current > 0.85) onDone(data.id);
  });

  return (
    <mesh ref={ref} position={data.start} quaternion={quat}>
      <boxGeometry args={[1.7, 0.04, 0.04]} />
      <meshBasicMaterial color="#eaf2ff" transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}

function ShootingStars() {
  const [meteors, setMeteors] = useState([]);
  const timer = useRef(2.2);

  useFrame((_, delta) => {
    timer.current -= delta;
    if (timer.current <= 0) {
      timer.current = 3 + Math.random() * 5;
      const dirX = Math.random() < 0.5 ? -1 : 1;
      setMeteors((prev) => [
        ...prev.slice(-3),
        {
          id: ++meteorId,
          start: [THREE.MathUtils.randFloatSpread(24), 5 + Math.random() * 4, -10 - Math.random() * 6],
          vel: [dirX * (8 + Math.random() * 6), -(3.5 + Math.random() * 3), 0],
        },
      ]);
    }
  });

  const done = useCallback((id) => {
    setMeteors((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return meteors.map((m) => <Meteor key={m.id} data={m} onDone={done} />);
}

/* ================= Day Sky ================= */

function Sun() {
  const ref = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    ref.current.position.y = 6 + Math.sin(t * 0.35) * 0.15;
    ref.current.rotation.z = t * 0.05;
  });
  return (
    <group position={[7.4, 6, -13]} ref={ref}>
      <mesh>
        <sphereGeometry args={[1.7, 32, 32]} />
        <meshBasicMaterial color="#ffd66b" />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial color="#ffefb8" transparent opacity={0.28} depthWrite={false} />
      </mesh>
      <Sparkles count={34} scale={[6, 6, 2]} size={3} speed={0.4} opacity={0.6} color="#fff0b8" />
      <pointLight intensity={4.5} distance={44} color="#fff2cc" />
    </group>
  );
}

const PUFFS = [
  [0, 0, 0, 1.1],
  [1, 0.15, 0.2, 0.8],
  [-1, 0.1, -0.1, 0.85],
  [0.45, 0.5, -0.15, 0.7],
  [-0.5, 0.45, 0.1, 0.65],
];

function Cloud({ position, speed, scale = 1 }) {
  const ref = useRef();
  useFrame((state, delta) => {
    const m = ref.current;
    m.position.x += speed * delta;
    if (m.position.x > 20) m.position.x = -20;
    m.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.12;
  });
  return (
    <group ref={ref} position={position} scale={scale}>
      {PUFFS.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} scale={[1, 0.62, 0.9]}>
          <sphereGeometry args={[r, 20, 20]} />
          <meshStandardMaterial color="#ffffff" roughness={1} transparent opacity={0.92} />
        </mesh>
      ))}
    </group>
  );
}

function Clouds() {
  return (
    <>
      <Cloud position={[-9, 5, -10]} speed={0.26} />
      <Cloud position={[3, 7, -14]} speed={0.18} scale={1.45} />
      <Cloud position={[11, 3.6, -8]} speed={0.34} scale={0.8} />
      <Cloud position={[-2, 8.4, -17]} speed={0.14} scale={1.8} />
    </>
  );
}

/* ================= Shared ================= */

function DriftCamera() {
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    state.camera.position.x = Math.sin(t * 0.1) * 0.6 + state.pointer.x * 0.8;
    state.camera.position.y = Math.cos(t * 0.13) * 0.4 + state.pointer.y * 0.5;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function Starfield({ children, camera = { position: [0, 0, 14], fov: 55 } }) {
  const theme = useTheme();
  const isNight = theme === 'night';

  return (
    <Canvas
      className="starfield-canvas"
      camera={camera}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <DriftCamera />
      {isNight ? (
        <>
          <Stars />
          <Moon />
          <ShootingStars />
          <Sparkles count={90} scale={[26, 16, 10]} size={2.4} speed={0.25} opacity={0.55} color="#ffd98e" />
          <Sparkles count={60} scale={[22, 14, 8]} size={3.2} speed={0.18} opacity={0.4} color="#f5c6d6" />
        </>
      ) : (
        <>
          <ambientLight intensity={0.85} />
          <directionalLight position={[7, 9, -3]} intensity={1.2} color="#fff3d6" />
          <Sun />
          <Clouds />
          <Sparkles count={40} scale={[24, 14, 8]} size={2} speed={0.2} opacity={0.3} color="#ffffff" />
        </>
      )}
      {children}
    </Canvas>
  );
}
