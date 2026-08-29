/**
 * Stage: the defect benchmark itself.
 *
 * The benchmark measures whether evaluation catches known defects. These tests
 * measure whether the benchmark measures anything — that it detects seeded
 * defects, leaves clean controls alone, notices a regression against a baseline,
 * and never reports a semantic score it did not actually obtain.
 */
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { ROOT, isRecord, parseJson, runScript } from './harness.ts';

const SCRIPT = 'tools/run-benchmark.ts';

interface CaseRow {
  readonly id: string;
  readonly tier?: string;
  readonly deterministic?: boolean;
  readonly open?: boolean;
  readonly closedDetection?: boolean;
  readonly closedPrecision?: boolean;
  readonly closed?: boolean;
  readonly rates?: Record<string, string>;
  readonly unstable?: boolean;
  readonly skipped?: string;
}

function rowsOf(result: { readonly stdout: string; readonly stderr: string }): readonly CaseRow[] {
  const parsed = parseJson(result.stdout);
  assert.ok(isRecord(parsed), result.stderr);
  const rows = parsed.results;
  assert.ok(Array.isArray(rows));
  return rows.filter(isRecord) as unknown as readonly CaseRow[];
}

function results(args: readonly string[] = []): readonly CaseRow[] {
  return rowsOf(runScript(SCRIPT, ['--json', ...args]));
}

/**
 * A full deterministic run scores every fixture through its owning checker,
 * which is the expensive part of this file. The run is pure — nothing here
 * writes to the repository — so one run serves every test that reads it.
 */
let fullRunCache: { readonly plain: ReturnType<typeof runScript>; readonly rows: readonly CaseRow[] } | null = null;

function fullRun(): { readonly plain: ReturnType<typeof runScript>; readonly rows: readonly CaseRow[] } {
  if (fullRunCache === null) {
    fullRunCache = { plain: runScript(SCRIPT, []), rows: rowsOf(runScript(SCRIPT, ['--json'])) };
  }
  return fullRunCache;
}

function workspace(): string {
  return mkdtempSync(join(tmpdir(), 'vps-benchmark-'));
}

const REAL_MANIFEST = join(ROOT, 'benchmarks/manifest.json');

/**
 * A throwaway benchmark surface: a manifest, the real diagnostic rubric, and
 * the given legacy diagnostic cases. Transcripts and baseline live beside it
 * so nothing a test writes can touch the committed evidence.
 */
function writeManifest(directory: string, criteria: readonly string[], cases: readonly Record<string, unknown>[]): string {
  const manifest = join(directory, 'manifest.json');
  const real = parseJson(readFileSync(REAL_MANIFEST, 'utf8'));
  assert.ok(isRecord(real));
  mkdirSync(join(directory, 'cases', 'diagnostic'), { recursive: true });
  writeFileSync(
    manifest,
    JSON.stringify({
      ...real,
      rubrics: { diagnostic: join(ROOT, 'benchmarks/rubrics/diagnostic.json') },
      diagnostic: {
        closedCriteria: criteria,
        transcripts: join(directory, 'transcripts'),
        baseline: join(directory, 'baseline.json'),
        exampleRoot: 'examples/level-2-missed-connection',
        visionModel: 'google/gemini-3-pro',
      },
    }),
  );
  for (const entry of cases) {
    const legacy = {
      suite: 'diagnostic', capability: 'detection', skills: ['video-evaluate'], rubric: 'diagnostic',
      execution: entry.tier === 'deterministic'
        ? { kind: 'deterministic', collector: 'runner', paid: false }
        : { kind: 'semantic', collector: 'runner', paid: true, provider: 'replicate' },
      ...entry,
    };
    writeFileSync(join(directory, 'cases', 'diagnostic', `${String(entry.id)}.json`), JSON.stringify(legacy));
  }
  return manifest;
}

/** A manifest whose single case cannot pass: the clean scene has no findings. */
function impossibleManifest(directory: string): string {
  return writeManifest(directory, [], [
    {
      id: 'deliberately-unsatisfiable',
      class: 'continuity',
      tier: 'deterministic',
      summary: 'expects a rule the clean scene will never produce',
      checker: 'continuity',
      scene: 'clean',
      expect: { rule: 'rule-that-does-not-exist' },
    },
  ]);
}

test('every seeded defect is detected and the suite passes', () => {
  const outcome = fullRun().plain;
  assert.equal(outcome.status, 0, outcome.stdout + outcome.stderr);

  const deterministic = fullRun().rows.filter((row) => row.deterministic !== undefined);
  assert.ok(deterministic.length >= 10, 'the benchmark should carry a meaningful number of cases');
  assert.deepEqual(
    deterministic.filter((row) => row.deterministic === false).map((row) => row.id),
    [],
    'no seeded defect may go undetected',
  );
});

test('clean controls are not flagged', () => {
  const controls = fullRun().rows.filter((row) => row.id.includes('control'));
  assert.ok(controls.length > 0, 'the benchmark must carry clean controls');

  for (const control of controls) {
    if (control.deterministic === undefined) continue;
    assert.equal(control.deterministic, true, `${control.id} produced a false positive`);
  }
});

test('a case that cannot pass fails the run', () => {
  const directory = workspace();
  const outcome = runScript(SCRIPT, ['--manifest', impossibleManifest(directory)]);
  assert.equal(outcome.status, 1, 'an undetected defect must fail the benchmark');
  assert.match(outcome.stdout, /MISS/);
});

test('a case that used to pass and now fails is reported as a regression', () => {
  const directory = workspace();
  const baseline = join(directory, 'baseline.json');
  writeFileSync(baseline, JSON.stringify({ cases: { 'deliberately-unsatisfiable': { deterministic: true } } }));

  const outcome = runScript(SCRIPT, ['--manifest', impossibleManifest(directory), '--baseline', baseline]);
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
  const outcome = fullRun().plain;
  assert.match(outcome.stdout, /semantic\s+NOT RUN/);

  const semantic = fullRun().rows.filter((row) => row.skipped !== undefined);
  assert.ok(semantic.length > 0, 'semantic cases must be reported as skipped, not omitted');
  for (const row of semantic) {
    assert.equal(row.deterministic, undefined, 'a skipped case must not carry a score');
  }
});

/**
 * Cases a host agent collects are never executed by the runner. They must
 * still appear in the run, as NOT RUN, so the catalogue never reads as green
 * for a case nobody measured.
 */
test('host-agent cases are reported NOT RUN, never scored', () => {
  const outcome = fullRun().plain;
  assert.match(outcome.stdout, /host-agent\s+\d+ case\(s\) NOT RUN/);
  const host = fullRun().rows.filter((row) => row.tier === 'host');
  assert.ok(host.length > 0, 'host cases must be listed');
  for (const row of host) {
    assert.match(String(row.skipped), /NOT RUN/);
    assert.equal(row.deterministic, undefined);
    assert.equal(row.closed, undefined);
  }
});

/**
 * The diagnostic suite points five semantic cases at real artifacts from the
 * failed run. The transcript key is a path descriptor, not a content hash, so
 * deleting the images leaves --rescore green while making re-collection
 * impossible — exactly how the seven stills once vanished without anything
 * noticing.
 */
test('every case-referenced example image exists on disk', () => {
  const directory = join(ROOT, 'benchmarks/cases/diagnostic');
  const referenced: string[] = [];
  for (const file of readdirSync(directory)) {
    const entry = parseJson(readFileSync(join(directory, file), 'utf8'));
    if (!isRecord(entry)) continue;
    const images = Array.isArray(entry.images) ? entry.images : [];
    for (const spec of images.filter(isRecord)) {
      if (typeof spec.example === 'string') referenced.push(spec.example);
    }
  }
  assert.ok(referenced.length > 0, 'the diagnostic suite is expected to score against real artifacts');

  const missing = referenced.filter(
    (path) => !existsSync(join(ROOT, 'examples/level-2-missed-connection', path)),
  );
  assert.deepEqual(missing, [], 'benchmark evidence must not be deleted out from under the cases');
});

/**
 * A transcript collector's shell exports the opt-in variables. The harness must
 * not let them leak into test subprocesses, or `npm test` on that machine turns
 * into a paid collection run.
 */
test('the semantic opt-in does not leak from the ambient environment', () => {
  const saved = {
    RUN_SEMANTIC_BENCHMARK: process.env.RUN_SEMANTIC_BENCHMARK,
    REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN,
  };
  process.env.RUN_SEMANTIC_BENCHMARK = '1';
  process.env.REPLICATE_API_TOKEN = 'deliberately-unused';
  try {
    const outcome = runScript(SCRIPT, ['--only', 'continuity']);
    assert.match(outcome.stdout, /semantic\s+NOT RUN/, 'ambient credentials must not start a collection');
    const skipped = results(['--only', 'continuity']).filter((row) => row.skipped !== undefined && row.tier === 'semantic');
    assert.ok(skipped.length > 0);
    for (const row of skipped) {
      assert.match(String(row.skipped), /semantic tier not requested/);
    }
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test('a class filter narrows the run', () => {
  const only = results(['--only', 'generation']);
  assert.ok(only.length > 0);
  assert.ok(only.every((row) => row.id.startsWith('generation-')), 'filter must exclude other classes');
});

test('a class filter that matches nothing is an error, not a green run', () => {
  const outcome = runScript(SCRIPT, ['--only', 'genration']);
  assert.equal(outcome.status, 2, 'a run over zero cases must not exit clean');
  assert.match(outcome.stderr, /matches no case class/);
  assert.match(outcome.stderr, /generation/, 'the error should list the known classes');
});

test('a case or suite filter that matches nothing is an error', () => {
  assert.equal(runScript(SCRIPT, ['--case', 'no-such-case']).status, 2);
  assert.equal(runScript(SCRIPT, ['--suite', 'no-such-suite']).status, 2);
  const one = results(['--case', 'generation-periodic-seams']);
  assert.deepEqual(one.map((row) => row.id), ['generation-periodic-seams']);
});

// ---------------------------------------------------------------- catalogue

test('--list names every case once with its fingerprint and baseline state', () => {
  const outcome = runScript(SCRIPT, ['--list', '--json']);
  assert.equal(outcome.status, 0, outcome.stderr);
  const parsed = parseJson(outcome.stdout);
  assert.ok(isRecord(parsed) && Array.isArray(parsed.cases));
  const rows = parsed.cases.filter(isRecord);
  const ids = rows.map((row) => String(row.id));
  assert.equal(new Set(ids).size, ids.length, 'every case is listed exactly once');
  assert.ok(ids.includes('generation-periodic-seams'));
  assert.ok(ids.some((id) => id.startsWith('production-')), 'production cases are catalogued');
  for (const row of rows) {
    assert.match(String(row.fingerprint), /^[0-9a-f]{16}$/);
    assert.ok(row.baseline === 'MEASURED' || row.baseline === 'UNMEASURED');
  }
  const measured = rows.filter((row) => row.baseline === 'MEASURED').map((row) => String(row.id));
  assert.ok(measured.includes('continuity-pillar-real'), 'historical evidence counts as measured');
  assert.ok(!measured.some((id) => id.startsWith('production-')), 'no baseline is fabricated for unmeasured surfaces');
});

test('--list is deterministic across invocations', () => {
  const first = runScript(SCRIPT, ['--list', '--json']).stdout;
  const second = runScript(SCRIPT, ['--list', '--json']).stdout;
  assert.equal(first, second, 'fingerprints must not depend on run-time state');
});

test('--prepare emits the exact prompt, the rubric and the fingerprint', () => {
  const outcome = runScript(SCRIPT, ['--prepare', 'routing-pacing-to-edit']);
  assert.equal(outcome.status, 0, outcome.stderr);
  const bundle = parseJson(outcome.stdout);
  assert.ok(isRecord(bundle) && isRecord(bundle.rubric) && isRecord(bundle.resultTemplate));
  assert.equal(bundle.rubric.id, 'diagnostic');
  assert.match(String(bundle.fingerprint), /^[0-9a-f]{64}$/);
  assert.match(String(bundle.prompt), /Diagnose/);
  assert.ok(isRecord(bundle.contracts) && Object.keys(bundle.contracts).length > 0, 'a contract-bound case lists its contract digests');
  assert.equal(runScript(SCRIPT, ['--prepare', 'no-such-case']).status, 2);
});

// ------------------------------------------------------------------ --score
//
// A host agent records what it observed as a structured result; scoring it is
// offline and free. The committed fixtures prove the scorer reads readiness
// the way docs/04 defines it.

function scoreFixture(name: string): { status: number | null; stdout: string } {
  const outcome = runScript(SCRIPT, ['--score', join(ROOT, 'benchmarks/fixtures', name)]);
  return { status: outcome.status, stdout: outcome.stdout };
}

test('the passing scorer fixture is READY on every repeat', () => {
  const outcome = scoreFixture('scorer-pass.json');
  assert.equal(outcome.status, 0, outcome.stdout);
  assert.match(outcome.stdout, /UNBOUND/, 'a fixture without a fingerprint is scored but flagged');
  assert.match(outcome.stdout, /majority READY \(3\/3\)/);
});

test('the failing scorer fixture names each reason and exits non-zero', () => {
  const outcome = scoreFixture('scorer-fail.json');
  assert.equal(outcome.status, 1);
  assert.match(outcome.stdout, /gate technical-integrity failed/);
  assert.match(outcome.stdout, /motion-quality=1 < 2/);
  assert.match(outcome.stdout, /dimension product-fidelity unscored/);
  assert.match(outcome.stdout, /majority NOT READY \(0\/3\)/);
  assert.doesNotMatch(outcome.stdout, /FLAKY/, 'a uniform failure is not flaky');
});

test('a result recorded under a different fingerprint is STALE and refused', () => {
  const directory = workspace();
  const fixture = parseJson(readFileSync(join(ROOT, 'benchmarks/fixtures/scorer-pass.json'), 'utf8'));
  assert.ok(isRecord(fixture));
  const path = join(directory, 'stale.json');
  writeFileSync(path, JSON.stringify({ ...fixture, fingerprint: 'deadbeef' }));
  const outcome = runScript(SCRIPT, ['--score', path]);
  assert.equal(outcome.status, 1);
  assert.match(outcome.stdout, /STALE RESULT/);
});

test('a diagnostic result with the wrong corrective target is not a strict pass', () => {
  const directory = workspace();
  const axes = { detection: true, evidence: true, scope: true, preservation: true, boundary: true, precision: false };
  const path = join(directory, 'routing.json');
  writeFileSync(
    path,
    JSON.stringify({
      schema: 'vps-benchmark-result/1',
      caseId: 'routing-pacing-to-edit',
      repeats: [{ index: 0, axes, routing: { owningArtifact: 'video_shot', correctiveAction: 'retry-execution' } }],
    }),
  );
  const outcome = runScript(SCRIPT, ['--score', path, '--json']);
  assert.equal(outcome.status, 1);
  const parsed = parseJson(outcome.stdout);
  assert.ok(isRecord(parsed) && Array.isArray(parsed.results));
  const report = parsed.results[0];
  assert.ok(isRecord(report) && Array.isArray(report.repeats));
  const repeat = report.repeats[0];
  assert.ok(isRecord(repeat));
  assert.equal(repeat.ready, false);
  assert.match(String(JSON.stringify(repeat.reasons)), /routing expected edit_timeline\/revise-edit/);
  assert.match(String(JSON.stringify(repeat.reasons)), /scope not recorded/);
  assert.equal(repeat.precision, false, 'precision is reported beside the verdict');

  writeFileSync(
    path,
    JSON.stringify({
      schema: 'vps-benchmark-result/1',
      caseId: 'routing-pacing-to-edit',
      repeats: [{ index: 0, axes, routing: { owningArtifact: 'edit_timeline', correctiveAction: 'revise-edit', scope: 'the edit timeline only' } }],
    }),
  );
  assert.equal(runScript(SCRIPT, ['--score', path]).status, 0, 'the right route with imprecision is still a strict pass');
});

test('a malformed result file is a usage error', () => {
  const directory = workspace();
  const path = join(directory, 'bad.json');
  writeFileSync(path, JSON.stringify({ schema: 'nope' }));
  assert.equal(runScript(SCRIPT, ['--score', path]).status, 2);
});

// ------------------------------------------------------------- semantic
//
// The semantic tier used to be untestable: scoring happened inline against a
// live model and the answers were thrown away. Recording transcripts makes the
// *scorer* offline and deterministic, so everything below runs for free. Only
// collecting answers costs money.

const CRITERIA = ['spatial-continuity', 'text-legibility'];

const DEFECT_CASE = {
  id: 'bench-defect',
  class: 'continuity',
  tier: 'semantic',
  summary: 'synthetic defect case',
  images: [{ fixture: 'scene-extra-pillar.png' }],
  context: 'A synthetic case used to test the scorer.',
  criterion: 'spatial-continuity',
  keywords: ['pillar'],
  expect: { detects: true },
};

const CONTROL_CASE = {
  id: 'bench-control',
  class: 'continuity',
  tier: 'semantic',
  summary: 'synthetic clean control',
  images: [{ fixture: 'scene-clean.png' }],
  context: 'A synthetic clean control.',
  expect: { clean: true },
};

interface PromptMeta {
  readonly model: string;
  readonly imagesKey: string;
  readonly open: string;
  readonly closed: string;
}

interface Bench {
  readonly manifest: string;
  readonly transcripts: string;
  readonly baseline: string;
  readonly meta: ReadonlyMap<string, PromptMeta>;
}

function bench(cases: readonly Record<string, unknown>[]): Bench {
  const directory = workspace();
  const manifest = writeManifest(directory, CRITERIA, cases);
  const transcripts = join(directory, 'transcripts');
  mkdirSync(transcripts, { recursive: true });

  // The digests a transcript is keyed on come from the runner itself rather than
  // being reimplemented here; a test that recomputed them would agree with a
  // broken implementation.
  const printed = runScript(SCRIPT, ['--manifest', manifest, '--print-prompts']);
  assert.equal(printed.status, 0, printed.stderr);
  const parsed = parseJson(printed.stdout);
  assert.ok(isRecord(parsed) && Array.isArray(parsed.cases));

  const meta = new Map<string, PromptMeta>();
  for (const entry of parsed.cases.filter(isRecord)) {
    assert.ok(isRecord(entry.prompts) && isRecord(entry.prompts.open) && isRecord(entry.prompts.closed));
    meta.set(String(entry.id), {
      model: String(parsed.model),
      imagesKey: String(entry.imagesKey),
      open: String(entry.prompts.open.sha),
      closed: String(entry.prompts.closed.sha),
    });
  }

  return { manifest, transcripts, baseline: join(directory, 'baseline.json'), meta };
}

function record(
  target: Bench,
  id: string,
  repeats: readonly { open: string; closed: string }[],
  override: Partial<PromptMeta> = {},
): void {
  const meta = target.meta.get(id);
  assert.ok(meta !== undefined, `no prompt metadata for ${id}`);
  writeFileSync(
    join(target.transcripts, `${id}.json`),
    JSON.stringify({
      model: override.model ?? meta.model,
      imagesKey: override.imagesKey ?? meta.imagesKey,
      prompts: { open: override.open ?? meta.open, closed: override.closed ?? meta.closed },
      repeats: repeats.map((repeat, index) => ({ index, ...repeat })),
    }),
  );
}

function rescore(target: Bench, args: readonly string[] = []): { rows: readonly CaseRow[]; status: number | null; stdout: string } {
  const outcome = runScript(SCRIPT, [
    '--rescore', '--json',
    '--manifest', target.manifest,
    '--transcripts', target.transcripts,
    '--baseline', target.baseline,
    ...args,
  ]);
  const parsed = parseJson(outcome.stdout);
  assert.ok(isRecord(parsed), outcome.stdout + outcome.stderr);
  const rows = parsed.results;
  assert.ok(Array.isArray(rows));
  return { rows: rows.filter(isRecord) as unknown as readonly CaseRow[], status: outcome.status, stdout: outcome.stdout };
}

/** Verdicts in the shape the closed pass returns them. */
function verdict(entries: Record<string, string>): string {
  return JSON.stringify(entries);
}

const NAMES_THE_DEFECT = 'There is an extra grey pillar that the scene does not declare.';

test('detection and precision are scored independently', () => {
  const target = bench([DEFECT_CASE]);
  record(target, 'bench-defect', [
    { open: NAMES_THE_DEFECT, closed: verdict({ 'spatial-continuity': 'FAIL', 'text-legibility': 'FAIL' }) },
  ]);

  const row = rescore(target).rows[0];
  assert.ok(row !== undefined);
  assert.equal(row.open, true, 'the defect was named unprompted');
  assert.equal(row.closedDetection, true, 'the expected criterion failed');
  assert.equal(row.closedPrecision, false, 'a criterion failed that should not have');
  assert.equal(row.closed, false, 'the strict verdict is unchanged by the split');
});

test('precision is not scored on a case whose defect was never detected', () => {
  const target = bench([DEFECT_CASE]);
  record(target, 'bench-defect', [
    { open: 'Looks fine to me.', closed: verdict({ 'spatial-continuity': 'PASS', 'text-legibility': 'PASS' }) },
  ]);

  const row = rescore(target).rows[0];
  assert.ok(row !== undefined);
  assert.equal(row.closedDetection, false);
  assert.equal(
    row.closedPrecision,
    undefined,
    'a miss must not count as precise, or the denominator flatters the reviewer',
  );
});

test('a clean control fails when the reviewer manufactures a criterion failure', () => {
  const target = bench([CONTROL_CASE]);
  record(target, 'bench-control', [
    { open: 'Nothing wrong, the layout is consistent.', closed: verdict({ 'spatial-continuity': 'FAIL' }) },
  ]);

  const row = rescore(target).rows[0];
  assert.ok(row !== undefined);
  assert.equal(row.open, true);
  assert.equal(row.closedPrecision, false, 'a false failure on a control is an imprecision');
  assert.equal(row.closedDetection, undefined, 'a control has no criterion to detect');
});

test('repeats aggregate by majority and record the observed rate', () => {
  const target = bench([DEFECT_CASE]);
  const precise = verdict({ 'spatial-continuity': 'FAIL', 'text-legibility': 'PASS' });
  const noisy = verdict({ 'spatial-continuity': 'FAIL', 'text-legibility': 'FAIL' });
  record(target, 'bench-defect', [
    { open: NAMES_THE_DEFECT, closed: precise },
    { open: NAMES_THE_DEFECT, closed: noisy },
    { open: NAMES_THE_DEFECT, closed: precise },
  ]);

  const row = rescore(target, ['--repeat', '3']).rows[0];
  assert.ok(row !== undefined);
  assert.equal(row.closedPrecision, true, 'two of three repeats were precise');
  assert.equal(row.rates?.closedPrecision, '2/3');
  assert.equal(row.rates?.open, '3/3');
  assert.equal(row.unstable, true, 'disagreement across repeats must be visible');
});

/**
 * Scoring one sample of a baseline recorded from three would disagree with it
 * for no reason but sampling, and the disagreement would read as a regression.
 */
test('re-scoring defaults to every repeat that was recorded', () => {
  const target = bench([DEFECT_CASE]);
  const precise = verdict({ 'spatial-continuity': 'FAIL', 'text-legibility': 'PASS' });
  const noisy = verdict({ 'spatial-continuity': 'FAIL', 'text-legibility': 'FAIL' });
  record(target, 'bench-defect', [
    { open: NAMES_THE_DEFECT, closed: noisy },
    { open: NAMES_THE_DEFECT, closed: precise },
    { open: NAMES_THE_DEFECT, closed: precise },
  ]);

  const row = rescore(target).rows[0];
  assert.ok(row !== undefined);
  assert.equal(row.rates?.closed, '2/3', 'all three recorded repeats must be scored without asking');
  assert.equal(row.closed, true);

  const one = rescore(target, ['--repeat', '1']).rows[0];
  assert.ok(one !== undefined);
  assert.equal(one.rates?.closed, '0/1', 'an explicit --repeat still narrows the sample to repeat 0');
  assert.equal(one.closed, false);
});

test('a case that passed the baseline and now flips is FLAKY, not a regression', () => {
  const target = bench([DEFECT_CASE]);
  writeFileSync(target.baseline, JSON.stringify({ cases: { 'bench-defect': { closed: true } } }));

  const strict = verdict({ 'spatial-continuity': 'FAIL', 'text-legibility': 'PASS' });
  const noisy = verdict({ 'spatial-continuity': 'FAIL', 'text-legibility': 'FAIL' });
  record(target, 'bench-defect', [
    { open: NAMES_THE_DEFECT, closed: strict },
    { open: NAMES_THE_DEFECT, closed: noisy },
    { open: NAMES_THE_DEFECT, closed: noisy },
  ]);

  const outcome = rescore(target, ['--repeat', '3']);
  assert.equal(outcome.status, 0, 'one flip must not fail the run — the tier is not deterministic');
  const parsed = parseJson(outcome.stdout);
  assert.ok(isRecord(parsed));
  assert.deepEqual(parsed.flaky, ['bench-defect.closed']);
  assert.deepEqual(parsed.regressions, []);
});

test('a case that passed the baseline and now fails every repeat is a regression', () => {
  const target = bench([DEFECT_CASE]);
  writeFileSync(target.baseline, JSON.stringify({ cases: { 'bench-defect': { closed: true } } }));

  const noisy = verdict({ 'spatial-continuity': 'FAIL', 'text-legibility': 'FAIL' });
  record(target, 'bench-defect', [
    { open: NAMES_THE_DEFECT, closed: noisy },
    { open: NAMES_THE_DEFECT, closed: noisy },
  ]);

  const outcome = rescore(target, ['--repeat', '2']);
  assert.equal(outcome.status, 1, 'a uniform failure against the baseline must fail the run');
  const parsed = parseJson(outcome.stdout);
  assert.ok(isRecord(parsed));
  assert.deepEqual(parsed.regressions, ['bench-defect.closed']);
});

/**
 * The cache must never score evidence gathered under a different question. This
 * is the standing rule that a stage which cannot run skips loudly, applied to
 * recorded answers.
 */
test('a transcript recorded against a different prompt is refused, not scored', () => {
  const target = bench([DEFECT_CASE]);
  record(
    target,
    'bench-defect',
    [{ open: NAMES_THE_DEFECT, closed: verdict({ 'spatial-continuity': 'FAIL' }) }],
    { open: 'aaaaaaaaaaaaaaaa' },
  );

  const outcome = runScript(SCRIPT, [
    '--rescore', '--manifest', target.manifest, '--transcripts', target.transcripts, '--baseline', target.baseline,
  ]);
  assert.equal(outcome.status, 1, 'a stale transcript must fail the run');
  assert.match(outcome.stdout, /STALE TRANSCRIPT: bench-defect: the open prompt changed/);
});

test('a stale transcript blocks a baseline update', () => {
  const target = bench([DEFECT_CASE]);
  record(
    target,
    'bench-defect',
    [{ open: NAMES_THE_DEFECT, closed: verdict({ 'spatial-continuity': 'FAIL' }) }],
    { imagesKey: 'fixture:something-else.png@artifact under review' },
  );

  const outcome = runScript(SCRIPT, [
    '--rescore', '--update-baseline',
    '--manifest', target.manifest, '--transcripts', target.transcripts, '--baseline', target.baseline,
  ]);
  assert.equal(outcome.status, 1);
  assert.match(outcome.stderr, /refusing to update the baseline while transcripts are stale/);
  assert.throws(() => readFileSync(target.baseline, 'utf8'), 'no baseline may be written from stale evidence');
});

test('a case with no recorded transcript skips loudly and fails the run', () => {
  const target = bench([DEFECT_CASE]);
  const outcome = rescore(target);
  const row = outcome.rows[0];
  assert.ok(row !== undefined);
  assert.match(String(row.skipped), /no recorded transcript/);
  assert.equal(row.closed, undefined, 'a skipped case must not carry a score');
  assert.equal(outcome.status, 1, 'a case the run was asked to score produced no evidence');
});

test('missing evidence blocks a baseline update', () => {
  const target = bench([DEFECT_CASE]);
  const outcome = runScript(SCRIPT, [
    '--rescore', '--update-baseline',
    '--manifest', target.manifest, '--transcripts', target.transcripts, '--baseline', target.baseline,
  ]);
  assert.equal(outcome.status, 1);
  assert.match(outcome.stderr, /refusing to update the baseline while cases skip without evidence/);
  assert.throws(() => readFileSync(target.baseline, 'utf8'), 'no baseline may be written from missing evidence');
});

/**
 * The baseline's rates blocks are the only record of how many samples each
 * verdict rests on. A partial run that rewrites the file must carry them
 * forward for the cases it did not score.
 */
test('a partial baseline update preserves the rates of unscored cases', () => {
  const directory = workspace();
  const baseline = join(directory, 'baseline.json');
  writeFileSync(
    baseline,
    JSON.stringify({
      cases: { 'semantic-untouched': { closed: true, rates: { closed: '3/3' }, note: 'load-bearing' } },
    }),
  );

  const outcome = runScript(SCRIPT, ['--only', 'generation', '--baseline', baseline, '--update-baseline']);
  assert.equal(outcome.status, 0, outcome.stderr);

  const parsed = parseJson(readFileSync(baseline, 'utf8'));
  assert.ok(isRecord(parsed) && isRecord(parsed.cases));
  const untouched = parsed.cases['semantic-untouched'];
  assert.ok(isRecord(untouched));
  assert.deepEqual(
    untouched,
    { closed: true, rates: { closed: '3/3' }, note: 'load-bearing' },
    'an entry the run did not score must survive verbatim',
  );
});

test('a stray "fine" does not launder a claimed defect on a clean control', () => {
  const target = bench([CONTROL_CASE]);
  record(target, 'bench-control', [
    {
      open: 'There is an inconsistency in the layout, but the colors are fine.',
      closed: verdict({ 'spatial-continuity': 'PASS' }),
    },
  ]);

  const row = rescore(target).rows[0];
  assert.ok(row !== undefined);
  assert.equal(row.open, false, 'an invented inconsistency must fail the control even with "fine" nearby');
});

/**
 * The committed transcripts are the evidence behind the published baseline. If
 * re-scoring them no longer reproduces it, either the scorer changed or the
 * numbers in docs/04 no longer describe this repository.
 */
test('re-scoring the committed transcripts reproduces the committed baseline', (t) => {
  const directory = join(ROOT, 'tests/fixtures/defects/transcripts');
  if (!existsSync(directory)) {
    t.skip('no transcripts committed yet — run the collection first');
    return;
  }

  const outcome = runScript(SCRIPT, ['--rescore', '--json']);
  const parsed = parseJson(outcome.stdout);
  assert.ok(isRecord(parsed) && Array.isArray(parsed.results));
  assert.deepEqual(parsed.stale, [], 'committed transcripts must match the committed cases');

  const baseline = parseJson(readFileSync(join(ROOT, 'tests/fixtures/defects/baseline.json'), 'utf8'));
  assert.ok(isRecord(baseline) && isRecord(baseline.cases));
  const cases: Record<string, unknown> = baseline.cases;

  for (const row of parsed.results.filter(isRecord) as unknown as readonly CaseRow[]) {
    const recorded = cases[row.id];
    if (!isRecord(recorded) || row.skipped !== undefined) continue;
    for (const key of ['open', 'closedDetection', 'closedPrecision', 'closed'] as const) {
      if (recorded[key] === undefined) continue;
      assert.equal(row[key], recorded[key], `${row.id}.${key} no longer matches the committed baseline`);
    }
  }
});
