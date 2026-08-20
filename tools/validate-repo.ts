#!/usr/bin/env -S node --experimental-strip-types
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REQUIRED_DOCS = [
  'docs/01-creative-skills-system-spec.md',
  'docs/02-creative-skills-workflows-and-artifacts-spec.md',
  'docs/03-creative-skills-repository-and-contracts-spec.md',
  'docs/extraction-candidates.md',
];
const REQUIRED_SKILLS = ['video-production', 'video-evaluate'];
const LEGACY_SKILLS = [
  'replicate-generate',
  'replicate-character',
  'replicate-product',
  'replicate-video',
  'replicate-ugc',
  'replicate-evaluate',
];

function fail(message: string): never {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

function walk(directory: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(directory)) {
    if (entry === '.git' || entry === 'node_modules') continue;
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) results.push(...walk(path));
    else results.push(path);
  }
  return results;
}

for (const relativePath of REQUIRED_DOCS) {
  if (!existsSync(join(ROOT, relativePath))) fail(`missing ${relativePath}`);
}

const skillsDirectory = join(ROOT, 'skills');
const actualSkills = readdirSync(skillsDirectory)
  .filter((name) => statSync(join(skillsDirectory, name)).isDirectory())
  .sort();
if (JSON.stringify(actualSkills) !== JSON.stringify([...REQUIRED_SKILLS].sort())) {
  fail(`expected skills ${REQUIRED_SKILLS.join(', ')}, found ${actualSkills.join(', ')}`);
}

for (const name of REQUIRED_SKILLS) {
  const skillFile = join(skillsDirectory, name, 'SKILL.md');
  const text = readFileSync(skillFile, 'utf8');
  if (!text.startsWith('---\n')) fail(`${skillFile}: missing frontmatter`);
  const frontmatter = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!frontmatter) fail(`${skillFile}: invalid frontmatter block`);
  if (!frontmatter[1].includes(`name: ${name}`)) fail(`${skillFile}: frontmatter name mismatch`);
  if (!frontmatter[1].includes('description:')) fail(`${skillFile}: missing description`);

  const evalFile = join(skillsDirectory, name, 'evals', 'evals.json');
  const data = JSON.parse(readFileSync(evalFile, 'utf8')) as { cases?: Array<{ class?: string }> };
  const classes = new Set((data.cases ?? []).map((entry) => entry.class));
  for (const required of ['normal', 'draft', 'refinement', 'final', 'failure-boundary']) {
    if (!classes.has(required)) fail(`${evalFile}: missing eval class ${required}`);
  }
}

for (const path of walk(ROOT)) {
  if (extname(path) === '.json') JSON.parse(readFileSync(path, 'utf8'));
}

for (const name of LEGACY_SKILLS) {
  if (existsSync(join(skillsDirectory, name))) fail(`forbidden legacy skill directory: ${name}`);
}

console.log('repository structure: OK');
