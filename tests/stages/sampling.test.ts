/**
 * Stage: review sampling adequacy.
 *
 * This encodes the measurement error that let the shipped defect through.
 * Shot selection was done from still contact sheets sampled every ~10 frames
 * while the artifact repeated every ~20 frames. Still sampling is not a
 * substitute for a temporal pass, and this test states the arithmetic so the
 * relationship cannot quietly regress.
 */
import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fixture, isRecord, parseJson, runScript } from './harness.ts';

function frameCount(video: string): number {
  const result = spawnSync(
    'ffprobe',
    ['-v', 'error', '-select_streams', 'v:0', '-count_frames', '-show_entries', 'stream=nb_read_frames',
      '-of', 'csv=p=0', video],
    { encoding: 'utf8' },
  );
  const frames = Number(result.stdout.trim());
  assert.ok(Number.isFinite(frames) && frames > 0, 'could not count frames');
  return frames;
}

function detectedPeriodFrames(video: string): number {
  const result = runScript('skills/video-evaluate/scripts/detect-motion-artifacts.ts', [video, '--json']);
  const parsed = parseJson(result.stdout);
  assert.ok(isRecord(parsed));

  const periodic = parsed.periodic;
  assert.ok(isRecord(periodic));
  assert.equal(periodic.detected, true, 'the seams fixture must report a period');
  assert.equal(typeof periodic.periodFrames, 'number');
  return periodic.periodFrames as number;
}

test('default still sampling cannot resolve a seam the temporal pass finds', () => {
  const video = fixture('seams.mp4');
  const directory = mkdtempSync(join(tmpdir(), 'vps-sampling-'));

  const sampled = runScript('skills/video-evaluate/scripts/sample-frames.ts', [video, directory]);
  assert.equal(sampled.status, 0, sampled.stderr);

  const sampledFrames = readdirSync(directory).length;
  assert.ok(sampledFrames > 0, 'sample-frames produced nothing');

  const interval = frameCount(video) / sampledFrames;
  const period = detectedPeriodFrames(video);

  assert.ok(
    interval >= period,
    `still sampling every ${interval.toFixed(1)} frames is finer than the ${String(period)}-frame ` +
      'artifact period; if that is now true by default, revisit this guidance',
  );
});

test('the temporal pass finds what the still pass structurally cannot', () => {
  const result = runScript('skills/video-evaluate/scripts/detect-motion-artifacts.ts', [fixture('seams.mp4')]);
  assert.equal(result.status, 1, 'the seamed clip must fail the motion gate');
});
