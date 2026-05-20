import { z } from "zod";
import { staticFile } from "remotion";

/**
 * Image reference schema for microstock compositions.
 *
 * An image reference can be supplied in three ways:
 *   1. As a public URL (https://...)
 *   2. As a staticFile path served from `public/` (e.g. "my-image.jpg")
 *   3. As a raw data URI (data:image/...;base64,...)
 *
 * The schema is shared by every composition in this project so the same
 * reference image can be reused across templates (Ken Burns, Parallax,
 * Slideshow, Product Showcase, etc.) without duplicating prop definitions.
 */
export const imageReferenceSchema = z.object({
  src: z.string().min(1, "Image source is required"),
  focusX: z.number().min(0).max(1).default(0.5),
  focusY: z.number().min(0).max(1).default(0.5),
  fit: z.enum(["cover", "contain"]).default("cover"),
  caption: z.string().optional(),
});

export type ImageReference = z.infer<typeof imageReferenceSchema>;

/**
 * Multiple image references (e.g. for a slideshow).
 */
export const imageReferenceListSchema = z.array(imageReferenceSchema).min(1);

export type ImageReferenceList = z.infer<typeof imageReferenceListSchema>;

const REMOTE_PREFIXES = ["http://", "https://", "data:", "blob:"];

/**
 * Resolve an image reference source to a URL the browser/renderer can load.
 *
 * - Remote URLs and data/blob URIs are returned as-is.
 * - Anything else is treated as a path inside the `public/` directory and
 *   wrapped with `staticFile()`.
 */
export const resolveImageSrc = (src: string): string => {
  if (REMOTE_PREFIXES.some((prefix) => src.startsWith(prefix))) {
    return src;
  }
  return staticFile(src);
};

/**
 * Build the inline CSS for an image so that the focus point is centered
 * in the frame. Useful when the source image has different proportions
 * than the target video.
 */
export const buildImageStyle = (
  ref: ImageReference,
): React.CSSProperties => ({
  width: "100%",
  height: "100%",
  objectFit: ref.fit,
  objectPosition: `${ref.focusX * 100}% ${ref.focusY * 100}%`,
});
