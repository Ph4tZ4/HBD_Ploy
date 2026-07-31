/* ================================================================
   CakeAndMemories.jsx — the classic features in full 3D:

   1. Birthday cake with flickering candle flames. Blow into the
      microphone (Web Audio RMS level via useMicLevel) — or hold
      the on-screen button — to snuff them one by one. Wind makes
      the flames lean and gutter before they die.
   2. Memory Gallery — a 3D photo carousel. Photos are auto-
      imported from src/images via import.meta.glob and floated
      on glass-framed panels; rotation is damped for a creamy feel.
   ================================================================ */
import * as THREE from 'three';
import { useMemo, useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Image as DreiImage, Sparkles, RoundedBox } from '@react-three/drei';
import { useGame, blowInput, CANDLE_COUNT } from './store';

const { damp } = THREE.MathUtils;

/* ----- Photo auto-import ------------------------------------------- */
const photoModules = import.meta.glob('./images/*.{jpg,JPG,jpeg,png}', {
  eager: true,
  query: '?url',
  import: 'default',
});
export const PHOTOS = Object.values(photoModules).slice(0, 10);

/* ================================================================
   Candle with a living flame
   ================================================================ */
const FLAME_COLORS = ['#ffd98e', '#ffb84d'];

function Candle({ index, position }) {
  const flameRef = useRef();
  const glowRef = useRef();
  const state = useRef({ heat: 1, out: false });
  const candlesOut = useGame((s) => s.candlesOut);
  const phase = useGame((s) => s.phase);

  useFrame((st, delta) => {
    const s = state.current;
    const t = st.clock.elapsedTime;

    /* re-light on replay */
    if (phase === 'cake' && candlesOut === 0 && s.out && index >= 0) {
      s.heat = 1; s.out = false;
    }

    /* only the "next" candle takes wind damage → they die in order */
    const level = blowInput.holding ? 1 : blowInput.levelRef.current;
    const isNext = index === candlesOut;
    if (phase === 'cake' && !s.out && isNext && level > 0.22) {
      s.heat -= delta * level * 1.6;
      if (s.heat <= 0) {
        s.heat = 0; s.out = true;
        useGame.getState().snuffCandle();
      }
    }

    if (!flameRef.current) return;
    const heat = s.heat;
    /* gentle flicker; guttering only when the flame is nearly out */
    const flicker = 1 + Math.sin(t * 11 + index * 7) * 0.06 + Math.sin(t * 19 + index * 3) * 0.04;
    const gutter = heat < 0.35 ? 0.65 + Math.sin(t * 26 + index) * 0.2 : 1;

    flameRef.current.visible = heat > 0.01;
    flameRef.current.scale.set(
      0.7 + heat * 0.3,
      (0.5 + heat * 0.5) * flicker * gutter,
      0.7 + heat * 0.3,
    );
    /* flames lean away from the "wind" */
    flameRef.current.rotation.z = damp(
      flameRef.current.rotation.z,
      -Math.min(level, 1) * 0.55 * heat,
      5, delta,
    );
    if (glowRef.current) {
      glowRef.current.intensity = heat * (3.2 + Math.sin(t * 9 + index) * 0.4);
    }
  });

  return (
    <group position={position}>
      {/* wax — slim pastel candle with a spiral stripe feel */}
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.028, 0.032, 0.32, 12]} />
        <meshStandardMaterial color={index % 2 ? '#ffb7cd' : '#c9bcff'} roughness={0.5} />
      </mesh>
      {/* wick */}
      <mesh position={[0, 0.335, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.035, 6]} />
        <meshBasicMaterial color="#3a2a1a" />
      </mesh>
      {/* flame — soft additive teardrop, white-hot core */}
      <group ref={flameRef} position={[0, 0.41, 0]}>
        <mesh scale={[0.05, 0.11, 0.05]} position={[0, 0.01, 0]}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshBasicMaterial
            color={FLAME_COLORS[1]} toneMapped={false} transparent opacity={0.85}
            blending={THREE.AdditiveBlending} depthWrite={false}
          />
        </mesh>
        <mesh scale={[0.026, 0.06, 0.026]} position={[0, -0.005, 0]}>
          <sphereGeometry args={[1, 10, 10]} />
          <meshBasicMaterial
            color="#fff6e0" toneMapped={false} transparent opacity={0.95}
            blending={THREE.AdditiveBlending} depthWrite={false}
          />
        </mesh>
        <pointLight ref={glowRef} color="#ffbf6e" intensity={3.2} distance={2.6} decay={2} />
      </group>
    </group>
  );
}

/* ================================================================
   The cake
   ================================================================ */
function Cake() {
  const phase = useGame((s) => s.phase);
  const candlesOut = useGame((s) => s.candlesOut);
  const group = useRef();
  const allOut = candlesOut >= CANDLE_COUNT;

  const candlePositions = useMemo(
    () =>
      Array.from({ length: CANDLE_COUNT }, (_, i) => {
        const a = (i / CANDLE_COUNT) * Math.PI * 2 + 0.4;
        return [Math.cos(a) * 0.42, 1.02, Math.sin(a) * 0.42];
      }),
    [],
  );

  useFrame((st, delta) => {
    if (!group.current) return;
    const show = phase === 'cake';
    const g = group.current;
    g.position.y = damp(g.position.y, show ? -1.35 : -5, 2.2, delta);
    g.rotation.y = damp(g.rotation.y, show ? 0 : 0.6, 2.2, delta);
    g.visible = g.position.y > -4.8;
  });

  return (
    <group ref={group} position={[0, -5, 0.4]}>
      {/* warm candlelight fill so the cake reads soft & cozy */}
      <pointLight position={[0, 2.2, 1.6]} intensity={6} color="#ffe3c4" distance={7} decay={2} />

      {/* plate */}
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[1.3, 1.38, 0.06, 48]} />
        <meshStandardMaterial color="#f2eefc" roughness={0.2} metalness={0.25} />
      </mesh>
      {/* tiers — soft strawberry-cream */}
      <mesh position={[0, 0.34, 0]}>
        <cylinderGeometry args={[0.98, 1.02, 0.56, 48]} />
        <meshStandardMaterial color="#f6cfdd" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.82, 0]}>
        <cylinderGeometry args={[0.66, 0.7, 0.42, 48]} />
        <meshStandardMaterial color="#fce3ec" roughness={0.6} />
      </mesh>
      {/* cream drip rims */}
      <mesh position={[0, 0.62, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.99, 0.06, 12, 48]} />
        <meshStandardMaterial color="#fff7f0" roughness={0.45} />
      </mesh>
      <mesh position={[0, 1.02, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.67, 0.05, 12, 48]} />
        <meshStandardMaterial color="#fff7f0" roughness={0.45} />
      </mesh>
      {/* cream dollops around the bottom tier */}
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return (
          <mesh key={`d${i}`} position={[Math.cos(a) * 0.99, 0.62, Math.sin(a) * 0.99]} scale={[1, 1.4, 1]}>
            <sphereGeometry args={[0.055, 10, 10]} />
            <meshStandardMaterial color="#ffffff" roughness={0.4} />
          </mesh>
        );
      })}
      {/* strawberries on the ledge */}
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2 + 0.3;
        return (
          <mesh key={`s${i}`} position={[Math.cos(a) * 0.84, 0.68, Math.sin(a) * 0.84]} scale={[1, 1.15, 1]}>
            <sphereGeometry args={[0.055, 10, 10]} />
            <meshStandardMaterial color="#ff5f7e" roughness={0.35} />
          </mesh>
        );
      })}
      {/* cherry on top */}
      <mesh position={[0, 1.1, 0]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial color="#e63b5f" roughness={0.25} />
      </mesh>

      {candlePositions.map((p, i) => (
        <Candle key={i} index={i} position={p} />
      ))}

      {/* smoke + congrats sparkle once everything is out */}
      {allOut && (
        <Sparkles count={60} scale={[2.4, 1.6, 2.4]} position={[0, 1.6, 0]} size={2.6} speed={0.9} color="#ffd98e" />
      )}
    </group>
  );
}

/* ================================================================
   Memory Gallery — damped 3D carousel
   ================================================================ */
function MemoryCarousel() {
  const phase = useGame((s) => s.phase);
  const memIndex = useGame((s) => s.memIndex);
  const group = useRef();
  const ring = useRef();
  const step = (Math.PI * 2) / Math.max(PHOTOS.length, 1);

  useFrame((st, delta) => {
    if (!group.current || !ring.current) return;
    const show = phase === 'memories';
    group.current.position.y = damp(group.current.position.y, show ? 0.7 : -6, 2.0, delta);
    group.current.visible = group.current.position.y > -5.5;
    /* creamy rotation toward the selected photo */
    ring.current.rotation.y = damp(ring.current.rotation.y, -memIndex * step, 3.2, delta);
    ring.current.children.forEach((child, i) => {
      const active = i === ((memIndex % PHOTOS.length) + PHOTOS.length) % PHOTOS.length;
      const target = active ? 1.18 : 0.92;
      child.scale.setScalar(damp(child.scale.x, target, 4, delta));
    });
  });

  if (!PHOTOS.length) return null;
  const radius = 3.0;

  return (
    <group ref={group} position={[0, -6, 0]}>
      {/* the ring pivot sits behind the stage; photos orbit around it,
          so the front photo lands at world z ≈ 0 facing the camera */}
      <group ref={ring} position={[0, 0, -radius]}>
        {PHOTOS.map((url, i) => {
          const a = i * step;
          return (
            <group
              key={url}
              position={[Math.sin(a) * radius, 0, Math.cos(a) * radius]}
              rotation-y={a}
            >
              {/* glass-style frame */}
              <RoundedBox args={[1.72, 2.22, 0.05]} radius={0.09} position={[0, 0, -0.04]}>
                <meshStandardMaterial
                  color="#ffffff" roughness={0.12} metalness={0.3}
                  transparent opacity={0.28}
                />
              </RoundedBox>
              <Suspense fallback={null}>
                <DreiImage url={url} scale={[1.56, 2.06]} radius={0.07} toneMapped={false} />
              </Suspense>
            </group>
          );
        })}
      </group>
      <Sparkles count={40} scale={[8, 4, 6]} size={1.8} speed={0.3} color="#f5c6d6" opacity={0.5} />
    </group>
  );
}

/* ================================================================ */
export default function CakeAndMemories() {
  return (
    <group>
      <Cake />
      <MemoryCarousel />
    </group>
  );
}
