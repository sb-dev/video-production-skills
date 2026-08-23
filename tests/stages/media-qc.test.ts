/**
 * Stage: deterministic media QC.
 *
 * These checks were the only ones the delivered master ever had to pass, which
 * is why a container-valid file with visible generation seams was reported as
 * a clean QC pass. They remain necessary; the motion stage covers what they
 * cannot see.
 */
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fixture, isRecord, parseJson, runScript } from './harness.ts';

const SCRIPT = 'skills/video-evaluate/scripts/inspect-video.ts';

function inspect(file: string, requirements?: Record<string, unknown>): Record<string, unknown> {
  const args = [file];
  if (requirements !== undefined) {
    const directory = mkdtempSync(join(tmpdir(), 'vps-qc-'));
    const path = join(directory, 'requirements.json');
    writeFileSync(path, JSON.stringify(requirements));
    args.push('--requirements', path);
  }

  const result = runScript(SCRIPT, args);
  const parsed = parseJson(result.stdout);
  assert.ok(isRecord(parsed), 'report must be a JSON object');
  return parsed;
}

test('a well-formed clip satisfying its requirements passes', () => {
  const report = inspect(fixture('clean.mp4'), { duration: 5, width: 640, height: 360, fps: 24 });
  assert.equal(report.readable, true);
  assert.equal(report.status, 'pass');
});

test('a requirement mismatch is reported as a failure, not a pass', () => {
  const report = inspect(fixture('clean.mp4'), { width: 1920, height: 1080 });
  assert.equal(report.status, 'fail');
  assert.ok(Array.isArray(report.failures) && report.failures.length > 0);
});

test('unreadable media fails before any semantic evaluation', () => {
  const report = inspect(fixture('corrupt.mp4'));
  assert.equal(report.readable, false);
  assert.equal(report.status, 'fail');
});

test('a required audio stream is enforced', () => {
  const silent = inspect(fixture('silent.mp4'), { audioRequired: true });
  assert.equal(silent.status, 'fail');

  const withAudio = inspect(fixture('withaudio.mp4'), { audioRequired: true });
  assert.equal(withAudio.status, 'pass');
});
