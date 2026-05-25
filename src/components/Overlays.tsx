import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { easeInOut, easeOut, hashRandom, oscillate } from "../utils/animations";

type Children = { children?: React.ReactNode };

// -----------------------------------------------------------------------------
// CameraShake
// -----------------------------------------------------------------------------
type CameraShakeProps = Children & {
  amplitude?: number;
  frequency?: number;
  rotateAmplitude?: number;
  /** Frame to start damping the shake. Default: half the composition. */
  dampAfter?: number;
};

/**
 * Wraps children in a subtly shaking container. Good for opening impact
 * (e.g. logo reveal, explosion-y intros). Defaults dampen towards the end so
 * the final frame is steady.
 */
export const CameraShake: React.FC<CameraShakeProps> = ({
  children,
  amplitude = 8,
  frequency = 0.35,
  rotateAmplitude = 0.4,
  dampAfter,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const dampStart = dampAfter ?? Math.floor(durationInFrames * 0.5);

  const damp = interpolate(
    frame,
    [dampStart, Math.min(durationInFrames - 1, dampStart + 60)],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const tx = oscillate(frame, amplitude, frequency, 0) * damp;
  const ty = oscillate(frame, amplitude * 0.6, frequency * 1.3, 1.7) * damp;
  const r = oscillate(frame, rotateAmplitude, frequency * 0.8, 3.1) * damp;

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${tx}px, ${ty}px) rotate(${r}deg)`,
        transformOrigin: "center center",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// -----------------------------------------------------------------------------
// BokehOverlay - drifting soft circles of light
// -----------------------------------------------------------------------------
type BokehOverlayProps = {
  count?: number;
  color?: string;
  /** 0–1, controls overall layer opacity. */
  intensity?: number;
};

export const BokehOverlay: React.FC<BokehOverlayProps> = ({
  count = 18,
  color = "#ffffff",
  intensity = 0.45,
}) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const t = frame / Math.max(1, durationInFrames);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      {Array.from({ length: count }).map((_, i) => {
        const seed = i + 1;
        const baseX = hashRandom(seed * 1.13) * width;
        const baseY = hashRandom(seed * 2.07) * height;
        const drift = hashRandom(seed * 3.21) * 200 + 60;
        const sizeBase = hashRandom(seed * 4.5) * 110 + 40;
        const phase = hashRandom(seed * 5.9) * Math.PI * 2;
        const pulse =
          0.55 + 0.45 * Math.sin(t * Math.PI * 2 + phase * 1.7);
        const size = sizeBase * pulse;
        const x = baseX + Math.sin(t * Math.PI * 2 + phase) * drift;
        const y =
          baseY - t * (hashRandom(seed * 6.3) * 280 + 80) +
          Math.cos(t * Math.PI * 2 + phase) * drift * 0.5;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - size / 2,
              top: y - size / 2,
              width: size,
              height: size,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${color} 0%, transparent 60%)`,
              opacity: intensity * (0.5 + 0.5 * pulse),
              filter: "blur(2px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// -----------------------------------------------------------------------------
// ParticleField - small drifting particles
// -----------------------------------------------------------------------------
type ParticleFieldProps = {
  count?: number;
  color?: string;
  intensity?: number;
};

export const ParticleField: React.FC<ParticleFieldProps> = ({
  count = 60,
  color = "#ffffff",
  intensity = 0.7,
}) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const t = frame / Math.max(1, durationInFrames);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const seed = i + 1;
        const baseX = hashRandom(seed * 1.7) * width;
        const baseY = hashRandom(seed * 2.9) * height;
        const speed = hashRandom(seed * 3.5) * 0.6 + 0.2;
        const size = hashRandom(seed * 4.1) * 6 + 1.5;
        const sway = hashRandom(seed * 5.4) * 80 + 20;
        const phase = hashRandom(seed * 6.7) * Math.PI * 2;
        const y = (baseY - t * height * speed + height) % height;
        const x = baseX + Math.sin(t * Math.PI * 2 + phase) * sway;
        const alpha =
          intensity *
          (0.4 + 0.6 * Math.sin(t * Math.PI * 2 + phase * 0.7));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background: color,
              opacity: Math.max(0, Math.min(1, alpha)),
              boxShadow: `0 0 ${size * 2}px ${color}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// -----------------------------------------------------------------------------
// LightLeak - diagonal animated gradient
// -----------------------------------------------------------------------------
type LightLeakProps = {
  fromColor?: string;
  toColor?: string;
  /** 0–1 overall opacity */
  intensity?: number;
};

export const LightLeak: React.FC<LightLeakProps> = ({
  fromColor = "rgba(255,180,80,0.55)",
  toColor = "rgba(255,80,150,0.0)",
  intensity = 0.7,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / Math.max(1, durationInFrames);
  const angle = 30 + t * 20;
  const pos = -30 + easeInOut(t) * 160;
  const pulse = 0.65 + 0.35 * Math.sin(t * Math.PI * 2);

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        mixBlendMode: "screen",
        opacity: intensity * pulse,
        background: `linear-gradient(${angle}deg, transparent ${pos - 35}%, ${fromColor} ${pos}%, ${toColor} ${pos + 30}%, transparent ${pos + 60}%)`,
      }}
    />
  );
};

// -----------------------------------------------------------------------------
// LetterboxBars - cinematic black bars sliding in
// -----------------------------------------------------------------------------
type LetterboxBarsProps = {
  /** Final height of each bar in px. */
  height?: number;
  /** How many frames the bars take to slide in. */
  slideInFrames?: number;
  /** If true, bars slide back out near the end. */
  slideOut?: boolean;
  color?: string;
};

export const LetterboxBars: React.FC<LetterboxBarsProps> = ({
  height = 140,
  slideInFrames = 20,
  slideOut = false,
  color = "#000000",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const inProgress = easeOut(
    Math.max(0, Math.min(1, frame / Math.max(1, slideInFrames))),
  );
  const outProgress = slideOut
    ? easeInOut(
        Math.max(
          0,
          Math.min(
            1,
            (frame - (durationInFrames - slideInFrames - 1)) /
              Math.max(1, slideInFrames),
          ),
        ),
      )
    : 0;
  const visibleHeight = height * inProgress * (1 - outProgress);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: visibleHeight,
          backgroundColor: color,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: visibleHeight,
          backgroundColor: color,
        }}
      />
    </AbsoluteFill>
  );
};

// -----------------------------------------------------------------------------
// VignettePulse - radial vignette that breathes
// -----------------------------------------------------------------------------
type VignettePulseProps = {
  /** Inner (transparent) percentage. */
  innerPercent?: number;
  /** Outer rgba darkness for the vignette. */
  outerColor?: string;
  /** How much the inner percent oscillates. */
  pulseAmplitude?: number;
  /** Frequency of oscillation (cycles per second). */
  pulseHz?: number;
};

export const VignettePulse: React.FC<VignettePulseProps> = ({
  innerPercent = 55,
  outerColor = "rgba(0,0,0,0.55)",
  pulseAmplitude = 8,
  pulseHz = 0.25,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const pulse = Math.sin(seconds * pulseHz * Math.PI * 2) * pulseAmplitude;
  const inner = innerPercent + pulse;

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        background: `radial-gradient(circle at center, rgba(0,0,0,0) ${inner}%, ${outerColor} 100%)`,
      }}
    />
  );
};

// -----------------------------------------------------------------------------
// NoiseGrain - subtle SVG-based film grain
// -----------------------------------------------------------------------------
type NoiseGrainProps = {
  /** 0–1 overall opacity */
  intensity?: number;
};

const NOISE_DATA_URI =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>` +
      `<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.85 0'/></filter>` +
      `<rect width='100%' height='100%' filter='url(#n)' opacity='0.7'/>` +
      `</svg>`,
  );

export const NoiseGrain: React.FC<NoiseGrainProps> = ({ intensity = 0.08 }) => {
  const frame = useCurrentFrame();
  // Subtle shift every frame so grain feels alive.
  const x = (frame * 7) % 200;
  const y = (frame * 11) % 200;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity: intensity,
        mixBlendMode: "overlay",
        backgroundImage: `url("${NOISE_DATA_URI}")`,
        backgroundRepeat: "repeat",
        backgroundPosition: `${x}px ${y}px`,
      }}
    />
  );
};

// -----------------------------------------------------------------------------
// GlowPulse - radial accent glow that breathes (useful for CTA buttons)
// -----------------------------------------------------------------------------
type GlowPulseProps = {
  color?: string;
  intensity?: number;
  pulseHz?: number;
};

export const GlowPulse: React.FC<GlowPulseProps> = ({
  color = "#22d3ee",
  intensity = 0.45,
  pulseHz = 0.5,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const pulse = 0.6 + 0.4 * Math.sin(seconds * pulseHz * Math.PI * 2);

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity: Math.max(0, Math.min(1, intensity * pulse)),
        background: `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 55%)`,
      }}
    />
  );
};
