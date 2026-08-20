#!/usr/bin/env -S node --experimental-strip-types
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

type ProbeStream = {
  codec_type?: string;
  width?: number;
  height?: number;
  avg_frame_rate?: string;
};

type ProbeData = {
  streams?: ProbeStream[];
  format?: { duration?: string };
};

type Requirements = {
  duration?: number;
  width?: number;
  height?: number;
  fps?: number;
  audioRequired?: boolean;
};

function usage(): void {
  console.log('Usage: inspect-video.ts <input> [--requirements requirements.json]');
}

function commandExists(command: string): boolean {
  const result = spawnSync(command, ['-version'], { stdio: 'ignore' });
  return !result.error;
}

function ratio(rate?: string): number | null {
  if (!rate || rate === '0/0') return null;
  const [numerator, denominator] = rate.split('/', 2).map(Number);
  return denominator ? numerator / denominator : null;
}

function closeEnough(actual: number, expected: number, relativeTolerance: number, absoluteTolerance: number): boolean {
  return Math.abs(actual - expected) <= Math.max(absoluteTolerance, Math.abs(expected) * relativeTolerance);
}

function probe(input: string): ProbeData {
  const result = spawnSync(
    'ffprobe',
    ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', input],
    { encoding: 'utf8' },
  );
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr.trim() || 'ffprobe failed');
  return JSON.parse(result.stdout) as ProbeData;
}

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  usage();
  process.exit(0);
}

const input = args[0];
let requirementsFile: string | undefined;
for (let index = 1; index < args.length; index += 1) {
  if (args[index] === '--requirements') requirementsFile = args[++index];
}

if (!input) {
  usage();
  process.exit(2);
}
if (!commandExists('ffprobe')) {
  console.error('ffprobe is required but was not found in PATH');
  process.exit(2);
}
if (!existsSync(input)) {
  console.error(`input does not exist: ${input}`);
  process.exit(2);
}

const report: {
  input: string;
  readable: boolean;
  observed?: Record<string, number | boolean | null>;
  failures: string[];
  status?: 'pass' | 'fail';
} = { input, readable: false, failures: [] };

let data: ProbeData;
try {
  data = probe(input);
} catch (error) {
  report.failures.push(error instanceof Error ? error.message : String(error));
  console.log(JSON.stringify(report, null, 2));
  process.exit(1);
}

report.readable = true;
const streams = data.streams ?? [];
const video = streams.find((stream) => stream.codec_type === 'video');
const audio = streams.find((stream) => stream.codec_type === 'audio');
const observed = {
  duration: data.format?.duration ? Number(data.format.duration) : null,
  width: video?.width ?? null,
  height: video?.height ?? null,
  fps: ratio(video?.avg_frame_rate),
  videoStream: Boolean(video),
  audioStream: Boolean(audio),
};
report.observed = observed;

const requirements: Requirements = requirementsFile
  ? JSON.parse(readFileSync(requirementsFile, 'utf8')) as Requirements
  : {};

if (!video) report.failures.push('video stream missing');
for (const key of ['width', 'height'] as const) {
  if (requirements[key] !== undefined && observed[key] !== requirements[key]) {
    report.failures.push(`${key}: expected ${requirements[key]}, got ${observed[key]}`);
  }
}
if (requirements.fps !== undefined && observed.fps !== null && !closeEnough(observed.fps, requirements.fps, 0.01, 0.05)) {
  report.failures.push(`fps: expected ${requirements.fps}, got ${observed.fps}`);
}
if (requirements.duration !== undefined && observed.duration !== null && !closeEnough(observed.duration, requirements.duration, 0.02, 0.1)) {
  report.failures.push(`duration: expected ${requirements.duration}, got ${observed.duration}`);
}
if (requirements.audioRequired && !audio) {
  report.failures.push('audio stream required but missing');
}

report.status = report.failures.length === 0 ? 'pass' : 'fail';
console.log(JSON.stringify(report, null, 2));
process.exit(report.status === 'pass' ? 0 : 1);
