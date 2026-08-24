/**
 * Stage: the defect benchmark itself.
 *
 * The benchmark measures whether evaluation catches known defects. These tests
 * measure whether the benchmark measures anything — that it detects seeded
 * defects, leaves clean controls alone, notices a regression against a baseline,
 * and never reports a semantic score it did not actually obtain.
 */
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { isRecord, parseJson, runScript } from './harness.ts';

const SCRIPT = 'tools/run-benchmark.ts';

interface CaseRow {
  readonly id: string;
  readonly deterministic?: boolean;
  readonly skipped?: string;
}

function results(args: readonly string[] = []): readonly CaseRow[] {
  const result = runScript(SCRIPT, ['--json', ...args]);
  const parsed = parseJson(result.stdout);
  assert.ok(isRecord(parsed), result.stderr);
  const rows = parsed.results;
  assert.ok(Array.isArray(rows));
  return rows.filter(isRecord) as unknown as readonly CaseRow[];
}

function workspace(): string {
  return mkdtempSync(join(tmpdir(), 'vps-benchmark-'));
}

/** A taxonomy whose single case cannot pass: the clean scene has no findings. */
function impossibleTaxonomy(directory: string): string {
  const path = join(directory, 'taxonomy.json');
  writeFileSync(
    path,
    JSON.stringify({
      criteria: [],
      cases: [
        {
          id: 'deliberately-unsatisfiable',
          class: 'continuity',
          tier: 'deterministic',
          summary: 'expects a rule the clean scene will never produce',
          checker: 'continuity',
          scene: 'clean',
          expect: { rule: 'rule-that-does-not-exist' },
        },
      ],
    }),
  );
  return path;
}

test('every seeded defect is detected and the suite passes', () => {
  const outcome = runScript(SCRIPT, []);
  assert.equal(outcome.status, 0, outcome.stdout + outcome.stderr);

  const deterministic = results().filter((row) => row.deterministic !== undefined);
  assert.ok(deterministic.length >= 10, 'the benchmark should carry a meaningful number of cases');
  assert.deepEqual(
    deterministic.filter((row) => row.deterministic === false).map((row) => row.id),
    [],
    'no seeded defect may go undetected',
  );
});

test('clean controls are not flagged', () => {
  const controls = results().filter((row) => row.id.includes('control'));
  assert.ok(controls.length > 0, 'the benchmark must carry clean controls');

  for (const control of controls) {
    if (control.deterministic === undefined) continue;
    assert.equal(control.deterministic, true, `${control.id} produced a false positive`);
  }
});

test('a case that cannot pass fails the run', () => {
  const directory = workspace();
  const outcome = runScript(SCRIPT, ['--taxonomy', impossibleTaxonomy(directory), '--baseline', join(directory, 'none.json')]);
  assert.equal(outcome.status, 1, 'an undetected defect must fail the benchmark');
  assert.match(outcome.stdout, /MISS/);
});

test('a case that used to pass and now fails is reported as a regression', () => {
  const directory = workspace();
  const baseline = join(directory, 'baseline.json');
  writeFileSync(baseline, JSON.stringify({ cases: { 'deliberately-unsatisfiable': { deterministic: true } } }));

  const outcome = runScript(SCRIPT, ['--taxonomy', impossibleTaxonomy(directory), '--baseline', baseline]);
  assert.equal(outcome.status, 1);
  assert.match(outcome.stdout, /REGRESSION: deliberately-unsatisfiable\.deterministic/);
});

test('the baseline is only written when asked for', () => {
  const directory = workspace();
  const baseline = join(directory, 'baseline.json');

  runScript(SCRIPT, ['--only', 'generation', '--baseline', baseline]);
  assert.throws(() => readFileSync(baseline, 'utf8'), 'a plain run must not write a baseline');

  const outcome = runScript(SCRIPT, ['--only', 'generation', '--baseline', baseline, '--update-baseline']);
  assert.equal(outcome.status, 0, outcome.stderr);

  const parsed = parseJson(readFileSync(baseline, 'utf8'));
  assert.ok(isRecord(parsed) && isRecord(parsed.cases));
  assert.ok(Object.keys(parsed.cases).length > 0, 'the written baseline must record the measured cases');
});

/**
 * A semantic score that was never obtained must never look like a pass. This is
 * the standing rule that a stage which cannot run skips loudly.
 */
test('the semantic tier reports not run rather than passing quietly', () => {
  const outcome = runScript(SCRIPT, []);
  assert.match(outcome.stdout, /semantic\s+NOT RUN/);

  const semantic = results().filter((row) => row.skipped !== undefined);
  assert.ok(semantic.length > 0, 'semantic cases must be reported as skipped, not omitted');
  for (const row of semantic) {
    assert.equal(row.deterministic, undefined, 'a skipped case must not carry a score');
  }
});

test('a class filter narrows the run', () => {
  const only = results(['--only', 'generation']);
  assert.ok(only.length > 0);
  assert.ok(only.every((row) => row.id.startsWith('generation-')), 'filter must exclude other classes');
});
