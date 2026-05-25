import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { resolveImageSrc } from "../utils/imageReference";
import { easeOut, oscillate } from "../utils/animations";

export const animatedLogoStyleSchema = z.enum([
  "stamp",
  "draw-in",
  "spin-in",
  "bounce-drop",
  "fade-glow",
  "zoom-pulse",
  "build-up",
  "flip-in",
  "slide-in",
]);

export type AnimatedLogoStyle = z.infer<typeof animatedLogoStyleSchema>;

export const animatedLogoSchema = z.object({
  /** Source URL/path of the logo image. Can be a public/ path, https URL, or data URI. */
  src: z.string().min(1, "Logo src is required"),
  /** Animation style for the logo entrance. */
  animation: animatedLogoStyleSchema.default("stamp"),
  /** Frame the animation starts on (relative to the parent Sequence/Composition). */
  startFrame: z.number().min(0).default(0),
  /** Entry animation duration in frames. */
  durationFrames: z.number().min(1).default(30),
  /** Whether the logo fades out near the end of the parent composition. */
  fadeOut: z.boolean().default(false),
  /** Frames before composition end where fade-out begins. */
  fadeOutAt: z.number().min(0).default(30),
  /** Rendered width of the logo in px (height auto-scales). */
  width: z.number().min(16).default(280),
  /** CSS color used for the glow ring in `fade-glow`. */
  glowColor: z.string().default("#22d3ee"),
  /** Optional drop shadow CSS string applied to the logo image. */
  dropShadow: z
    .string()
    .default(
      "drop-shadow(0 12px 32px rgba(0,0,0,0.45)) drop-shadow(0 0 1px rgba(0,0,0,0.3))",
    ),
});

export type AnimatedLogoProps = z.input<typeof animatedLogoSchema> & {
  /** Optional style override applied to the outer AbsoluteFill container. */
  containerStyle?: React.CSSProperties;
  /** Optional style override applied to the inner image. */
  imageStyle?: React.CSSProperties;
};

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({
  src,
  animation = "stamp",
  startFrame = 0,
  durationFrames = 30,
  fadeOut = false,
  fadeOutAt = 30,
  width = 280,
  glowColor = "#22d3ee",
  dropShadow = "drop-shadow(0 12px 32px rgba(0,0,0,0.45)) drop-shadow(0 0 1px rgba(0,0,0,0.3))",
  containerStyle,
  imageStyle,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const localFrame = Math.max(0, frame - startFrame);

  const linearProgress = Math.max(
    0,
    Math.min(1, localFrame / Math.max(1, durationFrames)),
  );
  const eased = easeOut(linearProgress);

  const outOpacity = fadeOut
    ? interpolate(
        frame,
        [durationInFrames - fadeOutAt, durationInFrames - 1],
        [1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      )
    : 1;

  const resolvedSrc = resolveImageSrc(src);

  const baseImg: React.CSSProperties = {
    width,
    height: "auto",
    filter: dropShadow,
    ...imageStyle,
  };

  const renderByAnimation = (): React.ReactNode => {
    switch (animation) {
      case "stamp": {
        // Big overshoot scale + impact: scale 1.6 -> 0.95 -> 1.0 (spring overshoot)
        const s = spring({
          frame: localFrame,
          fps,
          config: { damping: 8, stiffness: 140, mass: 0.6 },
        });
        const scale = interpolate(s, [0, 1], [1.6, 1]);
        const opacity =
          interpolate(localFrame, [0, 6], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }) * outOpacity;
        return (
          <Img
            src={resolvedSrc}
            style={{ ...baseImg, opacity, transform: `scale(${scale})` }}
          />
        );
      }

      case "draw-in": {
        // Reveal the logo from center using a circular clip-path that expands.
        const radius = interpolate(eased, [0, 1], [0, 75]);
        return (
          <Img
            src={resolvedSrc}
            style={{
              ...baseImg,
              opacity: outOpacity,
              clipPath: `circle(${radius}% at 50% 50%)`,
              WebkitClipPath: `circle(${radius}% at 50% 50%)`,
            }}
          />
        );
      }

      case "spin-in": {
        const s = spring({
          frame: localFrame,
          fps,
          config: { damping: 12, stiffness: 90, mass: 0.8 },
        });
        const rotate = interpolate(s, [0, 1], [-540, 0]);
        const scale = interpolate(s, [0, 1], [0.2, 1]);
        const opacity =
          interpolate(localFrame, [0, 8], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }) * outOpacity;
        return (
          <Img
            src={resolvedSrc}
            style={{
              ...baseImg,
              opacity,
              transform: `rotate(${rotate}deg) scale(${scale})`,
            }}
          />
        );
      }

      case "bounce-drop": {
        const s = spring({
          frame: localFrame,
          fps,
          config: { damping: 7, stiffness: 110, mass: 0.7 },
        });
        const translateY = interpolate(s, [0, 1], [-400, 0]);
        const scaleX = interpolate(s, [0, 0.6, 1], [1, 1.2, 1]);
        const scaleY = interpolate(s, [0, 0.6, 1], [1, 0.85, 1]);
        const opacity =
          interpolate(localFrame, [0, 4], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }) * outOpacity;
        return (
          <Img
            src={resolvedSrc}
            style={{
              ...baseImg,
              opacity,
              transform: `translateY(${translateY}px) scale(${scaleX}, ${scaleY})`,
            }}
          />
        );
      }

      case "fade-glow": {
        const opacity = eased * outOpacity;
        // Pulsing glow ring behind the logo.
        const glowSize = 20 + oscillate(frame, 8, 0.04);
        const glowOpacity = 0.45 + oscillate(frame, 0.2, 0.05);
        return (
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: width * 1.3,
                height: width * 1.3,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${glowColor}, rgba(0,0,0,0) 65%)`,
                opacity: glowOpacity * opacity,
                filter: `blur(${glowSize}px)`,
              }}
            />
            <Img
              src={resolvedSrc}
              style={{ ...baseImg, opacity, position: "relative" }}
            />
          </div>
        );
      }

      case "zoom-pulse": {
        // Quick zoom-in then continuous breathing pulse.
        const s = spring({
          frame: localFrame,
          fps,
          config: { damping: 14, stiffness: 110 },
        });
        const baseScale = interpolate(s, [0, 1], [0.4, 1]);
        const pulse = oscillate(
          Math.max(0, frame - startFrame - durationFrames),
          0.03,
          0.04,
        );
        const scale = baseScale + (s >= 0.95 ? pulse : 0);
        const opacity =
          interpolate(localFrame, [0, 8], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }) * outOpacity;
        return (
          <Img
            src={resolvedSrc}
            style={{ ...baseImg, opacity, transform: `scale(${scale})` }}
          />
        );
      }

      case "build-up": {
        // Two halves slide together from outside, then settle.
        const slide = interpolate(eased, [0, 1], [60, 0]);
        const opacity = eased * outOpacity;
        return (
          <div
            style={{
              position: "relative",
              width,
              height: width,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Img
              src={resolvedSrc}
              style={{
                ...baseImg,
                position: "absolute",
                clipPath: "inset(0 50% 0 0)",
                WebkitClipPath: "inset(0 50% 0 0)",
                opacity,
                transform: `translateX(${-slide}%)`,
              }}
            />
            <Img
              src={resolvedSrc}
              style={{
                ...baseImg,
                position: "absolute",
                clipPath: "inset(0 0 0 50%)",
                WebkitClipPath: "inset(0 0 0 50%)",
                opacity,
                transform: `translateX(${slide}%)`,
              }}
            />
          </div>
        );
      }

      case "flip-in": {
        const s = spring({
          frame: localFrame,
          fps,
          config: { damping: 12, stiffness: 100 },
        });
        const rotateY = interpolate(s, [0, 1], [-110, 0]);
        const opacity =
          interpolate(localFrame, [0, 6], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }) * outOpacity;
        return (
          <div
            style={{
              perspective: 1200,
            }}
          >
            <Img
              src={resolvedSrc}
              style={{
                ...baseImg,
                opacity,
                transformStyle: "preserve-3d",
                transform: `rotateY(${rotateY}deg)`,
              }}
            />
          </div>
        );
      }

      case "slide-in": {
        const s = spring({
          frame: localFrame,
          fps,
          config: { damping: 16, stiffness: 110 },
        });
        const translateX = interpolate(s, [0, 1], [-220, 0]);
        const opacity =
          interpolate(localFrame, [0, 6], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }) * outOpacity;
        return (
          <Img
            src={resolvedSrc}
            style={{
              ...baseImg,
              opacity,
              transform: `translateX(${translateX}px)`,
            }}
          />
        );
      }
    }
  };

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        ...containerStyle,
      }}
    >
      {renderByAnimation()}
    </AbsoluteFill>
  );
};
