import React from "react";
import { Composition } from "remotion";
import {
  VIDEO_WIDTH,
  VIDEO_HEIGHT,
  VIDEO_FPS,
  VIDEO_DURATION_FRAMES,
  SAMPLE_IMAGE_1,
  SAMPLE_IMAGE_2,
  SAMPLE_IMAGE_3,
  SAMPLE_IMAGE_4,
} from "./constants";

import { KenBurns, kenBurnsSchema } from "./compositions/KenBurns";
import { Parallax, parallaxSchema } from "./compositions/Parallax";
import { ImageReveal, imageRevealSchema } from "./compositions/ImageReveal";
import { Slideshow, slideshowSchema } from "./compositions/Slideshow";
import {
  ProductShowcase,
  productShowcaseSchema,
} from "./compositions/ProductShowcase";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="KenBurns"
        component={KenBurns}
        durationInFrames={VIDEO_DURATION_FRAMES}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        schema={kenBurnsSchema}
        defaultProps={{
          reference: {
            src: SAMPLE_IMAGE_1,
            focusX: 0.5,
            focusY: 0.5,
            fit: "cover" as const,
          },
          startScale: 1,
          endScale: 1.25,
          startX: 0,
          startY: 0,
          endX: -40,
          endY: 0,
          vignette: true,
          title: "Mountain Sunrise",
        }}
      />

      <Composition
        id="Parallax"
        component={Parallax}
        durationInFrames={VIDEO_DURATION_FRAMES}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        schema={parallaxSchema}
        defaultProps={{
          background: {
            src: SAMPLE_IMAGE_2,
            focusX: 0.5,
            focusY: 0.5,
            fit: "cover" as const,
          },
          foreground: undefined,
          direction: "horizontal" as const,
          amplitude: 120,
          overlayColor: "rgba(0, 0, 0, 0.25)",
          title: "Cinematic Parallax",
        }}
      />

      <Composition
        id="ImageReveal"
        component={ImageReveal}
        durationInFrames={VIDEO_DURATION_FRAMES}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        schema={imageRevealSchema}
        defaultProps={{
          reference: {
            src: SAMPLE_IMAGE_3,
            focusX: 0.5,
            focusY: 0.5,
            fit: "cover" as const,
          },
          revealStyle: "wipe-left" as const,
          accentColor: "#f5a623",
          title: "Bold Reveal",
          subtitle: "Premium microstock footage",
        }}
      />

      <Composition
        id="Slideshow"
        component={Slideshow}
        durationInFrames={VIDEO_DURATION_FRAMES}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        schema={slideshowSchema}
        defaultProps={{
          references: [
            {
              src: SAMPLE_IMAGE_1,
              focusX: 0.5,
              focusY: 0.5,
              fit: "cover" as const,
              caption: "Mountain Vista",
            },
            {
              src: SAMPLE_IMAGE_2,
              focusX: 0.5,
              focusY: 0.5,
              fit: "cover" as const,
              caption: "Ocean Horizon",
            },
            {
              src: SAMPLE_IMAGE_3,
              focusX: 0.5,
              focusY: 0.5,
              fit: "cover" as const,
              caption: "Urban Lights",
            },
          ],
          transitionFrames: 30,
          zoomPerSlide: true,
          showCaption: true,
        }}
      />

      <Composition
        id="ProductShowcase"
        component={ProductShowcase}
        durationInFrames={VIDEO_DURATION_FRAMES}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        schema={productShowcaseSchema}
        defaultProps={{
          product: {
            src: SAMPLE_IMAGE_4,
            focusX: 0.5,
            focusY: 0.5,
            fit: "contain" as const,
          },
          backgroundColor: "#0f1115",
          accentColor: "#22d3ee",
          productName: "AURORA X1",
          tagline: "Designed for creators",
          callToAction: "AVAILABLE NOW",
        }}
      />
    </>
  );
};
