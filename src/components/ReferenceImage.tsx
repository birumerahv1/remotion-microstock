import React from "react";
import { Img } from "remotion";
import {
  ImageReference,
  resolveImageSrc,
  buildImageStyle,
} from "../utils/imageReference";

type ReferenceImageProps = {
  reference: ImageReference;
  style?: React.CSSProperties;
  className?: string;
};

/**
 * Renders a reference image using Remotion's `<Img>` so that the renderer
 * waits for the image to fully load before capturing the frame.
 *
 * Honours the `focusX`/`focusY`/`fit` values from the reference so the
 * subject of the image stays in the viewport across all aspect ratios.
 */
export const ReferenceImage: React.FC<ReferenceImageProps> = ({
  reference,
  style,
  className,
}) => {
  const src = resolveImageSrc(reference.src);
  const baseStyle = buildImageStyle(reference);

  return (
    <Img
      src={src}
      className={className}
      style={{ ...baseStyle, ...style }}
      pauseWhenLoading
    />
  );
};
