#!/usr/bin/env node
/**
 * scripts/build-showcase.mjs
 *
 * Build a static MP4 showcase site for Vercel deployment.
 *
 * Reads every `*.mp4` from an input directory (default: `out/`), copies them
 * into `web/dist/videos/`, probes each one for dimensions / duration via
 * ffprobe, and emits a single `web/dist/index.html` listing every clip as a
 * <video controls> card.
 *
 * If no MP4s are found the tool still emits a placeholder page so the
 * deployed site never 404s — it just shows a friendly "render something
 * first" message.
 *
 * Requires `ffprobe` on the PATH for metadata. Falls back gracefully if a
 * probe fails (the card will just omit the missing fields).
 *
 * Examples:
 *   npm run build:showcase
 *   node scripts/build-showcase.mjs --input ./out --output ./web/dist
 *   node scripts/build-showcase.mjs --title "My Stock Reels"
 */

import { execFile as _execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { parseArgs, promisify } from "node:util";

const execFile = promisify(_execFile);

const HELP = `build-showcase — build a static MP4 showcase for Vercel deployment

Usage:
  node scripts/build-showcase.mjs [options]

Options:
  -i, --input <dir>     Directory to scan for *.mp4 files. Default: out.
  -o, --output <dir>    Static site output directory. Default: web/dist.
  -t, --title <string>  Page title. Default: "Remotion Microstock — Reel showcase".
      --base-href <p>   Base href to prefix asset URLs with. Default: "" (root).
  -h, --help            Show this help.

Workflow:
  1. Render compositions with \`npx remotion render <Id>\` → MP4 lands in out/.
  2. Run this tool                                          → web/dist/ ready.
  3. Deploy: \`vercel deploy\` (Vercel serves web/dist as static — see vercel.json).
`;

const fail = (msg) => {
  process.stderr.write(`build-showcase: ${msg}\n`);
  process.exit(1);
};

const fileExists = async (p) => {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
};

const ensureDir = (p) => fs.mkdir(p, { recursive: true });

const parseCli = () => {
  let parsed;
  try {
    parsed = parseArgs({
      options: {
        input: { type: "string", short: "i", default: "out" },
        output: { type: "string", short: "o", default: "web/dist" },
        title: {
          type: "string",
          short: "t",
          default: "Remotion Microstock — Reel showcase",
        },
        "base-href": { type: "string", default: "" },
        help: { type: "boolean", short: "h", default: false },
      },
      allowPositionals: false,
    });
  } catch (err) {
    fail(`${err.message}\n\n${HELP}`);
  }
  if (parsed.values.help) {
    process.stdout.write(HELP);
    process.exit(0);
  }
  return parsed.values;
};

const probeMp4 = async (file) => {
  try {
    const { stdout } = await execFile("ffprobe", [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=width,height,r_frame_rate",
      "-show_entries",
      "format=duration,size",
      "-of",
      "json",
      file,
    ]);
    const data = JSON.parse(stdout);
    const stream = data.streams?.[0] ?? {};
    const [num, den] = (stream.r_frame_rate ?? "0/1").split("/").map(Number);
    const fps = den ? num / den : null;
    return {
      width: stream.width ?? null,
      height: stream.height ?? null,
      fps: fps && Number.isFinite(fps) ? Math.round(fps * 100) / 100 : null,
      duration: data.format?.duration ? Number(data.format.duration) : null,
      bytes: data.format?.size ? Number(data.format.size) : null,
    };
  } catch {
    return { width: null, height: null, fps: null, duration: null, bytes: null };
  }
};

const formatBytes = (n) => {
  if (!Number.isFinite(n)) return null;
  const units = ["B", "KB", "MB", "GB"];
  let v = n;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  const precision = i === 0 ? 0 : 1;
  return `${v.toFixed(precision)} ${units[i]}`;
};

const formatDuration = (sec) => {
  if (!Number.isFinite(sec)) return null;
  const total = Math.round(sec);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

const escapeHtml = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

const renderCard = ({ name, src, poster, meta }) => {
  const dims = meta.width && meta.height ? `${meta.width}×${meta.height}` : null;
  const dur = formatDuration(meta.duration);
  const fps = meta.fps ? `${meta.fps} fps` : null;
  const size = formatBytes(meta.bytes);
  const chips = [dims, fps, dur, size].filter(Boolean);

  return `      <article class="card">
        <div class="card-video">
          <video
            controls
            preload="metadata"
            playsinline${poster ? `\n            poster="${escapeHtml(poster)}"` : ""}
          >
            <source src="${escapeHtml(src)}" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div class="card-body">
          <h2 class="card-title">${escapeHtml(name)}</h2>
          ${chips.length ? `<ul class="chips">\n            ${chips.map((c) => `<li>${escapeHtml(c)}</li>`).join("\n            ")}\n          </ul>` : ""}
          <a class="download" href="${escapeHtml(src)}" download>Download MP4</a>
        </div>
      </article>`;
};

const renderEmpty = () => `      <div class="empty">
        <h2>No reels yet</h2>
        <p>Render a composition into <code>out/</code> first:</p>
        <pre><code>npx remotion render src/index.ts &lt;CompositionId&gt; out/&lt;name&gt;.mp4
npm run build:showcase
vercel deploy</code></pre>
      </div>`;

const renderHtml = ({ title, baseHref, cards, generatedAt, count }) => {
  const headBase = baseHref ? `\n    <base href="${escapeHtml(baseHref)}" />` : "";
  const body = cards.length > 0 ? cards.join("\n") : renderEmpty();
  const countLabel =
    count === 1 ? "1 reel" : `${count} reel${count === 0 ? "s" : "s"}`;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark" />
    <title>${escapeHtml(title)}</title>${headBase}
    <style>
      :root {
        color-scheme: dark;
        --bg: #0a0a0a;
        --panel: #141414;
        --panel-border: #262626;
        --text: #f5f5f5;
        --muted: #a3a3a3;
        --accent: #ff0033;
      }
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; }
      body {
        background: var(--bg);
        color: var(--text);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
          "Helvetica Neue", Arial, sans-serif;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }
      header {
        padding: 56px 32px 24px;
        max-width: 1280px;
        width: 100%;
        margin: 0 auto;
      }
      header h1 {
        margin: 0;
        font-size: 32px;
        letter-spacing: -0.01em;
      }
      header p {
        margin: 8px 0 0;
        color: var(--muted);
        font-size: 14px;
      }
      main {
        flex: 1;
        max-width: 1280px;
        width: 100%;
        margin: 0 auto;
        padding: 24px 32px 64px;
      }
      .grid {
        display: grid;
        gap: 24px;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      }
      .card {
        background: var(--panel);
        border: 1px solid var(--panel-border);
        border-radius: 12px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      .card-video {
        background: #000;
        aspect-ratio: 16 / 9;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      .card-video video {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
      }
      .card-body {
        padding: 16px 20px 20px;
      }
      .card-title {
        margin: 0 0 12px;
        font-size: 18px;
        letter-spacing: -0.01em;
      }
      .chips {
        list-style: none;
        padding: 0;
        margin: 0 0 16px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .chips li {
        font-size: 12px;
        color: var(--muted);
        background: rgba(255, 255, 255, 0.05);
        padding: 4px 10px;
        border-radius: 999px;
        border: 1px solid var(--panel-border);
        font-variant-numeric: tabular-nums;
      }
      .download {
        display: inline-block;
        font-size: 13px;
        color: var(--text);
        text-decoration: none;
        padding: 8px 14px;
        border: 1px solid var(--panel-border);
        border-radius: 8px;
        transition: border-color 120ms ease, background 120ms ease;
      }
      .download:hover {
        border-color: var(--accent);
        background: rgba(255, 0, 51, 0.08);
      }
      .empty {
        background: var(--panel);
        border: 1px solid var(--panel-border);
        border-radius: 12px;
        padding: 48px;
        text-align: center;
        color: var(--muted);
      }
      .empty h2 { margin: 0 0 12px; color: var(--text); font-size: 22px; }
      .empty pre {
        text-align: left;
        background: #0a0a0a;
        border: 1px solid var(--panel-border);
        border-radius: 8px;
        padding: 16px;
        overflow-x: auto;
        font-size: 13px;
        margin: 16px auto 0;
        max-width: 560px;
      }
      .empty code { font-family: "JetBrains Mono", Menlo, Consolas, monospace; }
      footer {
        padding: 24px 32px 40px;
        max-width: 1280px;
        width: 100%;
        margin: 0 auto;
        color: var(--muted);
        font-size: 12px;
        font-variant-numeric: tabular-nums;
      }
    </style>
  </head>
  <body>
    <header>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(countLabel)} · Generated ${escapeHtml(generatedAt)}</p>
    </header>
    <main>
      <div class="grid">
${body}
      </div>
    </main>
    <footer>
      Built with Remotion. Render with <code>npx remotion render</code>, refresh with <code>npm run build:showcase</code>.
    </footer>
  </body>
</html>
`;
};

const findMp4s = async (dir) => {
  if (!(await fileExists(dir))) return [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && /\.mp4$/i.test(e.name))
    .map((e) => path.join(dir, e.name))
    .sort();
};

const findPoster = async (mp4Path) => {
  const base = mp4Path.replace(/\.mp4$/i, "");
  for (const ext of ["jpg", "jpeg", "png", "webp"]) {
    const candidate = `${base}.${ext}`;
    if (await fileExists(candidate)) return candidate;
  }
  return null;
};

const main = async () => {
  const args = parseCli();
  const inputDir = path.resolve(args.input);
  const outputDir = path.resolve(args.output);
  const videosOutDir = path.join(outputDir, "videos");
  const baseHref = args["base-href"];

  // Reset the videos directory so deletions are reflected.
  await fs.rm(videosOutDir, { recursive: true, force: true });
  await ensureDir(videosOutDir);

  const mp4s = await findMp4s(inputDir);
  const cards = [];

  for (const src of mp4s) {
    const base = path.basename(src);
    const dest = path.join(videosOutDir, base);
    await fs.copyFile(src, dest);

    let posterDest = null;
    const poster = await findPoster(src);
    if (poster) {
      const posterBase = path.basename(poster);
      posterDest = path.join(videosOutDir, posterBase);
      await fs.copyFile(poster, posterDest);
    }

    const meta = await probeMp4(dest);
    cards.push(
      renderCard({
        name: base.replace(/\.mp4$/i, ""),
        src: `videos/${base}`,
        poster: posterDest ? `videos/${path.basename(posterDest)}` : null,
        meta,
      }),
    );
  }

  const html = renderHtml({
    title: args.title,
    baseHref,
    cards,
    generatedAt: new Date().toISOString().replace("T", " ").replace(/\..+/, "Z"),
    count: mp4s.length,
  });

  await ensureDir(outputDir);
  await fs.writeFile(path.join(outputDir, "index.html"), html, "utf8");

  // 404 fallback so misnamed paths resolve cleanly.
  const notFound = renderHtml({
    title: `${args.title} — Not found`,
    baseHref,
    cards: [],
    generatedAt: new Date().toISOString().replace("T", " ").replace(/\..+/, "Z"),
    count: 0,
  });
  await fs.writeFile(path.join(outputDir, "404.html"), notFound, "utf8");

  const rel = (p) => path.relative(process.cwd(), p) || p;
  process.stdout.write(
    [
      `build-showcase: wrote ${mp4s.length} reel${mp4s.length === 1 ? "" : "s"}`,
      `  input:  ${rel(inputDir)}`,
      `  output: ${rel(outputDir)}`,
      ...mp4s.map((m) => `    • ${rel(m)} → videos/${path.basename(m)}`),
      "",
      mp4s.length === 0
        ? `No MP4s found in ${rel(inputDir)}. The showcase deploys a placeholder page.`
        : `Deploy with: vercel deploy${args.output === "web/dist" ? "" : ` (point Vercel at ${rel(outputDir)})`}`,
      "",
    ].join("\n"),
  );
};

main().catch((err) => {
  process.stderr.write(`build-showcase: ${err.stack || err.message || err}\n`);
  process.exit(1);
});
