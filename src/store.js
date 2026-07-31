/* ================================================================
   Global game state — shared between the 3D Canvas and the HTML UI.
   zustand is used because React context does not cross the R3F
   Canvas reconciler boundary.

   Persistence: collection + pullsLeft + cakeDone survive reloads
   via zustand/persist (localStorage key: 'hbd-ploy-gacha-v1').
   ================================================================ */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/* ----- Shared per-frame input (mutable, outside React) ----------- */
/* The mic hook / hold-button write here; 3D candle flames read it. */
export const blowInput = { levelRef: { current: 0 }, holding: false };

/* ----- Gacha pool ------------------------------------------------ */
export const MAX_PULLS = 3;
export const HITS_TO_WIN = 3;
export const CANDLE_COUNT = 5;

export const RARITY = {
  SSR: { id: 'SSR', label: 'Legendary ✦ SSR', color: '#ffd98e', glow: '#ffb84d', weight: 10 },
  SR: { id: 'SR', label: 'Epic ✦ SR', color: '#b8a9ff', glow: '#8f6bff', weight: 30 },
  R: { id: 'R', label: 'Rare ✦ R', color: '#8ecff5', glow: '#4da3ff', weight: 60 },
};

export const CARD_POOL = [
  {
    rarity: 'SSR', title: 'Wish Upon a Star',
    message: 'ขอให้ทุกความฝันของพลอยเป็นจริงในปีนี้ 🌟',
    ability: { name: 'Stardust Blessing', desc: 'คำขอพร 1 ข้อ จะเป็นจริงภายในปีนี้', stats: { luck: 99, love: 90, energy: 85 } },
  },
  {
    rarity: 'SSR', title: 'Golden Birthday',
    message: 'สุขสันต์วันเกิดนะพลอย ขอให้ปีนี้เป็นปีทอง ✨',
    ability: { name: 'Midas Touch', desc: 'ทุกอย่างที่จับในปีนี้จะกลายเป็นเรื่องดี', stats: { luck: 95, love: 88, energy: 92 } },
  },
  {
    rarity: 'SR', title: 'Moonlight Serenade',
    message: 'ขอให้ทุกคืนหลับฝันดี ตื่นมาสดใสทุกวัน 🌙',
    ability: { name: 'Sweet Dreams', desc: 'นอนหลับสบายทุกคืน ตื่นมาพลังเต็มร้อย', stats: { luck: 70, love: 85, energy: 95 } },
  },
  {
    rarity: 'SR', title: 'Lavender Sky',
    message: 'ขอให้เจอแต่เรื่องดี ๆ ตลอดปีเลยนะ 💜',
    ability: { name: 'Calm Aura', desc: 'ความเครียดเข้าใกล้ไม่ได้ในรัศมี 5 เมตร', stats: { luck: 75, love: 90, energy: 72 } },
  },
  {
    rarity: 'R', title: 'Sweet Moments',
    message: 'ขอบคุณที่เกิดมานะ สุขสันต์วันเกิด! 🎂',
    ability: { name: 'Sugar Rush', desc: 'กินของหวานได้ไม่อ้วน (ในจินตนาการ)', stats: { luck: 60, love: 80, energy: 88 } },
  },
  {
    rarity: 'R', title: 'Starlit Smile',
    message: 'ยิ้มสวย ๆ แบบนี้ตลอดไปเลยนะ 😊',
    ability: { name: 'Charm +10', desc: 'รอยยิ้มทำให้คนรอบตัวอารมณ์ดีทันที', stats: { luck: 65, love: 92, energy: 70 } },
  },
];

export function rollCard() {
  const total = Object.values(RARITY).reduce((s, r) => s + r.weight, 0);
  let roll = Math.random() * total;
  let picked = 'R';
  for (const r of Object.values(RARITY)) {
    roll -= r.weight;
    if (roll <= 0) { picked = r.id; break; }
  }
  const pool = CARD_POOL.filter((c) => c.rarity === picked);
  const base = pool[Math.floor(Math.random() * pool.length)];
  /* crypto.randomUUID is unavailable on non-HTTPS (e.g. LAN IP) — fall back */
  const uid = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return { ...base, uid, pulledAt: Date.now() };
}

/* ----- Store ------------------------------------------------------
   phase flow:
   intro → cake → memories → game → charged → summoning → reveal
                                      ↑__________ again __________|
   reveal → collection (when pulls are exhausted)
   ------------------------------------------------------------------ */
export const useGame = create(
  persist(
    (set, get) => ({
      phase: 'intro',
      /* mini-game */
      hits: 0,
      misses: 0,
      combo: 0,
      lastJudgement: null,
      /* cake */
      candlesOut: 0,
      cakeDone: false,
      /* memories */
      memIndex: 0,
      /* gacha — persisted */
      pullsLeft: MAX_PULLS,
      card: null,
      collection: [],

      /* --- flow --- */
      start: () => set({ phase: get().cakeDone ? 'memories' : 'cake' }),

      snuffCandle: () => {
        const n = Math.min(get().candlesOut + 1, CANDLE_COUNT);
        set({ candlesOut: n });
        if (n >= CANDLE_COUNT) {
          set({ cakeDone: true });
          setTimeout(() => set({ phase: 'memories' }), 1800);
        }
      },

      setMemIndex: (i) => set({ memIndex: i }),
      toMemories: () => set({ phase: 'memories' }),
      toGame: () =>
        set({ phase: 'game', hits: 0, misses: 0, combo: 0, lastJudgement: null, card: null }),
      toCollection: () => set({ phase: 'collection' }),

      /* --- mini-game --- */
      registerHit: (perfect) => {
        const hits = get().hits + 1;
        set({
          hits,
          combo: get().combo + 1,
          lastJudgement: { text: perfect ? 'PERFECT ✦' : 'GREAT', id: Math.random() },
        });
        if (hits >= HITS_TO_WIN) set({ phase: 'charged' });
      },
      registerMiss: () =>
        set((s) => ({ misses: s.misses + 1, combo: 0, lastJudgement: { text: 'MISS', id: Math.random() } })),

      /* --- gacha (strict 3-pull limit) --- */
      summon: () => {
        if (get().pullsLeft <= 0) return;
        set((s) => ({ phase: 'summoning', pullsLeft: s.pullsLeft - 1, card: rollCard() }));
      },

      reveal: () =>
        set((s) => ({ phase: 'reveal', collection: [...s.collection, s.card] })),

      again: () => {
        if (get().pullsLeft > 0) get().toGame();
        else set({ phase: 'collection' });
      },

      /* refill the 3 pulls but keep the collected cards */
      refillPulls: () =>
        set({ pullsLeft: MAX_PULLS, card: null, phase: 'game', hits: 0, misses: 0, combo: 0, lastJudgement: null }),

      resetSave: () =>
        set({ pullsLeft: MAX_PULLS, collection: [], card: null, cakeDone: false, candlesOut: 0, phase: 'intro' }),
    }),
    {
      name: 'hbd-ploy-gacha-v1',
      storage: createJSONStorage(() => localStorage),
      /* only durable data persists — phase & per-frame stuff do not */
      partialize: (s) => ({ pullsLeft: s.pullsLeft, collection: s.collection, cakeDone: s.cakeDone }),
    },
  ),
);
