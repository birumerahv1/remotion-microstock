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
import {
  BokehOverlay,
  CameraShake,
  GlowPulse,
  LetterboxBars,
  LightLeak,
  NoiseGrain,
  ParticleField,
  VignettePulse,
} from "../components/Overlays";

/**
 * TextHero — a fully-animated title sequence composition. Optional reference
 * image is rendered behind a tinted overlay. All text animations + overlay
 * effects are independently toggleable from the props panel.
 */
export const textHeroSchema = z.object({
  /** Optional background image. If omitted, the gradient is used. */
  reference: imageReferenceSchema.optional(),
  backgroundColor: z.string().default("#0b1020"),
  /** Gradient overlay color rendered on top of the background image. */
  overlayColor: z.string().default("rgba(8, 12, 30, 0.55)"),
  accentColor: z.string().default("#22d3ee"),

  eyebrow: z.string().default("MICROSTOCK"),
  title: z.string().default("Brand Story"),
  subtitle: z.string().default("Crafted for creators who care"),
  callToAction: z.string().default("WATCH NOW"),

  eyebrowAnimation: animatedTextStyleSchema.default("slide-in-left"),
  titleAnimation: animatedTextStyleSchema.default("stagger-words"),
  subtitleAnimation: animatedTextStyleSchema.default("fade-up"),

  /** Subtle camera shake on the entire scene (great for impact intros). */
  cameraShake: z.boolean().default(true),
  lightLeak: z.boolean().default(true),
  bokeh: z.boolean().default(true),
  particles: z.boolean().default(false),
  letterbox: z.boolean().default(true),
  grain: z.boolean().default(true),
});

export type TextHeroProps = z.infer<typeof textHeroSchema>;

export const TextHero: React.FC<TextHeroProps> = ({
  reference,
  backgroundColor,
  overlayColor,
  accentColor,
  eyebrow,
  title,
  subtitle,
  callToAction,
  eyebrowAnimation,
  titleAnimation,
  subtitleAnimation,
  cameraShake,
  lightLeak,
  bokeh,
  particles,
  letterbox,
  grain,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Slow zoom on the background to keep the frame alive.
  const progress = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const eased = 0.5 - Math.cos(progress * Math.PI) / 2;
  const bgScale = interpolate(eased, [0, 1], [1.05, 1.15]);

  // CTA button entrance
  const ctaSpring = spring({
    frame: Math.max(0, frame - (durationInFrames - 70)),
    fps,
    config: { damping: 9, stiffness: 110, mass: 0.7 },
    durationInFrames: 35,
  });
  const ctaPulse = 1 + Math.sin(frame * 0.16) * 0.04;
  const ctaScale = interpolate(ctaSpring, [0, 1], [0.7, 1]) * ctaPulse;
  const ctaOpacity = ctaSpring;

  const scene = (
    <>
      {/* Background */}
      <AbsoluteFill style={{ backgroundColor }} />
      {reference ? (
        <AbsoluteFill
          style={{
            transform: `scale(${bgScale})`,
            transformOrigin: "center center",
          }}
        >
          <ReferenceImage reference={reference} />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse at 50% 35%, ${accentColor}44 0%, ${backgroundColor} 60%)`,
          }}
        />
      )}
      <AbsoluteFill
        style={{ backgroundColor: overlayColor, pointerEvents: "none" }}
      />

      {bokeh ? (
        <BokehOverlay count={16} color={accentColor} intensity={0.35} />
      ) : null}
      {particles ? (
        <ParticleField count={50} color={accentColor} intensity={0.5} />
      ) : null}
      {lightLeak ? <LightLeak intensity={0.45} /> : null}

      {/* Eyebrow */}
      <AnimatedText
        text={eyebrow}
        animation={eyebrowAnimation}
        startFrame={4}
        durationFrames={24}
        fadeOut={false}
        fontSize={26}
        fontWeight={700}
        letterSpacing={10}
        color={accentColor}
        textShadow="0 0 12px rgba(0,0,0,0.5)"
        containerStyle={{
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 320,
        }}
        textStyle={{ textTransform: "uppercase" }}
      />

      {/* Title */}
      <AnimatedText
        text={title}
        animation={titleAnimation}
        startFrame={20}
        durationFrames={50}
        fadeOut={false}
        fontSize={140}
        fontWeight={900}
        letterSpacing={2}
        color="#ffffff"
        textShadow="0 8px 32px rgba(0,0,0,0.6), 0 0 60px rgba(0,0,0,0.3)"
        containerStyle={{
          alignItems: "center",
          justifyContent: "center",
        }}
      />

      {/* Accent underline */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 180,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: interpolate(
              eased,
              [0.1, 0.6],
              [0, 360],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            ),
            height: 6,
            backgroundColor: accentColor,
            borderRadius: 3,
            boxShadow: `0 0 24px ${accentColor}`,
            opacity: interpolate(eased, [0.1, 0.3], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />
      </AbsoluteFill>

      {/* Subtitle */}
      <AnimatedText
        text={subtitle}
        animation={subtitleAnimation}
        startFrame={70}
        durationFrames={45}
        fadeOut={false}
        fontSize={36}
        fontWeight={500}
        letterSpacing={3}
        color="rgba(255,255,255,0.92)"
        containerStyle={{
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 360,
        }}
      />

      {/* Glow behind CTA */}
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          padding: "0 0 130px 0",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "relative",
            opacity: ctaOpacity,
            transform: `scale(${ctaScale})`,
          }}
        >
          <div
            style={{
              padding: "22px 60px",
              borderRadius: 999,
              border: `2px solid ${accentColor}`,
              color: "white",
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: 6,
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              backgroundColor: `${accentColor}22`,
              boxShadow: `0 0 28px ${accentColor}88, inset 0 0 16px ${accentColor}55`,
            }}
          >
            {callToAction}
          </div>
        </div>
      </AbsoluteFill>

      <GlowPulse color={accentColor} intensity={0.25} pulseHz={0.4} />
      <VignettePulse innerPercent={60} pulseAmplitude={4} />
    </>
  );

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor }}>
      {cameraShake ? (
        <CameraShake amplitude={5} frequency={0.25} rotateAmplitude={0.3}>
          {scene}
        </CameraShake>
      ) : (
        scene
      )}
      {letterbox ? (
        <LetterboxBars height={120} slideInFrames={20} slideOut />
      ) : null}
      {grain ? <NoiseGrain intensity={0.07} /> : null}
    </AbsoluteFill>
  );
};
