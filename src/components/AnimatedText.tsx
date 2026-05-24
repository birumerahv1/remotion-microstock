import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { easeOut, fadeInOut } from "../utils/animations";

export const animatedTextStyleSchema = z.enum([
  "fade-up",
  "stagger-words",
  "typewriter",
  "bounce-in",
  "wipe",
  "blur-focus",
  "rotate-in",
  "slide-in-left",
  "slide-in-right",
]);

export type AnimatedTextStyle = z.infer<typeof animatedTextStyleSchema>;

export const animatedTextSchema = z.object({
  text: z.string(),
  /** Animation style applied to the text. */
  animation: animatedTextStyleSchema.default("fade-up"),
  /** Frame the animation starts on (relative to the current Sequence/Composition). */
  startFrame: z.number().min(0).default(0),
  /** How long the entry animation lasts. */
  durationFrames: z.number().min(1).default(30),
  /** If true, the text fades out near the end of the parent composition. */
  fadeOut: z.boolean().default(true),
  /** Frames before the end of the parent comp where fade-out begins. */
  fadeOutAt: z.number().min(0).default(30),
  /** Font size in px. */
  fontSize: z.number().min(8).default(72),
  /** Font weight. */
  fontWeight: z.number().min(100).max(900).default(800),
  /** CSS color. */
  color: z.string().default("#ffffff"),
  /** Letter spacing in px. */
  letterSpacing: z.number().default(2),
  /** Drop shadow CSS value. */
  textShadow: z
    .string()
    .default("0 4px 24px rgba(0, 0, 0, 0.55), 0 0 1px rgba(0, 0, 0, 0.4)"),
  /** Text alignment. */
  textAlign: z.enum(["left", "center", "right"]).default("center"),
  /** Max width of the text block in px. */
  maxWidth: z.number().min(200).default(1600),
});

// Use z.input so that fields with a Zod default are optional for callers.
export type AnimatedTextProps = z.input<typeof animatedTextSchema> & {
  /** Optional style override applied to the outer AbsoluteFill container. */
  containerStyle?: React.CSSProperties;
  /** Optional style override applied to the inner text element. */
  textStyle?: React.CSSProperties;
};

const FONT_FAMILY =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  animation = "fade-up",
  startFrame = 0,
  durationFrames = 30,
  fadeOut = true,
  fadeOutAt = 30,
  fontSize = 72,
  fontWeight = 800,
  color = "#ffffff",
  letterSpacing = 2,
  textShadow = "0 4px 24px rgba(0, 0, 0, 0.55), 0 0 1px rgba(0, 0, 0, 0.4)",
  textAlign = "center",
  maxWidth = 1600,
  containerStyle,
  textStyle,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const localFrame = frame - startFrame;

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

  const baseTextStyle: React.CSSProperties = {
    color,
    fontFamily: FONT_FAMILY,
    fontWeight,
    fontSize,
    letterSpacing,
    textShadow,
    textAlign,
    maxWidth,
    padding: "0 40px",
    margin: 0,
    lineHeight: 1.15,
  };

  const renderByAnimation = (): React.ReactNode => {
    switch (animation) {
      case "fade-up": {
        const translateY = interpolate(eased, [0, 1], [60, 0]);
        return (
          <div
            style={{
              ...baseTextStyle,
              opacity: eased * outOpacity,
              transform: `translateY(${translateY}px)`,
              ...textStyle,
            }}
          >
            {text}
          </div>
        );
      }

      case "slide-in-left": {
        const translateX = interpolate(eased, [0, 1], [-200, 0]);
        return (
          <div
            style={{
              ...baseTextStyle,
              opacity: eased * outOpacity,
              transform: `translateX(${translateX}px)`,
              ...textStyle,
            }}
          >
            {text}
          </div>
        );
      }

      case "slide-in-right": {
        const translateX = interpolate(eased, [0, 1], [200, 0]);
        return (
          <div
            style={{
              ...baseTextStyle,
              opacity: eased * outOpacity,
              transform: `translateX(${translateX}px)`,
              ...textStyle,
            }}
          >
            {text}
          </div>
        );
      }

      case "stagger-words": {
        const words = text.split(" ");
        const perWord = Math.max(
          2,
          Math.floor(durationFrames / Math.max(1, words.length)),
        );
        return (
          <div
            style={{
              ...baseTextStyle,
              opacity: outOpacity,
              display: "flex",
              flexWrap: "wrap",
              gap: "0 0.35em",
              justifyContent:
                textAlign === "left"
                  ? "flex-start"
                  : textAlign === "right"
                    ? "flex-end"
                    : "center",
              ...textStyle,
            }}
          >
            {words.map((word, i) => {
              const wordStart = i * perWord;
              const wordProgress = Math.max(
                0,
                Math.min(
                  1,
                  (localFrame - wordStart) / Math.max(1, perWord * 1.5),
                ),
              );
              const wordEased = easeOut(wordProgress);
              const ty = interpolate(wordEased, [0, 1], [40, 0]);
              return (
                <span
                  key={`${word}-${i}`}
                  style={{
                    display: "inline-block",
                    opacity: wordEased,
                    transform: `translateY(${ty}px)`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        );
      }

      case "typewriter": {
        const charCount = Math.floor(linearProgress * text.length);
        const visible = text.slice(0, charCount);
        const cursorOn = Math.floor(frame / 8) % 2 === 0;
        const isTyping = linearProgress < 1;
        return (
          <div
            style={{
              ...baseTextStyle,
              opacity: outOpacity,
              ...textStyle,
            }}
          >
            {visible}
            <span
              style={{
                display: "inline-block",
                width: "0.6ch",
                opacity: isTyping || cursorOn ? 1 : 0,
                color,
                marginLeft: "0.05em",
              }}
            >
              |
            </span>
          </div>
        );
      }

      case "bounce-in": {
        const s = spring({
          frame: localFrame,
          fps,
          config: { damping: 8, stiffness: 90, mass: 0.6 },
          durationInFrames: durationFrames,
        });
        const scale = interpolate(s, [0, 1], [0.4, 1]);
        return (
          <div
            style={{
              ...baseTextStyle,
              opacity: Math.max(0, Math.min(1, s)) * outOpacity,
              transform: `scale(${scale})`,
              transformOrigin: "center",
              ...textStyle,
            }}
          >
            {text}
          </div>
        );
      }

      case "wipe": {
        const wipe = eased * 100;
        return (
          <div
            style={{
              position: "relative",
              opacity: outOpacity,
              ...textStyle,
            }}
          >
            <div
              style={{
                ...baseTextStyle,
                clipPath: `inset(0 ${100 - wipe}% 0 0)`,
              }}
            >
              {text}
            </div>
          </div>
        );
      }

      case "blur-focus": {
        const blur = interpolate(eased, [0, 1], [22, 0]);
        return (
          <div
            style={{
              ...baseTextStyle,
              opacity: eased * outOpacity,
              filter: `blur(${blur}px)`,
              ...textStyle,
            }}
          >
            {text}
          </div>
        );
      }

      case "rotate-in": {
        const s = spring({
          frame: localFrame,
          fps,
          config: { damping: 12, stiffness: 120, mass: 0.7 },
          durationInFrames: durationFrames,
        });
        const rotate = interpolate(s, [0, 1], [-12, 0]);
        const scale = interpolate(s, [0, 1], [0.7, 1]);
        return (
          <div
            style={{
              ...baseTextStyle,
              opacity: Math.max(0, Math.min(1, s)) * outOpacity,
              transform: `rotate(${rotate}deg) scale(${scale})`,
              transformOrigin: "center",
              ...textStyle,
            }}
          >
            {text}
          </div>
        );
      }

      default:
        return <div style={{ ...baseTextStyle, ...textStyle }}>{text}</div>;
    }
  };

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "none",
        ...containerStyle,
      }}
    >
      {renderByAnimation()}
    </AbsoluteFill>
  );
};

/** Helper that produces a simple progress timeline for fading text in/out. */
export const useTextOpacity = (
  fadeInFrames = 20,
  fadeOutFrames = 20,
): number => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return fadeInOut(frame, durationInFrames, fadeInFrames, fadeOutFrames);
};
