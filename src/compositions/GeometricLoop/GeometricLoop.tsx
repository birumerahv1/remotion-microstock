import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { getPalette, palettes } from '../../lib/color';
import { easeInOutCubic } from '../../lib/easing';

const paletteNames = Object.keys(palettes) as [string, ...string[]];

export const geometricLoopSchema = z.object({
  palette: z.enum(paletteNames).default('ocean'),
  shape: z.enum(['triangle', 'square', 'hexagon', 'circle']).default('hexagon'),
  ringCount: z.number().int().min(2).max(12).default(6),
  shapesPerRing: z.number().int().min(4).max(36).default(14),
  rotationSpeed: z.number().min(-2).max(2).default(0.4),
});

export type GeometricLoopProps = z.infer<typeof geometricLoopSchema>;

export const defaultGeometricLoopProps: GeometricLoopProps = {
  palette: 'ocean',
  shape: 'hexagon',
  ringCount: 6,
  shapesPerRing: 14,
  rotationSpeed: 0.4,
};

const shapePath = (shape: GeometricLoopProps['shape']): string => {
  switch (shape) {
    case 'triangle':
      return 'M 0 -1 L 0.866 0.5 L -0.866 0.5 Z';
    case 'square':
      return 'M -1 -1 L 1 -1 L 1 1 L -1 1 Z';
    case 'hexagon':
      return 'M 1 0 L 0.5 0.866 L -0.5 0.866 L -1 0 L -0.5 -0.866 L 0.5 -0.866 Z';
    case 'circle':
    default:
      return 'M 1 0 A 1 1 0 1 1 -1 0 A 1 1 0 1 1 1 0';
  }
};

export const GeometricLoop: React.FC<GeometricLoopProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const palette = getPalette(props.palette);
  const t = frame / durationInFrames;
  const loopT = (t * Math.PI * 2) % (Math.PI * 2);
  const path = shapePath(props.shape);

  const colorStops = [palette.primary, palette.secondary, palette.accent];

  return (
    <AbsoluteFill style={{ backgroundColor: palette.background, overflow: 'hidden' }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at center, ${palette.primary}22, transparent 60%)`,
        }}
      />
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: 'absolute', inset: 0 }}
      >
        <defs>
          <radialGradient id="vignette" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="transparent" />
            <stop offset="100%" stopColor={palette.background} />
          </radialGradient>
        </defs>
        <g transform={`translate(${width / 2} ${height / 2})`}>
          {Array.from({ length: props.ringCount }).map((_, ringIdx) => {
            const ringT = ringIdx / Math.max(1, props.ringCount - 1);
            const baseRadius = (Math.min(width, height) / 2) * (0.15 + ringT * 0.75);
            const wobble =
              Math.sin(loopT + ringIdx * 0.7) * 0.04 * baseRadius;
            const radius = baseRadius + wobble;
            const dir = ringIdx % 2 === 0 ? 1 : -1;
            const ringRotation =
              dir * t * 360 * props.rotationSpeed + ringIdx * 12;
            const sizeBase = Math.max(8, baseRadius * 0.07);
            const color = colorStops[ringIdx % colorStops.length] ?? palette.primary;

            return (
              <g key={ringIdx} transform={`rotate(${ringRotation})`}>
                {Array.from({ length: props.shapesPerRing }).map((__, shapeIdx) => {
                  const angle =
                    (shapeIdx / props.shapesPerRing) * Math.PI * 2;
                  const cx = Math.cos(angle) * radius;
                  const cy = Math.sin(angle) * radius;
                  const pulsePhase = ringIdx * 0.4 + shapeIdx * 0.25;
                  const pulse =
                    0.6 +
                    0.4 *
                      easeInOutCubic(
                        (Math.sin(loopT * 2 + pulsePhase) + 1) / 2,
                      );
                  const size = sizeBase * pulse;
                  const localRotation = (angle * 180) / Math.PI + frame * dir * 1.2;
                  const opacity = interpolate(
                    ringIdx,
                    [0, props.ringCount - 1],
                    [0.95, 0.35],
                  );
                  return (
                    <g
                      key={shapeIdx}
                      transform={`translate(${cx} ${cy}) rotate(${localRotation}) scale(${size})`}
                    >
                      <path
                        d={path}
                        fill={color}
                        opacity={opacity}
                        style={{ mixBlendMode: 'screen' as const }}
                      />
                    </g>
                  );
                })}
              </g>
            );
          })}
        </g>
        <rect width={width} height={height} fill="url(#vignette)" />
      </svg>

      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: palette.accent,
            boxShadow: `0 0 40px ${palette.accent}`,
          }}
        />
      </AbsoluteFill>

      <div
        style={{
          position: 'absolute',
          left: 40,
          bottom: 32,
          color: palette.text,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: 18,
          letterSpacing: 2,
          textTransform: 'uppercase',
          opacity: 0.6,
        }}
      >
        Loop · {Math.round((frame / fps) * 10) / 10}s
      </div>
    </AbsoluteFill>
  );
};
