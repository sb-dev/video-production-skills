#!/usr/bin/env node
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';

const EXIT_USAGE = 2;
const DEFAULT_COUNT = 6;
const MAX_COUNT = 100;

function usage(): void {
  console.log('Usage: sample-frames.ts <input> <output-dir> [--count N]');
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
    throw new Error(message);
  }
  if (result.status !== 0) throw new Error(result.stderr.trim() || 'ffprobe failed');

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

  const count = values.count === undefined ? DEFAULT_COUNT : Number.parseInt(values.count, 10);
  if (!Number.isInteger(count) || count < 1 || count > MAX_COUNT) {
    console.error(`--count must be an integer between 1 and ${MAX_COUNT}`);
    return EXIT_USAGE;
  }

  let duration: number;
  try {
    duration = mediaDuration(input);
  } catch (error: unknown) {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }

  mkdirSync(outputDir, { recursive: true });
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
      console.error(message);
      return EXIT_USAGE;
    }
    if (result.status !== 0) return result.status ?? 1;
    frames.push(destination);
  }

  console.log(JSON.stringify({ input, duration, frames }, null, 2));
  return 0;
}

try {
  process.exitCode = main();
} catch (error: unknown) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = EXIT_USAGE;
}
