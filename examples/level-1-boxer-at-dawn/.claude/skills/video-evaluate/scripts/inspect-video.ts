#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';

const EXIT_USAGE = 2;

interface ProbeStream {
  readonly codec_type?: string;
  readonly width?: number;
  readonly height?: number;
  readonly avg_frame_rate?: string;
}

interface ProbeData {
  readonly streams: readonly ProbeStream[];
  readonly duration: number | null;
}

interface Requirements {
  readonly duration?: number;
  readonly width?: number;
  readonly height?: number;
  readonly fps?: number;
  readonly audioRequired?: boolean;
}

interface Report {
  readonly input: string;
  readable: boolean;
  observed?: {
    readonly duration: number | null;
    readonly width: number | null;
    readonly height: number | null;
    readonly fps: number | null;
    readonly videoStream: boolean;
    readonly audioStream: boolean;
  };
  readonly failures: string[];
  status?: 'pass' | 'fail';
}

function usage(): void {
  console.log('Usage: inspect-video.ts <input> [--requirements requirements.json]');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function optionalPositiveNumber(record: Record<string, unknown>, key: string): number | undefined {
  const value = record[key];
  if (value === undefined) return undefined;
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new Error(`${key} must be a positive finite number`);
  }
  return value;
}

function optionalPositiveInteger(record: Record<string, unknown>, key: string): number | undefined {
  const value = record[key];
  if (value === undefined) return undefined;
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    throw new Error(`${key} must be a positive integer`);
  }
  return value;
}

function parseRequirements(value: unknown): Requirements {
  if (!isRecord(value)) throw new Error('requirements must be a JSON object');

  const duration = optionalPositiveNumber(value, 'duration');
  const width = optionalPositiveInteger(value, 'width');
  const height = optionalPositiveInteger(value, 'height');
  const fps = optionalPositiveNumber(value, 'fps');
  const audioRequiredValue = value.audioRequired;
  if (audioRequiredValue !== undefined && typeof audioRequiredValue !== 'boolean') {
    throw new Error('audioRequired must be boolean when provided');
  }

  return {
    ...(duration === undefined ? {} : { duration }),
    ...(width === undefined ? {} : { width }),
    ...(height === undefined ? {} : { height }),
    ...(fps === undefined ? {} : { fps }),
    ...(audioRequiredValue === undefined ? {} : { audioRequired: audioRequiredValue }),
  };
}

function loadRequirements(path: string): Requirements {
  if (!existsSync(path)) throw new Error(`requirements file does not exist: ${path}`);

  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(path, 'utf8')) as unknown;
  } catch (error: unknown) {
    throw new Error(`invalid requirements JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
  return parseRequirements(parsed);
}

function ratio(rate: string | undefined): number | null {
  if (rate === undefined || rate === '0/0') return null;
  const [numeratorText, denominatorText] = rate.split('/', 2);
  if (numeratorText === undefined || denominatorText === undefined) return null;

  const numerator = Number(numeratorText);
  const denominator = Number(denominatorText);
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) return null;
  return numerator / denominator;
}

function closeEnough(
  actual: number,
  expected: number,
  relativeTolerance: number,
  absoluteTolerance: number,
): boolean {
  return Math.abs(actual - expected) <= Math.max(absoluteTolerance, Math.abs(expected) * relativeTolerance);
}

function parseProbeData(value: unknown): ProbeData {
  if (!isRecord(value)) throw new Error('ffprobe output must be a JSON object');

  const streamsValue = value.streams;
  if (!Array.isArray(streamsValue)) throw new Error('ffprobe output is missing streams');

  const streams: ProbeStream[] = streamsValue.map((stream, index) => {
    if (!isRecord(stream)) throw new Error(`ffprobe stream ${index} is invalid`);

    return {
      ...(typeof stream.codec_type === 'string' ? { codec_type: stream.codec_type } : {}),
      ...(typeof stream.width === 'number' ? { width: stream.width } : {}),
      ...(typeof stream.height === 'number' ? { height: stream.height } : {}),
      ...(typeof stream.avg_frame_rate === 'string' ? { avg_frame_rate: stream.avg_frame_rate } : {}),
    };
  });

  let duration: number | null = null;
  if (isRecord(value.format) && typeof value.format.duration === 'string') {
    const parsed = Number(value.format.duration);
    duration = Number.isFinite(parsed) ? parsed : null;
  }

  return { streams, duration };
}

function probe(input: string): ProbeData {
  const result = spawnSync(
    'ffprobe',
    ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', input],
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
  return parseProbeData(parsed);
}

function main(): number {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      help: { type: 'boolean', short: 'h' },
      requirements: { type: 'string' },
    },
    strict: true,
  });

  if (values.help) {
    usage();
    return 0;
  }
  if (positionals.length !== 1) {
    usage();
    return EXIT_USAGE;
  }

  const input = positionals[0];
  if (input === undefined || !existsSync(input)) {
    console.error(`input does not exist: ${input ?? '<missing>'}`);
    return EXIT_USAGE;
  }

  let requirements: Requirements = {};
  if (values.requirements !== undefined) {
    try {
      requirements = loadRequirements(values.requirements);
    } catch (error: unknown) {
      console.error(error instanceof Error ? error.message : String(error));
      return EXIT_USAGE;
    }
  }

  const report: Report = { input, readable: false, failures: [] };

  let data: ProbeData;
  try {
    data = probe(input);
  } catch (error: unknown) {
    report.failures.push(error instanceof Error ? error.message : String(error));
    report.status = 'fail';
    console.log(JSON.stringify(report, null, 2));
    return 1;
  }

  report.readable = true;
  const video = data.streams.find((stream) => stream.codec_type === 'video');
  const audio = data.streams.find((stream) => stream.codec_type === 'audio');
  const observed = {
    duration: data.duration,
    width: video?.width ?? null,
    height: video?.height ?? null,
    fps: ratio(video?.avg_frame_rate),
    videoStream: video !== undefined,
    audioStream: audio !== undefined,
  };
  report.observed = observed;

  if (video === undefined) report.failures.push('video stream missing');

  if (requirements.width !== undefined) {
    if (observed.width === null) report.failures.push('width unavailable');
    else if (observed.width !== requirements.width) {
      report.failures.push(`width: expected ${requirements.width}, got ${observed.width}`);
    }
  }
  if (requirements.height !== undefined) {
    if (observed.height === null) report.failures.push('height unavailable');
    else if (observed.height !== requirements.height) {
      report.failures.push(`height: expected ${requirements.height}, got ${observed.height}`);
    }
  }
  if (requirements.fps !== undefined) {
    if (observed.fps === null) report.failures.push('fps unavailable');
    else if (!closeEnough(observed.fps, requirements.fps, 0.01, 0.05)) {
      report.failures.push(`fps: expected ${requirements.fps}, got ${observed.fps}`);
    }
  }
  if (requirements.duration !== undefined) {
    if (observed.duration === null) report.failures.push('duration unavailable');
    else if (!closeEnough(observed.duration, requirements.duration, 0.02, 0.1)) {
      report.failures.push(`duration: expected ${requirements.duration}, got ${observed.duration}`);
    }
  }
  if (requirements.audioRequired === true && audio === undefined) {
    report.failures.push('audio stream required but missing');
  }

  report.status = report.failures.length === 0 ? 'pass' : 'fail';
  console.log(JSON.stringify(report, null, 2));
  return report.status === 'pass' ? 0 : 1;
}

try {
  process.exitCode = main();
} catch (error: unknown) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = EXIT_USAGE;
}
