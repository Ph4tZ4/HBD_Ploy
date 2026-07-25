import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GAME_DURATION } from '../config';
import './MiniGame.css';

export default function MiniGame() {
  const canvasRef = useRef(null);
  const [state, setState] = useState('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [best, setBest] = useState(() =>
    parseInt(localStorage.getItem('hbd_ploy_best') || '0', 10)
  );
  const [message, setMessage] = useState('');

  const gameRef = useRef({
    hearts: [],
    catcher: { x: 0, y: 0, w: 76, h: 32 },
    effects: [],
    score: 0,
    running: false,
    animId: null,
    timerInterval: null,
    spawnInterval: null,
  });

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const g = gameRef.current;
    g.catcher.y = canvas.height - 50;
    g.catcher.x = canvas.width / 2 - g.catcher.w / 2;
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  const moveCatcher = useCallback((clientX) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const g = gameRef.current;
    const x = (clientX - rect.left) * scaleX - g.catcher.w / 2;
    g.catcher.x = Math.max(0, Math.min(canvas.width - g.catcher.w, x));
  }, []);

  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    resizeCanvas();
    const ctx = canvas.getContext('2d');
    const g = gameRef.current;

    g.hearts = [];
    g.effects = [];
    g.score = 0;
    g.running = true;
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setState('playing');

    let localTime = GAME_DURATION;

    g.timerInterval = setInterval(() => {
      localTime--;
      setTimeLeft(localTime);
      if (localTime <= 0) endGame();
    }, 1000);

    g.spawnInterval = setInterval(() => {
      if (!g.running) return;
      g.hearts.push({
        x: Math.random() * (canvas.width - 30) + 15,
        y: -20,
        size: Math.random() * 14 + 14,
        speed: Math.random() * 2.5 + 1.8,
        golden: Math.random() > 0.8,
        strawberry: Math.random() > 0.85,
        wobbleAmp: Math.random() * 2 - 1,
        wobbleFreq: Math.random() * 0.03 + 0.01,
        wobbleOff: Math.random() * Math.PI * 2,
        rot: 0,
      });
    }, 450);

    function loop() {
      if (!g.running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Light background fill
      ctx.fillStyle = '#fffdfd';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Hearts & Strawberries
      for (let i = g.hearts.length - 1; i >= 0; i--) {
        const h = g.hearts[i];
        h.y += h.speed;
        h.x += Math.sin(h.y * h.wobbleFreq + h.wobbleOff) * h.wobbleAmp;
        h.rot = Math.sin(h.y * 0.02) * 0.2;

        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.rotate(h.rot);
        ctx.font = `${h.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (h.strawberry) {
          ctx.fillText('🍓', 0, 0);
        } else if (h.golden) {
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#f7d794';
          ctx.fillText('💛', 0, 0);
        } else {
          ctx.fillText('💖', 0, 0);
        }
        ctx.restore();

        // Collision
        if (
          h.x > g.catcher.x &&
          h.x < g.catcher.x + g.catcher.w &&
          h.y > g.catcher.y &&
          h.y < g.catcher.y + g.catcher.h
        ) {
          const pts = h.strawberry ? 5 : h.golden ? 3 : 1;
          g.score += pts;
          setScore(g.score);
          for (let j = 0; j < 8; j++) {
            g.effects.push({
              x: h.x, y: h.y,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              size: Math.random() * 4 + 2,
              life: 1,
              hue: 330 + Math.random() * 40,
            });
          }
          g.hearts.splice(i, 1);
        } else if (h.y > canvas.height + 20) {
          g.hearts.splice(i, 1);
        }
      }

      // Catcher Basket (Pink Pastel)
      const { x, y, w, h: ch } = g.catcher;
      ctx.save();
      ctx.shadowBlur = 12;
      ctx.shadowColor = 'rgba(255,107,151,0.4)';
      const grad = ctx.createLinearGradient(x, y, x, y + ch);
      grad.addColorStop(0, '#ff85a2');
      grad.addColorStop(1, '#ff477e');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w - 6, y + ch);
      ctx.lineTo(x + 6, y + ch);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - 4, y);
      ctx.lineTo(x + w + 4, y);
      ctx.stroke();
      ctx.font = '16px serif';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 0;
      ctx.fillText('🧺', x + w / 2, y + ch / 2 + 2);
      ctx.restore();

      // Effects
      for (let i = g.effects.length - 1; i >= 0; i--) {
        const e = g.effects[i];
        e.x += e.vx;
        e.y += e.vy;
        e.life -= 0.03;
        if (e.life <= 0) { g.effects.splice(i, 1); continue; }
        ctx.save();
        ctx.globalAlpha = e.life;
        ctx.fillStyle = `hsl(${e.hue},90%,65%)`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      g.animId = requestAnimationFrame(loop);
    }

    function endGame() {
      g.running = false;
      clearInterval(g.timerInterval);
      clearInterval(g.spawnInterval);
      cancelAnimationFrame(g.animId);
      setState('over');

      let msg;
      if (g.score >= 35) msg = '👑 เจ้าแห่งความรัก! เก่งสุดๆ ไปเลย! 💖';
      else if (g.score >= 25) msg = '🌟 น่ารักมากๆ พลอยประทับใจสุดๆ! 💕';
      else if (g.score >= 12) msg = '💪 เก่งมาก! จับได้เยอะเลยจ้า! 🥰';
      else msg = '😊 ลองใหม่อีกครั้งนะจ๊ะ!';
      setMessage(msg);

      if (g.score > best) {
        setBest(g.score);
        localStorage.setItem('hbd_ploy_best', String(g.score));
      }
    }

    loop();
  }, [resizeCanvas, best]);

  const handleMouseMove = useCallback(
    (e) => {
      if (gameRef.current.running) moveCatcher(e.clientX);
    },
    [moveCatcher]
  );

  const handleTouchMove = useCallback(
    (e) => {
      e.preventDefault();
      if (gameRef.current.running && e.touches[0])
        moveCatcher(e.touches[0].clientX);
    },
    [moveCatcher]
  );

  return (
    <section id="game" className="section game-section">
      <div className="section-container">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 60 }}
        >
          🎮 เกมเก็บหัวใจ & สตรอว์เบอร์รี
        </motion.h2>

        <motion.p
          className="game-description"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          ขยับตะกร้าจับ ❤️ และ 🍓 ให้ได้มากที่สุดใน {GAME_DURATION} วินาที!
        </motion.p>

        <motion.div
          className="game-stats"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          {[
            { label: '💖 Score', value: score },
            { label: '⏱️ Time', value: timeLeft },
            { label: '🏆 Best', value: best },
          ].map(({ label, value }) => (
            <div key={label} className="stat-item glass-card">
              <span className="stat-label">{label}</span>
              <motion.span
                className="stat-value"
                key={value}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {value}
              </motion.span>
            </div>
          ))}
        </motion.div>

        <motion.div
          className="game-canvas-wrapper"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 60 }}
        >
          <canvas
            ref={canvasRef}
            className="game-canvas"
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            onTouchStart={handleTouchMove}
          />

          <AnimatePresence>
            {state === 'idle' && (
              <motion.div
                className="game-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.button
                  className="game-btn"
                  whileHover={{ scale: 1.08, boxShadow: '0 10px 30px rgba(255,71,126,0.4)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                >
                  🎮 เริ่มเล่นเลย!
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {state === 'over' && (
              <motion.div
                className="game-over-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="game-over-content glass-card"
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 150 }}
                >
                  <h3 className="game-over-title">🎉 จบเกม!</h3>
                  <p className="game-over-score">
                    คะแนนที่ได้:{' '}
                    <motion.span
                      style={{ color: 'var(--pink-600)', fontWeight: 'bold' }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                    >
                      {score}
                    </motion.span>
                  </p>
                  <p className="game-message">{message}</p>
                  <motion.button
                    className="game-btn"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startGame}
                  >
                    🔄 เล่นใหม่อีกครั้ง
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
