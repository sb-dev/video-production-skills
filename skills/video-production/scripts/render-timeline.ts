#!/usr/bin/env -S node --experimental-strip-types
import { existsSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

type Shot = {
  source: string;
  in?: number;
  duration?: number;
};

type Timeline = {
  shots?: Shot[];
  render?: {
    width?: number;
    height?: number;
    fps?: number;
  };
};

function usage(): void {
  console.log('Usage: render-timeline.ts <timeline.json> <output.mp4>');
}

function commandExists(command: string): boolean {
  const result = spawnSync(command, ['-version'], { stdio: 'ignore' });
  return !result.error;
}

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  usage();
  process.exit(0);
}

const [timelineFile, output] = args;
if (!timelineFile || !output) {
  usage();
  process.exit(2);
}
if (!commandExists('ffmpeg')) {
  console.error('ffmpeg is required but was not found in PATH');
  process.exit(2);
}
if (!existsSync(timelineFile)) {
  console.error(`timeline does not exist: ${timelineFile}`);
  process.exit(2);
}

const timeline = JSON.parse(readFileSync(timelineFile, 'utf8')) as Timeline;
const shots = timeline.shots ?? [];
if (shots.length === 0) {
  console.error('timeline must contain at least one shot');
  process.exit(2);
}

const width = Math.trunc(timeline.render?.width ?? 1280);
const height = Math.trunc(timeline.render?.height ?? 720);
const fps = Number(timeline.render?.fps ?? 24);
const commandArgs: string[] = ['-y', '-hide_banner', '-loglevel', 'error'];
const filters: string[] = [];
const labels: string[] = [];
const baseDir = dirname(resolve(timelineFile));

for (const [index, shot] of shots.entries()) {
  if (!shot.source) {
    console.error(`shot ${index + 1}: source is required`);
    process.exit(2);
  }
  const source = isAbsolute(shot.source) ? shot.source : resolve(baseDir, shot.source);
  if (!existsSync(source)) {
    console.error(`shot source does not exist: ${source}`);
    process.exit(2);
  }
  commandArgs.push('-i', source);

  const start = Number(shot.in ?? 0);
  let trim = `trim=start=${start}`;
  if (shot.duration !== undefined) {
    trim += `:duration=${Number(shot.duration)}`;
  }
  const label = `v${index}`;
  filters.push(
    `[${index}:v]${trim},setpts=PTS-STARTPTS,` +
      `scale=${width}:${height}:force_original_aspect_ratio=decrease,` +
      `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=${fps}[${label}]`,
  );
  labels.push(`[${label}]`);
}

filters.push(`${labels.join('')}concat=n=${shots.length}:v=1:a=0[outv]`);
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
  console.error(result.error.message);
  process.exit(2);
}
process.exit(result.status ?? 1);
