import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { getPalette, palettes } from '../../lib/color';
import { easeInOutCubic } from '../../lib/easing';

const paletteNames = Object.keys(palettes) as [string, ...string[]];

const seriesSchema = z.object({
  label: z.string(),
  values: z.array(z.number()).min(2),
});

export const dataVizSchema = z.object({
  palette: z.enum(paletteNames).default('forest'),
  title: z.string().default('Quarterly Growth'),
  subtitle: z.string().default('Active users · in millions'),
  unit: z.string().default('M'),
  series: z
    .array(seriesSchema)
    .min(1)
    .max(8)
    .default([
      { label: 'Alpha', values: [1.2, 1.8, 2.4, 3.1, 4.0, 4.9, 5.8] },
      { label: 'Beta', values: [0.6, 1.0, 1.4, 2.2, 2.7, 3.6, 4.1] },
      { label: 'Gamma', values: [0.3, 0.5, 0.9, 1.4, 2.0, 2.8, 3.5] },
      { label: 'Delta', values: [0.1, 0.3, 0.6, 1.0, 1.5, 2.1, 2.9] },
    ]),
});

export type DataVizProps = z.infer<typeof dataVizSchema>;

export const defaultDataVizProps: DataVizProps = dataVizSchema.parse({});

export const DataViz: React.FC<DataVizProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const palette = getPalette(props.palette);

  const t = frame / durationInFrames;
  const intro = interpolate(frame, [0, fps * 0.8], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const exit = interpolate(
    frame,
    [durationInFrames - fps * 1, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp' },
  );

  const steps = props.series[0]?.values.length ?? 0;
  const playhead = interpolate(t, [0.05, 0.95], [0, steps - 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const valueAt = (values: number[], pos: number): number => {
    const lo = Math.floor(pos);
    const hi = Math.min(steps - 1, lo + 1);
    const blend = pos - lo;
    const a = values[lo] ?? 0;
    const b = values[hi] ?? a;
    return a + (b - a) * easeInOutCubic(blend);
  };

  const ranked = [...props.series]
    .map((s, idx) => ({
      ...s,
      value: valueAt(s.values, playhead),
      color: [palette.primary, palette.secondary, palette.accent, palette.text][idx % 4] ?? palette.primary,
      originalIndex: idx,
    }))
    .sort((a, b) => b.value - a.value);

  const maxValue = Math.max(...ranked.map((r) => r.value), 1);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: palette.background,
        overflow: 'hidden',
        opacity: exit,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${palette.background} 0%, ${palette.primary}11 100%)`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 80,
          top: 80,
          color: palette.text,
          opacity: intro,
          transform: `translateX(${(1 - intro) * -40}px)`,
        }}
      >
        <div style={{ fontSize: 16, letterSpacing: 4, textTransform: 'uppercase', opacity: 0.55 }}>
          {props.subtitle}
        </div>
        <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: -2, marginTop: 12 }}>
          {props.title}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          right: 80,
          top: 100,
          color: palette.text,
          opacity: 0.7 * intro,
          fontSize: 22,
          letterSpacing: 2,
        }}
      >
        Step {Math.min(steps, Math.floor(playhead) + 1)} / {steps}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 80,
          right: 80,
          top: 280,
          bottom: 120,
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          justifyContent: 'flex-start',
        }}
      >
        {ranked.map((row, rank) => {
          const barWidth = (row.value / maxValue) * 100;
          return (
            <div
              key={row.label}
              style={{
                position: 'relative',
                transition: 'transform 200ms',
                height: 80,
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                opacity: intro,
                transform: `translateY(${(1 - intro) * (rank + 1) * 10}px)`,
              }}
            >
              <div
                style={{
                  width: 60,
                  fontSize: 32,
                  fontWeight: 800,
                  color: palette.text,
                  opacity: 0.4,
                }}
              >
                {String(rank + 1).padStart(2, '0')}
              </div>
              <div
                style={{
                  width: 200,
                  color: palette.text,
                  fontSize: 28,
                  fontWeight: 600,
                }}
              >
                {row.label}
              </div>
              <div style={{ flex: 1, position: 'relative', height: 56 }}>
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${barWidth}%`,
                    borderRadius: 12,
                    background: `linear-gradient(90deg, ${row.color}aa, ${row.color})`,
                    boxShadow: `0 0 40px ${row.color}55`,
                  }}
                />
              </div>
              <div
                style={{
                  width: 180,
                  textAlign: 'right',
                  color: row.color,
                  fontSize: 36,
                  fontWeight: 800,
                  letterSpacing: -1,
                }}
              >
                {row.value.toFixed(1)}
                <span style={{ fontSize: 22, opacity: 0.7, marginLeft: 4 }}>{props.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 80,
          right: 80,
          bottom: 60,
          height: 4,
          borderRadius: 2,
          background: `${palette.text}22`,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${t * 100}%`,
            borderRadius: 2,
            background: palette.accent,
            boxShadow: `0 0 20px ${palette.accent}`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
