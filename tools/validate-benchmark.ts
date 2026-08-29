#!/usr/bin/env node
/**
 * Validates the benchmark surface and prints its coverage.
 *
 * The manifest under benchmarks/ is the authority for what the benchmark
 * claims to cover. This command checks that every claim resolves — cases,
 * rubrics, skills, commands, prompt sources — and that every advertised
 * example and every extension-pack showcase has a case. A gap exits non-zero;
 * a gap is not a pass.
 */
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { formatReport, loadCatalogue, summaryLine, validateBenchmark } from './benchmark/manifest.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const EXIT_FAILED = 1;
const EXIT_USAGE = 2;

function usage(): void {
  console.log('Usage: validate-benchmark.ts [--json] [--manifest <file>]');
}

function main(): number {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      json: { type: 'boolean' },
      manifest: { type: 'string' },
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

  const manifestPath = values.manifest === undefined ? undefined : resolve(values.manifest);
  const result = validateBenchmark(ROOT, manifestPath);
  let manifest = null;
  try {
    manifest = loadCatalogue(ROOT, manifestPath).manifest;
  } catch {
    manifest = null;
  }

  if (values.json) {
    console.log(JSON.stringify({ ok: result.errors.length === 0, cases: result.cases, errors: result.errors, report: result.report }, null, 2));
  } else {
    if (result.report !== null && manifest !== null) {
      console.log(formatReport(result.report, manifest));
      console.log('');
    }
    for (const error of result.errors) console.log(`ERROR: ${error}`);
    console.log(summaryLine(result, manifest));
  }

  return result.errors.length === 0 ? 0 : EXIT_FAILED;
}

try {
  process.exitCode = main();
} catch (error: unknown) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = EXIT_USAGE;
}
