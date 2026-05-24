import { interpolate } from "remotion";

/**
 * Cosine ease-in-out from 0 → 1.
 * Equivalent to (1 - cos(t·π)) / 2 — smooth start and end.
 */
export const easeInOut = (t: number): number =>
  0.5 - Math.cos(Math.max(0, Math.min(1, t)) * Math.PI) / 2;

/**
 * Cubic ease-out (decelerate).
 */
export const easeOut = (t: number): number => {
  const c = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - c, 3);
};

/**
 * Cubic ease-in (accelerate).
 */
export const easeIn = (t: number): number => {
  const c = Math.max(0, Math.min(1, t));
  return c * c * c;
};

/**
 * Linear progress in [0,1] for a clip from `start` to `end` frames.
 */
export const progressBetween = (
  frame: number,
  start: number,
  end: number,
): number => {
  if (end <= start) {
    return frame >= end ? 1 : 0;
  }
  return Math.max(0, Math.min(1, (frame - start) / (end - start)));
};

/**
 * Fade-in then fade-out window. Returns opacity in [0,1].
 * Useful for titles that appear and disappear within a composition.
 */
export const fadeInOut = (
  frame: number,
  totalFrames: number,
  fadeInFrames = 20,
  fadeOutFrames = 20,
): number =>
  interpolate(
    frame,
    [
      0,
      fadeInFrames,
      totalFrames - fadeOutFrames,
      totalFrames - 1,
    ],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

/**
 * Per-item delay for staggered animations.
 * Example: `stagger(index, 5)` → item 0 starts at frame 0, item 1 at frame 5, etc.
 */
export const stagger = (index: number, perItemDelay: number): number =>
  index * perItemDelay;

/**
 * A small deterministic pseudo-random in [0, 1) for visual variation.
 * Stable across renders (we cannot use Math.random for that reason).
 */
export const hashRandom = (seed: number): number => {
  let x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

/**
 * Wobble / oscillation around 0. Useful for camera shake and floating motion.
 * `frequency` is in cycles per frame (e.g. 0.1 = one cycle every 10 frames).
 */
export const oscillate = (
  frame: number,
  amplitude: number,
  frequency: number,
  phase = 0,
): number => Math.sin((frame * frequency * Math.PI * 2) + phase) * amplitude;
