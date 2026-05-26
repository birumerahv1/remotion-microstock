#!/usr/bin/env tsx
/**
 * CLI: render a single composition.
 *
 * Usage:
 *   npm run render -- <CompositionId> [--props='{"palette":"ocean"}'] [--out=path.mp4]
 *                       [--concurrency=4] [--quality=high|medium|low]
 *                       [--start=0 --end=60]
 *
 * Examples:
 *   npm run render -- AbstractGradient
 *   npm run render -- TypographyKinetic --props='{"lines":["HELLO","WORLD"]}'
 *   npm run render -- DataViz --out=out/dataviz-hd.mp4 --concurrency=8
 */
import path from 'node:path';
import fs from 'node:fs';
import { bundle } from '@remotion/bundler';
import {
  renderMedia,
  selectComposition,
  type ChromiumOptions,
} from '@remotion/renderer';

type CliArgs = {
  compositionId: string;
  props: Record<string, unknown>;
  out: string | null;
  concurrency: number | null;
  quality: 'high' | 'medium' | 'low';
  start: number | null;
  end: number | null;
};

const parseArgs = (argv: string[]): CliArgs => {
  const positional = argv.filter((a) => !a.startsWith('--'));
  const compositionId = positional[0];
  if (!compositionId) {
    throw new Error(
      'Composition id is required.\n' +
        'Usage: npm run render -- <CompositionId> [--props=...] [--out=...]',
    );
  }

  const flags = new Map<string, string>();
  for (const arg of argv) {
    if (!arg.startsWith('--')) continue;
    const eq = arg.indexOf('=');
    if (eq === -1) flags.set(arg.slice(2), 'true');
    else flags.set(arg.slice(2, eq), arg.slice(eq + 1));
  }

  const propsRaw = flags.get('props');
  let props: Record<string, unknown> = {};
  if (propsRaw) {
    try {
      const parsed: unknown = JSON.parse(propsRaw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        props = parsed as Record<string, unknown>;
      } else {
        throw new Error('Parsed --props is not a JSON object');
      }
    } catch (err) {
      throw new Error(`Failed to parse --props JSON: ${(err as Error).message}`);
    }
  }

  const concurrencyRaw = flags.get('concurrency');
  const concurrency = concurrencyRaw ? Number.parseInt(concurrencyRaw, 10) : null;

  const qualityRaw = (flags.get('quality') ?? 'high') as CliArgs['quality'];
  const quality: CliArgs['quality'] = ['high', 'medium', 'low'].includes(qualityRaw)
    ? qualityRaw
    : 'high';

  const startRaw = flags.get('start');
  const endRaw = flags.get('end');

  return {
    compositionId,
    props,
    out: flags.get('out') ?? null,
    concurrency,
    quality,
    start: startRaw ? Number.parseInt(startRaw, 10) : null,
    end: endRaw ? Number.parseInt(endRaw, 10) : null,
  };
};

const qualitySettings = {
  high: { crf: 16, jpegQuality: 95 },
  medium: { crf: 22, jpegQuality: 85 },
  low: { crf: 28, jpegQuality: 75 },
} as const;

export const renderComposition = async (args: CliArgs): Promise<string> => {
  const repoRoot = path.resolve(process.cwd());
  const entry = path.join(repoRoot, 'src', 'index.ts');
  const outDir = path.join(repoRoot, 'out');
  fs.mkdirSync(outDir, { recursive: true });

  const outPath =
    args.out ?? path.join(outDir, `${args.compositionId}-${Date.now()}.mp4`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  console.log(`[render] Bundling project from ${entry}`);
  const bundleLocation = await bundle({
    entryPoint: entry,
    webpackOverride: (cfg) => cfg,
  });

  console.log(`[render] Selecting composition: ${args.compositionId}`);
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: args.compositionId,
    inputProps: args.props,
  });

  const q = qualitySettings[args.quality];
  const chromiumOptions: ChromiumOptions = {
    gl: 'angle',
    headless: true,
  };

  const frameRange: [number, number] | null =
    args.start !== null && args.end !== null ? [args.start, args.end] : null;

  console.log(
    `[render] Writing to ${outPath} (quality=${args.quality}, ` +
      `concurrency=${args.concurrency ?? 'auto'}` +
      (frameRange ? `, frames=${frameRange[0]}-${frameRange[1]}` : '') +
      ')',
  );

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation: outPath,
    inputProps: args.props,
    crf: q.crf,
    jpegQuality: q.jpegQuality,
    pixelFormat: 'yuv420p',
    concurrency: args.concurrency,
    chromiumOptions,
    frameRange: frameRange ?? undefined,
    onProgress: ({ progress }) => {
      const pct = Math.round(progress * 100);
      process.stdout.write(`\r[render] progress: ${pct}%   `);
    },
  });

  process.stdout.write('\n');
  console.log(`[render] Done: ${outPath}`);
  return outPath;
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  await renderComposition(args);
};

main().catch((err) => {
  console.error('[render] Failed:', err);
  process.exit(1);
});
