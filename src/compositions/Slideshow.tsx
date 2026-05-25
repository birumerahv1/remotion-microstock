import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { ReferenceImage } from "../components/ReferenceImage";
import {
  imageReferenceSchema,
  ImageReference,
} from "../utils/imageReference";
import {
  AnimatedText,
  animatedTextStyleSchema,
} from "../components/AnimatedText";
import { BokehOverlay, NoiseGrain } from "../components/Overlays";

export const slideshowSchema = z.object({
  references: z.array(imageReferenceSchema).min(1),
  transitionFrames: z.number().min(5).max(120).default(30),
  zoomPerSlide: z.boolean().default(true),
  showCaption: z.boolean().default(true),
  captionStyle: animatedTextStyleSchema.default("fade-up"),
  bokeh: z.boolean().default(true),
  grain: z.boolean().default(true),
});

export type SlideshowProps = z.infer<typeof slideshowSchema>;

type SlideProps = {
  reference: ImageReference;
  slideDuration: number;
  transitionFrames: number;
  isFirst: boolean;
  isLast: boolean;
  zoomPerSlide: boolean;
  showCaption: boolean;
  captionStyle: z.infer<typeof animatedTextStyleSchema>;
};

const Slide: React.FC<SlideProps> = ({
  reference,
  slideDuration,
  transitionFrames,
  isFirst,
  isLast,
  zoomPerSlide,
  showCaption,
  captionStyle,
}) => {
  const frame = useCurrentFrame();

  const inOpacity = isFirst
    ? 1
    : interpolate(frame, [0, transitionFrames], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
  const outOpacity = isLast
    ? 1
    : interpolate(
        frame,
        [slideDuration - transitionFrames, slideDuration - 1],
        [1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      );
  const opacity = Math.min(inOpacity, outOpacity);

  const scale = zoomPerSlide
    ? interpolate(frame, [0, slideDuration - 1], [1.0, 1.12], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  return (
    <AbsoluteFill style={{ opacity }}>
      <AbsoluteFill
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        <ReferenceImage reference={reference} />
      </AbsoluteFill>
      {showCaption && reference.caption ? (
        <AnimatedText
          text={reference.caption}
          animation={captionStyle}
          startFrame={Math.max(0, transitionFrames)}
          durationFrames={26}
          fadeOut={false}
          fontSize={44}
          fontWeight={600}
          letterSpacing={1.5}
          textAlign="left"
          containerStyle={{
            justifyContent: "flex-end",
            alignItems: "flex-start",
            padding: "0 0 90px 90px",
          }}
          textStyle={{
            padding: "18px 28px",
            backgroundColor: "rgba(0,0,0,0.55)",
            borderRadius: 10,
            backdropFilter: "blur(8px)",
            boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

export const Slideshow: React.FC<SlideshowProps> = ({
  references,
  transitionFrames,
  zoomPerSlide,
  showCaption,
  captionStyle,
  bokeh,
  grain,
}) => {
  const { durationInFrames } = useVideoConfig();
  const count = references.length;
  const slideDuration = Math.floor(durationInFrames / count);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {references.map((reference, index) => (
        <Sequence
          key={`${reference.src}-${index}`}
          from={index * slideDuration}
          durationInFrames={
            index === count - 1
              ? durationInFrames - index * slideDuration
              : slideDuration + transitionFrames
          }
          layout="none"
        >
          <Slide
            reference={reference}
            slideDuration={
              index === count - 1
                ? durationInFrames - index * slideDuration
                : slideDuration + transitionFrames
            }
            transitionFrames={transitionFrames}
            isFirst={index === 0}
            isLast={index === count - 1}
            zoomPerSlide={zoomPerSlide}
            showCaption={showCaption}
            captionStyle={captionStyle}
          />
        </Sequence>
      ))}

      {bokeh ? <BokehOverlay count={10} intensity={0.25} /> : null}
      {grain ? <NoiseGrain intensity={0.05} /> : null}
    </AbsoluteFill>
  );
};
