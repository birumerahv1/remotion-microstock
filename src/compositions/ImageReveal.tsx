import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
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
import { LetterboxBars, NoiseGrain } from "../components/Overlays";

export const imageRevealSchema = z.object({
  reference: imageReferenceSchema,
  revealStyle: z
    .enum(["wipe-left", "wipe-right", "wipe-up", "wipe-down", "circle", "split"])
    .default("wipe-left"),
  accentColor: z.string().default("#f5a623"),
  title: z.string().default("Reveal"),
  subtitle: z.string().optional(),
  titleStyle: animatedTextStyleSchema.default("wipe"),
  letterbox: z.boolean().default(true),
  grain: z.boolean().default(true),
});

export type ImageRevealProps = z.infer<typeof imageRevealSchema>;

export const ImageReveal: React.FC<ImageRevealProps> = ({
  reference,
  revealStyle,
  accentColor,
  title,
  subtitle,
  titleStyle,
  letterbox,
  grain,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const reveal = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 80, mass: 1 },
    durationInFrames: Math.round(durationInFrames * 0.6),
  });

  const buildClipPath = (): string => {
    const r = reveal;
    switch (revealStyle) {
      case "wipe-left":
        return `inset(0 ${100 - r * 100}% 0 0)`;
      case "wipe-right":
        return `inset(0 0 0 ${100 - r * 100}%)`;
      case "wipe-up":
        return `inset(0 0 ${100 - r * 100}% 0)`;
      case "wipe-down":
        return `inset(${100 - r * 100}% 0 0 0)`;
      case "circle":
        return `circle(${r * 80}% at 50% 50%)`;
      case "split":
        return `inset(${(1 - r) * 50}% 0 ${(1 - r) * 50}% 0)`;
      default:
        return "inset(0 0 0 0)";
    }
  };

  const accentBarHeight = interpolate(
    reveal,
    [0.4, 1],
    [0, 80],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Pulse the accent bar after it has fully drawn in.
  const accentPulse =
    0.7 + 0.3 * Math.sin((frame - durationInFrames * 0.6) * 0.18);
  const accentOpacity = interpolate(
    reveal,
    [0.4, 1],
    [0, Math.max(0.6, Math.min(1, accentPulse))],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const titleStartFrame = Math.round(durationInFrames * 0.55);
  const subtitleStartFrame = titleStartFrame + 18;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a", overflow: "hidden" }}>
      <AbsoluteFill style={{ clipPath: buildClipPath() }}>
        <ReferenceImage reference={reference} />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 50%)",
          pointerEvents: "none",
        }}
      />

      {letterbox ? (
        <LetterboxBars height={100} slideInFrames={18} slideOut />
      ) : null}

      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          padding: "0 0 110px 100px",
          alignItems: "flex-start",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: 8,
            height: accentBarHeight,
            backgroundColor: accentColor,
            opacity: accentOpacity,
            marginBottom: 24,
            boxShadow: `0 0 12px ${accentColor}`,
          }}
        />
      </AbsoluteFill>

      <AnimatedText
        text={title}
        animation={titleStyle}
        startFrame={titleStartFrame}
        durationFrames={26}
        fadeOut={false}
        fontSize={108}
        fontWeight={800}
        letterSpacing={1}
        textAlign="left"
        containerStyle={{
          justifyContent: "flex-end",
          alignItems: "flex-start",
          padding: "0 0 120px 100px",
        }}
      />

      {subtitle ? (
        <AnimatedText
          text={subtitle}
          animation="stagger-words"
          startFrame={subtitleStartFrame}
          durationFrames={32}
          fadeOut={false}
          fontSize={36}
          fontWeight={500}
          letterSpacing={2}
          textAlign="left"
          color="rgba(255,255,255,0.88)"
          containerStyle={{
            justifyContent: "flex-end",
            alignItems: "flex-start",
            padding: "0 0 70px 100px",
          }}
        />
      ) : null}

      {grain ? <NoiseGrain intensity={0.06} /> : null}
    </AbsoluteFill>
  );
};
