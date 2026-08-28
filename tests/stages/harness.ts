import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

export const ROOT = resolve(import.meta.dirname, '..', '..');

export interface ScriptResult {
  readonly status: number | null;
  readonly stdout: string;
  readonly stderr: string;
}

/**
 * The default environment scrubs the semantic-benchmark opt-in variables: a
 * transcript collector's shell exports them, and inheriting them would turn
 * `npm test` into paid API calls. Tests that need a specific environment pass
 * an overlay via `options.env`.
 */
export function runScript(
  relativePath: string,
  args: readonly string[],
  options?: { readonly env?: Record<string, string | undefined> },
): ScriptResult {
  const result = spawnSync(process.execPath, [resolve(ROOT, relativePath), ...args], {
    encoding: 'utf8',
    env: {
      ...process.env,
      RUN_SEMANTIC_BENCHMARK: undefined,
      REPLICATE_API_TOKEN: undefined,
      ...options?.env,
    },
    maxBuffer: 64 * 1024 * 1024,
  });
  return { status: result.status, stdout: result.stdout ?? '', stderr: result.stderr ?? '' };
}

export function commandAvailable(command: string): boolean {
  const result = spawnSync(command, ['-version'], { stdio: 'ignore' });
  return result.status === 0 && result.error === undefined;
}

/**
 * Fixtures are synthesised once into a temp directory and reused across stage
 * tests. The directory is keyed on a hash of the generator itself, so editing a
 * fixture definition invalidates the cache automatically — caching on filename
 * alone silently serves a stale fixture and the test then measures the wrong clip.
 */
let fixturesDirCache: string | null = null;

export function fixturesDir(): string {
  if (fixturesDirCache !== null) return fixturesDirCache;
  const generator = resolve(ROOT, 'tests/fixtures/make-fixtures.ts');
  const key = createHash('sha256').update(readFileSync(generator)).digest('hex').slice(0, 12);
  const directory = join(tmpdir(), `video-production-skills-fixtures-${key}`);
  mkdirSync(directory, { recursive: true });

  const result = runScript('tests/fixtures/make-fixtures.ts', [directory]);
  if (result.status !== 0) {
    throw new Error(`fixture generation failed: ${result.stderr.trim()}`);
  }
  fixturesDirCache = directory;
  return directory;
}

export function fixture(name: string): string {
  return join(fixturesDir(), name);
}

export function parseJson(text: string): unknown {
  return JSON.parse(text) as unknown;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
