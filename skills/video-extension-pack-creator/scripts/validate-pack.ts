#!/usr/bin/env node
/**
 * Structural acceptance check for an extension pack directory.
 *
 * This is the cheap half of `validate-pack`. It proves the package is shaped
 * like a pack: the required files exist, SKILL.md has frontmatter, and the eval
 * suite is a JSON object with cases. It cannot judge whether the pack was
 * necessary, whether its production profile is operational, or whether its
 * evals are falsifiable — that is the command contract in
 * `commands/validate-pack.md`, and passing this script is not passing it.
 *
 * Deterministic. Reads files, not media; no provider.
 */
import { existsSync, readFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { parseArgs } from 'node:util';

const EXIT_FINDINGS = 1;
const EXIT_USAGE = 2;
/** An I/O failure while reading the pack — distinct from misuse. */
const EXIT_RUNTIME = 3;

const REQUIRED_FILES = ['SKILL.md', join('references', 'production-profile.md'), join('evals', 'evals.json')] as const;

function usage(): void {
  console.log(
    'Usage: validate-pack.ts <pack-directory> [--json]\n' +
      'Exit codes: 0 structurally valid, 1 findings, 2 usage error, 3 runtime failure (I/O)',
  );
}

function main(): number {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { json: { type: 'boolean' }, help: { type: 'boolean', short: 'h' } },
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

  const directory = resolve(positionals[0] as string);
  const name = basename(directory);
  if (!existsSync(directory)) {
    console.error(`no such pack directory: ${directory}`);
    return EXIT_USAGE;
  }

  const findings: string[] = [];

  const missing = REQUIRED_FILES.filter((relativePath) => !existsSync(join(directory, relativePath)));
  for (const relativePath of missing) findings.push(`missing ${relativePath}`);

  if (!missing.includes('SKILL.md')) {
    const skill = readFileSync(join(directory, 'SKILL.md'), 'utf8');
    const frontmatter = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(skill);
    if (frontmatter?.[1] === undefined) findings.push('SKILL.md has no frontmatter block');
    else {
      if (!/^name:\s*\S/m.test(frontmatter[1])) findings.push('SKILL.md frontmatter has no name');
      if (!/^description:\s*\S/m.test(frontmatter[1])) findings.push('SKILL.md frontmatter has no description');
    }
  }

  if (!missing.includes(join('evals', 'evals.json'))) {
    const evalPath = join(directory, 'evals', 'evals.json');
    let parsed: unknown;
    try {
      parsed = JSON.parse(readFileSync(evalPath, 'utf8')) as unknown;
    } catch (error: unknown) {
      findings.push(`evals/evals.json is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
      parsed = undefined;
    }

    if (parsed !== undefined) {
      // An array — including an empty one — is not an eval suite. Accepting it
      // is how a pack ships with no behavioural coverage and still reports PASS.
      const isSuite = typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed);
      if (!isSuite) findings.push('evals/evals.json must contain an object');
      else if (!Array.isArray((parsed as Record<string, unknown>).cases)) {
        findings.push('evals/evals.json: cases must be an array');
      } else if (((parsed as Record<string, unknown>).cases as unknown[]).length === 0) {
        findings.push('evals/evals.json: cases must not be empty');
      }
    }
  }

  if (values.json) {
    console.log(JSON.stringify({ pack: name, findings, ok: findings.length === 0 }, null, 2));
  } else if (findings.length === 0) {
    console.log(`PASS ${name}: structural pack validation`);
  } else {
    console.error(`FAIL ${name}: ${findings.join(', ')}`);
  }

  return findings.length === 0 ? 0 : EXIT_FINDINGS;
}

try {
  process.exitCode = main();
} catch (error: unknown) {
  console.error(error instanceof Error ? error.message : String(error));
  // Filesystem failures carry a code; misuse and argument errors do not.
  const io = error instanceof Error && typeof (error as NodeJS.ErrnoException).code === 'string';
  process.exitCode = io ? EXIT_RUNTIME : EXIT_USAGE;
}
