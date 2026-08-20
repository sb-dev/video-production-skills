import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');

interface ScriptResult {
  readonly status: number | null;
  readonly stdout: string;
  readonly stderr: string;
}

function runScript(relativePath: string, args: readonly string[]): ScriptResult {
  const result = spawnSync(process.execPath, [resolve(root, relativePath), ...args], {
    encoding: 'utf8',
    env: process.env,
  });
  return {
    status: result.status,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

test('inspect-media rejects a missing input', () => {
  const result = runScript('skills/video-production/scripts/inspect-media.ts', []);
  assert.equal(result.status, 2);
});

test('render-timeline rejects an empty timeline before invoking ffmpeg', () => {
  const timeline = join(tmpdir(), `video-production-empty-${process.pid}.json`);
  writeFileSync(timeline, JSON.stringify({ shots: [] }));

  const result = runScript('skills/video-production/scripts/render-timeline.ts', [timeline, 'unused.mp4']);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /at least one shot/);
});

test('make-contact-sheet validates columns before invoking ImageMagick', () => {
  const result = runScript(
    'skills/video-production/scripts/make-contact-sheet.ts',
    ['out.jpg', 'image.jpg', '--columns', '0'],
  );
  assert.equal(result.status, 2);
  assert.match(result.stderr, /between 1 and 50/);
});

test('sample-frames rejects an excessive frame count', () => {
  const result = runScript(
    'skills/video-evaluate/scripts/sample-frames.ts',
    ['missing.mp4', 'frames', '--count', '101'],
  );
  assert.equal(result.status, 2);
});
