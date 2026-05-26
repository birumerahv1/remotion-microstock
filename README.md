# remotion-microstock

Programmatic Remotion video generation platform built for microstock workflows. Compose complex
animations with React + TypeScript, render variants in batch from JSON, and ship everything
through a single Docker image.

## Features

- **5 production-ready compositions** — abstract gradients, kinetic typography, geometric loops,
  product showcases, animated data viz. Each one is driven by typed `zod` schemas.
- **Props-driven**: every composition takes typed `inputProps`, so a single template produces
  unlimited variants (different palettes, copy, seeds, datasets…).
- **Batch renderer**: render dozens of variants from a JSON config in one shot.
- **Headless Docker**: multi-stage image with Chromium, FFmpeg and fonts pre-installed for
  reproducible renders on any host or CI runner.
- **Studio mode**: hot-reloading Remotion Studio for previewing compositions locally.

## Project layout

```
src/
  Root.tsx                  Composition registry
  index.ts                  Remotion entrypoint
  compositions/
    AbstractGradient/       Animated gradient blobs + noise
    TypographyKinetic/      Kinetic typography w/ spring stagger
    GeometricLoop/          Looping geometric ring patterns
    ProductShowcase/        Product reveal w/ camera + sweep
    DataViz/                Animated bar race
  lib/                      math, color, easing, deterministic RNG
scripts/
  render.ts                 CLI: render a single composition
  batch-render.ts           CLI: render many variants from JSON
variants/
  example.json              Example batch config
remotion.config.ts          Encoder settings (H.264, CRF, ANGLE)
Dockerfile                  Headless render image
docker-compose.yml          `render` + `studio` services
```

## Requirements

- Node.js 20+
- For local rendering: a recent Chromium / Chrome will be downloaded by Remotion on first run.
- For Docker rendering: Docker 24+ with at least 2 GB shared memory.

## How to run

Pick whichever path matches your environment — full details in [docs/RUNNING.md](docs/RUNNING.md):

1. **Local Node.js** (recommended for development) — `npm install && npm run studio`.
2. **GitHub Actions** (no install at all) — open the **Actions** tab, run the **Render**
   workflow, download the MP4 as an artifact.
3. **GitHub Codespaces** — open the repo in a cloud VS Code; deps are pre-installed via
   `.devcontainer/`.
4. **Docker / Compose** — see the [Docker](#docker) section below.
5. **Remotion Lambda** — for serverless / production-scale rendering.

## Install

```bash
npm install
```

## Local development

Launch the Remotion Studio (hot-reloading preview at http://localhost:3000):

```bash
npm run studio
```

List all registered compositions:

```bash
npm run list
```

## Render a single composition

```bash
npm run render -- AbstractGradient
npm run render -- TypographyKinetic --props='{"lines":["HELLO","WORLD"],"palette":"cyber"}'
npm run render -- DataViz --out=out/dataviz-hd.mp4 --quality=high --concurrency=8
npm run render -- GeometricLoop --start=0 --end=60     # smoke-test first 2s
```

Flags:

| Flag             | Description                                                                         |
| ---------------- | ----------------------------------------------------------------------------------- |
| `--props=<json>` | Inline JSON object passed to the composition as `inputProps`.                       |
| `--out=<path>`   | Output file path. Defaults to `out/<CompositionId>-<timestamp>.mp4`.                |
| `--quality=...`  | `high` (CRF 16), `medium` (CRF 22), or `low` (CRF 28). Defaults to `high`.          |
| `--concurrency=N`| Parallel render workers. Defaults to Remotion's auto.                               |
| `--start=N`      | First frame to render (inclusive). Pair with `--end` for partial renders.           |
| `--end=N`        | Last frame to render (inclusive).                                                   |

## Batch render

```bash
npm run batch -- variants/example.json
```

`variants/example.json` defines a list of jobs:

```json
{
  "outDir": "out/batch",
  "concurrency": null,
  "quality": "high",
  "jobs": [
    { "composition": "AbstractGradient", "name": "gradient-sunset-01",
      "props": { "palette": "sunset", "seed": 1 } },
    { "composition": "TypographyKinetic", "name": "type-create",
      "props": { "lines": ["CREATE","EVERY","SECOND"] } }
  ]
}
```

A summary (`out/batch/_summary.json`) lists every job's status. The script exits non-zero if any
job failed, so it plays well with CI.

## Docker

Build the image and render the default composition:

```bash
docker compose build
docker compose run --rm render
```

Render a specific composition with custom props:

```bash
docker compose run --rm render npm run render -- TypographyKinetic \
  --props='{"lines":["DESIGN","IN","MOTION"],"palette":"mono"}'
```

Run a batch:

```bash
docker compose run --rm render npm run batch -- variants/example.json
```

Output MP4s land in `./out/` on the host (mounted into the container).

Launch the Studio inside Docker (preview at http://localhost:3000):

```bash
docker compose up studio
```

## Adding a composition

1. Create `src/compositions/MyComposition/MyComposition.tsx`.
2. Export a `zod` schema, a `defaultProps` object, and the React component.
3. Register it in `src/Root.tsx` with the desired duration / fps / dimensions.
4. The new id is immediately available to `npm run render`, the batch script, and Docker.

## Conventions

- Compositions are **pure functions of frame + props** — no side effects, no network calls.
- All randomness goes through `src/lib/random.ts` (`createRng(seed)`) so renders are
  reproducible byte-for-byte.
- All colors come from `src/lib/color.ts` palettes — easy to add new ones once, use everywhere.

## Scripts

| Script              | What it does                                |
| ------------------- | ------------------------------------------- |
| `npm run studio`    | Remotion Studio (preview UI)                |
| `npm run render`    | Render a single composition                 |
| `npm run batch`     | Render many variants from JSON              |
| `npm run list`      | Print all registered compositions           |
| `npm run build`     | Bundle the project (`./build`)              |
| `npm run typecheck` | TypeScript strict typecheck                 |
| `npm run lint`      | ESLint over `src/` and `scripts/`           |
| `npm run format`    | Prettier write                              |

## License

MIT
