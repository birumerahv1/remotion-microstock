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
import { AnimatedText } from "../components/AnimatedText";
import {
  GlowPulse,
  NoiseGrain,
  ParticleField,
} from "../components/Overlays";

export const productShowcaseSchema = z.object({
  product: imageReferenceSchema,
  backgroundColor: z.string().default("#0f1115"),
  accentColor: z.string().default("#22d3ee"),
  productName: z.string().default("PRODUCT NAME"),
  tagline: z.string().default("Designed for excellence"),
  callToAction: z.string().default("AVAILABLE NOW"),
  particles: z.boolean().default(true),
  grain: z.boolean().default(true),
});

export type ProductShowcaseProps = z.infer<typeof productShowcaseSchema>;

export const ProductShowcase: React.FC<ProductShowcaseProps> = ({
  product,
  backgroundColor,
  accentColor,
  productName,
  tagline,
  callToAction,
  particles,
  grain,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Product entrance (spring scale-in)
  const enter = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 100 },
    durationInFrames: 30,
  });
  const productScale = interpolate(enter, [0, 1], [0.6, 1]);
  const productOpacity = enter;

  // Gentle rotate + bob for the product itself
  const productRotate = Math.sin(frame * 0.03) * 1.8;
  const productBob = Math.sin(frame * 0.05) * 12;

  // CTA bouncy entrance + breathing pulse
  const ctaSpring = spring({
    frame: Math.max(0, frame - (durationInFrames - 80)),
    fps,
    config: { damping: 9, stiffness: 110, mass: 0.7 },
    durationInFrames: 40,
  });
  const ctaPulse = 1 + Math.sin(frame * 0.18) * 0.04;
  const ctaScale = interpolate(ctaSpring, [0, 1], [0.7, 1]) * ctaPulse;
  const ctaOpacity = ctaSpring;

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 40%, ${accentColor}33 0%, transparent 55%)`,
          pointerEvents: "none",
        }}
      />

      {particles ? (
        <ParticleField count={50} color={accentColor} intensity={0.6} />
      ) : null}

      {/* Animated accent glow behind the product */}
      <GlowPulse color={accentColor} intensity={0.35} pulseHz={0.35} />

      {/* Product image */}
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
            transform: `translateY(${productBob}px) scale(${productScale}) rotate(${productRotate}deg)`,
            filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.5))",
          }}
        >
          <ReferenceImage
            reference={{ ...product, fit: product.fit ?? "contain" }}
            style={{ objectFit: "contain" }}
          />
        </div>
      </AbsoluteFill>

      {/* Product name + tagline */}
      <AnimatedText
        text={productName}
        animation="bounce-in"
        startFrame={18}
        durationFrames={28}
        fadeOut={false}
        fontSize={88}
        fontWeight={800}
        letterSpacing={8}
        containerStyle={{
          justifyContent: "flex-start",
          alignItems: "center",
          padding: "80px 60px 0",
        }}
      />

      <AnimatedText
        text={tagline}
        animation="fade-up"
        startFrame={48}
        durationFrames={28}
        fadeOut={false}
        fontSize={32}
        fontWeight={600}
        letterSpacing={4}
        color={accentColor}
        textShadow="0 2px 12px rgba(0,0,0,0.5)"
        containerStyle={{
          justifyContent: "flex-start",
          alignItems: "center",
          padding: "200px 60px 0",
        }}
        textStyle={{ textTransform: "uppercase" }}
      />

      {/* CTA button at the bottom */}
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          padding: "0 0 110px 0",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            opacity: ctaOpacity,
            transform: `scale(${ctaScale})`,
            padding: "24px 60px",
            borderRadius: 999,
            border: `3px solid ${accentColor}`,
            color: "white",
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: 5,
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            backgroundColor: `${accentColor}22`,
            boxShadow: `0 0 32px ${accentColor}66, inset 0 0 18px ${accentColor}33`,
          }}
        >
          {callToAction}
        </div>
      </AbsoluteFill>

      {grain ? <NoiseGrain intensity={0.06} /> : null}
    </AbsoluteFill>
  );
};
