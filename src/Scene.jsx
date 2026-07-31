/* ================================================================
   Scene.jsx — R3F environment: lighting, lerped camera rig,
   drifting star-dust background and floating decor. Everything
   per-frame is mutated via refs + lerp (zero React re-renders).
   ================================================================ */
import * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, Sparkles, Stars, Float } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { GlassBackdrop } from './LiquidGlassMaterial';
import GachaSystem from './GachaSystem';
import CakeAndMemories from './CakeAndMemories';
import { useGame } from './store';

const { damp } = THREE.MathUtils;

/* ----- Camera rig: creamy pointer parallax + phase framing -------- */
const CAM_TARGETS = {
  intro: { pos: [0, 0.6, 7.5], look: [0, 0.4, 0] },
  cake: { pos: [0, 0.5, 4.6], look: [0, -0.3, 0.4] },
  memories: { pos: [0, 0.8, 5.4], look: [0, 0.7, 0] },
  game: { pos: [0, 0.8, 6.2], look: [0, 0.6, 0] },
  charged: { pos: [0, 1.0, 5.6], look: [0, 0.7, 0] },
  summoning: { pos: [0, 1.4, 4.2], look: [0, 1.1, 0] },
  reveal: { pos: [0, 1.2, 4.6], look: [0, 1.2, 0] },
  collection: { pos: [0, 0.9, 6.8], look: [0, 0.6, 0] },
};

function CameraRig() {
  const look = useRef(new THREE.Vector3(0, 0.4, 0));
  const phase = useGame((s) => s.phase);

  useFrame((state, delta) => {
    const t = CAM_TARGETS[phase] ?? CAM_TARGETS.intro;
    const { camera, pointer } = state;
    const px = pointer.x * 0.55;
    const py = pointer.y * 0.35;

    camera.position.x = damp(camera.position.x, t.pos[0] + px, 2.4, delta);
    camera.position.y = damp(camera.position.y, t.pos[1] + py, 2.4, delta);
    camera.position.z = damp(camera.position.z, t.pos[2], 2.0, delta);

    look.current.x = damp(look.current.x, t.look[0] + px * 0.2, 2.4, delta);
    look.current.y = damp(look.current.y, t.look[1], 2.4, delta);
    look.current.z = damp(look.current.z, t.look[2], 2.4, delta);
    camera.lookAt(look.current);
  });
  return null;
}

/* ----- Instanced drifting orbs (cheap, one draw call) -------------- */
function DriftingOrbs({ count = 40 }) {
  const mesh = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        pos: new THREE.Vector3(
          (Math.random() - 0.5) * 22,
          (Math.random() - 0.5) * 12,
          -4 - Math.random() * 14,
        ),
        speed: 0.2 + Math.random() * 0.5,
        scale: 0.04 + Math.random() * 0.12,
        offset: Math.random() * Math.PI * 2,
      })),
    [count],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    seeds.forEach((s, i) => {
      dummy.position.set(
        s.pos.x + Math.sin(t * s.speed + s.offset) * 0.6,
        s.pos.y + Math.cos(t * s.speed * 0.8 + s.offset) * 0.8,
        s.pos.z,
      );
      const pulse = 1 + Math.sin(t * 1.4 + s.offset) * 0.25;
      dummy.scale.setScalar(s.scale * pulse);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshBasicMaterial color="#f5c6d6" transparent opacity={0.5} toneMapped={false} />
    </instancedMesh>
  );
}

/* ----- Ground: soft reflective disc -------------------------------- */
function Ground() {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -1.6, 0]}>
      <circleGeometry args={[16, 48]} />
      <meshStandardMaterial color="#12122b" roughness={0.35} metalness={0.6} />
    </mesh>
  );
}

/* ----- Scene root --------------------------------------------------- */
export default function Scene() {
  return (
    <GlassBackdrop>
      <color attach="background" args={['#0b0b1e']} />
      <fog attach="fog" args={['#0b0b1e', 10, 26]} />

      <CameraRig />

      {/* Lighting — one shadow-free key + colored fills (cheap) */}
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 5]} intensity={1.1} color="#fff4e0" />
      <pointLight position={[-5, 2, -3]} intensity={12} color="#b8a9ff" />
      <pointLight position={[5, -1, -2]} intensity={10} color="#ff9ebb" />
      <Environment preset="city" environmentIntensity={0.5} />

      {/* Background dressing */}
      <Stars radius={60} depth={40} count={2400} factor={3.2} saturation={0.4} fade speed={0.6} />
      <Sparkles count={80} scale={[16, 9, 8]} size={2.2} speed={0.35} color="#ffd98e" opacity={0.65} />
      <DriftingOrbs />
      <Ground />

      <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.5}>
        <GachaSystem />
      </Float>
      <CakeAndMemories />

      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.85} intensity={0.9} mipmapBlur radius={0.7} />
        <Vignette darkness={0.55} offset={0.25} />
      </EffectComposer>
    </GlassBackdrop>
  );
}
