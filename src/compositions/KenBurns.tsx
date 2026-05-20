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

export const kenBurnsSchema = z.object({
  reference: imageReferenceSchema,
  startScale: z.number().min(0.5).max(3).default(1),
  endScale: z.number().min(0.5).max(3).default(1.25),
  startX: z.number().default(0),
  startY: z.number().default(0),
  endX: z.number().default(0),
  endY: z.number().default(0),
  vignette: z.boolean().default(true),
  title: z.string().optional(),
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
  title,
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

  const titleOpacity = interpolate(
    frame,
    [0, 20, durationInFrames - 30, durationInFrames - 10],
    [0, 1, 1, 0],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" },
  );

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

      {vignette ? (
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(circle at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)",
            pointerEvents: "none",
          }}
        />
      ) : null}

      {title ? (
        <AbsoluteFill
          style={{
            justifyContent: "flex-end",
            alignItems: "center",
            padding: "0 0 120px 0",
            opacity: titleOpacity,
          }}
        >
          <div
            style={{
              color: "white",
              fontSize: 64,
              fontWeight: 700,
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              letterSpacing: 2,
              textShadow: "0 4px 24px rgba(0,0,0,0.6)",
              textAlign: "center",
              padding: "0 80px",
            }}
          >
            {title}
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
