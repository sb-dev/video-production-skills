#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';

const EXIT_USAGE = 2;
const DEFAULT_COLUMNS = 3;
const DEFAULT_GEOMETRY = '512x512+12+12';
const GEOMETRY_PATTERN = /^\d+x\d+\+\d+\+\d+$/;

function usage(): void {
  console.log('Usage: make-contact-sheet.ts <output> <image...> [--columns N] [--geometry WxH+X+Y]');
}

function availableCommand(command: string): boolean {
  const result = spawnSync(command, ['-version'], { stdio: 'ignore' });
  return result.status === 0 && result.error === undefined;
}

function main(): number {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      columns: { type: 'string' },
      geometry: { type: 'string' },
      help: { type: 'boolean', short: 'h' },
    },
    strict: true,
  });

  if (values.help) {
    usage();
    return 0;
  }

  const [outputValue, ...imageValues] = positionals;
  if (outputValue === undefined || imageValues.length === 0) {
    usage();
    return EXIT_USAGE;
  }

  const columns = values.columns === undefined
    ? DEFAULT_COLUMNS
    : Number.parseInt(values.columns, 10);
  if (!Number.isInteger(columns) || columns < 1 || columns > 50) {
    console.error('--columns must be an integer between 1 and 50');
    return EXIT_USAGE;
  }

  const geometry = values.geometry ?? DEFAULT_GEOMETRY;
  if (!GEOMETRY_PATTERN.test(geometry)) {
    console.error('--geometry must use WxH+X+Y with non-negative integer values');
    return EXIT_USAGE;
  }

  const output = resolve(outputValue);
  const images = imageValues.map((image) => resolve(image));
  for (const image of images) {
    if (!existsSync(image)) {
      console.error(`image does not exist: ${image}`);
      return EXIT_USAGE;
    }
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

  const commandArgs = executable === 'magick'
    ? ['montage', ...images, '-geometry', geometry, '-tile', `${columns}x`, output]
    : [...images, '-geometry', geometry, '-tile', `${columns}x`, output];

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
