#!/usr/bin/env -S node --experimental-strip-types
import { readdirSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

function walk(directory: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(directory)) {
    if (entry === '.git' || entry === 'node_modules') continue;
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) results.push(...walk(path));
    else if (extname(path) === '.ts') results.push(path);
  }
  return results;
}

const root = resolve(process.cwd());
const files = walk(root);
for (const file of files) {
  const result = spawnSync(process.execPath, ['--experimental-strip-types', '--check', file], {
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout || `TypeScript syntax check failed: ${file}`);
    process.exit(result.status ?? 1);
  }
}
console.log(`TypeScript syntax: OK (${files.length} files)`);
