let ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

/* Gentle ascending chime — pitch rises with streak */
export function playChime(streak = 0) {
  try {
    const ac = getCtx();
    const notes = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66];
    const freq = notes[Math.min(streak, notes.length - 1)];
    const t = ac.currentTime;
    [0, 0.06].forEach((delay, i) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq * (i === 1 ? 2 : 1);
      gain.gain.setValueAtTime(0, t + delay);
      gain.gain.linearRampToValueAtTime(i === 1 ? 0.08 : 0.22, t + delay + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 0.7);
      osc.connect(gain).connect(ac.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 0.75);
    });
  } catch {
    /* audio unavailable — silent */
  }
}

/* Soft pop for UI feedback */
export function playPop() {
  try {
    const ac = getCtx();
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(160, t + 0.12);
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  } catch {
    /* audio unavailable — silent */
  }
}
