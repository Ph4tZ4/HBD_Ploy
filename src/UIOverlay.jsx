/* ================================================================
   UIOverlay.jsx — the HTML layer over the 3D canvas.
   Thin, legible, iOS-style. Framer Motion drives all entrances;
   the heavy glass work happens in the GLSL shader in-canvas.
   ================================================================ */
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useMicLevel from './hooks/useMicLevel';
import { useGame, RARITY, HITS_TO_WIN, CANDLE_COUNT, MAX_PULLS, blowInput } from './store';
import { PHOTOS } from './CakeAndMemories';
import './overlay.css';

const spring = { type: 'spring', stiffness: 320, damping: 26 };
const fadeUp = {
  initial: { opacity: 0, y: 24, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -16, filter: 'blur(6px)' },
  transition: { duration: 0.45, ease: [0.32, 0.72, 0, 1] },
};

/* ----- Top status ---------------------------------------------------- */
function StatusBar() {
  const phase = useGame((s) => s.phase);
  const combo = useGame((s) => s.combo);
  const pullsLeft = useGame((s) => s.pullsLeft);
  const label = {
    intro: 'Starlight Atelier',
    cake: 'Make a wish…',
    memories: 'Our memories',
    game: 'Sync the rings',
    charged: 'Altar charged',
    summoning: 'Summoning…',
    reveal: 'A gift appears',
    collection: 'Your collection',
  }[phase];

  return (
    <div className="ui-top">
      <motion.div className="ui-chip" layout transition={spring}>
        <span className={`dot ${phase !== 'intro' ? 'on' : ''}`} />
        {label}
      </motion.div>
      {phase !== 'intro' && phase !== 'cake' && phase !== 'memories' && (
        <motion.div className="ui-chip" {...fadeUp}>
          ✦ pulls {pullsLeft}/{MAX_PULLS}
        </motion.div>
      )}
      {combo > 1 && (
        <motion.div className="ui-chip" {...fadeUp} key={combo}>
          combo ×{combo}
        </motion.div>
      )}
    </div>
  );
}

/* ----- Rhythm judgement ---------------------------------------------- */
function Judgement() {
  const j = useGame((s) => s.lastJudgement);
  return (
    <AnimatePresence>
      {j && (
        <motion.div
          key={j.id}
          className={`ui-judgement ${j.text === 'MISS' ? 'miss' : ''}`}
          initial={{ opacity: 0, scale: 0.6, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.3, y: -20 }}
          transition={spring}
        >
          {j.text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Pips({ total, filled }) {
  return (
    <div className="ui-pips">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`ui-pip ${i < filled ? 'filled' : ''}`} />
      ))}
    </div>
  );
}

/* ----- Cake controls -------------------------------------------------- */
function CakeControls() {
  const candlesOut = useGame((s) => s.candlesOut);
  const { levelRef, enabled, denied, enable } = useMicLevel();

  /* pipe the mic level into the shared blow input for the 3D flames */
  useEffect(() => {
    if (enabled) blowInput.levelRef = levelRef;
    return () => { blowInput.levelRef = { current: 0 }; };
  }, [enabled, levelRef]);

  const hold = (on) => () => { blowInput.holding = on; };

  return (
    <motion.div key="cake" {...fadeUp} className="ui-stack">
      <Pips total={CANDLE_COUNT} filled={candlesOut} />
      <div className="ui-row">
        {!enabled && !denied && (
          <button className="btn-ghost" onClick={enable}>🎤 เปิดไมค์แล้วเป่าเลย</button>
        )}
        <button
          className="btn-tap"
          onPointerDown={hold(true)}
          onPointerUp={hold(false)}
          onPointerLeave={hold(false)}
          onContextMenu={(e) => e.preventDefault()}
        >
          เป่า 💨
        </button>
      </div>
      <span className="ui-hint">
        {enabled ? 'เป่าใส่ไมค์ หรือกดปุ่มค้างไว้' : denied ? 'ไมค์ใช้ไม่ได้ — กดปุ่มค้างไว้แทนนะ' : 'เป่าเทียนให้ครบทุกเล่ม'}
      </span>
    </motion.div>
  );
}

/* ----- Memory gallery controls ---------------------------------------- */
function MemoryControls() {
  const memIndex = useGame((s) => s.memIndex);
  const setMemIndex = useGame((s) => s.setMemIndex);
  const toGame = useGame((s) => s.toGame);
  const pullsLeft = useGame((s) => s.pullsLeft);
  const toCollection = useGame((s) => s.toCollection);
  const n = PHOTOS.length;
  const shown = ((memIndex % n) + n) % n;

  return (
    <motion.div key="memories" {...fadeUp} className="ui-stack">
      <div className="ui-row">
        <button className="btn-round" onClick={() => setMemIndex(memIndex - 1)}>‹</button>
        <span className="ui-chip">{shown + 1} / {n}</span>
        <button className="btn-round" onClick={() => setMemIndex(memIndex + 1)}>›</button>
      </div>
      {pullsLeft > 0 ? (
        <button className="btn-hero" onClick={toGame}>ไปเล่นเกมสุ่มการ์ด ✦</button>
      ) : (
        <button className="btn-hero" onClick={toCollection}>ดูการ์ดที่สะสมไว้ ✦</button>
      )}
    </motion.div>
  );
}

/* ----- Rhythm game controls -------------------------------------------- */
function GameControls() {
  const hits = useGame((s) => s.hits);
  return (
    <motion.div {...fadeUp} className="ui-stack">
      <Pips total={HITS_TO_WIN} filled={hits} />
      <button className="btn-tap" onClick={() => useGame.getState().tap?.()}>TAP</button>
      <span className="ui-hint">แตะเมื่อวงแหวนซ้อนกัน · หรือกด Space</span>
    </motion.div>
  );
}

/* ----- Stat bar --------------------------------------------------------- */
function Stat({ label, value, color }) {
  return (
    <div className="ui-stat">
      <span className="ui-stat-label">{label}</span>
      <div className="ui-stat-track">
        <motion.div
          className="ui-stat-fill"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1], delay: 0.3 }}
        />
      </div>
      <span className="ui-stat-num">{value}</span>
    </div>
  );
}

/* ----- Reveal modal ------------------------------------------------------ */
function RevealModal() {
  const card = useGame((s) => s.card);
  const again = useGame((s) => s.again);
  const pullsLeft = useGame((s) => s.pullsLeft);
  if (!card) return null;
  const rarity = RARITY[card.rarity];

  return (
    <div className="ui-modal">
      <motion.div
        className="ui-modal-card"
        initial={{ opacity: 0, y: 60, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={spring}
      >
        <span className="ui-rarity" style={{ background: rarity.color, boxShadow: `0 0 24px ${rarity.glow}66` }}>
          {rarity.label}
        </span>
        <div className="ui-card-title">{card.title}</div>
        <div className="ui-card-msg">{card.message}</div>

        <div className="ui-ability">
          <div className="ui-ability-name">✦ {card.ability.name}</div>
          <div className="ui-ability-desc">{card.ability.desc}</div>
          <Stat label="LUCK" value={card.ability.stats.luck} color="var(--starlight)" />
          <Stat label="LOVE" value={card.ability.stats.love} color="var(--pink)" />
          <Stat label="ENERGY" value={card.ability.stats.energy} color="var(--lavender)" />
        </div>

        <div className="ui-modal-actions">
          <button className="btn-hero" onClick={again}>
            {pullsLeft > 0 ? `สุ่มอีกครั้ง (เหลือ ${pullsLeft}) ✦` : 'ดูการ์ดทั้งหมด ✦'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ----- Collection modal --------------------------------------------------- */
function CollectionModal() {
  const collection = useGame((s) => s.collection);
  const toMemories = useGame((s) => s.toMemories);
  const refillPulls = useGame((s) => s.refillPulls);

  return (
    <div className="ui-modal">
      <motion.div
        className="ui-modal-card"
        initial={{ opacity: 0, y: 60, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={spring}
      >
        <div className="ui-card-title">การ์ดของพลอย ✦</div>
        <div className="ui-collection">
          {collection.length === 0 && <div className="ui-card-msg">ยังไม่มีการ์ดเลย</div>}
          {collection.map((c) => (
            <div key={c.uid} className="ui-coll-item" style={{ borderColor: RARITY[c.rarity].color }}>
              <span className="ui-rarity sm" style={{ background: RARITY[c.rarity].color }}>{c.rarity}</span>
              <div>
                <div className="ui-coll-title">{c.title}</div>
                <div className="ui-coll-ability">{c.ability.name} — {c.ability.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="ui-modal-actions">
          <button className="btn-ghost" onClick={toMemories}>กลับไปดูรูป ↺</button>
          <button className="btn-hero" onClick={refillPulls}>สุ่มใหม่อีกรอบ ✦</button>
        </div>
      </motion.div>
    </div>
  );
}

/* ----- Root ----------------------------------------------------------------- */
export default function UIOverlay() {
  const phase = useGame((s) => s.phase);
  const start = useGame((s) => s.start);
  const summon = useGame((s) => s.summon);
  const collection = useGame((s) => s.collection);

  return (
    <div className="ui-root">
      <StatusBar />

      <div className="ui-center">
        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div key="intro" {...fadeUp}>
              <h1 className="ui-title">Happy Birthday<br />Ploy ✦</h1>
              <p className="ui-sub">
                เป่าเทียน ดูความทรงจำ แล้วไปสุ่มการ์ดของขวัญกัน
                {collection.length > 0 && ` · สะสมแล้ว ${collection.length} ใบ`}
              </p>
            </motion.div>
          )}
          {phase === 'charged' && (
            <motion.div key="charged" {...fadeUp}>
              <h1 className="ui-title">แท่นเวทพร้อมแล้ว</h1>
              <p className="ui-sub">พลังดาวเต็มเปี่ยม… พร้อมอัญเชิญของขวัญหรือยัง?</p>
            </motion.div>
          )}
        </AnimatePresence>
        <Judgement />
      </div>

      <div className="ui-bottom">
        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.button key="start" className="btn-hero" onClick={start} {...fadeUp}>
              เริ่มเลย ✦
            </motion.button>
          )}
          {phase === 'cake' && <CakeControls />}
          {phase === 'memories' && <MemoryControls />}
          {phase === 'game' && <GameControls key="game" />}
          {phase === 'charged' && (
            <motion.button key="summon" className="btn-hero" onClick={summon} {...fadeUp}>
              อัญเชิญการ์ด ✦✦✦
            </motion.button>
          )}
          {phase === 'summoning' && (
            <motion.span key="summoning" className="ui-hint" {...fadeUp}>
              ✦ กำลังอัญเชิญ ✦
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>{phase === 'reveal' && <RevealModal />}</AnimatePresence>
      <AnimatePresence>{phase === 'collection' && <CollectionModal />}</AnimatePresence>
    </div>
  );
}
