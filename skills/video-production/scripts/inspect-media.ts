#!/usr/bin/env -S node --experimental-strip-types
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

function usage(): void {
  console.log('Usage: inspect-media.ts <input>');
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

const input = args[0];
if (!input) {
  usage();
  process.exit(2);
}
if (!commandExists('ffprobe')) {
  console.error('ffprobe is required but was not found in PATH');
  process.exit(2);
}
if (!existsSync(input)) {
  console.error(`input does not exist: ${input}`);
  process.exit(2);
}

const result = spawnSync(
  'ffprobe',
  ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', input],
  { encoding: 'utf8' },
);

if (result.error) {
  console.error(result.error.message);
  process.exit(2);
}
if (result.status !== 0) {
  console.error(result.stderr.trim());
  process.exit(result.status ?? 1);
}

const data: unknown = JSON.parse(result.stdout);
console.log(JSON.stringify(data, null, 2));
