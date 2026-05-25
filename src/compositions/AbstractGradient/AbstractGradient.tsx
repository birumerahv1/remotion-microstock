import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { getPalette, palettes } from '../../lib/color';
import { createRng, rngRange } from '../../lib/random';
import { easeInOutSine } from '../../lib/easing';

const paletteNames = Object.keys(palettes) as [string, ...string[]];

export const abstractGradientSchema = z.object({
  palette: z.enum(paletteNames).default('sunset'),
  blobCount: z.number().int().min(2).max(12).default(6),
  blur: z.number().min(40).max(220).default(140),
  noiseStrength: z.number().min(0).max(1).default(0.25),
  seed: z.number().int().default(42),
  title: z.string().default('Abstract Gradient'),
});

export type AbstractGradientProps = z.infer<typeof abstractGradientSchema>;

export const defaultAbstractGradientProps: AbstractGradientProps = {
  palette: 'sunset',
  blobCount: 6,
  blur: 140,
  noiseStrength: 0.25,
  seed: 42,
  title: 'Abstract Gradient',
};

type Blob = {
  x0: number;
  y0: number;
  amp: number;
  freqX: number;
  freqY: number;
  phase: number;
  size: number;
  color: string;
  opacity: number;
};

const buildBlobs = (props: AbstractGradientProps): Blob[] => {
  const rng = createRng(props.seed);
  const palette = getPalette(props.palette);
  const colors = [palette.primary, palette.secondary, palette.accent];
  const blobs: Blob[] = [];
  for (let i = 0; i < props.blobCount; i++) {
    const colorIdx = i % colors.length;
    blobs.push({
      x0: rngRange(rng, 0.1, 0.9),
      y0: rngRange(rng, 0.1, 0.9),
      amp: rngRange(rng, 0.08, 0.18),
      freqX: rngRange(rng, 0.4, 1.2),
      freqY: rngRange(rng, 0.4, 1.2),
      phase: rngRange(rng, 0, Math.PI * 2),
      size: rngRange(rng, 0.45, 0.85),
      color: colors[colorIdx] ?? palette.primary,
      opacity: rngRange(rng, 0.55, 0.85),
    });
  }
  return blobs;
};

export const AbstractGradient: React.FC<AbstractGradientProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const palette = getPalette(props.palette);
  const blobs = buildBlobs(props);

  const t = frame / fps;
  const progress = frame / durationInFrames;
  const intro = interpolate(frame, [0, fps * 0.8], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const outro = interpolate(frame, [durationInFrames - fps, durationInFrames], [1, 0.85], {
    extrapolateLeft: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: palette.background, overflow: 'hidden' }}>
      <AbsoluteFill style={{ filter: `blur(${props.blur}px)`, opacity: easeInOutSine(intro) }}>
        {blobs.map((blob, i) => {
          const angle = t * blob.freqX + blob.phase;
          const dx = Math.sin(angle) * blob.amp;
          const dy = Math.cos(t * blob.freqY + blob.phase * 1.3) * blob.amp;
          const cx = (blob.x0 + dx) * width;
          const cy = (blob.y0 + dy) * height;
          const r = blob.size * Math.min(width, height) * 0.6;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: cx - r,
                top: cy - r,
                width: r * 2,
                height: r * 2,
                borderRadius: '50%',
                background: `radial-gradient(circle at center, ${blob.color}, transparent 70%)`,
                opacity: blob.opacity * outro,
                mixBlendMode: 'screen',
              }}
            />
          );
        })}
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, transparent 40%, ${palette.background} 100%)`,
          opacity: 0.6,
        }}
      />

      <AbsoluteFill
        style={{
          opacity: props.noiseStrength,
          mixBlendMode: 'overlay',
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
          backgroundRepeat: 'repeat',
        }}
      />

      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-start',
          padding: 80,
        }}
      >
        <div
          style={{
            color: palette.text,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 700,
            fontSize: 56,
            letterSpacing: -1,
            opacity: easeInOutSine(intro),
            transform: `translateY(${(1 - easeInOutSine(intro)) * 40}px)`,
          }}
        >
          {props.title}
          <div
            style={{
              marginTop: 12,
              fontSize: 22,
              fontWeight: 400,
              opacity: 0.65,
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            {Math.round(progress * 100)}% · seed {props.seed}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
