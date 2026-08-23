/**
 * Stage: storyboard composition.
 *
 * Cover for the form failure in examples/level-2-missed-connection: three
 * separate full-bleed rendered illustrations, with arrows and sight-lines drawn
 * inside the frames and one panel per final shot, were produced and called a
 * storyboard. A board is a sheet of small numbered keylined panels, and the
 * layout is deterministic work rather than something an image model invents.
 *
 * The command is asserted rather than the rendered sheet, so board form stays
 * verifiable on a host without ImageMagick — the condition that let ad-hoc
 * tooling be substituted unnoticed in the first place.
 */
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { commandAvailable, runScript } from './harness.ts';

const SCRIPT = 'skills/video-production/scripts/make-storyboard.ts';
const IMAGEMAGICK = commandAvailable('magick') || commandAvailable('montage');

function panels(count: number): { directory: string; files: string[] } {
  const directory = mkdtempSync(join(tmpdir(), 'vps-storyboard-'));
  const files: string[] = [];

  for (let index = 1; index <= count; index += 1) {
    const file = join(directory, `panel-${String(index)}.png`);
    const result = spawnSync(
      'ffmpeg',
      ['-y', '-v', 'error', '-f', 'lavfi', '-i', 'color=c=gray:s=320x240:d=1', '-frames:v', '1', file],
      { encoding: 'utf8' },
    );
    assert.equal(result.status, 0, `could not build panel: ${result.stderr}`);
    files.push(file);
  }

  return { directory, files };
}

function composedCommand(args: readonly string[]): string {
  const result = runScript(SCRIPT, args);
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

test('default composition produces the reference board form', () => {
  const { directory, files } = panels(4);
  const command = composedCommand([join(directory, 'board.png'), ...files, '--print-command']);

  assert.match(command, /-background white/, 'the sheet is paper white');
  assert.match(command, /-bordercolor black/, 'each panel carries a keyline');
  assert.match(command, /-border 2/, 'the keyline is a thin rule');
  assert.match(command, /-set label/, 'panels are numbered');
  assert.match(command, /-tile 3x/, 'panels are laid out in a grid, three columns by default');
});

test('numbering can be turned off without losing the rest of the form', () => {
  const { directory, files } = panels(3);
  const command = composedCommand([
    join(directory, 'board.png'),
    ...files,
    '--no-numbers',
    '--print-command',
  ]);

  assert.doesNotMatch(command, /%\[fx:t\+1\]/, 'no panel number expression when numbering is off');
  assert.match(command, /-bordercolor black/, 'the keyline survives');
  assert.match(command, /-tile 3x/, 'the grid survives');
});

test('column count is honoured', () => {
  const { directory, files } = panels(4);
  const command = composedCommand([
    join(directory, 'board.png'),
    ...files,
    '--columns',
    '2',
    '--print-command',
  ]);
  assert.match(command, /-tile 2x/);
});

test('an invalid column count is rejected', () => {
  const { directory, files } = panels(1);
  const result = runScript(SCRIPT, [join(directory, 'board.png'), ...files, '--columns', '0']);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /between 1 and 50/);
});

test('a malformed geometry is rejected', () => {
  const { directory, files } = panels(1);
  const result = runScript(SCRIPT, [join(directory, 'board.png'), ...files, '--geometry', 'huge']);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /WxH\+X\+Y/);
});

test('a missing panel is rejected before ImageMagick is consulted', () => {
  const directory = mkdtempSync(join(tmpdir(), 'vps-storyboard-'));
  const result = runScript(SCRIPT, [join(directory, 'board.png'), join(directory, 'absent.png')]);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /panel does not exist/);
});

test('panels with no output path are rejected', () => {
  const result = runScript(SCRIPT, []);
  assert.equal(result.status, 2);
});

test(
  'panels compose into a board sheet',
  { skip: IMAGEMAGICK ? false : 'ImageMagick is not installed; make-storyboard.ts cannot run here' },
  () => {
    const { directory, files } = panels(6);
    const output = join(directory, 'board.png');

    const result = runScript(SCRIPT, [output, ...files]);
    assert.equal(result.status, 0, result.stderr);
    assert.ok(existsSync(output), 'board sheet was not written');
  },
);
