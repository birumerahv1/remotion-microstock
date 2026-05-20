---
name: testing-remotion-microstock
description: Test the Remotion microstock compositions and the shared Image Reference feature end-to-end. Use when verifying changes to compositions, the ReferenceImage component, imageReferenceSchema, or any rendering output.
---

# Testing Remotion Microstock

Project: https://github.com/birumerahv1/remotion-microstock

Default output spec: 1920x1080 @ 30 fps, 10 s, MP4 H.264 yuv420p.
Five compositions registered in `src/Root.tsx`: `KenBurns`, `Parallax`, `ImageReveal`, `Slideshow`, `ProductShowcase`. All share `imageReferenceSchema` and render via `<ReferenceImage>` (`src/components/ReferenceImage.tsx`), so testing any one of them covers the shared image-reference contract.

## Devin secrets needed

None for local testing. Microstock-agency uploads (Shutterstock, Adobe Stock, Pond5) require real accounts and are out of scope.

## Setup

```bash
npm install
npm run typecheck   # tsc --noEmit, must be clean
```

If Remotion Studio reports "Maximum update depth exceeded" inside `@remotion/player`'s `SplitterHandle.js` when toggling the Props panel, the React version is likely out of sync with Remotion. Pin React to a Remotion-compatible version:

```bash
npm install --save-exact react@18.3.1 react-dom@18.3.1
npm install --save-exact --save-dev @types/react@18.3.12 @types/react-dom@18.3.1
```

Remotion 4.0.x targets React 18.x. Newer React majors might be broken; pin and retest before assuming the bug is in app code.

## Running

- **Studio** (interactive): `npm start` → http://localhost:3000
- **CLI render**: `npx remotion render <CompositionId> <out.mp4> --props='<json>'`
- **Render all** (smoke): `npm run render-all` if defined, otherwise loop over IDs.

## Image reference contract

`reference` prop on every composition: `{ src, focusX (0-1), focusY (0-1), fit ("cover"|"contain"), caption? }`.

- `src` can be a `public/` path (resolved via `staticFile()`), an `http(s)://` URL, a `data:` URI, or a `blob:` URI. See `resolveImageSrc` in `src/utils/imageReference.ts`.
- `focusX/focusY` map to CSS `object-position: ${focusX*100}% ${focusY*100}%`. They only have a visible effect when the image is being cropped — i.e. when image aspect != canvas aspect under `fit: "cover"`. The bundled sample SVGs are all 1920x1080 and will NOT shift with focusX/focusY on the default 1920x1080 canvas.

## Adversarial testing tips

1. **src swap** — swap `src` between two visually distinct sample images and verify the preview changes. If a broken `<ReferenceImage>` ignored the prop, the preview would not change.
2. **focus shift** — use a wide test image (e.g. 3840x1080 with distinct LEFT / MID / RIGHT markers) so cover-fit cropping is visible. Set `focusX=0` then `focusX=1` and verify the visible slice shifts. Without a wider-than-canvas image the test is degenerate. Drop the file in `public/sample-images/` and delete after testing.
3. **CLI propagation** — render via `npx remotion render <id> out.mp4 --props='...'` and extract a frame with `ffmpeg -ss 00:00:01 -i out.mp4 -frames:v 1 frame.png`. Inspect the frame to confirm the reference was honored. Use `t≥1s` because title overlays fade in over the first 20 frames in several compositions (see `KenBurns.tsx:52-56`).

## Studio gotchas

- Editing props in the **Schema** view: number inputs are scrub-draggable buttons, not direct text inputs. For exact values, switch to the **JSON** tab on the Props panel and edit the raw JSON.
- Studio can auto-write your JSON edits back to `defaultProps` in `src/Root.tsx` ("Save default props" feature). Run `git status` after testing and revert with `git checkout -- src/Root.tsx` if you don't want those changes committed.
- The "Can't save default props: Could not find or extract defaultProps for composition X" warning is non-blocking — Zod schema defaults still apply at render time.

## Verifying a render

```bash
file out/test.mp4               # MP4 container
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,pix_fmt out/test.mp4
# Expect: width=1920, height=1080, r_frame_rate=30/1, pix_fmt=yuv420p
ffmpeg -y -ss 00:00:01 -i out/test.mp4 -frames:v 1 out/frame.png
# Visually inspect frame.png against the --props you passed.
```

## Lint / typecheck / build

```bash
npm run typecheck   # tsc --noEmit
```

There is no separate lint script in the current scaffold.
