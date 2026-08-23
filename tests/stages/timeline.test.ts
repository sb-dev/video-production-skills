/**
 * Stage: editorial assembly.
 *
 * Regression cover for the conform trap in examples/level-2-missed-connection:
 * a provider returned 1928x1072 into a 1920x1080 timeline, the renderer padded
 * it, and one shot in the delivered master carried black bars that nothing
 * reported.
 */
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fixture, runScript } from './harness.ts';

const SCRIPT = 'skills/video-production/scripts/render-timeline.ts';

function workspace(): string {
  return mkdtempSync(join(tmpdir(), 'vps-timeline-'));
}

function writeTimeline(directory: string, source: string, width: number, height: number): string {
  const path = join(directory, 'timeline.json');
  writeFileSync(
    path,
    JSON.stringify({
      shots: [{ source, in: 0, duration: 1 }],
      render: { width, height, fps: 24 },
    }),
  );
  return path;
}

/**
 * Mean luma of the top two rows. Limited-range video encodes black as Y=16, not
 * zero, so a padded bar measures ~16 and picture measures well above it.
 */
const LIMITED_RANGE_BLACK = 20;

function topRowLuma(video: string): number {
  const result = spawnSync(
    'ffmpeg',
    [
      '-v', 'error', '-i', video,
      '-vf', 'crop=iw:2:0:0,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-',
      '-frames:v', '1', '-f', 'null', '-',
    ],
    { encoding: 'utf8' },
  );
  const match = /lavfi\.signalstats\.YAVG=(-?[\d.]+)/.exec(result.stdout);
  assert.ok(match?.[1] !== undefined, 'could not measure top-row luma');
  return Number(match[1]);
}

function probe(video: string, entries: string): string {
  const result = spawnSync(
    'ffprobe',
    ['-v', 'error', '-select_streams', 'v:0', '-show_entries', entries, '-of', 'csv=p=0', video],
    { encoding: 'utf8' },
  );
  return result.stdout.trim();
}

test('a matching-aspect source renders full frame with no warning', () => {
  const directory = workspace();
  const output = join(directory, 'out.mp4');
  // 1928x1072 rendered at the same aspect: no padding is required.
  const timeline = writeTimeline(directory, fixture('offsize.mp4'), 964, 536);

  const result = runScript(SCRIPT, [timeline, output]);
  assert.equal(result.status, 0, result.stderr);
  assert.doesNotMatch(result.stderr, /will be padded/);
  assert.ok(
    topRowLuma(output) > LIMITED_RANGE_BLACK,
    'a full-frame render must have picture in its top rows',
  );
});

test('a mismatched-aspect source is padded and the operator is warned', () => {
  const directory = workspace();
  const output = join(directory, 'out.mp4');
  const timeline = writeTimeline(directory, fixture('offsize.mp4'), 1920, 1080);

  const result = runScript(SCRIPT, [timeline, output]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(
    result.stderr,
    /will be padded/,
    'silent letterboxing is how a bar shipped in the master; it must warn',
  );
  assert.ok(
    topRowLuma(output) <= LIMITED_RANGE_BLACK,
    'the padded render is expected to have black bars',
  );
});

test('rendered duration and frame count follow the timeline', () => {
  const directory = workspace();
  const output = join(directory, 'out.mp4');
  const timeline = writeTimeline(directory, fixture('clean.mp4'), 640, 360);

  const result = runScript(SCRIPT, [timeline, output]);
  assert.equal(result.status, 0, result.stderr);
  const frames = Number(probe(output, 'stream=nb_frames'));
  assert.ok(frames >= 23 && frames <= 24, `one second at 24fps, got ${String(frames)} frames`);
  assert.equal(probe(output, 'stream=width,height'), '640,360');
});

test('a missing shot source is rejected before invoking ffmpeg', () => {
  const directory = workspace();
  const timeline = writeTimeline(directory, join(directory, 'nope.mp4'), 640, 360);

  const result = runScript(SCRIPT, [timeline, join(directory, 'out.mp4')]);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /does not exist/);
});
