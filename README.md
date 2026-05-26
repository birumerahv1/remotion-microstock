# remotion-microstock

Programmatic video generation for microstock marketplaces, built on
[Remotion](https://www.remotion.dev/). Includes a CLI tool that converts
any video file into a Remotion TSX composition so you can re-render,
overlay, and remix existing clips inside the same React-based pipeline
as your generated stock.

## Requirements

- Node.js 20+
- `ffmpeg` and `ffprobe` on the `PATH` (used by the `video-to-tsx` tool)

## Setup

```bash
npm install
npm run start      # open Remotion Studio
npm run tsc        # typecheck
```

## `video-to-tsx` — convert a video to a Remotion TSX composition

The `video-to-tsx` script reads any video file, extracts its metadata
(`duration`, `fps`, `width`, `height`) via `ffprobe`, and emits a
ready-to-render Remotion composition. It also auto-registers the new
composition in [`src/Root.tsx`](./src/Root.tsx).

Two output modes:

| Mode      | Output asset                                  | Generated component uses |
|-----------|-----------------------------------------------|--------------------------|
| `video`   | `public/<slug>/source.<ext>` (remuxed copy)   | `<OffthreadVideo>`       |
| `frames`  | `public/<slug>/frames/frame-NNNNN.jpg` series | `<Img>` per frame        |

Use `video` mode when you want to keep the original clip and layer
motion graphics on top. Use `frames` mode when you need per-frame
control (e.g. masking, blending, frame-by-frame retiming) or when the
target render environment can't decode the source container.

### Usage

```bash
# video mode (default) — copies the clip into public/ and renders it with OffthreadVideo
npm run video-to-tsx -- --input ./clips/intro.mp4 --name IntroClip

# frames mode — extracts every frame as JPEG, caps the count to 300
npm run video-to-tsx -- -i ./clips/intro.mp4 -n IntroClip --mode frames --max-frames 300

# show all flags
npm run video-to-tsx -- --help
```

### Flags

| Flag                          | Default        | Description                                                                 |
|-------------------------------|----------------|-----------------------------------------------------------------------------|
| `-i, --input <path>`          | _required_     | Source video file.                                                          |
| `-n, --name <ComponentName>`  | _required_     | PascalCase component / composition id.                                      |
| `-m, --mode <video\|frames>`  | `video`        | Output mode.                                                                |
| `--fps <number>`              | detected       | Override fps.                                                               |
| `--width <number>`            | detected       | Override width.                                                             |
| `--height <number>`           | detected       | Override height.                                                            |
| `--quality <1-31>`            | `4`            | JPEG quality for `frames` mode (lower = better).                            |
| `--max-frames <number>`       | `1800`         | Cap extracted frame count. Set to `0` to disable.                           |
| `--out-dir <dir>`             | `src`          | Where the TSX file is written.                                              |
| `--public-dir <dir>`          | `public`       | Where assets (video copy / frames) are written.                             |
| `--root <path>`               | `src/Root.tsx` | Path to the Root file to auto-register into.                                |
| `--no-register`               | off            | Skip auto-registration in `Root.tsx`.                                       |
| `--force`                     | off            | Overwrite existing TSX file or asset directory.                             |
| `--manifest <path>`           | _none_         | Also write a JSON manifest describing the output.                           |
| `-h, --help`                  | —              | Show help.                                                                  |

### Auto-registration

`Root.tsx` contains two markers:

```tsx
// VIDEO_TO_TSX:IMPORTS              // imports inserted above this line
{/* VIDEO_TO_TSX:COMPOSITIONS */}    // <Composition> elements inserted above this marker
```

Keep them in place. Running the tool again with the same `--name` will
update the existing `<Composition>` entry rather than duplicate it
(idempotent). Use `--no-register` to opt out of automatic edits.

If the markers are missing the tool prints a manual snippet to paste.

### Generated composition

The TSX file follows the conventions used throughout this repo:

- `React.FC` component
- `useCurrentFrame()` + `useVideoConfig()` hooks
- A 0.5s `interpolate`-driven fade in / out
- An `AbsoluteFill` root with a black backdrop
- A commented-out `<Sequence>` block scaffolding a caption overlay so
  you can drop in lower-thirds, watermarks, or motion graphics without
  reaching for the docs

Edit the file freely — re-running the tool with `--force` is the only
thing that will overwrite it.

### Asset hygiene

Asset directories under `public/<slug>/` are gitignored by default (see
[`.gitignore`](./.gitignore)). If you want a specific composition's
assets committed, add an explicit negation rule.

### Examples

```bash
# 1080p clip → composition with OffthreadVideo
npm run video-to-tsx -- -i ./raw/product-shot.mov -n ProductShot

# extract every frame, downsample to 24fps, cap at 480 frames (20s)
npm run video-to-tsx -- -i ./raw/loop.mp4 -n LoopFrames --mode frames --fps 24 --max-frames 480

# regenerate an existing composition after the source video changed
npm run video-to-tsx -- -i ./raw/loop.mp4 -n LoopFrames --mode frames --force

# generate without touching Root.tsx (e.g. for previewing in isolation)
npm run video-to-tsx -- -i ./raw/loop.mp4 -n LoopFrames --no-register

# also emit a JSON manifest for downstream tooling
npm run video-to-tsx -- -i ./raw/loop.mp4 -n LoopFrames --manifest ./out/loop-frames.json
```

## `build:showcase` — static MP4 gallery for Vercel

After you've rendered compositions to `out/`, run the `build:showcase`
script to bundle them into a static dark-themed gallery page at
`web/dist/index.html`. The site is plain HTML/CSS — no framework, no
runtime — so it deploys to Vercel (or any static host) instantly.

### Workflow

```bash
# 1. Render whatever compositions you want into out/
npx remotion render src/index.ts MyClip out/MyClip.mp4
npx remotion render src/index.ts AnotherClip out/AnotherClip.mp4

# 2. Build the static showcase (reads out/, writes web/dist/)
npm run build:showcase

# 3. Deploy
npm run deploy            # invokes `vercel deploy` (see vercel.json)
# or, for production:
vercel deploy --prod
```

The build step copies every `*.mp4` from `out/` into
`web/dist/videos/`, probes each one for dimensions / fps / duration /
file size via `ffprobe`, and renders a responsive card grid. If a
sibling poster image (`<name>.jpg|.jpeg|.png|.webp`) exists next to an
MP4 it's used as the `<video poster>`.

If `out/` is empty the showcase still builds — it just shows a friendly
placeholder explaining how to render the first reel.

### Flags

| Flag                     | Default                                 | Description                          |
|--------------------------|-----------------------------------------|--------------------------------------|
| `-i, --input <dir>`      | `out`                                   | Directory to scan for `*.mp4`.       |
| `-o, --output <dir>`     | `web/dist`                              | Static site output directory.        |
| `-t, --title <string>`   | `Remotion Microstock — Reel showcase`   | Page `<h1>` + `<title>`.             |
| `--base-href <p>`        | `""`                                    | Prefix asset URLs with a `<base href>`. Useful when hosting under a subpath. |

### Vercel configuration

[`vercel.json`](./vercel.json) declares the project as a pure static
site (no framework, no build command on the Vercel side) and points the
`outputDirectory` at `web/dist`. It also sets long-cache headers on
`/videos/*` and `no-cache` on `*.html` so updates appear immediately.

Vercel will not render compositions for you — rendering needs ffmpeg
and a headless Chromium. Run `npm run build:showcase` locally first,
then `vercel deploy`; the CLI uploads the prebuilt `web/dist/` content.

If you want auto-deploy on every push, link the GitHub repo in Vercel
and point its **Root Directory** at the repo root with the same
`outputDirectory: web/dist` — but you'll still need to commit the
`web/dist/` artifacts (or render them in CI with a separate workflow)
since the default Vercel build environment can't run Remotion.
