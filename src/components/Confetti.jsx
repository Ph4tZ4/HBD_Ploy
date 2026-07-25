import { useMemo, useCallback } from 'react';
import { Particles, useParticlesProvider } from '@tsparticles/react';

function ConfettiInner({ active }) {
  const { loaded } = useParticlesProvider();

  const options = useMemo(
    () => ({
      fullScreen: { enable: true, zIndex: 3000 },
      fpsLimit: 60,
      particles: {
        number: { value: 0 },
        color: {
          value: [
            '#ff6b9d', '#ff9ab8', '#ffc0d3', '#f7d794',
            '#e8a87c', '#e84393', '#c44569', '#ffffff',
            '#ffcc02', '#ffd1dc',
          ],
        },
        shape: {
          type: ['square', 'circle'],
        },
        opacity: {
          value: { min: 0.6, max: 1 },
          animation: { enable: true, speed: 1, startValue: 'max', destroy: 'min' },
        },
        size: {
          value: { min: 3, max: 8 },
        },
        move: {
          enable: true,
          speed: { min: 10, max: 25 },
          direction: 'none',
          outModes: { default: 'destroy' },
          gravity: { enable: true, acceleration: 5 },
        },
        tilt: {
          enable: true,
          value: { min: 0, max: 360 },
          direction: 'random',
          animation: { enable: true, speed: 30 },
        },
        roll: {
          enable: true,
          darken: { enable: true, value: 20 },
          speed: { min: 10, max: 25 },
        },
        wobble: {
          enable: true,
          distance: 30,
          speed: 10,
        },
        life: {
          duration: { value: 5 },
          count: 1,
        },
      },
      emitters: active
        ? [
            {
              position: { x: 50, y: 40 },
              rate: { quantity: 30, delay: 0.1 },
              life: { duration: 0.5, count: 1 },
              size: { width: 60, height: 0 },
            },
          ]
        : [],
      detectRetina: true,
    }),
    [active]
  );

  const particlesLoaded = useCallback(async () => {}, []);

  if (!loaded || !active) return null;

  return (
    <Particles
      id="confetti-particles"
      options={options}
      particlesLoaded={particlesLoaded}
    />
  );
}

export default function Confetti({ active }) {
  return <ConfettiInner active={active} />;
}
