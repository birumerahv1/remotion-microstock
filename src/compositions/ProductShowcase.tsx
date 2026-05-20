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

export const productShowcaseSchema = z.object({
  product: imageReferenceSchema,
  backgroundColor: z.string().default("#0f1115"),
  accentColor: z.string().default("#22d3ee"),
  productName: z.string().default("PRODUCT NAME"),
  tagline: z.string().default("Designed for excellence"),
  callToAction: z.string().default("AVAILABLE NOW"),
});

export type ProductShowcaseProps = z.infer<typeof productShowcaseSchema>;

export const ProductShowcase: React.FC<ProductShowcaseProps> = ({
  product,
  backgroundColor,
  accentColor,
  productName,
  tagline,
  callToAction,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 100 },
    durationInFrames: 30,
  });

  const productScale = interpolate(enter, [0, 1], [0.6, 1]);
  const productOpacity = enter;
  const productRotate = interpolate(
    frame,
    [0, durationInFrames - 1],
    [-2, 2],
  );

  const nameY = interpolate(
    frame,
    [20, 50],
    [60, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const nameOpacity = interpolate(
    frame,
    [20, 50],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const taglineOpacity = interpolate(
    frame,
    [50, 80],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const ctaScale = interpolate(
    frame,
    [
      durationInFrames - 60,
      durationInFrames - 40,
      durationInFrames - 20,
      durationInFrames - 1,
    ],
    [0.85, 1.05, 1, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const ctaOpacity = interpolate(
    frame,
    [durationInFrames - 60, durationInFrames - 40],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 40%, ${accentColor}33 0%, transparent 55%)`,
          pointerEvents: "none",
        }}
      />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 900,
            height: 700,
            opacity: productOpacity,
            transform: `scale(${productScale}) rotate(${productRotate}deg)`,
            filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.5))",
          }}
        >
          <ReferenceImage
            reference={{ ...product, fit: product.fit ?? "contain" }}
            style={{ objectFit: "contain" }}
          />
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          padding: "80px 60px 0",
        }}
      >
        <div
          style={{
            opacity: nameOpacity,
            transform: `translateY(${nameY}px)`,
            color: "white",
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: 8,
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            textAlign: "center",
          }}
        >
          {productName}
        </div>
        <div
          style={{
            opacity: taglineOpacity,
            color: accentColor,
            fontSize: 28,
            marginTop: 12,
            letterSpacing: 3,
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            textTransform: "uppercase",
          }}
        >
          {tagline}
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          padding: "0 0 100px 0",
        }}
      >
        <div
          style={{
            opacity: ctaOpacity,
            transform: `scale(${ctaScale})`,
            padding: "24px 56px",
            borderRadius: 999,
            border: `3px solid ${accentColor}`,
            color: "white",
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: 4,
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            backgroundColor: `${accentColor}22`,
          }}
        >
          {callToAction}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
