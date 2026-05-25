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
  SAMPLE_LOGO_MARK,
  SAMPLE_LOGO_WORDMARK,
} from "./constants";

import { KenBurns, kenBurnsSchema } from "./compositions/KenBurns";
import { Parallax, parallaxSchema } from "./compositions/Parallax";
import { ImageReveal, imageRevealSchema } from "./compositions/ImageReveal";
import { Slideshow, slideshowSchema } from "./compositions/Slideshow";
import {
  ProductShowcase,
  productShowcaseSchema,
} from "./compositions/ProductShowcase";
import { TextHero, textHeroSchema } from "./compositions/TextHero";
import { LowerThird, lowerThirdSchema } from "./compositions/LowerThird";
import { LogoReveal, logoRevealSchema } from "./compositions/LogoReveal";

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
          bokeh: true,
          grain: true,
          title: "Mountain Sunrise",
          subtitle: "Premium microstock footage",
          titleStyle: "fade-up" as const,
          subtitleStyle: "stagger-words" as const,
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
          direction: "horizontal" as const,
          amplitude: 120,
          overlayColor: "rgba(0, 0, 0, 0.25)",
          lightLeak: true,
          particles: true,
          title: "Cinematic Parallax",
          subtitle: "Layered depth with motion",
          titleStyle: "rotate-in" as const,
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
          revealStyle: "wipe-right" as const,
          accentColor: "#f5a623",
          title: "Bold Reveal",
          subtitle: "Premium microstock footage",
          titleStyle: "wipe" as const,
          letterbox: true,
          grain: true,
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
          captionStyle: "fade-up" as const,
          bokeh: true,
          grain: true,
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
          particles: true,
          grain: true,
        }}
      />

      <Composition
        id="TextHero"
        component={TextHero}
        durationInFrames={VIDEO_DURATION_FRAMES}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        schema={textHeroSchema}
        defaultProps={{
          reference: {
            src: SAMPLE_IMAGE_1,
            focusX: 0.5,
            focusY: 0.4,
            fit: "cover" as const,
          },
          backgroundColor: "#0b1020",
          overlayColor: "rgba(8, 12, 30, 0.55)",
          accentColor: "#22d3ee",
          eyebrow: "MICROSTOCK SERIES",
          title: "Brand Story",
          subtitle: "Crafted for creators who care",
          callToAction: "WATCH NOW",
          eyebrowAnimation: "slide-in-left" as const,
          titleAnimation: "bounce-in" as const,
          subtitleAnimation: "fade-up" as const,
          logoSrc: SAMPLE_LOGO_MARK,
          logoAnimation: "stamp" as const,
          logoWidth: 140,
          logoStartFrame: 0,
          cameraShake: true,
          lightLeak: true,
          bokeh: true,
          particles: false,
          letterbox: true,
          grain: true,
        }}
      />

      <Composition
        id="LowerThird"
        component={LowerThird}
        durationInFrames={VIDEO_DURATION_FRAMES}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        schema={lowerThirdSchema}
        defaultProps={{
          reference: {
            src: SAMPLE_IMAGE_3,
            focusX: 0.5,
            focusY: 0.4,
            fit: "cover" as const,
          },
          backgroundColor: "#0f1115",
          accentColor: "#ef4444",
          barColor: "rgba(0, 0, 0, 0.85)",
          name: "Jane Doe",
          role: "Director of Photography",
          socialHandle: "@janedoe.films",
          nameAnimation: "slide-in-left" as const,
          roleAnimation: "fade-up" as const,
          logoSrc: SAMPLE_LOGO_MARK,
          logoAnimation: "fade-glow" as const,
          logoWidth: 120,
          bottomOffset: 140,
          exitFrames: 30,
        }}
      />

      <Composition
        id="LogoReveal"
        component={LogoReveal}
        durationInFrames={VIDEO_DURATION_FRAMES}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        schema={logoRevealSchema}
        defaultProps={{
          logoSrc: SAMPLE_LOGO_MARK,
          logoAnimation: "stamp" as const,
          logoWidth: 420,
          backgroundColor: "#0b1020",
          backgroundGradient: true,
          accentColor: "#22d3ee",
          tagline: "MICROSTOCK VISUAL STUDIO",
          taglineAnimation: "fade-up" as const,
          showAccentBar: true,
          logoStartFrame: 8,
          logoDurationFrames: 36,
          taglineStartFrame: 56,
          bokeh: true,
          particles: false,
          lightLeak: true,
          letterbox: false,
          grain: true,
          vignette: true,
        }}
      />
    </>
  );
};
