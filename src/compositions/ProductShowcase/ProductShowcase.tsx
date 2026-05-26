import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { z } from 'zod';
import { getPalette, palettes } from '../../lib/color';
import { easeInOutCubic, easeOutQuart } from '../../lib/easing';

const paletteNames = Object.keys(palettes) as [string, ...string[]];

export const productShowcaseSchema = z.object({
  palette: z.enum(paletteNames).default('mono'),
  productName: z.string().default('Aurora Headphones'),
  tagline: z.string().default('Sound, redefined.'),
  price: z.string().default('$249'),
  glyph: z.string().default('A'),
});

export type ProductShowcaseProps = z.infer<typeof productShowcaseSchema>;

export const defaultProductShowcaseProps: ProductShowcaseProps = {
  palette: 'mono',
  productName: 'Aurora Headphones',
  tagline: 'Sound, redefined.',
  price: '$249',
  glyph: 'A',
};

export const ProductShowcase: React.FC<ProductShowcaseProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const palette = getPalette(props.palette);

  const t = frame / durationInFrames;
  const intro = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 80, mass: 1 },
  });

  const orbitAngle = interpolate(frame, [0, durationInFrames], [-25, 25]);
  const productScale = 0.6 + intro * 0.4;
  const productLift = (1 - intro) * 200;

  const taglineReveal = interpolate(frame, [fps * 1, fps * 2], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const priceReveal = interpolate(frame, [fps * 2.5, fps * 3.4], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const ctaReveal = interpolate(frame, [fps * 4, fps * 5], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exit = interpolate(
    frame,
    [durationInFrames - fps * 1.2, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp' },
  );

  const sweep = easeInOutCubic((Math.sin((frame / fps) * 1.2) + 1) / 2);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: palette.background,
        overflow: 'hidden',
        opacity: exit,
      }}
    >
      <AbsoluteFill
        style={{
          background: `linear-gradient(${135 + orbitAngle * 0.5}deg, ${palette.background} 0%, ${palette.primary}22 50%, ${palette.background} 100%)`,
        }}
      />

      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          perspective: 1600,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: 560,
            height: 560,
            transform: `translateY(${productLift}px) rotateY(${orbitAngle}deg) scale(${productScale})`,
            transformStyle: 'preserve-3d',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: `conic-gradient(from ${frame * 1.6}deg, ${palette.primary}, ${palette.secondary}, ${palette.accent}, ${palette.primary})`,
              filter: 'blur(60px)',
              opacity: 0.55,
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 40,
              borderRadius: '50%',
              background: `radial-gradient(circle at 35% 30%, ${palette.text}, ${palette.primary} 60%, ${palette.background} 100%)`,
              boxShadow: `0 60px 120px ${palette.primary}55, inset 0 -40px 80px rgba(0,0,0,0.6)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: palette.background,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: 900,
              fontSize: 240,
              letterSpacing: -8,
            }}
          >
            {props.glyph}
          </div>

          <div
            style={{
              position: 'absolute',
              left: `${sweep * 100 - 30}%`,
              top: 0,
              width: 80,
              height: '100%',
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
              transform: 'skewX(-20deg)',
              mixBlendMode: 'screen',
              borderRadius: '50%',
              filter: 'blur(20px)',
            }}
          />
        </div>
      </AbsoluteFill>

      <div
        style={{
          position: 'absolute',
          left: 80,
          top: 80,
          color: palette.text,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 14,
            letterSpacing: 4,
            textTransform: 'uppercase',
            opacity: 0.55 * intro,
          }}
        >
          New Release
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            marginTop: 8,
            letterSpacing: -2,
            transform: `translateY(${(1 - intro) * 40}px)`,
            opacity: intro,
          }}
        >
          {props.productName}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 80,
          bottom: 200,
          color: palette.text,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: 36,
          fontWeight: 300,
          opacity: easeOutQuart(taglineReveal),
          transform: `translateX(${(1 - taglineReveal) * -60}px)`,
        }}
      >
        {props.tagline}
      </div>

      <div
        style={{
          position: 'absolute',
          right: 80,
          bottom: 200,
          color: palette.accent,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: 72,
          fontWeight: 800,
          opacity: priceReveal,
          transform: `translateY(${(1 - priceReveal) * 30}px)`,
          letterSpacing: -2,
        }}
      >
        {props.price}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 80,
          bottom: 80,
          color: palette.background,
          backgroundColor: palette.text,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: 22,
          fontWeight: 600,
          padding: '18px 36px',
          borderRadius: 999,
          opacity: ctaReveal,
          transform: `translateY(${(1 - ctaReveal) * 20}px)`,
          letterSpacing: 1,
        }}
      >
        Pre-order today
      </div>

      <div
        style={{
          position: 'absolute',
          right: 80,
          top: 80,
          color: palette.text,
          opacity: 0.4 * intro,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: 14,
          letterSpacing: 2,
        }}
      >
        {Math.round(t * 100)
          .toString()
          .padStart(3, '0')}{' '}
        / 100
      </div>
    </AbsoluteFill>
  );
};

