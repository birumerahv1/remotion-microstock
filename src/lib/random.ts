/**
 * Mulberry32 deterministic PRNG. Same seed → same sequence,
 * so the same composition variant always renders identically.
 */
export const createRng = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const rngRange = (rng: () => number, min: number, max: number): number => {
  return min + rng() * (max - min);
};

export const rngInt = (rng: () => number, min: number, max: number): number => {
  return Math.floor(rngRange(rng, min, max + 1));
};

export const rngPick = <T>(rng: () => number, arr: readonly T[]): T => {
  const idx = Math.floor(rng() * arr.length);
  const item = arr[idx];
  if (item === undefined) {
    throw new Error('rngPick called on empty array');
  }
  return item;
};
