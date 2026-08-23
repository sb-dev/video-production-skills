#!/usr/bin/env node
/**
 * Composes storyboard panels into a board sheet: a grid of numbered, keylined
 * panels on a paper-white background.
 *
 * The defaults are the artifact. An agent that knows nothing about board form
 * gets the right form by passing panels and an output path, because the failure
 * this script exists to prevent was not knowing what a storyboard looks like.
 *
 * Layout, numbering and framing are deterministic work. Do not ask an image
 * model to lay out a grid.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';

const EXIT_USAGE = 2;

const DEFAULT_COLUMNS = 3;
const DEFAULT_GEOMETRY = '480x360+14+14';
const DEFAULT_LABEL_SIZE = 22;
const GEOMETRY_PATTERN = /^\d+x\d+\+\d+\+\d+$/;

const SHEET_BACKGROUND = 'white';
const KEYLINE_COLOUR = 'black';
const KEYLINE_WIDTH = '2';
const LABEL_COLOUR = 'black';

/** Montage's 1-based index for the current tile. */
const PANEL_NUMBER_EXPRESSION = '%[fx:t+1]';

function usage(): void {
  console.log(
    'Usage: make-storyboard.ts <output> <panel...> [--columns N] [--geometry WxH+X+Y] ' +
      '[--label-size N] [--no-numbers] [--print-command]',
  );
}

function availableCommand(command: string): boolean {
  const result = spawnSync(command, ['-version'], { stdio: 'ignore' });
  return result.status === 0 && result.error === undefined;
}

function buildMontageArgs(
  panels: readonly string[],
  output: string,
  columns: number,
  geometry: string,
  labelSize: number,
  numbers: boolean,
): readonly string[] {
  const numbering = numbers
    ? ['-set', 'label', PANEL_NUMBER_EXPRESSION, '-pointsize', String(labelSize), '-fill', LABEL_COLOUR]
    : ['-set', 'label', ''];

  return [
    '-background', SHEET_BACKGROUND,
    '-bordercolor', KEYLINE_COLOUR,
    '-border', KEYLINE_WIDTH,
    ...numbering,
    ...panels,
    '-geometry', geometry,
    '-tile', `${String(columns)}x`,
    output,
  ];
}

function main(): number {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      columns: { type: 'string' },
      geometry: { type: 'string' },
      'label-size': { type: 'string' },
      'no-numbers': { type: 'boolean' },
      'print-command': { type: 'boolean' },
      help: { type: 'boolean', short: 'h' },
    },
    strict: true,
  });

  if (values.help) {
    usage();
    return 0;
  }

  const [outputValue, ...panelValues] = positionals;
  if (outputValue === undefined || panelValues.length === 0) {
    usage();
    return EXIT_USAGE;
  }

  const columns = values.columns === undefined ? DEFAULT_COLUMNS : Number.parseInt(values.columns, 10);
  if (!Number.isInteger(columns) || columns < 1 || columns > 50) {
    console.error('--columns must be an integer between 1 and 50');
    return EXIT_USAGE;
  }

  const geometry = values.geometry ?? DEFAULT_GEOMETRY;
  if (!GEOMETRY_PATTERN.test(geometry)) {
    console.error('--geometry must use WxH+X+Y with non-negative integer values');
    return EXIT_USAGE;
  }

  const labelSize = values['label-size'] === undefined
    ? DEFAULT_LABEL_SIZE
    : Number.parseInt(values['label-size'], 10);
  if (!Number.isInteger(labelSize) || labelSize < 6 || labelSize > 200) {
    console.error('--label-size must be an integer between 6 and 200');
    return EXIT_USAGE;
  }

  const output = resolve(outputValue);
  const panels = panelValues.map((panel) => resolve(panel));
  for (const panel of panels) {
    if (!existsSync(panel)) {
      console.error(`panel does not exist: ${panel}`);
      return EXIT_USAGE;
    }
  }

  const montageArgs = buildMontageArgs(
    panels,
    output,
    columns,
    geometry,
    labelSize,
    values['no-numbers'] !== true,
  );

  // Printing the composed command is how board form stays inspectable and
  // testable on a host without ImageMagick.
  if (values['print-command'] === true) {
    console.log(['montage', ...montageArgs].join(' '));
    return 0;
  }

  const executable = availableCommand('magick')
    ? 'magick'
    : availableCommand('montage')
      ? 'montage'
      : undefined;

  if (executable === undefined) {
    console.error('ImageMagick (magick or montage) is required but was not found in PATH');
    return EXIT_USAGE;
  }

  const commandArgs = executable === 'magick' ? ['montage', ...montageArgs] : [...montageArgs];

  const result = spawnSync(executable, commandArgs, { stdio: 'inherit' });
  if (result.error) {
    console.error(result.error.message);
    return EXIT_USAGE;
  }
  return result.status ?? 1;
}

try {
  process.exitCode = main();
} catch (error: unknown) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = EXIT_USAGE;
}
