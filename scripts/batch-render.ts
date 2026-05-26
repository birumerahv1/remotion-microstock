#!/usr/bin/env tsx
/**
 * Batch render multiple variants defined in a JSON config file.
 *
 * Usage:
 *   npm run batch -- variants/example.json
 *
 * Config format (see variants/example.json):
 * {
 *   "outDir": "out/batch",
 *   "concurrency": 4,
 *   "quality": "high",
 *   "jobs": [
 *     { "composition": "AbstractGradient", "name": "sunset-01", "props": { "palette": "sunset", "seed": 1 } },
 *     ...
 *   ]
 * }
 */
import path from 'node:path';
import fs from 'node:fs';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';

type Quality = 'high' | 'medium' | 'low';

type BatchJob = {
  composition: string;
  name: string;
  props?: Record<string, unknown>;
};

type BatchConfig = {
  outDir?: string;
  concurrency?: number | null;
  quality?: Quality;
  jobs: BatchJob[];
};

const qualitySettings: Record<Quality, { crf: number; jpegQuality: number }> = {
  high: { crf: 16, jpegQuality: 95 },
  medium: { crf: 22, jpegQuality: 85 },
  low: { crf: 28, jpegQuality: 75 },
};

const main = async () => {
  const configPath = process.argv[2];
  if (!configPath) {
    console.error('Usage: npm run batch -- <config.json>');
    process.exit(1);
  }

  const repoRoot = path.resolve(process.cwd());
  const absConfigPath = path.resolve(repoRoot, configPath);
  if (!fs.existsSync(absConfigPath)) {
    console.error(`Batch config not found: ${absConfigPath}`);
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(absConfigPath, 'utf8')) as BatchConfig;
  if (!Array.isArray(config.jobs) || config.jobs.length === 0) {
    console.error('Batch config has no jobs.');
    process.exit(1);
  }

  const outDir = path.resolve(repoRoot, config.outDir ?? 'out/batch');
  fs.mkdirSync(outDir, { recursive: true });

  const quality: Quality = config.quality ?? 'high';
  const q = qualitySettings[quality];
  const concurrency = config.concurrency ?? null;

  const entry = path.join(repoRoot, 'src', 'index.ts');
  console.log(`[batch] Bundling project once from ${entry}`);
  const bundleLocation = await bundle({ entryPoint: entry, webpackOverride: (c) => c });

  const summary: Array<{ name: string; status: 'ok' | 'fail'; output?: string; error?: string }> = [];

  for (let i = 0; i < config.jobs.length; i++) {
    const job = config.jobs[i]!;
    const outPath = path.join(outDir, `${job.name}.mp4`);
    console.log(
      `\n[batch] (${i + 1}/${config.jobs.length}) ${job.composition} → ${job.name}`,
    );
    try {
      const composition = await selectComposition({
        serveUrl: bundleLocation,
        id: job.composition,
        inputProps: job.props ?? {},
      });
      await renderMedia({
        composition,
        serveUrl: bundleLocation,
        codec: 'h264',
        outputLocation: outPath,
        inputProps: job.props ?? {},
        crf: q.crf,
        jpegQuality: q.jpegQuality,
        pixelFormat: 'yuv420p',
        concurrency,
        chromiumOptions: { gl: 'angle', headless: true },
        onProgress: ({ progress }) => {
          const pct = Math.round(progress * 100);
          process.stdout.write(`\r[batch]   progress: ${pct}%   `);
        },
      });
      process.stdout.write('\n');
      summary.push({ name: job.name, status: 'ok', output: outPath });
    } catch (err) {
      console.error(`[batch] Job ${job.name} failed:`, (err as Error).message);
      summary.push({ name: job.name, status: 'fail', error: (err as Error).message });
    }
  }

  const okCount = summary.filter((s) => s.status === 'ok').length;
  console.log(`\n[batch] Done. ${okCount}/${summary.length} succeeded.`);
  const summaryPath = path.join(outDir, '_summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`[batch] Summary: ${summaryPath}`);
  if (okCount < summary.length) process.exit(1);
};

main().catch((err) => {
  console.error('[batch] Fatal:', err);
  process.exit(1);
});
