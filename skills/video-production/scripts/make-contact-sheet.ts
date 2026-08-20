#!/usr/bin/env -S node --experimental-strip-types
import { spawnSync } from 'node:child_process';

function usage(): void {
  console.log('Usage: make-contact-sheet.ts <output> <image...> [--columns N] [--geometry WxH+X+Y]');
}

function commandExists(command: string): boolean {
  const result = spawnSync(command, ['-version'], { stdio: 'ignore' });
  return !result.error;
}

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  usage();
  process.exit(0);
}

let columns = 3;
let geometry = '512x512+12+12';
const positional: string[] = [];

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === '--columns') {
    const value = args[++index];
    columns = Number.parseInt(value ?? '', 10);
    if (!Number.isInteger(columns) || columns < 1) {
      console.error('--columns must be a positive integer');
      process.exit(2);
    }
  } else if (arg === '--geometry') {
    geometry = args[++index] ?? '';
    if (!geometry) {
      console.error('--geometry requires a value');
      process.exit(2);
    }
  } else {
    positional.push(arg);
  }
}

const [output, ...images] = positional;
if (!output || images.length === 0) {
  usage();
  process.exit(2);
}

const useMagick = commandExists('magick');
const executable = useMagick ? 'magick' : commandExists('montage') ? 'montage' : null;
if (!executable) {
  console.error('ImageMagick (magick or montage) is required');
  process.exit(2);
}

const commandArgs = useMagick
  ? ['montage', ...images, '-geometry', geometry, '-tile', `${columns}x`, output]
  : [...images, '-geometry', geometry, '-tile', `${columns}x`, output];

const result = spawnSync(executable, commandArgs, { stdio: 'inherit' });
if (result.error) {
  console.error(result.error.message);
  process.exit(2);
}
process.exit(result.status ?? 1);
