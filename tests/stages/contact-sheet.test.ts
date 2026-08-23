/**
 * Stage: review artifact generation.
 *
 * The contact sheet script depends on ImageMagick. When it is absent the tests
 * must say so loudly rather than pass quietly — a silently skipped stage is how
 * ad-hoc tooling gets substituted without anyone noticing.
 */
import assert from 'node:assert/strict';
import { mkdtempSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { commandAvailable, fixture, runScript } from './harness.ts';

const SCRIPT = 'skills/video-production/scripts/make-contact-sheet.ts';
const IMAGEMAGICK = commandAvailable('magick') || commandAvailable('convert');

test('argument validation runs without ImageMagick', () => {
  const result = runScript(SCRIPT, ['out.jpg', 'image.jpg', '--columns', '0']);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /between 1 and 50/);
});

test(
  'a contact sheet is produced from sampled frames',
  { skip: IMAGEMAGICK ? false : 'ImageMagick is not installed; make-contact-sheet.ts cannot run here' },
  () => {
    const frames = mkdtempSync(join(tmpdir(), 'vps-frames-'));
    const sampled = runScript('skills/video-evaluate/scripts/sample-frames.ts', [fixture('clean.mp4'), frames]);
    assert.equal(sampled.status, 0, sampled.stderr);

    const images = readdirSync(frames).map((name) => join(frames, name));
    assert.ok(images.length > 0, 'no frames were sampled');

    const output = join(mkdtempSync(join(tmpdir(), 'vps-sheet-')), 'sheet.jpg');
    const result = runScript(SCRIPT, [output, ...images]);
    assert.equal(result.status, 0, result.stderr);
    assert.ok(existsSync(output), 'contact sheet was not written');
  },
);
