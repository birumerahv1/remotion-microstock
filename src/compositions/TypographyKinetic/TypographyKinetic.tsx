import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { z } from 'zod';
import { getPalette, palettes } from '../../lib/color';

const paletteNames = Object.keys(palettes) as [string, ...string[]];

export const typographyKineticSchema = z.object({
  palette: z.enum(paletteNames).default('cyber'),
  lines: z
    .array(z.string())
    .min(1)
    .max(8)
    .default(['CREATE', 'EVERY', 'SECOND']),
  accentWordIndex: z.number().int().nonnegative().default(1),
  fontSize: z.number().int().min(100).max(420).default(260),
  stagger: z.number().min(2).max(40).default(8),
});

export type TypographyKineticProps = z.infer<typeof typographyKineticSchema>;

export const defaultTypographyKineticProps: TypographyKineticProps = {
  palette: 'cyber',
  lines: ['CREATE', 'EVERY', 'SECOND'],
  accentWordIndex: 1,
  fontSize: 260,
  stagger: 8,
};

export const TypographyKinetic: React.FC<TypographyKineticProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const palette = getPalette(props.palette);

  const cameraDrift = interpolate(frame, [0, durationInFrames], [-30, 30]);
  const scaleBreath = 1 + Math.sin((frame / fps) * 0.8) * 0.01;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: palette.background,
        overflow: 'hidden',
      }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 30% 30%, ${palette.primary}33, transparent 60%), radial-gradient(circle at 70% 70%, ${palette.secondary}33, transparent 60%)`,
        }}
      />

      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translateX(${cameraDrift}px) scale(${scaleBreath})`,
        }}
      >
        {props.lines.map((line, i) => {
          const start = i * props.stagger;
          const enter = spring({
            frame: frame - start,
            fps,
            config: { damping: 14, stiffness: 120, mass: 0.6 },
          });
          const exit = interpolate(
            frame,
            [durationInFrames - fps * 1.2 - i * 4, durationInFrames - i * 4],
            [1, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
          );
          const reveal = enter * exit;
          const isAccent = i === props.accentWordIndex;
          const blur = (1 - enter) * 30;
          const slide = (1 - enter) * 80;

          return (
            <div
              key={i}
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontWeight: 900,
                fontSize: props.fontSize,
                lineHeight: 0.95,
                letterSpacing: -8,
                color: isAccent ? palette.accent : palette.text,
                opacity: reveal,
                transform: `translateY(${slide}px)`,
                filter: `blur(${blur}px)`,
                textShadow: isAccent ? `0 0 60px ${palette.accent}88` : 'none',
                mixBlendMode: isAccent ? 'normal' : 'screen',
              }}
            >
              {line}
            </div>
          );
        })}
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.4) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};
