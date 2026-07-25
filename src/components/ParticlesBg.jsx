import { useMemo } from 'react';
import { Particles, useParticlesProvider } from '@tsparticles/react';

function ParticlesInner() {
  const { loaded } = useParticlesProvider();

  const options = useMemo(
    () => ({
      fullScreen: { enable: true, zIndex: 0 },
      fpsLimit: 30, // Optimized for mobile battery and thermal performance
      particles: {
        number: { value: 25, density: { enable: true, width: 1200, height: 800 } }, // Reduced count
        color: {
          value: ['#ff9ab8', '#ffbcd3', '#ff6b97', '#e8a0b0', '#f7d088'],
        },
        shape: {
          type: ['circle', 'heart'],
        },
        opacity: {
          value: { min: 0.15, max: 0.35 },
          animation: { enable: true, speed: 0.5, startValue: 'random', sync: false },
        },
        size: {
          value: { min: 3, max: 8 },
          animation: { enable: true, speed: 1, startValue: 'random', sync: false },
        },
        move: {
          enable: true,
          speed: { min: 0.3, max: 0.8 },
          direction: 'top',
          outModes: { default: 'out' },
          random: true,
          straight: false,
        },
      },
      interactivity: {
        events: {
          onHover: { enable: false }, // Disabled expensive hover detection
        },
      },
      detectRetina: true,
    }),
    []
  );

  if (!loaded) return null;

  return <Particles id="tsparticles" options={options} />;
}

export default function ParticlesBg() {
  return <ParticlesInner />;
}
