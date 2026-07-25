import { ParticlesProvider } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import NavDots from './components/NavDots';
import MusicPlayer from './components/MusicPlayer';
import FloatingBalloons from './components/FloatingBalloons';
import Hero from './components/Hero';
import Wishes from './components/Wishes';
import Gallery from './components/Gallery';
import Timeline from './components/Timeline';
import MiniGame from './components/MiniGame';
import MakeAWish from './components/MakeAWish';
import ParticlesBg from './components/ParticlesBg';

async function particlesInit(engine) {
  await loadSlim(engine);
}

export default function App() {
  return (
    <ParticlesProvider init={particlesInit}>
      <ParticlesBg />
      <FloatingBalloons />
      <MusicPlayer />
      <NavDots />
      <Hero />
      <Wishes />
      <Gallery />
      <Timeline />
      <MiniGame />
      <MakeAWish />
    </ParticlesProvider>
  );
}
