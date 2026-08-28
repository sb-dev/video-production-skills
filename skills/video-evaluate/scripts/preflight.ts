#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';

const EXIT_USAGE = 2;
const EXIT_MISSING_REQUIRED = 1;

interface Dependency {
  readonly id: string;
  readonly commands: readonly string[];
  readonly required: boolean;
  readonly enables: readonly string[];
}

interface DependencyReport {
  readonly id: string;
  readonly required: boolean;
  readonly available: boolean;
  readonly resolvedCommand: string | null;
  readonly enables: readonly string[];
}

interface Report {
  readonly dependencies: readonly DependencyReport[];
  readonly unusableScripts: readonly string[];
  readonly ok: boolean;
}

// Declared in the skill frontmatter. A production run that starts without these
// silently degrades: the missing tool is worked around ad hoc, and the review
// method drifts away from the one the skill actually specifies.
const DEPENDENCIES: readonly Dependency[] = [
  {
    id: 'ffmpeg',
    commands: ['ffmpeg'],
    required: true,
    enables: [
      'video-production/scripts/render-timeline.ts',
      'video-evaluate/scripts/sample-frames.ts',
      'video-evaluate/scripts/detect-motion-artifacts.ts',
    ],
  },
  {
    id: 'ffprobe',
    commands: ['ffprobe'],
    required: true,
    enables: [
      'video-production/scripts/inspect-media.ts',
      'video-evaluate/scripts/inspect-video.ts',
      'video-evaluate/scripts/sample-frames.ts',
    ],
  },
  {
    id: 'imagemagick',
    commands: ['magick', 'convert'],
    required: false,
    enables: [
      'video-production/scripts/make-contact-sheet.ts',
      'video-production/scripts/make-storyboard.ts',
    ],
  },
];

function usage(): void {
  console.log('Usage: preflight.ts [--json]');
}

function resolveCommand(commands: readonly string[]): string | null {
  for (const command of commands) {
    const result = spawnSync(command, ['-version'], { stdio: 'ignore' });
    if (result.status === 0 && result.error === undefined) return command;
  }
  return null;
}

function buildReport(): Report {
  const dependencies = DEPENDENCIES.map((dependency): DependencyReport => {
    const resolvedCommand = resolveCommand(dependency.commands);
    return {
      id: dependency.id,
      required: dependency.required,
      available: resolvedCommand !== null,
      resolvedCommand,
      enables: dependency.enables,
    };
  });

  const unusableScripts = dependencies
    .filter((dependency) => !dependency.available)
    .flatMap((dependency) => dependency.enables);

  const ok = dependencies.every((dependency) => dependency.available || !dependency.required);

  return { dependencies, unusableScripts: [...new Set(unusableScripts)].sort(), ok };
}

function printText(report: Report): void {
  for (const dependency of report.dependencies) {
    const state = dependency.available ? `available (${dependency.resolvedCommand ?? ''})` : 'MISSING';
    const necessity = dependency.required ? 'required' : 'optional';
    console.log(`${dependency.id}: ${state} [${necessity}]`);
  }

  if (report.unusableScripts.length > 0) {
    console.log('');
    console.log('unusable scripts:');
    for (const script of report.unusableScripts) console.log(`  ${script}`);
    console.log('');
    console.log('Do not substitute ad-hoc tooling for an unusable script without recording it.');
  }
}

function main(): number {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      json: { type: 'boolean' },
      help: { type: 'boolean', short: 'h' },
    },
    strict: true,
  });

  if (values.help) {
    usage();
    return 0;
  }
  if (positionals.length > 0) {
    usage();
    return EXIT_USAGE;
  }

  const report = buildReport();
  if (values.json) console.log(JSON.stringify(report, null, 2));
  else printText(report);

  return report.ok ? 0 : EXIT_MISSING_REQUIRED;
}

try {
  process.exitCode = main();
} catch (error: unknown) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = EXIT_USAGE;
}
