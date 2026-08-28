import { cpSync, existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS = ['video-production', 'video-evaluate'] as const;
const AGENTS = [
  { name: 'claude-code', skillsDir: '.claude/skills' },
  { name: 'codex', skillsDir: '.agents/skills' },
] as const;

function referencedLocalResources(skillMarkdown: string): readonly string[] {
  return [...skillMarkdown.matchAll(/`((?:references|scripts|evals)\/[^`]+)`/g)]
    .map((match) => match[1])
    .filter((value): value is string => value !== undefined);
}

/**
 * docs/03 §20 requires that repository-level docs are not runtime dependencies
 * of an installed skill. A backticked path into docs/, examples/, or a parent
 * directory is exactly such a dependency, and the resource sweep above cannot
 * see it because it only matches skill-local prefixes.
 */
function repositoryLevelReferences(skillMarkdown: string): readonly string[] {
  return [...skillMarkdown.matchAll(/`((?:docs|examples|\.\.)\/[^`]*)`/g)]
    .map((match) => match[1])
    .filter((value): value is string => value !== undefined);
}

for (const agent of AGENTS) {
  for (const skill of SKILLS) {
    test(`${skill} is self-contained when copied for ${agent.name}`, () => {
      const consumer = mkdtempSync(join(tmpdir(), `video-skills-${agent.name}-`));
      try {
        const targetRoot = join(consumer, agent.skillsDir, skill);
        mkdirSync(dirname(targetRoot), { recursive: true });
        cpSync(join(ROOT, 'skills', skill), targetRoot, { recursive: true });

        for (const required of ['SKILL.md', 'references', 'scripts', 'evals'] as const) {
          assert.ok(existsSync(join(targetRoot, required)), `missing installed resource: ${required}`);
        }

        const skillMarkdown = readFileSync(join(targetRoot, 'SKILL.md'), 'utf8');
        for (const resource of referencedLocalResources(skillMarkdown)) {
          assert.ok(!resource.includes('..'), `skill-local reference escapes installed root: ${resource}`);
          assert.ok(existsSync(join(targetRoot, resource)), `broken installed reference: ${resource}`);
        }

        assert.deepEqual(
          repositoryLevelReferences(skillMarkdown),
          [],
          'an installed skill must not depend on repository-level docs, examples, or parent paths',
        );

        const scriptsDir = join(targetRoot, 'scripts');
        const scripts = readdirSync(scriptsDir)
          .filter((entry) => entry.endsWith('.ts'))
          .sort();
        assert.ok(scripts.length > 0, 'expected at least one installed TypeScript script');

        for (const script of scripts) {
          const result = spawnSync(process.execPath, [join(scriptsDir, script), '--help'], {
            encoding: 'utf8',
            env: process.env,
          });
          assert.equal(
            result.status,
            0,
            `${script} --help failed: ${result.stderr || result.stdout}`,
          );
        }
      } finally {
        rmSync(consumer, { recursive: true, force: true });
      }
    });
  }
}
