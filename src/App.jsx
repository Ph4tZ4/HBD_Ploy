/* ================================================================
   App.jsx — entry point: fuses the R3F Canvas with the HTML UI.
   Global state lives in store.js (zustand) so it flows freely
   across the Canvas reconciler boundary.
   ================================================================ */
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, Preload } from '@react-three/drei';
import Scene from './Scene';
import UIOverlay from './UIOverlay';

export default function App() {
  return (
    <>
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: 'high-performance', stencil: false }}
        camera={{ position: [0, 0.6, 7.5], fov: 42, near: 0.1, far: 60 }}
        style={{ position: 'fixed', inset: 0 }}
        onCreated={({ camera }) => camera.layers.enableAll()}
      >
        <Suspense fallback={null}>
          <Scene />
          <Preload all />
        </Suspense>
        {/* drops resolution during fast motion, restores at rest → locked 60fps */}
        <AdaptiveDpr pixelated={false} />
      </Canvas>
      <UIOverlay />
    </>
  );
}
