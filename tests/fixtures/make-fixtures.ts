#!/usr/bin/env node
/**
 * Synthesises tiny deterministic media fixtures with ffmpeg's lavfi sources so
 * every workflow stage can be exercised in isolation, offline, with no provider
 * credentials and nothing large committed to the repository.
 *
 * Each fixture reproduces one failure class that has actually shipped.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';

const EXIT_USAGE = 2;
const EXIT_UNAVAILABLE = 1;

const WIDTH = 640;
const HEIGHT = 360;
const BOX = 40;
const FPS = 24;
const SECONDS = 5;

// Wrapping the box every 500px at 600px/s puts a discontinuity every 20 frames,
// which is the shape of a clip assembled from fixed-length latent chunks.
const SEAM_PERIOD_FRAMES = 20;

interface Fixture {
  readonly name: string;
  readonly file: string;
  readonly describes: string;
  readonly build: (output: string) => readonly string[];
}

function movingBox(xExpression: string, seconds: number, width: number, height: number): readonly string[] {
  return [
    '-f', 'lavfi', '-i', `color=c=black:s=${String(width)}x${String(height)}:r=${String(FPS)}:d=${String(seconds)}`,
    '-f', 'lavfi', '-i', `color=c=white:s=${String(BOX)}x${String(BOX)}:r=${String(FPS)}:d=${String(seconds)}`,
    '-filter_complex', `[0][1]overlay=x='${xExpression}':y=${String(Math.floor(height / 2 - BOX / 2))}:eval=frame`,
    // Long GOP with scene detection off: periodic keyframes decode microscopically
    // differently from the frames they replace, which would otherwise plant a
    // perfectly periodic bump in a fixture that is supposed to be clean.
    '-c:v', 'libx264', '-crf', '20', '-g', '600', '-sc_threshold', '0', '-pix_fmt', 'yuv420p',
  ];
}

const FIXTURES: readonly Fixture[] = [
  {
    name: 'clean',
    file: 'clean.mp4',
    describes: 'smooth constant-velocity motion; must pass every check',
    build: () => movingBox(`t*110`, SECONDS, WIDTH, HEIGHT),
  },
  {
    name: 'seams',
    file: 'seams.mp4',
    describes: `discontinuity every ${String(SEAM_PERIOD_FRAMES)} frames; the shipped seedance failure`,
    build: () => movingBox(`mod(t*600,500)`, SECONDS, WIDTH, HEIGHT),
  },
  {
    name: 'frozen',
    file: 'frozen.mp4',
    describes: 'motion then a held section; duplicated-frame failure',
    build: () => movingBox(`if(lt(t,2),t*110,220)`, SECONDS, WIDTH, HEIGHT),
  },
  {
    name: 'drift',
    file: 'drift.mp4',
    describes: 'accelerating motion; a take that destabilises as it runs',
    build: () => movingBox(`40*t+10*t*t`, SECONDS, WIDTH, HEIGHT),
  },
  {
    name: 'offsize',
    file: 'offsize.mp4',
    describes: '1928x1072; the provider output that letterboxes when conformed naively',
    build: () => [
      '-f', 'lavfi', '-i', 'testsrc2=s=1928x1072:r=24:d=2',
      '-c:v', 'libx264', '-crf', '20', '-g', '600', '-sc_threshold', '0', '-pix_fmt', 'yuv420p',
    ],
  },
  {
    name: 'silent',
    file: 'silent.mp4',
    describes: 'video with no audio stream',
    build: () => movingBox(`t*110`, 2, WIDTH, HEIGHT),
  },
  {
    name: 'withaudio',
    file: 'withaudio.mp4',
    describes: 'video with an audio stream',
    build: () => [
      '-f', 'lavfi', '-i', `color=c=black:s=${String(WIDTH)}x${String(HEIGHT)}:r=${String(FPS)}:d=2`,
      '-f', 'lavfi', '-i', 'sine=frequency=440:duration=2',
      '-c:v', 'libx264', '-crf', '20', '-g', '600', '-sc_threshold', '0', '-pix_fmt', 'yuv420p',
      '-c:a', 'aac', '-shortest',
    ],
  },
];

const CORRUPT_FILE = 'corrupt.mp4';

function usage(): void {
  console.log('Usage: make-fixtures.ts <output-dir> [--only name,name] [--force] [--list]');
}

function ffmpegAvailable(): boolean {
  const result = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
  return result.status === 0 && result.error === undefined;
}

function build(fixture: Fixture, directory: string, force: boolean): string {
  const output = join(directory, fixture.file);
  if (existsSync(output) && !force) return output;

  const result = spawnSync('ffmpeg', ['-y', '-v', 'error', ...fixture.build(output), output], {
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    throw new Error(`failed to build fixture ${fixture.name}: ${result.stderr.trim()}`);
  }
  return output;
}

function main(): number {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      only: { type: 'string' },
      force: { type: 'boolean' },
      list: { type: 'boolean' },
      help: { type: 'boolean', short: 'h' },
    },
    strict: true,
  });

  if (values.help) {
    usage();
    return 0;
  }

  if (values.list) {
    for (const fixture of FIXTURES) console.log(`${fixture.name}\t${fixture.file}\t${fixture.describes}`);
    console.log(`corrupt\t${CORRUPT_FILE}\tunreadable bytes with a video extension`);
    return 0;
  }

  const directoryValue = positionals[0];
  if (positionals.length !== 1 || directoryValue === undefined) {
    usage();
    return EXIT_USAGE;
  }

  if (!ffmpegAvailable()) {
    console.error('ffmpeg is required but was not found in PATH');
    return EXIT_UNAVAILABLE;
  }

  const requested = values.only?.split(',').map((name) => name.trim()).filter((name) => name !== '');
  if (requested !== undefined) {
    const known = new Set(FIXTURES.map((fixture) => fixture.name).concat('corrupt'));
    for (const name of requested) {
      if (!known.has(name)) {
        console.error(`unknown fixture: ${name}`);
        return EXIT_USAGE;
      }
    }
  }

  const directory = resolve(directoryValue);
  mkdirSync(directory, { recursive: true });

  const force = values.force === true;
  for (const fixture of FIXTURES) {
    if (requested !== undefined && !requested.includes(fixture.name)) continue;
    console.log(build(fixture, directory, force));
  }

  if (requested === undefined || requested.includes('corrupt')) {
    const corrupt = join(directory, CORRUPT_FILE);
    if (!existsSync(corrupt) || force) {
      writeFileSync(corrupt, Buffer.from('not a video, deliberately', 'utf8'));
    }
    console.log(corrupt);
  }

  return 0;
}

try {
  process.exitCode = main();
} catch (error: unknown) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = EXIT_USAGE;
}
