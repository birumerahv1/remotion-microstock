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
import { LightLeak, ParticleField } from "../components/Overlays";

export const parallaxSchema = z.object({
  background: imageReferenceSchema,
  foreground: imageReferenceSchema.optional(),
  direction: z.enum(["horizontal", "vertical", "zoom"]).default("horizontal"),
  amplitude: z.number().min(20).max(400).default(120),
  overlayColor: z.string().default("rgba(0, 0, 0, 0.25)"),
  lightLeak: z.boolean().default(true),
  particles: z.boolean().default(true),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  titleStyle: animatedTextStyleSchema.default("rotate-in"),
});

export type ParallaxProps = z.infer<typeof parallaxSchema>;

export const Parallax: React.FC<ParallaxProps> = ({
  background,
  foreground,
  direction,
  amplitude,
  overlayColor,
  lightLeak,
  particles,
  title,
  subtitle,
  titleStyle,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const eased = 0.5 - Math.cos(progress * Math.PI) / 2;

  const bgTranslateX =
    direction === "horizontal" ? interpolate(eased, [0, 1], [-amplitude, amplitude]) : 0;
  const bgTranslateY =
    direction === "vertical" ? interpolate(eased, [0, 1], [-amplitude, amplitude]) : 0;
  const bgScale = direction === "zoom" ? interpolate(eased, [0, 1], [1, 1.2]) : 1.1;

  const fgTranslateX = bgTranslateX * 0.4;
  const fgTranslateY = bgTranslateY * 0.4;
  const fgScale = direction === "zoom" ? interpolate(eased, [0, 1], [1, 1.08]) : 1;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `translate(${bgTranslateX}px, ${bgTranslateY}px) scale(${bgScale})`,
          transformOrigin: "center center",
          filter: foreground ? "blur(6px) brightness(0.85)" : undefined,
        }}
      >
        <ReferenceImage reference={background} />
      </AbsoluteFill>

      {foreground ? (
        <AbsoluteFill
          style={{
            transform: `translate(${fgTranslateX}px, ${fgTranslateY}px) scale(${fgScale})`,
            transformOrigin: "center center",
          }}
        >
          <ReferenceImage reference={foreground} />
        </AbsoluteFill>
      ) : null}

      <AbsoluteFill style={{ backgroundColor: overlayColor, pointerEvents: "none" }} />

      {particles ? <ParticleField count={45} intensity={0.55} /> : null}

      {lightLeak ? <LightLeak intensity={0.55} /> : null}

      {title ? (
        <AnimatedText
          text={title}
          animation={titleStyle}
          startFrame={10}
          durationFrames={40}
          fadeOut
          fadeOutAt={20}
          fontSize={96}
          fontWeight={800}
          letterSpacing={4}
          containerStyle={{
            justifyContent: "center",
            alignItems: "center",
            padding: subtitle ? "0 0 90px 0" : 0,
          }}
        />
      ) : null}

      {subtitle ? (
        <AnimatedText
          text={subtitle}
          animation="stagger-words"
          startFrame={40}
          durationFrames={50}
          fadeOut
          fadeOutAt={20}
          fontSize={34}
          fontWeight={500}
          letterSpacing={3}
          color="rgba(255,255,255,0.9)"
          containerStyle={{
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 200,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
