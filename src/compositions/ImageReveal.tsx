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

export const imageRevealSchema = z.object({
  reference: imageReferenceSchema,
  revealStyle: z
    .enum(["wipe-left", "wipe-right", "wipe-up", "wipe-down", "circle", "split"])
    .default("wipe-left"),
  accentColor: z.string().default("#f5a623"),
  title: z.string().default("Reveal"),
  subtitle: z.string().optional(),
});

export type ImageRevealProps = z.infer<typeof imageRevealSchema>;

export const ImageReveal: React.FC<ImageRevealProps> = ({
  reference,
  revealStyle,
  accentColor,
  title,
  subtitle,
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

  const titleY = interpolate(
    frame,
    [durationInFrames * 0.5, durationInFrames * 0.7],
    [80, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const titleOpacity = interpolate(
    frame,
    [durationInFrames * 0.5, durationInFrames * 0.65, durationInFrames - 10],
    [0, 1, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a", overflow: "hidden" }}>
      <AbsoluteFill style={{ clipPath: buildClipPath() }}>
        <ReferenceImage reference={reference} />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 50%)",
          pointerEvents: "none",
        }}
      />

      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          padding: "0 0 100px 100px",
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <div
          style={{
            width: 8,
            height: 80,
            backgroundColor: accentColor,
            marginBottom: 24,
          }}
        />
        <div
          style={{
            color: "white",
            fontSize: 96,
            fontWeight: 800,
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            letterSpacing: 1,
            textShadow: "0 4px 24px rgba(0,0,0,0.6)",
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 36,
              marginTop: 16,
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              fontWeight: 400,
              letterSpacing: 1,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
