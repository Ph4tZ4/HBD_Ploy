/* ================================================================
   GachaSystem.jsx — the core experience:

   1. Rhythm mini-game: a pulse ring collapses toward a target
      ring around the star core. Tap when they align. 3 hits
      charge the altar.
   2. Summoning: the altar erupts, a card rises from the light
      column, spins, and flips to reveal the pull.
   3. Rarity FX: color, sparkle density and burst scale all key
      off the rolled rarity.

   All motion uses damp/lerp on refs — no per-frame React state.
   ================================================================ */
import * as THREE from 'three';
import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles, Text, RoundedBox } from '@react-three/drei';
import { GlassPanel } from './LiquidGlassMaterial';
import { useGame, RARITY } from './store';

const { damp, lerp, clamp } = THREE.MathUtils;

/* ----- Mini-game tuning ------------------------------------------- */
const RING_START = 2.4; // pulse ring spawn radius
const RING_TARGET = 0.9; // target ring radius
const HIT_WINDOW = 0.22; // |r - target| ≤ window → hit
const PERFECT_WINDOW = 0.09;

/* ================================================================
   Rhythm mini-game
   ================================================================ */
function RhythmGame() {
  const phase = useGame((s) => s.phase);
  const hits = useGame((s) => s.hits);
  const pulseRef = useRef();
  const targetRef = useRef();
  const coreRef = useRef();
  const state = useRef({ r: RING_START, speed: 1.1, flash: 0 });

  const active = phase === 'game';

  const tap = () => {
    if (!active) return;
    const diff = Math.abs(state.current.r - RING_TARGET);
    if (diff <= HIT_WINDOW) {
      useGame.getState().registerHit(diff <= PERFECT_WINDOW);
      state.current.flash = 1;
      state.current.speed += 0.35; // ramp difficulty
    } else {
      useGame.getState().registerMiss();
    }
    state.current.r = RING_START;
  };

  /* let the HTML overlay trigger taps too (spacebar / TAP button) */
  useEffect(() => {
    useGame.setState({ tap });
    const onKey = (e) => { if (e.code === 'Space') tap(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useFrame((st, delta) => {
    const s = state.current;
    if (active) {
      s.r -= delta * s.speed;
      if (s.r < RING_TARGET - HIT_WINDOW * 1.4) {
        useGame.getState().registerMiss();
        s.r = RING_START;
      }
    }
    s.flash = damp(s.flash, 0, 6, delta);

    if (pulseRef.current) {
      pulseRef.current.scale.setScalar(Math.max(s.r, 0.01));
      pulseRef.current.material.opacity = active ? clamp(1.6 - s.r * 0.45, 0.15, 0.95) : 0;
      pulseRef.current.material.color.lerpColors(
        new THREE.Color('#ff9ebb'),
        new THREE.Color('#ffd98e'),
        clamp(1 - Math.abs(s.r - RING_TARGET) / 1.2, 0, 1),
      );
    }
    if (targetRef.current) {
      const glow = 0.35 + s.flash * 2.5 + Math.sin(st.clock.elapsedTime * 3) * 0.08;
      targetRef.current.material.opacity = active ? 0.9 : 0.25;
      targetRef.current.material.color.setScalar(1).lerp(new THREE.Color('#ffd98e'), 0.6);
      targetRef.current.scale.setScalar(RING_TARGET * (1 + s.flash * 0.08));
      targetRef.current.material.emissiveIntensity = glow;
    }
    if (coreRef.current) {
      const charge = hits / 3;
      coreRef.current.material.emissiveIntensity = lerp(0.6, 3.2, charge) + s.flash * 3;
      coreRef.current.rotation.y += delta * (0.4 + charge);
      coreRef.current.rotation.z += delta * 0.2;
    }
  });

  return (
    <group position={[0, 0.7, 0]}>
      {/* star core */}
      <mesh ref={coreRef} onPointerDown={tap}>
        <icosahedronGeometry args={[0.34, 1]} />
        <meshStandardMaterial
          color="#fff1d6" emissive="#ffd98e" emissiveIntensity={1}
          roughness={0.15} metalness={0.4} flatShading
        />
      </mesh>

      {/* target ring */}
      <mesh ref={targetRef} rotation-x={0}>
        <torusGeometry args={[1, 0.016, 12, 72]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffd98e" transparent />
      </mesh>

      {/* collapsing pulse ring */}
      <mesh ref={pulseRef}>
        <torusGeometry args={[1, 0.022, 12, 72]} />
        <meshBasicMaterial color="#ff9ebb" transparent toneMapped={false} />
      </mesh>

      {/* generous invisible tap zone */}
      <mesh visible={false} onPointerDown={tap}>
        <planeGeometry args={[7, 7]} />
      </mesh>
    </group>
  );
}

/* ================================================================
   Altar — charges with each hit, erupts on summon
   ================================================================ */
function Altar() {
  const hits = useGame((s) => s.hits);
  const phase = useGame((s) => s.phase);
  const crystalRef = useRef();
  const beamRef = useRef();

  useFrame((st, delta) => {
    const charge = phase === 'summoning' || phase === 'reveal' ? 1 : hits / 3;
    if (crystalRef.current) {
      crystalRef.current.rotation.y += delta * (0.5 + charge * 2);
      crystalRef.current.material.emissiveIntensity = damp(
        crystalRef.current.material.emissiveIntensity,
        0.4 + charge * 3 + (phase === 'summoning' ? 5 : 0),
        3, delta,
      );
    }
    if (beamRef.current) {
      const target = phase === 'summoning' ? 1 : phase === 'reveal' ? 0.35 : charge * 0.12;
      beamRef.current.material.opacity = damp(beamRef.current.material.opacity, target, 3, delta);
      beamRef.current.scale.x = beamRef.current.scale.z =
        damp(beamRef.current.scale.x, phase === 'summoning' ? 1.25 : 1, 3, delta);
    }
  });

  return (
    <group position={[0, -1.55, 0]}>
      {/* stepped base */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[1.5, 1.7, 0.16, 48]} />
        <meshStandardMaterial color="#1c1c40" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.26, 0]}>
        <cylinderGeometry args={[1.05, 1.2, 0.2, 48]} />
        <meshStandardMaterial color="#26264f" roughness={0.25} metalness={0.75} />
      </mesh>

      {/* charging crystal */}
      <mesh ref={crystalRef} position={[0, 0.62, 0]}>
        <octahedronGeometry args={[0.26, 0]} />
        <meshStandardMaterial color="#e8dcff" emissive="#b8a9ff" emissiveIntensity={0.4} roughness={0.1} />
      </mesh>

      {/* light beam */}
      <mesh ref={beamRef} position={[0, 2.4, 0]}>
        <cylinderGeometry args={[0.5, 0.9, 4.4, 24, 1, true]} />
        <meshBasicMaterial
          color="#ffe9c2" transparent opacity={0} toneMapped={false}
          side={THREE.DoubleSide} depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/* ================================================================
   Summoned card — rises, spins, flips; rarity-driven FX
   ================================================================ */
function SummonCard() {
  const phase = useGame((s) => s.phase);
  const card = useGame((s) => s.card);
  const group = useRef();
  const anim = useRef({ t: 0 });

  const rarity = card ? RARITY[card.rarity] : RARITY.R;
  const active = phase === 'summoning' || phase === 'reveal';

  useEffect(() => {
    if (phase === 'summoning') {
      anim.current.t = 0;
      const timer = setTimeout(() => useGame.getState().reveal(), 3200);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  useFrame((st, delta) => {
    if (!group.current) return;
    const g = group.current;
    if (!active) {
      g.visible = false;
      return;
    }
    g.visible = true;
    anim.current.t += delta;
    const t = anim.current.t;

    if (phase === 'summoning') {
      /* rise from altar + accelerate spin */
      const rise = clamp(t / 2.4, 0, 1);
      const eased = 1 - Math.pow(1 - rise, 3);
      g.position.y = lerp(-1.1, 1.15, eased);
      g.rotation.y += delta * (2 + t * 3);
      g.scale.setScalar(lerp(0.25, 1, eased));
    } else {
      /* settle facing camera, gentle bob */
      g.position.y = damp(g.position.y, 1.15 + Math.sin(st.clock.elapsedTime * 1.2) * 0.04, 3, delta);
      const twoPi = Math.PI * 2;
      g.rotation.y = damp(g.rotation.y % twoPi, g.rotation.y % twoPi > Math.PI ? twoPi : 0, 4, delta);
      g.scale.setScalar(damp(g.scale.x, 1.12, 3, delta));
    }
  });

  const sparkleCount = card?.rarity === 'SSR' ? 160 : card?.rarity === 'SR' ? 80 : 36;

  return (
    <group ref={group} visible={false}>
      {/* card body */}
      <RoundedBox args={[1.5, 2.1, 0.06]} radius={0.09} smoothness={4}>
        <meshStandardMaterial
          color="#14142e" roughness={0.2} metalness={0.6}
          emissive={rarity.glow} emissiveIntensity={phase === 'reveal' ? 0.35 : 1.4}
        />
      </RoundedBox>

      {/* face frame + rarity gem */}
      <RoundedBox args={[1.34, 1.94, 0.02]} radius={0.08} position={[0, 0, 0.035]}>
        <meshStandardMaterial color={rarity.color} roughness={0.25} metalness={0.5} emissive={rarity.glow} emissiveIntensity={0.25} />
      </RoundedBox>
      <mesh position={[0, 0.45, 0.08]}>
        <octahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial color={rarity.color} emissive={rarity.glow} emissiveIntensity={2} roughness={0.1} />
      </mesh>

      {phase === 'reveal' && card && (
        <>
          <Text
            position={[0, -0.1, 0.08]} fontSize={0.13} maxWidth={1.1}
            color="#0b0b1e" anchorX="center" anchorY="middle"
          >
            {card.title}
          </Text>
          <Text position={[0, -0.72, 0.08]} fontSize={0.085} color="#23233a" anchorX="center">
            {RARITY[card.rarity].label}
          </Text>
        </>
      )}

      <Sparkles count={sparkleCount} scale={[2.6, 3.2, 1.4]} size={3} speed={0.6} color={rarity.color} />
      {card?.rarity === 'SSR' && (
        <pointLight color={rarity.glow} intensity={20} distance={6} />
      )}
    </group>
  );
}

/* ================================================================
   Floating glass HUD panel behind the play area (true shader glass)
   ================================================================ */
function GlassStage() {
  const phase = useGame((s) => s.phase);
  const group = useRef();
  useFrame((st, delta) => {
    if (!group.current) return;
    const show = phase === 'intro' ? 0.9 : 0;
    group.current.position.z = damp(group.current.position.z, phase === 'intro' ? 1.4 : -2.5, 2.5, delta);
    group.current.scale.setScalar(damp(group.current.scale.x, show > 0 ? 1 : 0.85, 2.5, delta));
  });
  return (
    <group ref={group} position={[0, 0.55, 1.4]}>
      <GlassPanel width={4.6} height={2.7} radius={0.34} />
    </group>
  );
}

/* ================================================================ */
const GACHA_PHASES = ['intro', 'game', 'charged', 'summoning', 'reveal', 'collection'];

export default function GachaSystem() {
  const phase = useGame((s) => s.phase);
  const group = useRef();
  const show = GACHA_PHASES.includes(phase);

  /* glide the whole stage away during cake / memories chapters */
  useFrame((st, delta) => {
    if (!group.current) return;
    group.current.position.y = damp(group.current.position.y, show ? 0 : 7, 2.0, delta);
    group.current.visible = group.current.position.y < 6.5;
  });

  return (
    <group ref={group}>
      <GlassStage />
      <RhythmGame />
      <Altar />
      <SummonCard />
    </group>
  );
}
