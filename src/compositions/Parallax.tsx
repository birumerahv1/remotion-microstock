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

export const parallaxSchema = z.object({
  background: imageReferenceSchema,
  foreground: imageReferenceSchema.optional(),
  direction: z.enum(["horizontal", "vertical", "zoom"]).default("horizontal"),
  amplitude: z.number().min(20).max(400).default(120),
  overlayColor: z.string().default("rgba(0, 0, 0, 0.25)"),
  title: z.string().optional(),
});

export type ParallaxProps = z.infer<typeof parallaxSchema>;

export const Parallax: React.FC<ParallaxProps> = ({
  background,
  foreground,
  direction,
  amplitude,
  overlayColor,
  title,
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

  const titleOpacity = interpolate(
    frame,
    [0, 25, durationInFrames - 30, durationInFrames - 10],
    [0, 1, 1, 0],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" },
  );

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

      {title ? (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            opacity: titleOpacity,
          }}
        >
          <div
            style={{
              color: "white",
              fontSize: 88,
              fontWeight: 800,
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              letterSpacing: 4,
              textShadow: "0 6px 32px rgba(0,0,0,0.7)",
              textAlign: "center",
              padding: "0 80px",
              maxWidth: 1600,
            }}
          >
            {title}
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
