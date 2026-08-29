/**
 * The benchmark manifest is a repository contract. These tests hold the
 * validator to it on throwaway repositories: an advertised example or showcase
 * without a case is a failure, an orphan case is a failure, a prompt edit
 * changes the fingerprint, and the committed surface validates clean.
 */
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import {
  canonicalJson, extractFencedPrompt, fingerprintCase, hasPromptHeading, loadCatalogue, validateBenchmark,
} from '../tools/benchmark/manifest.ts';
import type { BenchmarkCase, Rubric } from '../tools/benchmark/manifest.ts';
import { scoreRepeat } from '../tools/benchmark/score.ts';

const ROOT = resolve(import.meta.dirname, '..');

function write(root: string, relativePath: string, content: string): void {
  const path = join(root, relativePath);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

const COMMAND_CONTRACT = [
  '---', 'id: CMD', 'skill: SKILL', '---', '# CMD', '## Purpose', 'x', '## Inputs', 'x', '## Outputs', 'x',
  '## Preconditions', 'x', '## Invariants', 'x', '## Forbidden behaviour', 'x', '## Failure routing', 'x', '## Evaluation hooks', 'x', '',
].join('\n');

const README_WITH_PROMPT = '# Example\n\n## Prompt\n\n```text\nUse video-production to make a thing.\n```\n\n## What happened\n\nnothing yet\n';

interface Options {
  readonly examples?: readonly string[];
  readonly showcases?: readonly string[];
  readonly cases?: readonly Record<string, unknown>[];
  readonly evalCases?: readonly Record<string, unknown>[];
  readonly exempt?: Readonly<Record<string, string>>;
}

/** A minimal repository: one skill with one command, plus whatever the test asks for. */
function repository(options: Options = {}): string {
  const root = mkdtempSync(join(tmpdir(), 'vps-manifest-'));
  write(root, 'skills/video-production/SKILL.md', '---\nname: video-production\n---\n');
  write(root, 'skills/video-production/commands/generate-shot.md', COMMAND_CONTRACT.replaceAll('CMD', 'generate-shot').replaceAll('SKILL', 'video-production'));
  write(root, 'skills/video-production/evals/evals.json', JSON.stringify({
    skill: 'video-production',
    cases: options.evalCases ?? [
      { id: 'n', class: 'normal', command: 'generate-shot', given: 'x', expect: ['y'] },
      { id: 'b', class: 'failure-boundary', command: 'generate-shot', given: 'x', expect: ['y'] },
    ],
  }));
  for (const name of options.examples ?? []) write(root, `examples/${name}/README.md`, README_WITH_PROMPT);
  for (const slug of options.showcases ?? []) write(root, `extension-packs/${slug}/README.md`, README_WITH_PROMPT);

  const rubrics = ['diagnostic', 'video-quality', 'pack-adherence', 'pack-authoring'];
  for (const id of rubrics) {
    write(root, `benchmarks/rubrics/${id}.json`, readFileSync(join(ROOT, 'benchmarks/rubrics', `${id}.json`), 'utf8'));
  }
  write(root, 'benchmarks/manifest.json', JSON.stringify({
    schema: 'vps-benchmark-manifest/1',
    suites: {
      diagnostic: { description: 'd', measures: ['detection'] },
      production: { description: 'p', measures: ['video-quality'] },
      packs: { description: 'k', measures: ['pack-adherence'] },
      'pack-authoring': { description: 'a', measures: ['pack-authoring'] },
    },
    rubrics: Object.fromEntries(rubrics.map((id) => [id, `rubrics/${id}.json`])),
    diagnostic: {
      closedCriteria: ['spatial-continuity'],
      transcripts: 'tests/fixtures/defects/transcripts',
      baseline: 'tests/fixtures/defects/baseline.json',
      exampleRoot: 'examples/none',
      visionModel: 'test-model',
    },
    coverage: {
      examples: { root: 'examples', promptHeading: 'Prompt', exclude: [] },
      showcases: { root: 'extension-packs', promptHeading: 'Prompt', caseIdPrefix: 'packs-' },
      commands: { normalClasses: ['normal', 'draft', 'refinement', 'final'], boundaryClasses: ['failure-boundary'], exempt: options.exempt ?? {} },
    },
    tiers: { core: ['diagnostic', 'production'], catalogue: ['packs', 'pack-authoring'] },
  }));
  for (const entry of options.cases ?? []) {
    write(root, `benchmarks/cases/${String(entry.suite)}/${String(entry.id)}.json`, JSON.stringify(entry));
  }
  return root;
}

function productionCase(example: string): Record<string, unknown> {
  return {
    id: `production-${example}`, suite: 'production', capability: 'video-quality', summary: 's',
    skills: ['video-production'], rubric: 'video-quality',
    execution: { kind: 'generation', collector: 'host', paid: true },
    example, promptSource: { path: `examples/${example}/README.md`, heading: 'Prompt' },
    requiredDimensions: ['instruction-adherence'],
  };
}

function packsCase(slug: string): Record<string, unknown> {
  return {
    id: `packs-${slug}`, suite: 'packs', capability: 'pack-adherence', summary: 's',
    skills: ['video-production'], rubric: 'pack-adherence',
    execution: { kind: 'generation', collector: 'host', paid: true },
    pack: slug, promptSource: { path: `extension-packs/${slug}/README.md`, heading: 'Prompt' },
  };
}

function errorsOf(root: string): readonly string[] {
  return validateBenchmark(root).errors;
}

// ------------------------------------------------------------------ helpers

test('canonicalJson is independent of key order', () => {
  assert.equal(canonicalJson({ b: 1, a: [{ d: 2, c: 3 }] }), canonicalJson({ a: [{ c: 3, d: 2 }], b: 1 }));
});

test('extractFencedPrompt returns the first fence under the heading and nothing else', () => {
  assert.equal(extractFencedPrompt(README_WITH_PROMPT, 'Prompt'), 'Use video-production to make a thing.');
  assert.equal(extractFencedPrompt('# X\n\n## Prompt\n\nno fence here\n', 'Prompt'), null);
  assert.equal(extractFencedPrompt('# X\n\n## Other\n\n```\nx\n```\n', 'Prompt'), null);
  assert.equal(extractFencedPrompt('## Prompt\n\n```text\n```\n', 'Prompt'), null, 'an empty fence is not a prompt');
  assert.equal(hasPromptHeading(README_WITH_PROMPT, 'Prompt'), true);
});

// ---------------------------------------------------------------- coverage

test('a clean minimal repository validates', () => {
  assert.deepEqual(errorsOf(repository()), []);
});

test('an example that advertises a prompt without a production case is an error', () => {
  const errors = errorsOf(repository({ examples: ['demo'] }));
  assert.ok(errors.some((line) => /examples\/demo\/README\.md advertises a prompt but has no production benchmark case/.test(line)), errors.join('\n'));
  assert.deepEqual(errorsOf(repository({ examples: ['demo'], cases: [productionCase('demo')] })), []);
});

test('a production case whose example does not advertise a prompt is an orphan', () => {
  const root = repository({ cases: [productionCase('ghost')] });
  const errors = errorsOf(root);
  assert.ok(errors.some((line) => /promptSource examples\/ghost\/README\.md does not exist/.test(line)), errors.join('\n'));
  assert.ok(errors.some((line) => /production case production-ghost points at an example that does not advertise a prompt/.test(line)));
});

test('a showcase without a packs case fails; an absent extension-packs directory is zero showcases', () => {
  const absent = validateBenchmark(repository());
  assert.equal(absent.report?.showcases.present, false);
  assert.deepEqual(absent.errors, []);

  const missing = errorsOf(repository({ showcases: ['demo-pack'] }));
  assert.ok(missing.some((line) => /extension-packs\/demo-pack\/README\.md is a showcase with no packs benchmark case/.test(line)), missing.join('\n'));

  assert.deepEqual(errorsOf(repository({ showcases: ['demo-pack'], cases: [packsCase('demo-pack')] })), []);

  const orphan = errorsOf(repository({ cases: [packsCase('gone')] }));
  assert.ok(orphan.some((line) => /packs case packs-gone points at a pack with no showcase/.test(line)), orphan.join('\n'));
});

test('the extension-pack manifest must cross-reference the packs case', () => {
  const root = repository({ showcases: ['demo-pack'], cases: [packsCase('demo-pack')] });
  write(root, 'extension-packs/manifest.json', JSON.stringify({ packs: [{ slug: 'demo-pack', benchmarkCase: 'wrong-id' }] }));
  const errors = errorsOf(root);
  assert.ok(errors.some((line) => /benchmarkCase must be "packs-demo-pack"/.test(line)), errors.join('\n'));
});

test('a command without a normal-side or boundary eval case is a gap unless exempted with a reason', () => {
  const gap = errorsOf(repository({ evalCases: [{ id: 'n', class: 'normal', command: 'generate-shot', given: 'x', expect: ['y'] }] }));
  assert.ok(gap.some((line) => /command video-production\/generate-shot: no boundary eval case/.test(line)), gap.join('\n'));

  const exempt = validateBenchmark(repository({
    evalCases: [{ id: 'n', class: 'normal', command: 'generate-shot', given: 'x', expect: ['y'] }],
    exempt: { 'video-production/generate-shot': 'boundary behaviour is covered by the stage test' },
  }));
  assert.deepEqual(exempt.errors, []);
  assert.equal(exempt.report?.commands[0]?.state, 'EXEMPT');
});

test('a case naming a missing skill, command, rubric or dimension is refused', () => {
  const bad = {
    ...productionCase('demo'),
    skills: ['no-such-skill'], commands: ['video-production/no-such-command'], requiredDimensions: ['no-such-dimension'], hardGates: ['no-such-gate'],
  };
  const errors = errorsOf(repository({ examples: ['demo'], cases: [bad] }));
  for (const pattern of [/skill "no-such-skill" does not exist/, /has no contract file/, /requiredDimensions names "no-such-dimension"/, /hardGates names "no-such-gate"/]) {
    assert.ok(errors.some((line) => pattern.test(line)), `${pattern.source}\n${errors.join('\n')}`);
  }
});

test('a case file whose name disagrees with its id is refused', () => {
  const root = repository({ examples: ['demo'] });
  write(root, 'benchmarks/cases/production/misnamed.json', JSON.stringify(productionCase('demo')));
  const errors = errorsOf(root);
  assert.ok(errors.some((line) => /must equal the file name/.test(line)), errors.join('\n'));
});

// ------------------------------------------------------------- fingerprints

test('editing the advertised prompt changes the case fingerprint', () => {
  const root = repository({ examples: ['demo'], cases: [productionCase('demo')] });
  const before = fingerprintCase(loadCatalogue(root), loadCatalogue(root).cases[0] as never).value;
  write(root, 'examples/demo/README.md', README_WITH_PROMPT.replace('make a thing', 'make a different thing'));
  const after = fingerprintCase(loadCatalogue(root), loadCatalogue(root).cases[0] as never).value;
  assert.notEqual(before, after);
});

test('editing a bound command contract changes the fingerprint; an unbound case is unaffected', () => {
  const bound = { ...productionCase('demo'), id: 'production-demo', commands: ['video-production/generate-shot'], execution: { kind: 'generation', collector: 'host', paid: true, bindContracts: true } };
  const root = repository({ examples: ['demo'], cases: [bound] });
  const read = (): string => fingerprintCase(loadCatalogue(root), loadCatalogue(root).cases[0] as never).value;
  const before = read();
  write(root, 'skills/video-production/commands/generate-shot.md', `${COMMAND_CONTRACT.replaceAll('CMD', 'generate-shot').replaceAll('SKILL', 'video-production')}\nchanged\n`);
  assert.notEqual(read(), before);
});

// ----------------------------------------------------------------- scoring

test('scoreRepeat treats a missing hard gate as a failure and never sums dimensions', () => {
  const catalogue = loadCatalogue(ROOT);
  const rubric = catalogue.rubrics.get('video-quality');
  const entry = catalogue.cases.find((candidate) => candidate.id === 'production-level-1-mechanical-watch-hero');
  assert.ok(rubric !== undefined && entry !== undefined);
  const verdict = scoreRepeat(rubric, entry, { index: 0, gates: {}, dimensions: { 'instruction-adherence': 3 } });
  assert.equal(verdict.ready, false);
  assert.ok(verdict.reasons.some((reason) => reason === 'gate approved-decision-preservation unscored'));
  assert.equal(verdict.dimensions['instruction-adherence'], 3);
});

const ALL_AXES = { detection: true, evidence: true, routing: true, scope: true, preservation: true, boundary: true, precision: true } as const;

function diagnosticFixture(): { rubric: Rubric; entry: BenchmarkCase } {
  const catalogue = loadCatalogue(ROOT);
  const rubric = catalogue.rubrics.get('diagnostic');
  const entry = catalogue.cases.find((candidate) => candidate.id === 'scope-single-failing-shot');
  assert.ok(rubric !== undefined && entry !== undefined);
  return { rubric, entry };
}

test('a case that declares expectedRouting fails when the result records no route, whatever the reviewer said', () => {
  const { rubric, entry } = diagnosticFixture();
  const verdict = scoreRepeat(rubric, entry, { index: 0, axes: ALL_AXES });
  assert.equal(verdict.ready, false);
  assert.ok(verdict.reasons.some((reason) => /routing not recorded/.test(reason)), verdict.reasons.join('\n'));
});

test('maxScope is scored: an absent or wider recorded scope fails, a matching one passes', () => {
  const { rubric, entry } = diagnosticFixture();
  const route = { owningArtifact: 'video_shot', correctiveAction: 'retry-execution' };
  const absent = scoreRepeat(rubric, entry, { index: 0, axes: ALL_AXES, routing: route });
  assert.equal(absent.ready, false);
  assert.ok(absent.reasons.some((reason) => /scope not recorded/.test(reason)), absent.reasons.join('\n'));
  const wider = scoreRepeat(rubric, entry, { index: 0, axes: ALL_AXES, routing: { ...route, scope: 'the whole production' } });
  assert.equal(wider.ready, false);
  assert.ok(wider.reasons.some((reason) => /scope expected "SH02 only"/.test(reason)), wider.reasons.join('\n'));
  const exact = scoreRepeat(rubric, entry, { index: 0, axes: ALL_AXES, routing: { ...route, scope: ' sh02  only ' } });
  assert.equal(exact.ready, true, exact.reasons.join('\n'));
});

// --------------------------------------------------------------- committed

test('the committed benchmark surface validates and covers every advertised example', () => {
  const result = validateBenchmark(ROOT);
  assert.deepEqual(result.errors, []);
  assert.ok(result.report !== null);
  assert.equal(result.report.examples.missing.length, 0);
  assert.equal(result.report.examples.orphans.length, 0);
  assert.ok(result.report.examples.withPrompt.length > 0);
  assert.ok(result.report.commands.every((row) => row.state !== 'GAP'), 'every command has normal and boundary coverage or a recorded exemption');
  assert.ok(result.report.suites.diagnostic >= 21, 'the migrated diagnostic cases are all present');
});
