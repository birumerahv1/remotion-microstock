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
import { easeInOut, easeOut } from "../utils/animations";

/**
 * LowerThird — name/title bar for interviews and talking-heads. Optional
 * background image. The animated bar slides in from the left, expands to its
 * full width, then slides out near the end.
 */
export const lowerThirdSchema = z.object({
  /** Optional background image. */
  reference: imageReferenceSchema.optional(),
  backgroundColor: z.string().default("#0f1115"),
  /** Primary brand color (bar accent). */
  accentColor: z.string().default("#ef4444"),
  /** Bar fill color. */
  barColor: z.string().default("rgba(0, 0, 0, 0.85)"),

  name: z.string().default("Jane Doe"),
  role: z.string().default("Director of Photography"),
  socialHandle: z.string().optional(),

  nameAnimation: animatedTextStyleSchema.default("slide-in-left"),
  roleAnimation: animatedTextStyleSchema.default("fade-up"),

  /** Position of the lower-third on screen (vertical offset from bottom in px). */
  bottomOffset: z.number().min(0).default(140),
  /** Stay visible until this many frames before the end, then slide out. */
  exitFrames: z.number().min(0).default(30),
});

export type LowerThirdProps = z.infer<typeof lowerThirdSchema>;

export const LowerThird: React.FC<LowerThirdProps> = ({
  reference,
  backgroundColor,
  accentColor,
  barColor,
  name,
  role,
  socialHandle,
  nameAnimation,
  roleAnimation,
  bottomOffset,
  exitFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Bar entrance: spring slide from left + width expand
  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 110, mass: 0.8 },
    durationInFrames: 30,
  });
  const slideX = interpolate(entrance, [0, 1], [-600, 0]);

  // Width expands from 0 to full as the bar slides in (cinematic flourish).
  const widthProgress = easeOut(
    Math.max(0, Math.min(1, (frame - 6) / 18)),
  );

  // Exit slide-out: shift everything off-screen before the comp ends.
  const exitProgress = easeInOut(
    Math.max(
      0,
      Math.min(
        1,
        (frame - (durationInFrames - exitFrames)) / Math.max(1, exitFrames),
      ),
    ),
  );
  const exitOffset = exitProgress * -800;

  const accentHeight = interpolate(entrance, [0, 1], [0, 120]);

  return (
    <AbsoluteFill style={{ backgroundColor, overflow: "hidden" }}>
      {reference ? (
        <AbsoluteFill>
          <ReferenceImage reference={reference} />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at 30% 60%, ${accentColor}22 0%, ${backgroundColor} 55%)`,
          }}
        />
      )}

      {/* Vignette */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.55) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Lower-third bar */}
      <div
        style={{
          position: "absolute",
          left: 120,
          bottom: bottomOffset,
          transform: `translateX(${slideX + exitOffset}px)`,
          display: "flex",
          alignItems: "stretch",
          height: 140,
          opacity: entrance,
        }}
      >
        {/* Accent vertical bar */}
        <div
          style={{
            width: 10,
            height: accentHeight,
            alignSelf: "center",
            backgroundColor: accentColor,
            boxShadow: `0 0 18px ${accentColor}`,
            marginRight: 20,
          }}
        />

        {/* Text wrapper */}
        <div
          style={{
            position: "relative",
            padding: "20px 40px",
            backgroundColor: barColor,
            backdropFilter: "blur(8px)",
            borderRadius: 6,
            width: 800 * widthProgress,
            minHeight: 140,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            overflow: "hidden",
            boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
          }}
        >
          <AnimatedText
            text={name}
            animation={nameAnimation}
            startFrame={14}
            durationFrames={22}
            fadeOut={false}
            fontSize={58}
            fontWeight={800}
            letterSpacing={1}
            textAlign="left"
            maxWidth={760}
            containerStyle={{
              position: "relative",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              padding: 0,
              height: "auto",
            }}
            textStyle={{ padding: 0 }}
          />
          <AnimatedText
            text={role}
            animation={roleAnimation}
            startFrame={28}
            durationFrames={24}
            fadeOut={false}
            fontSize={28}
            fontWeight={500}
            letterSpacing={2}
            color={accentColor}
            textAlign="left"
            maxWidth={760}
            containerStyle={{
              position: "relative",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              padding: 0,
              height: "auto",
              marginTop: 8,
            }}
            textStyle={{ padding: 0, textTransform: "uppercase" }}
          />
        </div>
      </div>

      {/* Social handle */}
      {socialHandle ? (
        <div
          style={{
            position: "absolute",
            left: 150,
            bottom: bottomOffset - 50,
            transform: `translateX(${slideX + exitOffset}px)`,
            color: "rgba(255,255,255,0.85)",
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: 1.5,
            opacity: easeOut(
              Math.max(0, Math.min(1, (frame - 40) / 20)),
            ) *
              (1 - exitProgress),
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          {socialHandle}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
