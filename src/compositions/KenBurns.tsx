import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { ReferenceImage } from "../components/ReferenceImage";
import { imageReferenceSchema } from "../utils/imageReference";
import {
  AnimatedText,
  animatedTextStyleSchema,
} from "../components/AnimatedText";
import {
  BokehOverlay,
  NoiseGrain,
  VignettePulse,
} from "../components/Overlays";

export const kenBurnsSchema = z.object({
  reference: imageReferenceSchema,
  startScale: z.number().min(0.5).max(3).default(1),
  endScale: z.number().min(0.5).max(3).default(1.25),
  startX: z.number().default(0),
  startY: z.number().default(0),
  endX: z.number().default(0),
  endY: z.number().default(0),
  vignette: z.boolean().default(true),
  bokeh: z.boolean().default(true),
  grain: z.boolean().default(true),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  titleStyle: animatedTextStyleSchema.default("fade-up"),
  subtitleStyle: animatedTextStyleSchema.default("stagger-words"),
});

export type KenBurnsProps = z.infer<typeof kenBurnsSchema>;

export const KenBurns: React.FC<KenBurnsProps> = ({
  reference,
  startScale,
  endScale,
  startX,
  startY,
  endX,
  endY,
  vignette,
  bokeh,
  grain,
  title,
  subtitle,
  titleStyle,
  subtitleStyle,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Ease-in-out for a cinematic feel
  const eased = 0.5 - Math.cos(progress * Math.PI) / 2;

  const scale = interpolate(eased, [0, 1], [startScale, endScale]);
  const translateX = interpolate(eased, [0, 1], [startX, endX]);
  const translateY = interpolate(eased, [0, 1], [startY, endY]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        <ReferenceImage reference={reference} />
      </AbsoluteFill>

      {bokeh ? <BokehOverlay count={14} intensity={0.4} /> : null}

      {vignette ? <VignettePulse /> : null}

      {title ? (
        <AnimatedText
          text={title}
          animation={titleStyle}
          startFrame={6}
          durationFrames={36}
          fadeOut
          fadeOutAt={20}
          fontSize={84}
          fontWeight={800}
          letterSpacing={3}
          containerStyle={{
            justifyContent: "flex-end",
            alignItems: "center",
            padding: subtitle ? "0 0 200px 0" : "0 0 140px 0",
          }}
        />
      ) : null}

      {subtitle ? (
        <AnimatedText
          text={subtitle}
          animation={subtitleStyle}
          startFrame={30}
          durationFrames={45}
          fadeOut
          fadeOutAt={20}
          fontSize={32}
          fontWeight={500}
          letterSpacing={4}
          color="rgba(255,255,255,0.92)"
          containerStyle={{
            justifyContent: "flex-end",
            alignItems: "center",
            padding: "0 0 130px 0",
          }}
        />
      ) : null}

      {grain ? <NoiseGrain intensity={0.07} /> : null}
    </AbsoluteFill>
  );
};
