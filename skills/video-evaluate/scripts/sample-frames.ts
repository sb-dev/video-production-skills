#!/usr/bin/env -S node --experimental-strip-types
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

function usage(): void {
  console.log('Usage: sample-frames.ts <input> <output-dir> [--count N]');
}

function commandExists(command: string): boolean {
  const result = spawnSync(command, ['-version'], { stdio: 'ignore' });
  return !result.error;
}

function mediaDuration(input: string): number {
  const result = spawnSync(
    'ffprobe',
    ['-v', 'error', '-show_entries', 'format=duration', '-of', 'json', input],
    { encoding: 'utf8' },
  );
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr.trim() || 'ffprobe failed');
  const data = JSON.parse(result.stdout) as { format?: { duration?: string } };
  const duration = Number(data.format?.duration);
  if (!Number.isFinite(duration) || duration <= 0) throw new Error('media duration is unavailable');
  return duration;
}

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  usage();
  process.exit(0);
}

const input = args[0];
const outputDir = args[1];
let count = 6;
for (let index = 2; index < args.length; index += 1) {
  if (args[index] === '--count') {
    count = Number.parseInt(args[++index] ?? '', 10);
  }
}

if (!input || !outputDir || !Number.isInteger(count) || count < 1) {
  usage();
  process.exit(2);
}
if (!commandExists('ffmpeg') || !commandExists('ffprobe')) {
  console.error('ffmpeg and ffprobe are required');
  process.exit(2);
}

mkdirSync(outputDir, { recursive: true });
let duration: number;
try {
  duration = mediaDuration(input);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

const frames: string[] = [];
for (let index = 0; index < count; index += 1) {
  const time = duration * (index + 1) / (count + 1);
  const filename = `frame-${String(index + 1).padStart(2, '0')}.jpg`;
  const destination = join(outputDir, filename);
  const result = spawnSync(
    'ffmpeg',
    ['-y', '-hide_banner', '-loglevel', 'error', '-ss', time.toFixed(3), '-i', input, '-frames:v', '1', '-q:v', '2', destination],
    { stdio: 'inherit' },
  );
  if (result.error) {
    console.error(result.error.message);
    process.exit(2);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
  frames.push(destination);
}

console.log(JSON.stringify({ input, duration, frames }, null, 2));
