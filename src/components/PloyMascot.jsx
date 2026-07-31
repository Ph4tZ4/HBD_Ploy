import { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

const SKIN = '#ffd9c4';
const HAIR = '#1c1c26';
const SHIRT = '#f7f7fa';
const SHORTS = '#1f1f26';
const STRIPE = '#26262e';
const EYE = '#4a3228';
const PINK = '#ff9ebb';
const GOLD = '#e8b64c';

function Doll({ mouse }) {
  const headRef = useRef();
  const eyesRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const targetY = mouse.current.x * 0.55 + Math.sin(t * 0.7) * 0.04;
    const targetX = -mouse.current.y * 0.32 + Math.sin(t * 1.1) * 0.02;
    headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetY, 0.08);
    headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, targetX, 0.08);
    headRef.current.rotation.z = Math.sin(t * 1.2) * 0.03;
    if (eyesRef.current) {
      eyesRef.current.position.x = THREE.MathUtils.lerp(eyesRef.current.position.x, mouse.current.x * 0.045, 0.12);
      eyesRef.current.position.y = THREE.MathUtils.lerp(eyesRef.current.position.y, mouse.current.y * 0.03, 0.12);
    }
  });

  return (
    <group position={[0, -0.95, 0]}>
      {/* Torso: white polo shirt */}
      <mesh position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.24, 0.4, 0.62, 32]} />
        <meshStandardMaterial color={SHIRT} roughness={0.6} />
      </mesh>
      {/* Collar */}
      <mesh position={[0, 0.9, 0.02]} rotation={[0.15, 0, 0]}>
        <cylinderGeometry args={[0.19, 0.26, 0.1, 24]} />
        <meshStandardMaterial color={SHIRT} roughness={0.55} />
      </mesh>
      {/* Placket buttons */}
      {[0.78, 0.7].map((y) => (
        <mesh key={y} position={[0, y, 0.345]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshStandardMaterial color="#d9d9de" roughness={0.4} />
        </mesh>
      ))}
      {/* Gold heart necklace */}
      <mesh position={[0, 0.84, 0.26]} rotation={[0.4, 0, 0]}>
        <torusGeometry args={[0.12, 0.008, 8, 24, Math.PI]} />
        <meshStandardMaterial color={GOLD} roughness={0.25} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.76, 0.31]} rotation={[0.2, 0, Math.PI]}>
        <coneGeometry args={[0.035, 0.05, 12]} />
        <meshStandardMaterial color={GOLD} roughness={0.25} metalness={0.8} />
      </mesh>
      {/* Crest badge on chest */}
      <mesh position={[0.12, 0.72, 0.335]} rotation={[-0.12, 0.28, 0]} scale={[1, 1.25, 0.35]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial color="#8d2438" roughness={0.5} />
      </mesh>

      {/* Shorts: black with white side stripes */}
      <mesh position={[0, 0.26, 0]}>
        <cylinderGeometry args={[0.3, 0.33, 0.24, 32]} />
        <meshStandardMaterial color={SHORTS} roughness={0.6} />
      </mesh>
      {[-0.29, 0.29].map((x) => (
        <mesh key={x} position={[x, 0.26, 0.06]} rotation={[0, 0, x > 0 ? -0.1 : 0.1]}>
          <boxGeometry args={[0.02, 0.22, 0.1]} />
          <meshStandardMaterial color="#f2f2f5" roughness={0.55} />
        </mesh>
      ))}

      {/* Legs + white socks + white shoes */}
      {[-0.13, 0.13].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.08, 0]}>
            <capsuleGeometry args={[0.068, 0.26, 6, 12]} />
            <meshStandardMaterial color={SKIN} roughness={0.6} />
          </mesh>
          {/* Sock */}
          <mesh position={[x, -0.06, 0]}>
            <cylinderGeometry args={[0.072, 0.075, 0.12, 14]} />
            <meshStandardMaterial color="#ffffff" roughness={0.65} />
          </mesh>
          {/* Shoe */}
          <mesh position={[x, -0.15, 0.035]} scale={[1, 0.62, 1.45]}>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshStandardMaterial color="#ffffff" roughness={0.35} />
          </mesh>
        </group>
      ))}

      {/* Arms down, hands clasped in front (sleeves with black stripes) */}
      {[-1, 1].map((s) => (
        <group key={s}>
          {/* Short sleeve */}
          <mesh position={[s * 0.29, 0.82, 0]} rotation={[0, 0, s * -0.5]}>
            <cylinderGeometry args={[0.085, 0.1, 0.16, 14]} />
            <meshStandardMaterial color={SHIRT} roughness={0.6} />
          </mesh>
          {/* Sleeve stripes */}
          <mesh position={[s * 0.335, 0.755, 0]} rotation={[0, 0, s * -0.5]}>
            <cylinderGeometry args={[0.096, 0.101, 0.028, 14]} />
            <meshStandardMaterial color={STRIPE} roughness={0.55} />
          </mesh>
          {/* Arm angled inward toward front */}
          <mesh position={[s * 0.26, 0.56, 0.12]} rotation={[0.35, 0, s * -0.55]}>
            <capsuleGeometry args={[0.06, 0.3, 6, 12]} />
            <meshStandardMaterial color={SKIN} roughness={0.6} />
          </mesh>
          {/* Hand */}
          <mesh position={[s * 0.08, 0.42, 0.24]}>
            <sphereGeometry args={[0.07, 14, 14]} />
            <meshStandardMaterial color={SKIN} roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* Head */}
      <group position={[0, 1.34, 0]} ref={headRef}>
        <mesh>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color={SKIN} roughness={0.55} />
        </mesh>
        {/* Back hair */}
        <mesh position={[0, 0.06, -0.1]} scale={[1.14, 1.16, 1.06]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color={HAIR} roughness={0.4} />
        </mesh>
        {/* Long hair falling down the back */}
        <mesh position={[0, -0.66, -0.3]} scale={[0.8, 1.5, 0.5]}>
          <sphereGeometry args={[0.5, 24, 24]} />
          <meshStandardMaterial color={HAIR} roughness={0.4} />
        </mesh>
        {/* Long front locks over shoulders */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.42, -0.55, 0.1]} rotation={[0, 0, s * 0.08]} scale={[0.42, 2.1, 0.42]}>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshStandardMaterial color={HAIR} roughness={0.4} />
          </mesh>
        ))}
        {/* Bangs with center parting hint */}
        <mesh position={[0, 0.27, 0.24]} scale={[1.02, 0.6, 0.7]}>
          <sphereGeometry args={[0.44, 24, 24]} />
          <meshStandardMaterial color={HAIR} roughness={0.4} />
        </mesh>
        {/* Wispy bang strands */}
        {[-0.16, 0, 0.16].map((x) => (
          <mesh key={x} position={[x, 0.2, 0.42]} rotation={[0.25, 0, x * 0.6]} scale={[0.35, 1, 0.3]}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial color={HAIR} roughness={0.4} />
          </mesh>
        ))}
        {/* Side locks framing the face */}
        {[-0.44, 0.44].map((x) => (
          <mesh key={x} position={[x, -0.14, 0.14]} scale={[0.5, 1.6, 0.55]}>
            <sphereGeometry args={[0.16, 14, 14]} />
            <meshStandardMaterial color={HAIR} roughness={0.4} />
          </mesh>
        ))}

        {/* Eyes: big brown with white sparkles */}
        <group ref={eyesRef}>
          {[-0.18, 0.18].map((x) => (
            <group key={x}>
              {/* White of the eye */}
              <mesh position={[x, 0.02, 0.42]} scale={[1, 1.15, 0.55]}>
                <sphereGeometry args={[0.095, 18, 18]} />
                <meshStandardMaterial color="#ffffff" roughness={0.25} />
              </mesh>
              {/* Brown iris */}
              <mesh position={[x, 0.015, 0.46]} scale={[1, 1.15, 0.5]}>
                <sphereGeometry args={[0.072, 16, 16]} />
                <meshStandardMaterial color={EYE} roughness={0.2} />
              </mesh>
              {/* Pupil */}
              <mesh position={[x, 0.01, 0.49]} scale={[1, 1.1, 0.5]}>
                <sphereGeometry args={[0.042, 12, 12]} />
                <meshStandardMaterial color="#17110d" roughness={0.15} />
              </mesh>
              {/* Big sparkle */}
              <mesh position={[x + 0.03, 0.06, 0.52]}>
                <sphereGeometry args={[0.022, 8, 8]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
              {/* Small sparkle */}
              <mesh position={[x - 0.025, -0.02, 0.52]}>
                <sphereGeometry args={[0.011, 8, 8]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>
          ))}
        </group>

        {/* Eyebrows */}
        {[-0.18, 0.18].map((x) => (
          <mesh key={x} position={[x, 0.17, 0.44]} rotation={[0.25, 0, x > 0 ? -0.12 : 0.12]}>
            <capsuleGeometry args={[0.012, 0.09, 4, 8]} />
            <meshStandardMaterial color={HAIR} roughness={0.5} />
          </mesh>
        ))}

        {/* Nose */}
        <mesh position={[0, -0.05, 0.49]}>
          <sphereGeometry args={[0.028, 10, 10]} />
          <meshStandardMaterial color="#f7c3ac" roughness={0.55} />
        </mesh>

        {/* Blush */}
        {[-0.29, 0.29].map((x) => (
          <mesh key={x} position={[x, -0.09, 0.38]} scale={[1, 0.6, 0.4]}>
            <sphereGeometry args={[0.075, 12, 12]} />
            <meshBasicMaterial color={PINK} transparent opacity={0.5} />
          </mesh>
        ))}

        {/* Beauty mark under the right eye */}
        <mesh position={[0.31, -0.03, 0.4]}>
          <sphereGeometry args={[0.012, 8, 8]} />
          <meshBasicMaterial color="#3a2a24" />
        </mesh>

        {/* Gentle smile */}
        <mesh position={[0, -0.14, 0.46]} rotation={[0.3, 0, Math.PI]}>
          <torusGeometry args={[0.06, 0.014, 8, 16, Math.PI]} />
          <meshBasicMaterial color="#c96a7f" />
        </mesh>
      </group>
    </group>
  );
}

export default function PloyMascot() {
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onTouch = (e) => {
      if (e.touches.length > 0) {
        mouse.current.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouse.current.y = -((e.touches[0].clientY / window.innerHeight) * 2 - 1);
      }
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('touchmove', onTouch, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('touchmove', onTouch);
    };
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0.45, 3.4], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 4, 5]} intensity={1.25} color="#fff0f5" />
      <pointLight position={[-3, 1, 2]} intensity={2.4} color="#b8a9ff" />
      <Float speed={1.6} rotationIntensity={0.1} floatIntensity={0.7}>
        <Doll mouse={mouse} />
      </Float>
    </Canvas>
  );
}
