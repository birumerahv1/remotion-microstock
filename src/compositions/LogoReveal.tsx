import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import {
  AnimatedLogo,
  animatedLogoStyleSchema,
} from "../components/AnimatedLogo";
import {
  AnimatedText,
  animatedTextStyleSchema,
} from "../components/AnimatedText";
import {
  BokehOverlay,
  GlowPulse,
  LetterboxBars,
  LightLeak,
  NoiseGrain,
  ParticleField,
  VignettePulse,
} from "../components/Overlays";
import { easeOut } from "../utils/animations";

/**
 * LogoReveal — a brand intro/outro composition with an animated logo as the
 * focal point. Optional tagline appears below the logo after the entrance
 * animation settles.
 */
export const logoRevealSchema = z.object({
  /** Logo image path (public/ path, https URL, or data URI). */
  logoSrc: z.string().default("/sample-logos/sample-mark.svg"),
  logoAnimation: animatedLogoStyleSchema.default("stamp"),
  /** Logo width in px (height scales automatically). */
  logoWidth: z.number().min(50).default(420),

  backgroundColor: z.string().default("#0b1020"),
  /** When true, paints a soft radial gradient behind the logo. */
  backgroundGradient: z.boolean().default(true),
  accentColor: z.string().default("#22d3ee"),

  /** Optional tagline displayed below the logo. Leave empty to hide. */
  tagline: z.string().default("MICROSTOCK VISUAL STUDIO"),
  taglineAnimation: animatedTextStyleSchema.default("fade-up"),

  /** When true, shows a horizontal accent bar between logo and tagline. */
  showAccentBar: z.boolean().default(true),

  /** Frame at which the logo animation starts. */
  logoStartFrame: z.number().min(0).default(8),
  /** Frames the logo entrance animation runs for. */
  logoDurationFrames: z.number().min(1).default(36),
  /** Frame at which the tagline animation starts. */
  taglineStartFrame: z.number().min(0).default(56),

  // Toggleable overlays.
  bokeh: z.boolean().default(true),
  particles: z.boolean().default(false),
  lightLeak: z.boolean().default(true),
  letterbox: z.boolean().default(false),
  grain: z.boolean().default(true),
  vignette: z.boolean().default(true),
});

export type LogoRevealProps = z.infer<typeof logoRevealSchema>;

export const LogoReveal: React.FC<LogoRevealProps> = ({
  logoSrc,
  logoAnimation,
  logoWidth,
  backgroundColor,
  backgroundGradient,
  accentColor,
  tagline,
  taglineAnimation,
  showAccentBar,
  logoStartFrame,
  logoDurationFrames,
  taglineStartFrame,
  bokeh,
  particles,
  lightLeak,
  letterbox,
  grain,
  vignette,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Accent bar grows in after the logo lands.
  const barProgress = easeOut(
    Math.max(
      0,
      Math.min(
        1,
        (frame - (logoStartFrame + logoDurationFrames * 0.7)) / 24,
      ),
    ),
  );
  const barWidth = interpolate(barProgress, [0, 1], [0, 320]);
  const barOpacity = interpolate(barProgress, [0, 0.4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor, overflow: "hidden" }}>
      {backgroundGradient ? (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse at 50% 50%, ${accentColor}33 0%, ${backgroundColor} 70%)`,
          }}
        />
      ) : null}

      {bokeh ? (
        <BokehOverlay count={20} color={accentColor} intensity={0.4} />
      ) : null}
      {particles ? (
        <ParticleField count={60} color={accentColor} intensity={0.55} />
      ) : null}
      {lightLeak ? <LightLeak intensity={0.4} /> : null}

      {/* Logo */}
      <AnimatedLogo
        src={logoSrc}
        animation={logoAnimation}
        startFrame={logoStartFrame}
        durationFrames={logoDurationFrames}
        width={logoWidth}
        glowColor={accentColor}
        containerStyle={{
          paddingBottom: tagline ? 120 : 0,
        }}
      />

      {/* Accent bar */}
      {showAccentBar ? (
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingTop: logoWidth * 0.55,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: barWidth,
              height: 4,
              backgroundColor: accentColor,
              borderRadius: 2,
              opacity: barOpacity,
              boxShadow: `0 0 18px ${accentColor}`,
            }}
          />
        </AbsoluteFill>
      ) : null}

      {/* Tagline */}
      {tagline ? (
        <AnimatedText
          text={tagline}
          animation={taglineAnimation}
          startFrame={taglineStartFrame}
          durationFrames={36}
          fadeOut={false}
          fontSize={32}
          fontWeight={700}
          letterSpacing={10}
          color="rgba(255,255,255,0.95)"
          textShadow="0 2px 12px rgba(0,0,0,0.5)"
          containerStyle={{
            alignItems: "center",
            justifyContent: "center",
            paddingTop: logoWidth * 0.55 + 80,
          }}
          textStyle={{ textTransform: "uppercase" }}
        />
      ) : null}

      <GlowPulse color={accentColor} intensity={0.22} pulseHz={0.35} />
      {vignette ? (
        <VignettePulse innerPercent={55} pulseAmplitude={3} />
      ) : null}
      {letterbox ? (
        <LetterboxBars height={120} slideInFrames={20} slideOut />
      ) : null}
      {grain ? <NoiseGrain intensity={0.06} /> : null}
    </AbsoluteFill>
  );
};
