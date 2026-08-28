#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';

const EXIT_USAGE = 2;
const EXIT_ARTIFACTS = 1;
/** ffmpeg failed at runtime — distinct from misuse, distinct from a verdict. */
const EXIT_RUNTIME = 3;

/** A runtime failure of the measurement itself, not of the invocation. */
class RuntimeFailure extends Error {}

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

interface UsableRange {
  readonly start: number;
  readonly end: number;
  readonly seconds: number;
}

interface Report {
  readonly input: string;
  readonly frames: number;
  readonly medianDiff: number;
  readonly spikes: readonly Spike[];
  readonly periodic: Periodic;
  readonly frozenRuns: readonly FrozenRun[];
  readonly driftPerSecond: number;
  readonly usableRange: UsableRange;
  readonly verdict: 'clean' | 'artifacts';
}

function usage(): void {
  console.log(
    'Usage: detect-motion-artifacts.ts <input> [--json] [--spike-ratio N] ' +
      '[--hard-spike-ratio N] [--min-spike-diff N] [--period-tolerance N] [--skip-head N]\n' +
      'Exit codes: 0 clean, 1 artifacts detected, 2 usage error, 3 runtime failure (ffmpeg)',
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
    throw new RuntimeFailure(message);
  }
  if (result.status !== 0) throw new RuntimeFailure(result.stderr.trim() || 'ffmpeg failed');

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

  if (samples.length === 0) throw new RuntimeFailure('no frame statistics were produced; is the input a video?');
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
 * A seam spanning several consecutive frames raises one spike per frame. Fed to
 * the periodicity test raw, the gaps alternate between one frame and the true
 * period, the mean lands near half of it, and a perfectly periodic seam reads
 * as noise — the more pronounced the defect, the less periodic it looks. Each
 * contiguous run is one boundary event; keep its strongest sample.
 */
function mergeSpikeRuns(spikes: readonly Spike[]): readonly Spike[] {
  const events: Spike[] = [];
  let runEnd: number | null = null;

  for (const spike of spikes) {
    const last = events[events.length - 1];
    if (last !== undefined && runEnd !== null && spike.frame === runEnd + 1) {
      runEnd = spike.frame;
      if (spike.ratio > last.ratio) events[events.length - 1] = spike;
      continue;
    }
    events.push(spike);
    runEnd = spike.frame;
  }

  return events;
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

  const inTolerance = frameGaps.map((gap) => Math.abs(gap - meanFrameGap) / meanFrameGap <= tolerance);
  const withinTolerance = inTolerance.filter(Boolean).length;
  const confidence = withinTolerance / frameGaps.length;
  if (confidence < 0.75) return absent;

  // The period is reported from the in-tolerance gaps only. Editorial picks a
  // sampling interval from this number; one real cut among the seams must not
  // be allowed to stretch it.
  const keptFrameGaps = frameGaps.filter((_, index) => inTolerance[index] === true);
  const keptTimeGaps = timeGaps.filter((_, index) => inTolerance[index] === true);
  const periodFrames = keptFrameGaps.reduce((total, gap) => total + gap, 0) / keptFrameGaps.length;
  const periodSeconds = keptTimeGaps.reduce((total, gap) => total + gap, 0) / keptTimeGaps.length;

  return {
    detected: true,
    periodFrames: Number(periodFrames.toFixed(2)),
    periodSeconds: Number(periodSeconds.toFixed(3)),
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

/**
 * The longest stretch carrying neither a spike nor a frozen run.
 *
 * Editorial otherwise has nothing to trim against and the out-point gets chosen
 * by eye. A take whose usable range is far shorter than its duration was never
 * usable at the length it was cut to.
 */
function findUsableRange(
  samples: readonly Sample[],
  spikes: readonly Spike[],
  frozenRuns: readonly FrozenRun[],
  skipHead: number,
): UsableRange {
  const damaged = new Set<number>();
  for (const spike of spikes) damaged.add(spike.frame);
  for (const run of frozenRuns) {
    for (let offset = 0; offset < run.frames; offset += 1) damaged.add(run.startFrame + offset);
  }

  let bestStart = 0;
  let bestLength = 0;
  let currentStart: number | null = null;
  let currentLength = 0;

  // Head samples below skipHead were never examined by the detectors, so they
  // are unknown, not clean — counting them usable would let a large --skip-head
  // inflate the exact number editorial trims against.
  for (let index = Math.max(1, skipHead); index < samples.length; index += 1) {
    const sample = samples[index];
    if (sample === undefined) continue;
    if (damaged.has(sample.frame)) {
      currentStart = null;
      currentLength = 0;
      continue;
    }
    if (currentStart === null) currentStart = index;
    currentLength += 1;
    if (currentLength > bestLength) {
      bestLength = currentLength;
      bestStart = currentStart;
    }
  }

  if (bestLength === 0) return { start: 0, end: 0, seconds: 0 };

  const first = samples[bestStart];
  const last = samples[bestStart + bestLength - 1];
  if (first === undefined || last === undefined) return { start: 0, end: 0, seconds: 0 };

  return {
    start: Number(first.time.toFixed(3)),
    end: Number(last.time.toFixed(3)),
    seconds: Number((last.time - first.time).toFixed(3)),
  };
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
  console.log(
    `usable range: ${report.usableRange.start.toFixed(2)}s-${report.usableRange.end.toFixed(2)}s ` +
      `(${report.usableRange.seconds.toFixed(2)}s)`,
  );

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
  const periodic = findPeriodicity(mergeSpikeRuns(spikes), periodTolerance);
  const frozenRuns = findFrozenRuns(samples, skipHead);

  const hasHardSpike = spikes.some((spike) => spike.ratio >= hardSpikeRatio);
  const verdict = periodic.detected || frozenRuns.length > 0 || hasHardSpike ? 'artifacts' : 'clean';
  const usableRange = findUsableRange(samples, spikes, frozenRuns, skipHead);

  // Internally every frame number is a diff-space index: sample N describes the
  // transition into source frame N+1. Reported numbers are source frames, so an
  // editor trimming at a reported boundary lands on the damaged frame itself.
  const report: Report = {
    input,
    frames: samples.length + 1,
    medianDiff: Number(median(samples.map((sample) => sample.diff)).toFixed(3)),
    spikes: spikes.map((spike) => ({ ...spike, frame: spike.frame + 1 })),
    periodic,
    frozenRuns: frozenRuns.map((run) => ({ ...run, startFrame: run.startFrame + 1 })),
    driftPerSecond: driftPerSecond(samples),
    usableRange,
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
  process.exitCode = error instanceof RuntimeFailure ? EXIT_RUNTIME : EXIT_USAGE;
}
