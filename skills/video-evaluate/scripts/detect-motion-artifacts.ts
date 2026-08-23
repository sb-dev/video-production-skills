#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';

const EXIT_USAGE = 2;
const EXIT_ARTIFACTS = 1;

const DEFAULT_SPIKE_RATIO = 1.3;
const DEFAULT_HARD_SPIKE_RATIO = 2.5;
// Codecs insert periodic keyframes, and a keyframe decodes microscopically
// differently from the predicted frame it replaces. On low-motion footage that
// shows up as a small, perfectly periodic bump that is not a generation seam.
// Requiring a minimum absolute luma delta separates the two: encoder bumps sit
// well below one luma level, generation seams are an order of magnitude larger.
const DEFAULT_MIN_SPIKE_DIFF = 1;
const DEFAULT_PERIOD_TOLERANCE = 0.25;
const DEFAULT_SKIP_HEAD = 2;
const FROZEN_DIFF = 0.05;
const MAX_BUFFER = 64 * 1024 * 1024;

interface Sample {
  readonly frame: number;
  readonly time: number;
  readonly diff: number;
}

interface Spike {
  readonly frame: number;
  readonly time: number;
  readonly diff: number;
  readonly ratio: number;
}

interface FrozenRun {
  readonly startFrame: number;
  readonly frames: number;
}

interface Periodic {
  readonly detected: boolean;
  readonly periodFrames: number | null;
  readonly periodSeconds: number | null;
  readonly confidence: number;
}

interface Report {
  readonly input: string;
  readonly frames: number;
  readonly medianDiff: number;
  readonly spikes: readonly Spike[];
  readonly periodic: Periodic;
  readonly frozenRuns: readonly FrozenRun[];
  readonly driftPerSecond: number;
  readonly verdict: 'clean' | 'artifacts';
}

function usage(): void {
  console.log(
    'Usage: detect-motion-artifacts.ts <input> [--json] [--spike-ratio N] ' +
      '[--hard-spike-ratio N] [--min-spike-diff N] [--period-tolerance N] [--skip-head N]',
  );
}

function positiveNumber(raw: string | undefined, fallback: number, field: string): number {
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) throw new Error(`${field} must be a positive number`);
  return value;
}

function nonNegativeInteger(raw: string | undefined, fallback: number, field: string): number {
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0) throw new Error(`${field} must be a non-negative integer`);
  return value;
}

/**
 * Per-frame mean absolute luma difference. `tblend=difference` turns each frame
 * into its delta from the previous frame; `signalstats` then reports that
 * delta's average brightness. A generated clip assembled from latent chunks
 * shows a regular spike at every chunk boundary.
 */
function measure(input: string): readonly Sample[] {
  const result = spawnSync(
    'ffmpeg',
    [
      '-v', 'error',
      '-i', input,
      '-vf',
      'tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-',
      '-f', 'null', '-',
    ],
    { encoding: 'utf8', maxBuffer: MAX_BUFFER },
  );

  if (result.error) {
    const message = result.error.message.includes('ENOENT')
      ? 'ffmpeg is required but was not found in PATH'
      : result.error.message;
    throw new Error(message);
  }
  if (result.status !== 0) throw new Error(result.stderr.trim() || 'ffmpeg failed');

  const samples: Sample[] = [];
  let frame: number | null = null;
  let time: number | null = null;

  for (const line of result.stdout.split('\n')) {
    const frameMatch = /^frame:(\d+)\s+pts:\S+\s+pts_time:(-?[\d.]+)/.exec(line);
    if (frameMatch?.[1] !== undefined && frameMatch[2] !== undefined) {
      frame = Number(frameMatch[1]);
      time = Number(frameMatch[2]);
      continue;
    }

    const valueMatch = /^lavfi\.signalstats\.YAVG=(-?[\d.]+)/.exec(line);
    if (valueMatch?.[1] !== undefined && frame !== null && time !== null) {
      samples.push({ frame, time, diff: Number(valueMatch[1]) });
      frame = null;
      time = null;
    }
  }

  if (samples.length === 0) throw new Error('no frame statistics were produced; is the input a video?');
  return samples;
}

function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[middle] ?? 0;
  return ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
}

function findSpikes(
  samples: readonly Sample[],
  spikeRatio: number,
  minSpikeDiff: number,
  skipHead: number,
): readonly Spike[] {
  const spikes: Spike[] = [];

  for (let index = Math.max(1, skipHead); index < samples.length - 1; index += 1) {
    const previous = samples[index - 1];
    const current = samples[index];
    const next = samples[index + 1];
    if (previous === undefined || current === undefined || next === undefined) continue;
    if (current.diff < minSpikeDiff) continue;

    const neighbourMean = (previous.diff + next.diff) / 2;
    if (neighbourMean <= 0) continue;

    const ratio = current.diff / neighbourMean;
    if (ratio >= spikeRatio) {
      spikes.push({ frame: current.frame, time: current.time, diff: current.diff, ratio });
    }
  }

  return spikes;
}

/**
 * Evenly spaced spikes are the signature of chunked generation. Random spikes
 * from fast motion or a real cut are not evenly spaced.
 */
function findPeriodicity(spikes: readonly Spike[], tolerance: number): Periodic {
  const absent: Periodic = { detected: false, periodFrames: null, periodSeconds: null, confidence: 0 };
  if (spikes.length < 3) return absent;

  const frameGaps: number[] = [];
  const timeGaps: number[] = [];
  for (let index = 1; index < spikes.length; index += 1) {
    const previous = spikes[index - 1];
    const current = spikes[index];
    if (previous === undefined || current === undefined) continue;
    frameGaps.push(current.frame - previous.frame);
    timeGaps.push(current.time - previous.time);
  }
  if (frameGaps.length < 2) return absent;

  const meanFrameGap = frameGaps.reduce((total, gap) => total + gap, 0) / frameGaps.length;
  if (meanFrameGap <= 0) return absent;

  const withinTolerance = frameGaps.filter(
    (gap) => Math.abs(gap - meanFrameGap) / meanFrameGap <= tolerance,
  ).length;
  const confidence = withinTolerance / frameGaps.length;
  if (confidence < 0.75) return absent;

  const meanTimeGap = timeGaps.reduce((total, gap) => total + gap, 0) / timeGaps.length;
  return {
    detected: true,
    periodFrames: Number(meanFrameGap.toFixed(2)),
    periodSeconds: Number(meanTimeGap.toFixed(3)),
    confidence: Number(confidence.toFixed(2)),
  };
}

function findFrozenRuns(samples: readonly Sample[], skipHead: number): readonly FrozenRun[] {
  const runs: FrozenRun[] = [];
  let startFrame: number | null = null;
  let length = 0;

  for (let index = Math.max(1, skipHead); index < samples.length; index += 1) {
    const sample = samples[index];
    if (sample === undefined) continue;

    if (sample.diff <= FROZEN_DIFF) {
      if (startFrame === null) startFrame = sample.frame;
      length += 1;
      continue;
    }
    if (startFrame !== null && length >= 2) runs.push({ startFrame, frames: length });
    startFrame = null;
    length = 0;
  }

  if (startFrame !== null && length >= 2) runs.push({ startFrame, frames: length });
  return runs;
}

/** Least-squares slope of diff against time: a take that destabilises as it runs. */
function driftPerSecond(samples: readonly Sample[]): number {
  if (samples.length < 3) return 0;

  const count = samples.length;
  const meanTime = samples.reduce((total, sample) => total + sample.time, 0) / count;
  const meanDiff = samples.reduce((total, sample) => total + sample.diff, 0) / count;

  let covariance = 0;
  let variance = 0;
  for (const sample of samples) {
    const timeDelta = sample.time - meanTime;
    covariance += timeDelta * (sample.diff - meanDiff);
    variance += timeDelta * timeDelta;
  }
  if (variance === 0) return 0;
  return Number((covariance / variance).toFixed(3));
}

function printText(report: Report): void {
  console.log(`input:        ${report.input}`);
  console.log(`frames:       ${report.frames}`);
  console.log(`median diff:  ${report.medianDiff.toFixed(2)}`);
  console.log(`drift/second: ${report.driftPerSecond.toFixed(3)}`);

  if (report.periodic.detected) {
    console.log(
      `periodic seams: every ${String(report.periodic.periodFrames)} frames ` +
        `(${String(report.periodic.periodSeconds)}s), confidence ${String(report.periodic.confidence)}`,
    );
  }

  for (const run of report.frozenRuns) {
    console.log(`frozen run:   frame ${run.startFrame} for ${run.frames} frames`);
  }

  for (const spike of report.spikes) {
    console.log(
      `spike:        frame ${spike.frame} t=${spike.time.toFixed(2)}s ` +
        `diff=${spike.diff.toFixed(1)} (${((spike.ratio - 1) * 100).toFixed(0)}% above neighbours)`,
    );
  }

  console.log(`verdict:      ${report.verdict}`);
}

function main(): number {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      json: { type: 'boolean' },
      'spike-ratio': { type: 'string' },
      'hard-spike-ratio': { type: 'string' },
      'min-spike-diff': { type: 'string' },
      'period-tolerance': { type: 'string' },
      'skip-head': { type: 'string' },
      help: { type: 'boolean', short: 'h' },
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

  const spikeRatio = positiveNumber(values['spike-ratio'], DEFAULT_SPIKE_RATIO, 'spike-ratio');
  const hardSpikeRatio = positiveNumber(
    values['hard-spike-ratio'],
    DEFAULT_HARD_SPIKE_RATIO,
    'hard-spike-ratio',
  );
  const periodTolerance = positiveNumber(
    values['period-tolerance'],
    DEFAULT_PERIOD_TOLERANCE,
    'period-tolerance',
  );
  const minSpikeDiff = positiveNumber(values['min-spike-diff'], DEFAULT_MIN_SPIKE_DIFF, 'min-spike-diff');
  const skipHead = nonNegativeInteger(values['skip-head'], DEFAULT_SKIP_HEAD, 'skip-head');

  const samples = measure(input);
  const spikes = findSpikes(samples, spikeRatio, minSpikeDiff, skipHead);
  const periodic = findPeriodicity(spikes, periodTolerance);
  const frozenRuns = findFrozenRuns(samples, skipHead);

  const hasHardSpike = spikes.some((spike) => spike.ratio >= hardSpikeRatio);
  const verdict = periodic.detected || frozenRuns.length > 0 || hasHardSpike ? 'artifacts' : 'clean';

  const report: Report = {
    input,
    frames: samples.length,
    medianDiff: Number(median(samples.map((sample) => sample.diff)).toFixed(3)),
    spikes,
    periodic,
    frozenRuns,
    driftPerSecond: driftPerSecond(samples),
    verdict,
  };

  if (values.json) console.log(JSON.stringify(report, null, 2));
  else printText(report);

  return verdict === 'artifacts' ? EXIT_ARTIFACTS : 0;
}

try {
  process.exitCode = main();
} catch (error: unknown) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = EXIT_USAGE;
}
