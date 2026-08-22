#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';

const EXIT_USAGE = 2;

function usage(): void {
  console.log('Usage: inspect-media.ts <input>');
}

function main(): number {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      help: { type: 'boolean', short: 'h' },
    },
    strict: true,
  });

  if (values.help) {
    usage();
    return 0;
  }

  if (positionals.length !== 1) {
    usage();
    return EXIT_USAGE;
  }

  const input = positionals[0];
  if (input === undefined || !existsSync(input)) {
    console.error(`input does not exist: ${input ?? '<missing>'}`);
    return EXIT_USAGE;
  }

  const result = spawnSync(
    'ffprobe',
    ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', input],
    { encoding: 'utf8' },
  );

  if (result.error) {
    const message = result.error.message.includes('ENOENT')
      ? 'ffprobe is required but was not found in PATH'
      : result.error.message;
    console.error(message);
    return EXIT_USAGE;
  }

  if (result.status !== 0) {
    console.error(result.stderr.trim() || 'ffprobe failed');
    return result.status ?? 1;
  }

  try {
    const data: unknown = JSON.parse(result.stdout) as unknown;
    console.log(JSON.stringify(data, null, 2));
    return 0;
  } catch (error: unknown) {
    console.error(`ffprobe returned invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
    return 1;
  }
}

try {
  process.exitCode = main();
} catch (error: unknown) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = EXIT_USAGE;
}
