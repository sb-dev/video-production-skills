/**
 * Stage: video-shot motion quality.
 *
 * Regression cover for the failure that shipped in
 * examples/level-2-missed-connection: a generated take carrying a discontinuity
 * every ~20 frames was selected, evaluated and mastered without anything in the
 * toolchain being able to see it.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture, isRecord, parseJson, runScript } from './harness.ts';

const SCRIPT = 'skills/video-evaluate/scripts/detect-motion-artifacts.ts';
const SEEDED_PERIOD_FRAMES = 20;

function report(file: string, args: readonly string[] = []): Record<string, unknown> {
  const result = runScript(SCRIPT, [file, '--json', ...args]);
  const parsed = parseJson(result.stdout);
  assert.ok(isRecord(parsed), 'report must be a JSON object');
  return parsed;
}

test('smooth motion is reported clean and exits zero', () => {
  const result = runScript(SCRIPT, [fixture('clean.mp4')]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /verdict: +clean/);
});

test('periodic seams are detected at the seeded period and gate non-zero', () => {
  const result = runScript(SCRIPT, [fixture('seams.mp4'), '--json']);
  assert.equal(result.status, 1, 'a seamed take must fail the gate');

  const parsed = parseJson(result.stdout);
  assert.ok(isRecord(parsed));

  const periodic = parsed.periodic;
  assert.ok(isRecord(periodic));
  assert.equal(periodic.detected, true, 'periodic seams must be detected');

  const periodFrames = periodic.periodFrames;
  assert.equal(typeof periodFrames, 'number');
  assert.ok(
    Math.abs((periodFrames as number) - SEEDED_PERIOD_FRAMES) <= 1,
    `expected a period near ${String(SEEDED_PERIOD_FRAMES)} frames, got ${String(periodFrames)}`,
  );
  assert.equal(parsed.verdict, 'artifacts');
});

/**
 * A boundary that includes a blended or duplicated transition frame raises two
 * adjacent spikes. Fed to the periodicity test raw, the gaps alternate 1 and
 * P−1, the mean lands near P/2, and the confidence collapses — a perfectly
 * periodic seam read as clean, for being twice as visible.
 */
test('a seam spanning two frames is still detected as periodic', () => {
  const result = runScript(SCRIPT, [fixture('seams-2f.mp4'), '--json']);
  assert.equal(result.status, 1, 'a two-frame seam must fail the gate');

  const parsed = parseJson(result.stdout);
  assert.ok(isRecord(parsed));
  const periodic = parsed.periodic;
  assert.ok(isRecord(periodic));
  assert.equal(periodic.detected, true, 'adjacent spikes must merge into one boundary event');
  assert.ok(
    Math.abs((periodic.periodFrames as number) - SEEDED_PERIOD_FRAMES) <= 1,
    `expected a period near ${String(SEEDED_PERIOD_FRAMES)} frames, got ${String(periodic.periodFrames)}`,
  );
});

test('a held section is reported as a frozen run', () => {
  const parsed = report(fixture('frozen.mp4'));
  const frozenRuns = parsed.frozenRuns;
  assert.ok(Array.isArray(frozenRuns) && frozenRuns.length > 0, 'frozen frames must be reported');
  assert.equal(parsed.verdict, 'artifacts');

  // The fixture moves until t=2s at 24fps, so the first duplicated frame is
  // source frame 49. Reported numbers are source frames, not diff indices — an
  // editor trimming at the reported boundary must land on the hold itself.
  const first = frozenRuns[0];
  assert.ok(isRecord(first));
  assert.ok(
    Math.abs((first.startFrame as number) - 49) <= 2,
    `expected the hold to start near source frame 49, got ${String(first.startFrame)}`,
  );
});

test('accelerating motion reports positive drift without false artifacts', () => {
  const parsed = report(fixture('drift.mp4'));
  const drift = parsed.driftPerSecond;
  assert.equal(typeof drift, 'number');
  assert.ok((drift as number) > 0, 'drift must be positive for an accelerating take');
  assert.equal(parsed.verdict, 'clean', 'drift alone is a signal, not a failure');
});

/**
 * Sub-luma-level periodic variation is everywhere in encoded video: keyframe
 * boundaries decode microscopically differently from the frames they replace,
 * and integer-pixel rounding of smooth motion alternates the per-frame delta.
 * Both are perfectly periodic. Only an absolute floor separates them from a
 * generation seam, so assert the floor is doing that work rather than trusting
 * the relative ratio alone.
 */
test('sub-luma periodic variation is not mistaken for generation seams', () => {
  const withFloor = report(fixture('clean.mp4'));
  assert.equal(withFloor.verdict, 'clean', 'clean footage must pass at the default floor');

  const withoutFloor = report(fixture('clean.mp4'), ['--min-spike-diff', '0.01']);
  const periodic = withoutFloor.periodic;
  assert.ok(isRecord(periodic));
  assert.equal(
    periodic.detected,
    true,
    'without the floor the same clean clip reads as periodic — the floor is load-bearing',
  );
});

/**
 * Editorial needs something to trim against. A take whose usable range is far
 * shorter than its duration was never usable at the length it was cut to.
 */
test('usable range spans a clean take and collapses on a seamed one', () => {
  const clean = report(fixture('clean.mp4'));
  const cleanRange = clean.usableRange;
  assert.ok(isRecord(cleanRange));
  assert.ok(
    (cleanRange.seconds as number) > 4,
    `a clean 5s take should be usable throughout, got ${String(cleanRange.seconds)}s`,
  );

  const seamed = report(fixture('seams.mp4'));
  const seamedRange = seamed.usableRange;
  assert.ok(isRecord(seamedRange));
  assert.ok(
    (seamedRange.seconds as number) < (cleanRange.seconds as number),
    'seams must shorten the usable range',
  );
});

test('skipped head samples are not counted usable', () => {
  const full = report(fixture('clean.mp4'));
  const narrowed = report(fixture('clean.mp4'), ['--skip-head', '100']);
  assert.ok(isRecord(full.usableRange) && isRecord(narrowed.usableRange));
  assert.ok(
    (narrowed.usableRange.seconds as number) < (full.usableRange.seconds as number),
    'samples the detectors never examined are unknown, not clean',
  );
});

test('a missing input is rejected before ffmpeg is invoked', () => {
  const result = runScript(SCRIPT, ['definitely-missing.mp4']);
  assert.equal(result.status, 2);
});

test('an unreadable input is a runtime failure, not a usage error', () => {
  const result = runScript(SCRIPT, [fixture('corrupt.mp4')]);
  assert.equal(result.status, 3, 'ffmpeg failing on real media must not read as operator error');
});

test('an invalid spike ratio is rejected', () => {
  const result = runScript(SCRIPT, [fixture('clean.mp4'), '--spike-ratio', '0']);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /positive number/);
});
