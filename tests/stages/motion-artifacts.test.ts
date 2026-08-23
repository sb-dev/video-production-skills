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

test('a held section is reported as a frozen run', () => {
  const parsed = report(fixture('frozen.mp4'));
  const frozenRuns = parsed.frozenRuns;
  assert.ok(Array.isArray(frozenRuns) && frozenRuns.length > 0, 'frozen frames must be reported');
  assert.equal(parsed.verdict, 'artifacts');
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

test('a missing input is rejected before ffmpeg is invoked', () => {
  const result = runScript(SCRIPT, ['definitely-missing.mp4']);
  assert.equal(result.status, 2);
});

test('an invalid spike ratio is rejected', () => {
  const result = runScript(SCRIPT, [fixture('clean.mp4'), '--spike-ratio', '0']);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /positive number/);
});
