#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';

const EXIT_USAGE = 2;
const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 720;
const DEFAULT_FPS = 24;

interface Shot {
  readonly source: string;
  readonly in: number;
  readonly duration?: number;
}

interface RenderSettings {
  readonly width: number;
  readonly height: number;
  readonly fps: number;
}

interface Timeline {
  readonly shots: readonly Shot[];
  readonly render: RenderSettings;
}

function usage(): void {
  console.log('Usage: render-timeline.ts <timeline.json> <output.mp4>');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function finiteNumber(value: unknown, field: string, minimum: number, allowZero: boolean): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${field} must be a finite number`);
  }
  if (allowZero ? value < minimum : value <= minimum) {
    const comparator = allowZero ? 'at least' : 'greater than';
    throw new Error(`${field} must be ${comparator} ${minimum}`);
  }
  return value;
}

function positiveInteger(value: unknown, field: string, fallback: number): number {
  if (value === undefined) return fallback;
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    throw new Error(`${field} must be a positive integer`);
  }
  return value;
}

function parseShot(value: unknown, index: number): Shot {
  if (!isRecord(value)) throw new Error(`shots[${index}] must be an object`);

  const source = value.source;
  if (typeof source !== 'string' || source.trim() === '') {
    throw new Error(`shots[${index}].source must be a non-empty string`);
  }

  const start = value.in === undefined
    ? 0
    : finiteNumber(value.in, `shots[${index}].in`, 0, true);

  const duration = value.duration === undefined
    ? undefined
    : finiteNumber(value.duration, `shots[${index}].duration`, 0, false);

  return duration === undefined
    ? { source, in: start }
    : { source, in: start, duration };
}

function parseTimeline(value: unknown): Timeline {
  if (!isRecord(value)) throw new Error('timeline must be a JSON object');

  if (!Array.isArray(value.shots) || value.shots.length === 0) {
    throw new Error('timeline.shots must contain at least one shot');
  }

  const shots = value.shots.map(parseShot);
  const renderValue = value.render;
  if (renderValue !== undefined && !isRecord(renderValue)) {
    throw new Error('timeline.render must be an object when provided');
  }

  const renderRecord = renderValue ?? {};
  const width = positiveInteger(renderRecord.width, 'render.width', DEFAULT_WIDTH);
  const height = positiveInteger(renderRecord.height, 'render.height', DEFAULT_HEIGHT);
  const fps = renderRecord.fps === undefined
    ? DEFAULT_FPS
    : finiteNumber(renderRecord.fps, 'render.fps', 0, false);

  if (width % 2 !== 0 || height % 2 !== 0) {
    throw new Error('render.width and render.height must be even for yuv420p output');
  }
  if (fps > 240) throw new Error('render.fps must not exceed 240');

  return { shots, render: { width, height, fps } };
}

function loadTimeline(path: string): Timeline {
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(path, 'utf8')) as unknown;
  } catch (error: unknown) {
    throw new Error(`invalid timeline JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
  return parseTimeline(parsed);
}

function main(): number {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      help: { type: 'boolean', short: 'h' },
    },
    strict: true,
  });

  if (values.help) {
    usage();
    return 0;
  }
  if (positionals.length !== 2) {
    usage();
    return EXIT_USAGE;
  }

  const timelineFile = positionals[0];
  const output = positionals[1];
  if (timelineFile === undefined || output === undefined) return EXIT_USAGE;
  if (!existsSync(timelineFile)) {
    console.error(`timeline does not exist: ${timelineFile}`);
    return EXIT_USAGE;
  }

  let timeline: Timeline;
  try {
    timeline = loadTimeline(timelineFile);
  } catch (error: unknown) {
    console.error(error instanceof Error ? error.message : String(error));
    return EXIT_USAGE;
  }

  const commandArgs: string[] = ['-y', '-hide_banner', '-loglevel', 'error'];
  const filters: string[] = [];
  const labels: string[] = [];
  const baseDir = dirname(resolve(timelineFile));

  for (const [index, shot] of timeline.shots.entries()) {
    const source = isAbsolute(shot.source) ? shot.source : resolve(baseDir, shot.source);
    if (!existsSync(source)) {
      console.error(`shot source does not exist: ${source}`);
      return EXIT_USAGE;
    }

    commandArgs.push('-i', source);

    let trim = `trim=start=${shot.in}`;
    if (shot.duration !== undefined) trim += `:duration=${shot.duration}`;

    const label = `v${index}`;
    filters.push(
      `[${index}:v]${trim},setpts=PTS-STARTPTS,` +
        `scale=${timeline.render.width}:${timeline.render.height}:force_original_aspect_ratio=decrease,` +
        `pad=${timeline.render.width}:${timeline.render.height}:(ow-iw)/2:(oh-ih)/2,` +
        `setsar=1,fps=${timeline.render.fps}[${label}]`,
    );
    labels.push(`[${label}]`);
  }

  filters.push(`${labels.join('')}concat=n=${timeline.shots.length}:v=1:a=0[outv]`);
  commandArgs.push(
    '-filter_complex', filters.join(';'),
    '-map', '[outv]',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    output,
  );

  const result = spawnSync('ffmpeg', commandArgs, { stdio: 'inherit' });
  if (result.error) {
    const message = result.error.message.includes('ENOENT')
      ? 'ffmpeg is required but was not found in PATH'
      : result.error.message;
    console.error(message);
    return EXIT_USAGE;
  }
  return result.status ?? 1;
}

try {
  process.exitCode = main();
} catch (error: unknown) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = EXIT_USAGE;
}
