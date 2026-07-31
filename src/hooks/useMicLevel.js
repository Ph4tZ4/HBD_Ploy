import { useEffect, useRef, useState, useCallback } from 'react';

/* Microphone volume level (0..1) for candle blowing. */
export default function useMicLevel() {
  const [enabled, setEnabled] = useState(false);
  const [denied, setDenied] = useState(false);
  const levelRef = useRef(0);
  const rafRef = useRef(0);

  const enable = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const src = ac.createMediaStreamSource(stream);
      const analyser = ac.createAnalyser();
      analyser.fftSize = 512;
      src.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        levelRef.current = Math.min(1, Math.sqrt(sum / data.length) * 4);
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
      setEnabled(true);
    } catch {
      setDenied(true);
    }
  }, []);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return { levelRef, enabled, denied, enable };
}
