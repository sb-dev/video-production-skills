#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';

const EXIT_USAGE = 2;
/** ffmpeg or ffprobe failed at runtime — distinct from misuse. */
const EXIT_RUNTIME = 3;
const DEFAULT_COUNT = 6;
const MAX_COUNT = 100;
// A review pack is dense by construction; the cap only exists to stop a whole
// clip being written out one frame at a time by accident.
const MAX_PACK_FRAMES = 400;

/** A runtime failure of the tooling, not of the invocation. */
class RuntimeFailure extends Error {}

function usage(): void {
  console.log(
    'Usage: sample-frames.ts <input> <output-dir> [--count N | --every N]\n' +
      'Exit codes: 0 ok, 2 usage error, 3 runtime failure (ffmpeg/ffprobe)',
  );
}

/**
 * Sample every Nth frame in one pass.
 *
 * `--count` spreads a handful of frames across the clip, which answers staging
 * questions and nothing else. A temporal artifact is only visible in a pack
 * dense enough to sit under half its period; sampling at or above the period
 * aliases straight past it.
 */
function samplePack(input: string, outputDir: string, every: number): readonly string[] {
  const result = spawnSync(
    'ffmpeg',
    [
      '-y', '-hide_banner', '-loglevel', 'error',
      '-i', input,
      '-vf', `select='not(mod(n\\,${String(every)}))'`,
      '-vsync', '0', '-q:v', '2',
      join(outputDir, 'frame-%03d.jpg'),
    ],
    { stdio: 'inherit' },
  );

  if (result.error) {
    const message = result.error.message.includes('ENOENT')
      ? 'ffmpeg is required but was not found in PATH'
      : result.error.message;
    throw new RuntimeFailure(message);
  }
  if (result.status !== 0) throw new RuntimeFailure('ffmpeg failed while building the frame pack');

  return readdirSync(outputDir)
    .filter((name) => name.startsWith('frame-') && name.endsWith('.jpg'))
    .sort()
    .map((name) => join(outputDir, name));
}

/**
 * Best-effort frame count, so the pack cap can refuse before anything is
 * written rather than report the overflow after the disk already paid for it.
 */
function frameCountEstimate(input: string, duration: number): number | null {
  const result = spawnSync(
    'ffprobe',
    ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=nb_frames,avg_frame_rate', '-of', 'json', input],
    { encoding: 'utf8' },
  );
  if (result.error !== undefined || result.status !== 0) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(result.stdout) as unknown;
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null) return null;

  const streams = Reflect.get(parsed, 'streams');
  const stream: unknown = Array.isArray(streams) ? streams[0] : null;
  if (typeof stream !== 'object' || stream === null) return null;

  const declared = Number(Reflect.get(stream, 'nb_frames'));
  if (Number.isFinite(declared) && declared > 0) return declared;

  const rate = Reflect.get(stream, 'avg_frame_rate');
  const [numerator, denominator] = typeof rate === 'string' ? rate.split('/').map(Number) : [];
  if (
    numerator === undefined || denominator === undefined ||
    !Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0
  ) {
    return null;
  }
  return Math.ceil(duration * (numerator / denominator));
}

function mediaDuration(input: string): number {
  const result = spawnSync(
    'ffprobe',
    ['-v', 'error', '-show_entries', 'format=duration', '-of', 'json', input],
    { encoding: 'utf8' },
  );

  if (result.error) {
    const message = result.error.message.includes('ENOENT')
      ? 'ffprobe is required but was not found in PATH'
      : result.error.message;
    throw new RuntimeFailure(message);
  }
  if (result.status !== 0) throw new RuntimeFailure(result.stderr.trim() || 'ffprobe failed');

  let parsed: unknown;
  try {
    parsed = JSON.parse(result.stdout) as unknown;
  } catch (error: unknown) {
    throw new Error(`ffprobe returned invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('ffprobe output must be a JSON object');
  }

  const format = Reflect.get(parsed, 'format');
  if (typeof format !== 'object' || format === null || Array.isArray(format)) {
    throw new Error('media duration is unavailable');
  }

  const durationText = Reflect.get(format, 'duration');
  const duration = typeof durationText === 'string' ? Number(durationText) : Number.NaN;
  if (!Number.isFinite(duration) || duration <= 0) throw new Error('media duration is unavailable');
  return duration;
}

function main(): number {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      count: { type: 'string' },
      every: { type: 'string' },
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

  const input = positionals[0];
  const outputDir = positionals[1];
  if (input === undefined || outputDir === undefined) return EXIT_USAGE;
  if (!existsSync(input)) {
    console.error(`input does not exist: ${input}`);
    return EXIT_USAGE;
  }

  if (values.count !== undefined && values.every !== undefined) {
    console.error('--count and --every are mutually exclusive');
    return EXIT_USAGE;
  }

  const count = values.count === undefined ? DEFAULT_COUNT : Number.parseInt(values.count, 10);
  if (!Number.isInteger(count) || count < 1 || count > MAX_COUNT) {
    console.error(`--count must be an integer between 1 and ${MAX_COUNT}`);
    return EXIT_USAGE;
  }

  const duration = mediaDuration(input);

  mkdirSync(outputDir, { recursive: true });

  if (values.every !== undefined) {
    const every = Number.parseInt(values.every, 10);
    if (!Number.isInteger(every) || every < 1 || every > 120) {
      console.error('--every must be an integer between 1 and 120');
      return EXIT_USAGE;
    }

    // The reported pack is a directory listing, so leftovers from a previous
    // run — possibly at a different density or filename width — would be folded
    // into this one and scramble the temporal order. Demand a clean directory.
    const stale = readdirSync(outputDir).filter((name) => name.startsWith('frame-') && name.endsWith('.jpg'));
    if (stale.length > 0) {
      console.error(
        `output directory already contains ${String(stale.length)} frame-*.jpg from a previous run; ` +
          'use a fresh directory',
      );
      return EXIT_USAGE;
    }

    // Refuse an oversized pack before ffmpeg writes it, when the frame count is
    // knowable; the post-write check below stays as the backstop.
    const estimate = frameCountEstimate(input, duration);
    if (estimate !== null && Math.ceil(estimate / every) > MAX_PACK_FRAMES) {
      console.error(
        `a pack of ~${String(Math.ceil(estimate / every))} frames exceeds ${String(MAX_PACK_FRAMES)}; raise --every`,
      );
      return EXIT_USAGE;
    }

    const packed = samplePack(input, outputDir, every);

    if (packed.length > MAX_PACK_FRAMES) {
      console.error(`frame pack of ${String(packed.length)} exceeds ${String(MAX_PACK_FRAMES)}; raise --every`);
      return EXIT_USAGE;
    }

    console.log(JSON.stringify({ input, duration, every, frames: packed }, null, 2));
    return 0;
  }

  const frames: string[] = [];

  for (let index = 0; index < count; index += 1) {
    const time = duration * (index + 1) / (count + 1);
    const filename = `frame-${String(index + 1).padStart(2, '0')}.jpg`;
    const destination = join(outputDir, filename);
    const result = spawnSync(
      'ffmpeg',
      [
        '-y',
        '-hide_banner',
        '-loglevel', 'error',
        '-ss', time.toFixed(3),
        '-i', input,
        '-frames:v', '1',
        '-q:v', '2',
        destination,
      ],
      { stdio: 'inherit' },
    );

    if (result.error) {
      const message = result.error.message.includes('ENOENT')
        ? 'ffmpeg is required but was not found in PATH'
        : result.error.message;
      throw new RuntimeFailure(message);
    }
    if (result.status !== 0) throw new RuntimeFailure(`ffmpeg failed extracting frame ${String(index + 1)}`);
    frames.push(destination);
  }

  console.log(JSON.stringify({ input, duration, frames }, null, 2));
  return 0;
}

try {
  process.exitCode = main();
} catch (error: unknown) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = error instanceof RuntimeFailure ? EXIT_RUNTIME : EXIT_USAGE;
}
