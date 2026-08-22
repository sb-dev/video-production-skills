#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REQUIRED_DOCS = [
  'docs/01-creative-skills-system-spec.md',
  'docs/02-creative-skills-workflows-and-artifacts-spec.md',
  'docs/03-creative-skills-repository-and-contracts-spec.md',
  'docs/2026-08-20-extraction-candidates.md',
] as const;
const REQUIRED_SKILLS = ['video-production', 'video-evaluate'] as const;
const REQUIRED_EVAL_CLASSES = ['normal', 'draft', 'refinement', 'final', 'failure-boundary'] as const;
const LEGACY_SKILLS = [
  'replicate-generate',
  'replicate-character',
  'replicate-product',
  'replicate-video',
  'replicate-ugc',
  'replicate-evaluate',
] as const;

function fail(message: string): never {
  throw new Error(message);
}

function filesUnder(directory: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) results.push(...filesUnder(path));
    else if (entry.isFile()) results.push(path);
  }
  return results;
}

function parseJson(path: string): unknown {
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as unknown;
  } catch (error: unknown) {
    fail(`${relative(ROOT, path)}: invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseFrontmatter(skillFile: string): string {
  const text = readFileSync(skillFile, 'utf8');
  const match = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(text);
  if (match?.[1] === undefined) fail(`${relative(ROOT, skillFile)}: invalid frontmatter block`);
  return match[1];
}

function validateSkill(name: string): void {
  const skillDirectory = join(ROOT, 'skills', name);
  const skillFile = join(skillDirectory, 'SKILL.md');
  if (!existsSync(skillFile)) fail(`missing skills/${name}/SKILL.md`);

  const frontmatter = parseFrontmatter(skillFile);
  if (!new RegExp(`^name:\\s*${name}\\s*$`, 'm').test(frontmatter)) {
    fail(`skills/${name}/SKILL.md: frontmatter name mismatch`);
  }
  const namePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!namePattern.test(name) || name.length > 64) {
    fail(`skills/${name}/SKILL.md: invalid Agent Skills name`);
  }

  const descriptionMatch = /^description:\s*(\S.*)$/m.exec(frontmatter);
  if (descriptionMatch?.[1] === undefined || descriptionMatch[1].length > 1024) {
    fail(`skills/${name}/SKILL.md: description must be 1-1024 characters`);
  }

  if (!/^license:\s*Apache-2\.0\s*$/m.test(frontmatter)) {
    fail(`skills/${name}/SKILL.md: license must be Apache-2.0`);
  }

  const compatibilityMatch = /^compatibility:\s*(\S.*)$/m.exec(frontmatter);
  if (compatibilityMatch?.[1] === undefined || compatibilityMatch[1].length > 500) {
    fail(`skills/${name}/SKILL.md: compatibility must be 1-500 characters`);
  }

  const skillLines = readFileSync(skillFile, 'utf8').split('\n').length;
  if (skillLines > 500) fail(`skills/${name}/SKILL.md: exceeds 500-line Agent Skills guidance`);

  const evalFile = join(skillDirectory, 'evals', 'evals.json');
  if (!existsSync(evalFile)) fail(`missing skills/${name}/evals/evals.json`);
  const parsed = parseJson(evalFile);
  if (!isRecord(parsed) || !Array.isArray(parsed.cases)) {
    fail(`skills/${name}/evals/evals.json: cases must be an array`);
  }

  const classes = new Set<string>();
  for (const [index, value] of parsed.cases.entries()) {
    if (!isRecord(value) || typeof value.class !== 'string') {
      fail(`skills/${name}/evals/evals.json: cases[${index}].class must be a string`);
    }
    classes.add(value.class);
  }

  for (const required of REQUIRED_EVAL_CLASSES) {
    if (!classes.has(required)) fail(`skills/${name}/evals/evals.json: missing eval class ${required}`);
  }
}

function main(): void {
  for (const path of REQUIRED_DOCS) {
    if (!existsSync(join(ROOT, path))) fail(`missing ${path}`);
  }

  const tsconfigPath = join(ROOT, 'tsconfig.json');
  if (!existsSync(tsconfigPath)) fail('missing tsconfig.json');
  const tsconfig = parseJson(tsconfigPath);
  if (!isRecord(tsconfig) || !isRecord(tsconfig.compilerOptions)) {
    fail('tsconfig.json: compilerOptions must be an object');
  }
  for (const option of [
    'strict',
    'noUncheckedIndexedAccess',
    'exactOptionalPropertyTypes',
    'noEmit',
    'erasableSyntaxOnly',
    'verbatimModuleSyntax',
  ] as const) {
    if (tsconfig.compilerOptions[option] !== true) fail(`tsconfig.json: ${option} must be true`);
  }

  const packageJson = parseJson(join(ROOT, 'package.json'));
  if (!isRecord(packageJson) || !isRecord(packageJson.engines) || typeof packageJson.engines.node !== 'string') {
    fail('package.json: engines.node must be defined');
  }
  if (!packageJson.engines.node.includes('24.12')) {
    fail('package.json: engines.node must require Node.js 24.12+ for stable native TypeScript execution');
  }
  if (typeof packageJson.packageManager !== 'string' || !packageJson.packageManager.startsWith('npm@')) {
    fail('package.json: packageManager must pin the npm development toolchain');
  }
  if (!existsSync(join(ROOT, 'package-lock.json'))) fail('missing package-lock.json');

  const skillsDirectory = join(ROOT, 'skills');
  if (!existsSync(skillsDirectory)) fail('missing skills directory');

  const actualSkills = readdirSync(skillsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const expectedSkills = [...REQUIRED_SKILLS].sort();
  if (actualSkills.length !== expectedSkills.length || actualSkills.some((name, index) => name !== expectedSkills[index])) {
    fail(`expected skills ${expectedSkills.join(', ')}, found ${actualSkills.join(', ')}`);
  }

  for (const name of REQUIRED_SKILLS) validateSkill(name);

  const allFiles = filesUnder(ROOT);
  for (const path of allFiles) {
    if (extname(path) === '.json') parseJson(path);
    if (extname(path) === '.py') fail(`Python source is not allowed: ${relative(ROOT, path)}`);
    if (extname(path) === '.ts') {
      const source = readFileSync(path, 'utf8');
      if (source.includes(['--experimental', 'strip-types'].join('-'))) {
        fail(`obsolete experimental TypeScript runtime flag: ${relative(ROOT, path)}`);
      }
      if (relative(ROOT, path).includes('/scripts/') && !source.startsWith('#!/usr/bin/env node\n')) {
        fail(`skill script must use the stable Node shebang: ${relative(ROOT, path)}`);
      }
    }
  }

  for (const name of LEGACY_SKILLS) {
    if (existsSync(join(skillsDirectory, name))) fail(`forbidden legacy skill directory: ${name}`);
  }

  console.log(`repository structure: OK (${allFiles.length} files)`);
}

try {
  main();
} catch (error: unknown) {
  console.error(`ERROR: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
