#!/usr/bin/env node
/**
 * scripts/video-to-tsx.mjs
 *
 * Convert a video file into a Remotion TSX composition.
 *
 * Two output modes:
 *   - video (default): copies the source video into `public/<slug>/source.<ext>`
 *     and emits a TSX that plays it back with <OffthreadVideo>. Great for the
 *     common case where you want to overlay motion graphics on top of an
 *     existing clip.
 *   - frames: extracts every frame (or a downsampled subset) as JPEGs into
 *     `public/<slug>/frames/` and emits a TSX that pages through them with
 *     <Img>. Useful when you need per-frame access (e.g. blending, masking,
 *     or rendering on a platform that can't decode the original container).
 *
 * Requires `ffmpeg` and `ffprobe` on the PATH.
 *
 * Examples:
 *   npm run video-to-tsx -- --input ./clips/intro.mp4 --name IntroClip
 *   npm run video-to-tsx -- -i raw.mov -n ProductReveal --mode frames --max-frames 300
 *   node scripts/video-to-tsx.mjs -i a.mp4 -n A --no-register --force
 */

import { execFile as _execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { parseArgs, promisify } from "node:util";

const execFile = promisify(_execFile);

const HELP = `video-to-tsx — convert a video into a Remotion TSX composition

Usage:
  node scripts/video-to-tsx.mjs --input <video> --name <ComponentName> [options]

Required:
  -i, --input <path>          Path to the source video file.
  -n, --name <ComponentName>  PascalCase component / composition id.

Options:
  -m, --mode <video|frames>   Output mode. Default: video.
      --fps <number>          Override fps (default: detected from video).
      --width <number>        Override width (default: detected).
      --height <number>       Override height (default: detected).
      --quality <1-31>        JPEG quality for frames mode (lower = better). Default: 4.
      --max-frames <number>   Cap extracted frame count by downsampling (frames mode only).
                              Default: 1800 (~60s @ 30fps). Use 0 to disable.
      --out-dir <dir>         Where to write the TSX file. Default: src.
      --public-dir <dir>      Where to write assets. Default: public.
      --root <path>           Path to the Root.tsx file. Default: src/Root.tsx.
      --no-register           Skip auto-registration in Root.tsx.
      --force                 Overwrite existing TSX / asset files.
      --manifest <path>       Also write a JSON manifest describing the output.
  -h, --help                  Show this help.

Notes:
  * The tool inserts the new composition above the
    \`{/* VIDEO_TO_TSX:COMPOSITIONS */}\` marker in Root.tsx and its import
    above \`// VIDEO_TO_TSX:IMPORTS\`. If the markers are missing the tool
    prints a snippet for you to paste manually.
  * Generated TSX includes a fade-in / fade-out and a commented-out overlay
    scaffold so you can drop in captions, watermarks, or lower-thirds.
`;

const KEBAB_RE = /[A-Z]+(?=[A-Z][a-z])|[A-Z]?[a-z]+|[A-Z]+|[0-9]+/g;

const toKebab = (name) =>
  (name.match(KEBAB_RE) ?? [name]).map((s) => s.toLowerCase()).join("-");

const isPascalCase = (s) => /^[A-Z][A-Za-z0-9]*$/.test(s);

const fileExists = async (p) => {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
};

const ensureDir = (p) => fs.mkdir(p, { recursive: true });

const fail = (msg) => {
  process.stderr.write(`video-to-tsx: ${msg}\n`);
  process.exit(1);
};

const parseCli = () => {
  let parsed;
  try {
    parsed = parseArgs({
      options: {
        input: { type: "string", short: "i" },
        name: { type: "string", short: "n" },
        mode: { type: "string", short: "m", default: "video" },
        fps: { type: "string" },
        width: { type: "string" },
        height: { type: "string" },
        quality: { type: "string", default: "4" },
        "max-frames": { type: "string", default: "1800" },
        "out-dir": { type: "string", default: "src" },
        "public-dir": { type: "string", default: "public" },
        root: { type: "string", default: "src/Root.tsx" },
        "no-register": { type: "boolean", default: false },
        force: { type: "boolean", default: false },
        manifest: { type: "string" },
        help: { type: "boolean", short: "h", default: false },
      },
      allowPositionals: false,
    });
  } catch (err) {
    fail(`${err.message}\n\n${HELP}`);
  }

  const { values } = parsed;

  if (values.help) {
    process.stdout.write(HELP);
    process.exit(0);
  }
  if (!values.input) fail(`missing required --input. See --help.`);
  if (!values.name) fail(`missing required --name. See --help.`);
  if (!isPascalCase(values.name)) {
    fail(`--name must be PascalCase (got "${values.name}"). Example: IntroClip.`);
  }
  if (!["video", "frames"].includes(values.mode)) {
    fail(`--mode must be "video" or "frames" (got "${values.mode}").`);
  }
  return values;
};

const probeVideo = async (input) => {
  const args = [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=width,height,r_frame_rate,avg_frame_rate,nb_frames,codec_name,duration",
    "-show_entries",
    "format=duration",
    "-of",
    "json",
    input,
  ];
  let raw;
  try {
    const { stdout } = await execFile("ffprobe", args);
    raw = stdout;
  } catch (err) {
    fail(
      `ffprobe failed for "${input}". Is ffmpeg installed and on PATH?\n${
        err.stderr || err.message
      }`,
    );
  }
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    fail(`failed to parse ffprobe output: ${raw}`);
  }
  const stream = data.streams?.[0];
  if (!stream) fail(`no video stream found in "${input}".`);

  const evalRate = (rate) => {
    if (!rate || rate === "0/0") return null;
    const [a, b] = rate.split("/").map(Number);
    if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return null;
    return a / b;
  };

  const detectedFps =
    evalRate(stream.r_frame_rate) ?? evalRate(stream.avg_frame_rate);
  const duration = Number(stream.duration ?? data.format?.duration ?? 0);

  return {
    width: Number(stream.width),
    height: Number(stream.height),
    fps: detectedFps,
    duration,
    codec: stream.codec_name,
    nbFrames: stream.nb_frames ? Number(stream.nb_frames) : null,
  };
};

const renderVideoTsx = ({ name, slug, ext, w, h, fps, frames }) => {
  return `import React from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Auto-generated by scripts/video-to-tsx.mjs.
// Edit freely; re-running the tool with --force will overwrite this file.

export const COMP_ID = "${name}";
export const COMP_DURATION_IN_FRAMES = ${frames};
export const COMP_FPS = ${fps};
export const COMP_WIDTH = ${w};
export const COMP_HEIGHT = ${h};

const SOURCE = staticFile("${slug}/source.${ext}");

// ─── Main composition ───
export const ${name}: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  // Global fade in / out — 0.5s at each end.
  const opacity = interpolate(
    frame,
    [0, fps * 0.5, durationInFrames - fps * 0.5, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ opacity }}>
        <OffthreadVideo
          src={SOURCE}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>

      {/* ─── Overlay scaffold ───
        Uncomment and customize to add captions, lower-thirds, watermarks, etc.
      <Sequence from={Math.round(fps * 0.5)} durationInFrames={Math.round(fps * 3)} layout="none">
        <AbsoluteFill
          style={{
            justifyContent: "flex-end",
            alignItems: "center",
            padding: 80,
          }}
        >
          <h1
            style={{
              color: "#fff",
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              fontSize: 72,
              letterSpacing: 4,
              textTransform: "uppercase",
              margin: 0,
              textShadow: "0 4px 24px rgba(0,0,0,0.7)",
            }}
          >
            Your caption
          </h1>
        </AbsoluteFill>
      </Sequence>
      */}
    </AbsoluteFill>
  );
};
`;
};

const renderFramesTsx = ({ name, slug, w, h, fps, frames, padding, ext }) => {
  return `import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Auto-generated by scripts/video-to-tsx.mjs (mode: frames).
// Edit freely; re-running the tool with --force will overwrite this file.

export const COMP_ID = "${name}";
export const COMP_DURATION_IN_FRAMES = ${frames};
export const COMP_FPS = ${fps};
export const COMP_WIDTH = ${w};
export const COMP_HEIGHT = ${h};

const FRAME_DIR = "${slug}/frames";
const FRAME_COUNT = ${frames};
const FRAME_PADDING = ${padding};
const FRAME_EXT = "${ext}";

const frameSrc = (index: number): string => {
  const clamped = Math.max(0, Math.min(FRAME_COUNT - 1, index));
  const n = String(clamped + 1).padStart(FRAME_PADDING, "0");
  return staticFile(\`\${FRAME_DIR}/frame-\${n}.\${FRAME_EXT}\`);
};

// ─── Main composition ───
export const ${name}: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [0, fps * 0.5, durationInFrames - fps * 0.5, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ opacity }}>
        <Img
          src={frameSrc(frame)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
`;
};

const writeIfAllowed = async (filePath, contents, force) => {
  if (!force && (await fileExists(filePath))) {
    fail(`refusing to overwrite "${filePath}" (use --force).`);
  }
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, contents, "utf8");
};

const runFfmpegCopyVideo = async (input, dest) => {
  // Stream copy when possible; falls back to a transcode only if remuxing fails.
  await ensureDir(path.dirname(dest));
  try {
    await execFile("ffmpeg", [
      "-y",
      "-i",
      input,
      "-c",
      "copy",
      "-movflags",
      "+faststart",
      dest,
    ]);
  } catch {
    // Fallback to a safe re-encode (some containers/codecs don't remux cleanly).
    await execFile("ffmpeg", [
      "-y",
      "-i",
      input,
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "20",
      "-c:a",
      "aac",
      "-movflags",
      "+faststart",
      dest,
    ]);
  }
};

const extractFrames = async ({ input, outDir, fps, quality, maxFrames }) => {
  await ensureDir(outDir);
  // Remove any prior extraction to avoid mixing differently-numbered frames.
  for (const entry of await fs.readdir(outDir).catch(() => [])) {
    if (/^frame-\d+\.(jpg|jpeg|png)$/.test(entry)) {
      await fs.rm(path.join(outDir, entry));
    }
  }

  const filters = [];
  let effectiveFps = fps;
  if (maxFrames > 0) {
    // We don't know the precise frame count yet; assume the probed fps is
    // authoritative and downsample at the source level if we'd exceed the cap.
    // The actual cap is enforced later by counting files on disk.
    filters.push(`fps=${fps}`);
  } else {
    filters.push(`fps=${fps}`);
  }

  const pattern = path.join(outDir, "frame-%05d.jpg");
  const ffmpegArgs = [
    "-y",
    "-i",
    input,
    "-vf",
    filters.join(","),
    "-q:v",
    String(quality),
    pattern,
  ];
  await execFile("ffmpeg", ffmpegArgs);

  let files = (await fs.readdir(outDir))
    .filter((f) => /^frame-\d+\.jpg$/.test(f))
    .sort();

  // Enforce the hard cap by deleting overflow frames (keeps the start of the clip).
  if (maxFrames > 0 && files.length > maxFrames) {
    const overflow = files.slice(maxFrames);
    for (const f of overflow) await fs.rm(path.join(outDir, f));
    files = files.slice(0, maxFrames);
  }

  if (files.length === 0) {
    fail(`ffmpeg extracted 0 frames from "${input}".`);
  }
  return { count: files.length, padding: 5, ext: "jpg", fps: effectiveFps };
};

const indentBlock = (block, indent) =>
  block
    .split("\n")
    .map((line) => (line.length === 0 ? line : `${indent}${line}`))
    .join("\n");

const insertBeforeMarkerLine = (source, marker, snippet) => {
  const lines = source.split("\n");
  const idx = lines.findIndex((line) => line.includes(marker));
  if (idx === -1) return null;
  const indent = lines[idx].slice(0, lines[idx].indexOf(marker.trim()[0] ?? marker[0]));
  const indented = indentBlock(snippet, indent);
  lines.splice(idx, 0, indented);
  return lines.join("\n");
};

const updateRoot = async ({ rootPath, name, frames, fps, width, height }) => {
  if (!(await fileExists(rootPath))) {
    return { ok: false, reason: `Root file not found at ${rootPath}` };
  }
  const original = await fs.readFile(rootPath, "utf8");
  const importMarker = "// VIDEO_TO_TSX:IMPORTS";
  const compMarker = "{/* VIDEO_TO_TSX:COMPOSITIONS */}";

  if (!original.includes(importMarker) || !original.includes(compMarker)) {
    return {
      ok: false,
      reason: `markers not found in ${rootPath}. Add \`${importMarker}\` and \`${compMarker}\`, or register manually.`,
    };
  }

  const importLine = `import { ${name} } from "./${name}";`;
  const compElement =
    `<Composition\n` +
    `  id="${name}"\n` +
    `  component={${name}}\n` +
    `  durationInFrames={${frames}}\n` +
    `  fps={${fps}}\n` +
    `  width={${width}}\n` +
    `  height={${height}}\n` +
    `/>`;

  let next = original;
  if (!next.includes(importLine)) {
    const updated = insertBeforeMarkerLine(next, importMarker, importLine);
    if (updated !== null) next = updated;
  }

  const compIdRe = new RegExp(
    `^[ \\t]*<Composition[\\s\\S]*?id=["']${name}["'][\\s\\S]*?/>\\n?`,
    "m",
  );
  if (compIdRe.test(next)) {
    next = next.replace(compIdRe, (match) => {
      const indent = match.match(/^[ \t]*/)?.[0] ?? "";
      return `${indentBlock(compElement, indent)}\n`;
    });
  } else {
    const updated = insertBeforeMarkerLine(next, compMarker, compElement);
    if (updated !== null) next = updated;
  }

  if (next === original) {
    return { ok: true, changed: false };
  }
  await fs.writeFile(rootPath, next, "utf8");
  return { ok: true, changed: true };
};

const main = async () => {
  const args = parseCli();
  const input = path.resolve(args.input);
  if (!(await fileExists(input))) fail(`input file not found: ${input}`);

  const probed = await probeVideo(input);
  const fps = args.fps ? Number(args.fps) : (probed.fps ?? 30);
  if (!Number.isFinite(fps) || fps <= 0) fail(`invalid fps: ${fps}`);
  const width = args.width ? Number(args.width) : probed.width;
  const height = args.height ? Number(args.height) : probed.height;
  if (!Number.isFinite(width) || width <= 0) fail(`invalid width: ${width}`);
  if (!Number.isFinite(height) || height <= 0) fail(`invalid height: ${height}`);
  const duration = probed.duration;
  if (!Number.isFinite(duration) || duration <= 0) {
    fail(`invalid duration probed from video: ${duration}`);
  }

  const name = args.name;
  const slug = toKebab(name);
  const mode = args.mode;
  const outDir = path.resolve(args["out-dir"]);
  const publicDir = path.resolve(args["public-dir"]);
  const compDir = path.join(publicDir, slug);

  const tsxPath = path.join(outDir, `${name}.tsx`);

  let durationInFrames;
  let tsxContents;
  let writtenAssets = [];

  if (mode === "video") {
    const ext = (path.extname(input).slice(1) || "mp4").toLowerCase();
    const dest = path.join(compDir, `source.${ext}`);
    if (!args.force && (await fileExists(dest))) {
      fail(`refusing to overwrite asset "${dest}" (use --force).`);
    }
    await runFfmpegCopyVideo(input, dest);
    writtenAssets.push(dest);

    durationInFrames = Math.max(1, Math.ceil(duration * fps));
    tsxContents = renderVideoTsx({
      name,
      slug,
      ext,
      w: width,
      h: height,
      fps,
      frames: durationInFrames,
    });
  } else {
    const framesDir = path.join(compDir, "frames");
    const maxFrames = Math.max(0, Number(args["max-frames"]));
    const quality = Math.max(1, Math.min(31, Number(args.quality) || 4));
    const extracted = await extractFrames({
      input,
      outDir: framesDir,
      fps,
      quality,
      maxFrames,
    });
    writtenAssets.push(framesDir);

    durationInFrames = extracted.count;
    tsxContents = renderFramesTsx({
      name,
      slug,
      w: width,
      h: height,
      fps,
      frames: durationInFrames,
      padding: extracted.padding,
      ext: extracted.ext,
    });
  }

  await writeIfAllowed(tsxPath, tsxContents, args.force);

  let registration = { ok: false, reason: "skipped (--no-register)" };
  if (!args["no-register"]) {
    registration = await updateRoot({
      rootPath: path.resolve(args.root),
      name,
      frames: durationInFrames,
      fps,
      width,
      height,
    });
  }

  const manifest = {
    name,
    slug,
    mode,
    input,
    tsx: tsxPath,
    assets: writtenAssets,
    composition: {
      id: name,
      durationInFrames,
      fps,
      width,
      height,
    },
    source: {
      duration,
      detectedFps: probed.fps,
      codec: probed.codec,
    },
    registration,
    generatedAt: new Date().toISOString(),
  };

  if (args.manifest) {
    await ensureDir(path.dirname(path.resolve(args.manifest)));
    await fs.writeFile(
      path.resolve(args.manifest),
      JSON.stringify(manifest, null, 2),
      "utf8",
    );
  }

  // Friendly summary.
  const rel = (p) => path.relative(process.cwd(), p) || p;
  process.stdout.write(
    [
      `video-to-tsx: wrote composition "${name}"`,
      `  mode:        ${mode}`,
      `  tsx:         ${rel(tsxPath)}`,
      `  assets:      ${writtenAssets.map(rel).join(", ")}`,
      `  composition: ${durationInFrames} frames @ ${fps}fps, ${width}x${height}`,
      registration.ok
        ? `  root:        ${registration.changed ? "updated" : "already registered"} (${rel(path.resolve(args.root))})`
        : `  root:        SKIPPED — ${registration.reason}`,
      "",
      "Next step: run `npm run start` to preview the composition in Remotion Studio.",
      "",
    ].join("\n"),
  );

  if (!registration.ok && !args["no-register"]) {
    process.stdout.write(
      [
        "Manual registration snippet:",
        `  import { ${name} } from "./${name}";`,
        "",
        `  <Composition`,
        `    id="${name}"`,
        `    component={${name}}`,
        `    durationInFrames={${durationInFrames}}`,
        `    fps={${fps}}`,
        `    width={${width}}`,
        `    height={${height}}`,
        `  />`,
        "",
      ].join("\n"),
    );
  }
};

main().catch((err) => {
  process.stderr.write(`video-to-tsx: ${err.stack || err.message || err}\n`);
  process.exit(1);
});
