#!/usr/bin/env node
/**
 * Scores the evaluation against artifacts whose defects are known in advance.
 *
 * Every other layer tests tooling. A checker that reports what it was told to
 * report proves nothing about judgement, and judgement is what let a pillar
 * reach an approved reference frame.
 *
 *   deterministic  runs the owning checker over seeded fixtures. Free, offline.
 *   semantic       puts the artifact to a reviewer twice — once open-ended, to
 *                  measure whether the defect is named unprompted, and once
 *                  against the documented criteria, to measure whether the right
 *                  criterion fails. Opt-in, costs money.
 *
 * Clean controls carry equal weight. A benchmark without negative cases measures
 * eagerness, not discrimination.
 *
 * Three properties of the semantic tier are deliberate, because the first
 * baseline was published without them and was the weaker for it:
 *
 *   Answers are kept. Every response is written to a committed transcript, so
 *   changing the scorer is re-scored with `--rescore` for nothing. Only
 *   collecting answers costs money.
 *
 *   The checklist pass is scored on two axes. Failing the right criterion and
 *   failing only that criterion are different abilities, and collapsing them
 *   into one boolean reported a correct-but-noisy answer as blindness.
 *
 *   One run is not a measurement. `--repeat N` samples each case N times; the
 *   recorded verdict is the majority and the observed rate travels with it. A
 *   case that flips is FLAKY, not a regression.
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_TAXONOMY = join(ROOT, 'tests/fixtures/defects/taxonomy.json');
const DEFAULT_BASELINE = join(ROOT, 'tests/fixtures/defects/baseline.json');
const DEFAULT_TRANSCRIPTS = join(ROOT, 'tests/fixtures/defects/transcripts');
const EXAMPLE_ROOT = join(ROOT, 'examples/level-2-missed-connection');

const EXIT_USAGE = 2;
const EXIT_FAILED = 1;

const VISION_MODEL = 'google/gemini-3-pro';
const MAX_IMAGE_WIDTH = 1024;

/** A ceiling on accidental spend: every repeat is two more paid calls per case. */
const MAX_REPEAT = 9;

/** Every axis a case can be scored on. Baseline keys and regression keys are these. */
const SCORE_KEYS = ['deterministic', 'open', 'closedDetection', 'closedPrecision', 'closed'] as const;
type ScoreKey = (typeof SCORE_KEYS)[number];

interface CaseResult {
  readonly id: string;
  readonly class: string;
  readonly tier: string;
  readonly deterministic?: boolean | undefined;
  readonly open?: boolean | undefined;
  readonly closedDetection?: boolean | undefined;
  readonly closedPrecision?: boolean | undefined;
  readonly closed?: boolean | undefined;
  /** Observed pass count per axis across repeats, e.g. `{ open: '2/3' }`. */
  readonly rates?: Readonly<Record<string, string>> | undefined;
  /** True when the repeats disagreed on any axis. */
  readonly unstable?: boolean | undefined;
  readonly detail: string;
  readonly transcript?: string | undefined;
  readonly skipped?: string | undefined;
}

function usage(): void {
  console.log(
    'Usage: run-benchmark.ts [--json] [--only <class>] [--repeat <n>] [--rescore] [--refresh]\n' +
      '                       [--update-baseline] [--print-prompts] [--taxonomy <file>]\n' +
      '                       [--baseline <file>] [--transcripts <dir>]',
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function runScript(relativePath: string, args: readonly string[]): { status: number | null; stdout: string; stderr: string } {
  const result = spawnSync(process.execPath, [resolve(ROOT, relativePath), ...args], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  return { status: result.status, stdout: result.stdout ?? '', stderr: result.stderr ?? '' };
}

function parseJsonOrNull(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function temp(prefix: string): string {
  return mkdtempSync(join(tmpdir(), `vps-bench-${prefix}-`));
}

function sha(text: string): string {
  return createHash('sha256').update(text).digest('hex').slice(0, 16);
}

let fixtureCache: string | null = null;

function fixtures(): string {
  if (fixtureCache !== null) return fixtureCache;
  const directory = temp('fixtures');
  const result = runScript('tests/fixtures/make-fixtures.ts', [directory]);
  if (result.status !== 0) throw new Error(`fixture generation failed: ${result.stderr.trim()}`);
  fixtureCache = directory;
  return directory;
}

// ---------------------------------------------------------------- scenes

const LANDMARKS = [{ id: 'kiosk' }, { id: 'board', attachedTo: 'column' }, { id: 'column' }];

const SCENES: Readonly<Record<string, unknown>> = {
  clean: {
    sceneId: 'bench', cameraSide: 'south',
    axis: { name: 'west-east', order: ['kiosk', 'board', 'column'] },
    landmarks: [{ id: 'kiosk' }, { id: 'board' }, { id: 'column' }],
    shots: {
      SH01: { present: ['kiosk', 'board'], screenOrder: ['kiosk', 'board'] },
      SH02: { present: ['board', 'column'], screenOrder: ['board', 'column'] },
    },
  },
  'extra-landmark': {
    sceneId: 'bench', cameraSide: 'south',
    axis: { name: 'west-east', order: ['kiosk', 'board', 'column'] },
    landmarks: [{ id: 'kiosk' }, { id: 'board' }, { id: 'column' }],
    shots: {
      SH01: { present: ['board'] },
      SH02: { present: ['board', 'column-foreground'] },
    },
  },
  'attachment-conflict': {
    sceneId: 'bench', cameraSide: 'south',
    axis: { name: 'west-east', order: ['kiosk', 'board', 'column'] },
    landmarks: LANDMARKS,
    shots: {
      SH01: { present: ['board', 'column'], attachments: { board: 'column' } },
      SH02: { present: ['board', 'column'], attachments: { board: null } },
    },
  },
  'order-inverted': {
    sceneId: 'bench', cameraSide: 'south',
    axis: { name: 'west-east', order: ['kiosk', 'board', 'column'] },
    landmarks: [{ id: 'kiosk' }, { id: 'board' }, { id: 'column' }],
    shots: {
      SH01: { present: ['kiosk', 'board'], screenOrder: ['kiosk', 'board'] },
      SH02: { present: ['kiosk', 'board'], screenOrder: ['board', 'kiosk'] },
    },
  },
  'vanishing-landmark': {
    sceneId: 'bench', cameraSide: 'south',
    axis: { name: 'west-east', order: ['kiosk', 'board', 'column'] },
    landmarks: [{ id: 'kiosk' }, { id: 'board' }, { id: 'column' }],
    shots: {
      SH01: { present: ['kiosk', 'board'] },
      SH02: { present: ['board'] },
      SH03: { present: ['kiosk', 'board'] },
    },
  },
  'undeclared-crossing': {
    sceneId: 'bench', cameraSide: 'south',
    axis: { name: 'west-east', order: ['kiosk', 'board', 'column'] },
    landmarks: [{ id: 'kiosk' }, { id: 'board' }, { id: 'column' }],
    shots: {
      SH01: { present: ['board'] },
      SH02: { present: ['board'], cameraSide: 'north' },
    },
  },
};

function writeScene(name: string): string {
  const scene = SCENES[name];
  if (scene === undefined) throw new Error(`unknown scene fixture: ${name}`);
  const path = join(temp('scene'), 'scene.json');
  writeFileSync(path, JSON.stringify(scene));
  return path;
}

function writeProduction(kind: string): string {
  const root = temp('production');
  if (kind === 'self-approved') {
    writeFileSync(join(root, 'direction.md'), '---\ndecisionState: approved\n---\n');
    return root;
  }
  if (kind === 'plan-drift') {
    writeFileSync(join(root, 'direction.md'), '---\ndecisionState: selected\n---\n');
    writeFileSync(
      join(root, 'timeline.json'),
      JSON.stringify({
        shots: [{ source: join(fixtures(), 'clean.mp4'), in: 0, duration: 2 }],
        render: { width: 1920, height: 1080, fps: 24 },
      }),
    );
    spawnSync('cp', [join(fixtures(), 'clean.mp4'), join(root, 'the-master.mp4')]);
    return root;
  }
  throw new Error(`unknown production fixture: ${kind}`);
}

// ------------------------------------------------------- deterministic

function findingRules(stdout: string): readonly string[] {
  const parsed = parseJsonOrNull(stdout);
  if (!isRecord(parsed) || !Array.isArray(parsed.findings)) return [];
  return parsed.findings.filter(isRecord).map((finding) => String(finding.rule));
}

function scoreDeterministic(entry: Record<string, unknown>): { pass: boolean; detail: string } {
  const expect = isRecord(entry.expect) ? entry.expect : {};
  const checker = String(entry.checker);

  if (checker === 'continuity') {
    const path = writeScene(String(entry.scene));
    const result = runScript('skills/video-evaluate/scripts/validate-continuity.ts', [path, '--json']);
    const rules = findingRules(result.stdout);
    if (expect.clean === true) {
      return { pass: rules.length === 0, detail: rules.length === 0 ? 'no findings' : `false positives: ${rules.join(', ')}` };
    }
    const wanted = String(expect.rule);
    return { pass: rules.includes(wanted), detail: rules.includes(wanted) ? wanted : `got [${rules.join(', ')}]` };
  }

  if (checker === 'motion') {
    const file = join(fixtures(), String(entry.fixture));
    const result = runScript('skills/video-evaluate/scripts/detect-motion-artifacts.ts', [file, '--json']);
    const parsed = parseJsonOrNull(result.stdout);
    if (!isRecord(parsed)) return { pass: false, detail: 'no report' };

    if (expect.clean === true) {
      return { pass: parsed.verdict === 'clean', detail: String(parsed.verdict) };
    }
    if (expect.periodic === true) {
      const periodic = isRecord(parsed.periodic) && parsed.periodic.detected === true;
      return { pass: periodic, detail: periodic ? 'periodic seams detected' : 'seams missed' };
    }
    const frozen = Array.isArray(parsed.frozenRuns) && parsed.frozenRuns.length > 0;
    return { pass: frozen, detail: frozen ? 'frozen run detected' : 'frozen frames missed' };
  }

  if (checker === 'media-qc') {
    const file = join(fixtures(), String(entry.fixture));
    const result = runScript('skills/video-evaluate/scripts/inspect-video.ts', [file]);
    const parsed = parseJsonOrNull(result.stdout);
    const unreadable = isRecord(parsed) && parsed.readable === false;
    return { pass: unreadable, detail: unreadable ? 'rejected as unreadable' : 'accepted corrupt media' };
  }

  if (checker === 'timeline') {
    const directory = temp('timeline');
    const timeline = join(directory, 'timeline.json');
    writeFileSync(
      timeline,
      JSON.stringify({
        shots: [{ source: join(fixtures(), String(entry.fixture)), in: 0, duration: 1 }],
        render: { width: 1920, height: 1080, fps: 24 },
      }),
    );
    const result = runScript('skills/video-production/scripts/render-timeline.ts', [timeline, join(directory, 'out.mp4')]);
    const warned = /will be padded/.test(result.stderr);
    return { pass: warned, detail: warned ? 'operator warned' : 'padded silently' };
  }

  if (checker === 'production') {
    const root = writeProduction(String(entry.production));
    const result = runScript('tools/validate-production.ts', [root, '--json']);
    const rules = findingRules(result.stdout);
    const wanted = String(expect.rule);
    return { pass: rules.includes(wanted), detail: rules.includes(wanted) ? wanted : `got [${rules.join(', ')}]` };
  }

  throw new Error(`unknown checker: ${checker}`);
}

// -------------------------------------------------------------- prompts

function imageSpecs(entry: Record<string, unknown>): readonly Record<string, unknown>[] {
  return Array.isArray(entry.images) ? entry.images.filter(isRecord) : [];
}

function roleList(entry: Record<string, unknown>): readonly string[] {
  return imageSpecs(entry).map((spec) => (typeof spec.role === 'string' ? spec.role : 'artifact under review'));
}

/**
 * A stable description of which images a case sends, used to notice that a case
 * was repointed at different artifacts. Deliberately a descriptor and not a
 * content hash: it must be recomputable with no filesystem or ffmpeg access, so
 * `--rescore` stays offline. Content drift in the underlying files is not
 * detectable this way and is recorded as a limitation in docs/04.
 */
function imagesKey(entry: Record<string, unknown>): string {
  return imageSpecs(entry)
    .map((spec) => {
      const source = typeof spec.fixture === 'string' ? `fixture:${spec.fixture}` : `example:${String(spec.example)}`;
      return `${source}@${typeof spec.role === 'string' ? spec.role : 'artifact under review'}`;
    })
    .join('|');
}

function describeImages(roles: readonly string[]): string {
  if (roles.length <= 1) return '';
  return `The images are, in order: ${roles.map((role, index) => `(${String(index + 1)}) ${role}`).join('; ')}.\n\n`;
}

function openPrompt(entry: Record<string, unknown>): string {
  const context = typeof entry.context === 'string' ? `${entry.context}\n\n` : '';
  return (
    `${context}${describeImages(roleList(entry))}Describe any problems with this artifact. ` +
    'If it is fine, say so plainly. Be specific and concrete.'
  );
}

function closedPrompt(entry: Record<string, unknown>, criteria: readonly string[]): string {
  const context = typeof entry.context === 'string' ? `${entry.context}\n\n` : '';
  return (
    `${context}${describeImages(roleList(entry))}Assess this artifact against each criterion below. ` +
    'Reply with JSON only, an object mapping each criterion name to one of "PASS", "FAIL" or "NA", ' +
    'like {"criterion-name": "PASS"}. Use FAIL only when the criterion is genuinely violated.\n\n' +
    criteria.map((criterion) => `- ${criterion}`).join('\n')
  );
}

// ------------------------------------------------------------ semantic

function downscale(source: string): string {
  const output = join(temp('img'), basename(source).replace(/\.[^.]+$/, '.jpg'));
  const result = spawnSync(
    'ffmpeg',
    ['-y', '-v', 'error', '-i', source, '-vf', `scale='min(${String(MAX_IMAGE_WIDTH)},iw)':-2`, '-q:v', '4', output],
    { encoding: 'utf8' },
  );
  if (result.status !== 0) throw new Error(`could not downscale ${source}`);
  return output;
}

function dataUri(path: string): string {
  return `data:image/jpeg;base64,${readFileSync(path).toString('base64')}`;
}

interface ResolvedImages {
  readonly uris: readonly string[];
  readonly missing: string | null;
}

function resolveImages(entry: Record<string, unknown>): ResolvedImages {
  const uris: string[] = [];

  for (const spec of imageSpecs(entry)) {
    let source: string;
    if (typeof spec.fixture === 'string') source = join(fixtures(), spec.fixture);
    else if (typeof spec.example === 'string') source = join(EXAMPLE_ROOT, spec.example);
    else continue;

    if (!existsSync(source)) return { uris: [], missing: source };
    uris.push(dataUri(downscale(source)));
  }

  return { uris, missing: null };
}

/** `Prefer: wait` blocks for at most a minute, so a slow prediction must be polled out. */
const POLL_INTERVAL_MS = 3000;
const PREDICTION_TIMEOUT_MS = 10 * 60 * 1000;

function sleep(ms: number): Promise<void> {
  return new Promise((done) => setTimeout(done, ms));
}

function pollUrl(prediction: Record<string, unknown>): string | null {
  const urls = prediction.urls;
  if (!isRecord(urls) || typeof urls.get !== 'string') return null;
  return urls.get;
}

async function askVision(prompt: string, images: readonly string[]): Promise<string> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (token === undefined || token === '') throw new Error('REPLICATE_API_TOKEN is not set');
  const authorization = { Authorization: `Bearer ${token}` };

  const response = await fetch(`https://api.replicate.com/v1/models/${VISION_MODEL}/predictions`, {
    method: 'POST',
    headers: { ...authorization, 'Content-Type': 'application/json', Prefer: 'wait' },
    body: JSON.stringify({ input: { prompt, images: [...images], temperature: 0 } }),
  });
  if (!response.ok) throw new Error(`vision request failed ${String(response.status)}: ${await response.text()}`);

  let prediction: unknown = await response.json();
  if (!isRecord(prediction)) throw new Error('unexpected vision response');

  const deadline = Date.now() + PREDICTION_TIMEOUT_MS;
  while (prediction.status === 'starting' || prediction.status === 'processing') {
    const url = pollUrl(prediction);
    if (url === null) throw new Error(`vision ${String(prediction.status)} with no poll URL`);
    if (Date.now() > deadline) throw new Error('vision prediction did not finish within ten minutes');

    await sleep(POLL_INTERVAL_MS);
    const polled = await fetch(url, { headers: authorization });
    if (!polled.ok) throw new Error(`vision poll failed ${String(polled.status)}: ${await polled.text()}`);
    prediction = await polled.json();
    if (!isRecord(prediction)) throw new Error('unexpected vision poll response');
  }

  if (prediction.status !== 'succeeded') throw new Error(`vision ${String(prediction.status)}: ${String(prediction.error)}`);

  const output = prediction.output;
  return Array.isArray(output) ? output.join('') : String(output ?? '');
}

// ----------------------------------------------------------- transcripts

interface TranscriptRepeat {
  readonly index: number;
  readonly open: string;
  readonly closed: string;
}

interface Transcript {
  readonly model: string;
  readonly imagesKey: string;
  readonly prompts: { readonly open: string; readonly closed: string };
  readonly repeats: readonly TranscriptRepeat[];
}

function transcriptPath(directory: string, id: string): string {
  return join(directory, `${id}.json`);
}

function readTranscript(directory: string, id: string): Transcript | null {
  const path = transcriptPath(directory, id);
  if (!existsSync(path)) return null;
  const parsed = parseJsonOrNull(readFileSync(path, 'utf8'));
  if (!isRecord(parsed) || !isRecord(parsed.prompts) || !Array.isArray(parsed.repeats)) return null;

  const repeats: TranscriptRepeat[] = [];
  for (const value of parsed.repeats) {
    if (!isRecord(value)) continue;
    repeats.push({ index: Number(value.index), open: String(value.open), closed: String(value.closed) });
  }
  return {
    model: String(parsed.model),
    imagesKey: String(parsed.imagesKey),
    prompts: { open: String(parsed.prompts.open), closed: String(parsed.prompts.closed) },
    repeats,
  };
}

function writeTranscript(directory: string, id: string, transcript: Transcript): void {
  mkdirSync(directory, { recursive: true });
  writeFileSync(transcriptPath(directory, id), `${JSON.stringify(transcript, null, 2)}\n`);
}

/**
 * A transcript recorded against a different prompt, model or image set is not
 * evidence about the case as it stands now. Saying so is the cache equivalent of
 * the standing rule that a stage which cannot run skips loudly.
 */
function staleReason(transcript: Transcript, expected: Omit<Transcript, 'repeats'>): string | null {
  if (transcript.model !== expected.model) return `recorded against ${transcript.model}, now ${expected.model}`;
  if (transcript.imagesKey !== expected.imagesKey) return 'the case now sends different images';
  if (transcript.prompts.open !== expected.prompts.open) return 'the open prompt changed';
  if (transcript.prompts.closed !== expected.prompts.closed) return 'the closed prompt changed';
  return null;
}

// -------------------------------------------------------------- scoring

/** Open pass: does a reviewer name the defect without being told what to look for. */
function scoreOpenAnswer(entry: Record<string, unknown>, answer: string): { pass: boolean; detail: string } {
  const expect = isRecord(entry.expect) ? entry.expect : {};
  const lower = answer.toLowerCase();
  const keywords = Array.isArray(entry.keywords) ? entry.keywords.map(String) : [];
  const matched = keywords.find((keyword) => lower.includes(keyword.toLowerCase()));

  if (expect.clean === true) {
    // A control passes when the reviewer does not manufacture a defect.
    const invented = /\b(problem|issue|inconsist|wrong|missing|error|defect)\b/.test(lower) &&
      !/\bno (problems|issues)\b|\bnothing (wrong|amiss)\b|\bfine\b|\bconsistent\b/.test(lower);
    return { pass: !invented, detail: invented ? 'invented a defect on a clean control' : 'no defect claimed' };
  }

  return {
    pass: matched !== undefined,
    detail: matched === undefined ? 'defect not named unprompted' : `named via "${matched}"`,
  };
}

interface ClosedScore {
  /** The expected criterion failed. Undefined for clean controls, which have none. */
  readonly detection?: boolean | undefined;
  /** No criterion failed that should not have. Only meaningful once detection passed. */
  readonly precision?: boolean | undefined;
  /** Detection and precision together — the original, unchanged, strict rule. */
  readonly strict: boolean;
  readonly detail: string;
}

/**
 * Closed pass: given the documented criteria, does the right one fail.
 *
 * Scored on two axes because they are two abilities. A reviewer that fails the
 * right criterion and two others has found the defect and been noisy about it;
 * one that passes the right criterion has not found it at all. The original
 * combined verdict is kept as `strict` so nothing here loosens the bar — it
 * simply stops reporting the first case as if it were the second.
 */
function scoreClosedAnswer(
  entry: Record<string, unknown>,
  answer: string,
  criteria: readonly string[],
): ClosedScore {
  const jsonText = /\{[\s\S]*\}/.exec(answer)?.[0] ?? '';
  const parsed = parseJsonOrNull(jsonText);
  const expect = isRecord(entry.expect) ? entry.expect : {};

  if (!isRecord(parsed)) {
    return expect.clean === true
      ? { precision: false, strict: false, detail: 'no parsable verdict' }
      : { detection: false, strict: false, detail: 'no parsable verdict' };
  }

  const failed = criteria.filter((criterion) => String(parsed[criterion] ?? '').toUpperCase() === 'FAIL');

  if (expect.clean === true) {
    const clean = failed.length === 0;
    return {
      precision: clean,
      strict: clean,
      detail: clean ? 'all criteria pass' : `false failures: ${failed.join(', ')}`,
    };
  }

  const wanted = String(entry.criterion);
  const detection = failed.includes(wanted);
  const spurious = failed.filter((criterion) => criterion !== wanted);

  return {
    detection,
    // Precision is undefined when the defect was never found: scoring a miss as
    // "precise" would inflate the denominator with cases that never had the
    // chance to be imprecise.
    ...(detection ? { precision: spurious.length === 0 } : {}),
    strict: detection && spurious.length === 0,
    detail: detection
      ? spurious.length === 0 ? `${wanted} failed` : `${wanted} failed, also flagged ${spurious.join(', ')}`
      : `${wanted} passed; failed [${failed.join(', ')}]`,
  };
}

// ----------------------------------------------------------- aggregation

/**
 * Ties fail. With an even repeat count a case that passes half the time has not
 * demonstrated the ability, and the conservative reading is the honest one.
 */
function majority(values: readonly boolean[]): boolean | undefined {
  if (values.length === 0) return undefined;
  return values.filter(Boolean).length * 2 > values.length;
}

function aggregate(
  id: string,
  className: string,
  tier: string,
  samples: readonly { open: { pass: boolean; detail: string }; closed: ClosedScore }[],
  transcript: string,
): CaseResult {
  const axes: Record<string, readonly boolean[]> = {
    open: samples.map((sample) => sample.open.pass),
    closedDetection: samples.map((sample) => sample.closed.detection).filter((value): value is boolean => value !== undefined),
    closedPrecision: samples.map((sample) => sample.closed.precision).filter((value): value is boolean => value !== undefined),
    closed: samples.map((sample) => sample.closed.strict),
  };

  const rates: Record<string, string> = {};
  let unstable = false;
  for (const [axis, values] of Object.entries(axes)) {
    if (values.length === 0) continue;
    const passed = values.filter(Boolean).length;
    rates[axis] = `${String(passed)}/${String(values.length)}`;
    if (passed !== 0 && passed !== values.length) unstable = true;
  }

  const first = samples[0];
  const detail = first === undefined ? '' : `open: ${first.open.detail} | closed: ${first.closed.detail}`;

  return {
    id, class: className, tier,
    open: majority(axes.open ?? []),
    closedDetection: majority(axes.closedDetection ?? []),
    closedPrecision: majority(axes.closedPrecision ?? []),
    closed: majority(axes.closed ?? []),
    rates, unstable, detail, transcript,
  };
}

// -------------------------------------------------------------- report

function rate(passed: number, total: number): string {
  return total === 0 ? 'n/a' : `${String(passed)}/${String(total)} (${String(Math.round((passed / total) * 100))}%)`;
}

function tally(results: readonly CaseResult[], key: ScoreKey): string {
  const scored = results.filter((result) => result[key] !== undefined);
  return rate(scored.filter((result) => result[key] === true).length, scored.length);
}

function mark(label: string, value: boolean | undefined, observed: string | undefined): string | null {
  if (value === undefined) return null;
  const suffix = observed === undefined ? '' : `(${observed})`;
  return `${label} ${value ? 'ok' : 'MISS'}${suffix}`;
}

function printReport(results: readonly CaseResult[], semanticRan: boolean, source: string): void {
  for (const result of results) {
    if (result.skipped !== undefined) {
      console.log(`SKIP ${result.id} — ${result.skipped}`);
      continue;
    }
    const marks = [
      mark('det', result.deterministic, undefined),
      mark('open', result.open, result.rates?.open),
      mark('detect', result.closedDetection, result.rates?.closedDetection),
      mark('precise', result.closedPrecision, result.rates?.closedPrecision),
      mark('strict', result.closed, result.rates?.closed),
    ].filter((value): value is string => value !== null);
    const flag = result.unstable === true ? '  FLAKY' : '';
    console.log(`${marks.join('  ')}  ${result.id} — ${result.detail}${flag}`);
  }

  console.log('');
  console.log(`deterministic  ${tally(results, 'deterministic')}`);

  if (!semanticRan) {
    console.log('semantic       NOT RUN — set RUN_SEMANTIC_BENCHMARK=1 and REPLICATE_API_TOKEN, or use --rescore');
    return;
  }

  console.log(`semantic recall (unprompted)      ${tally(results, 'open')}`);
  console.log(`semantic detection (checklist)    ${tally(results, 'closedDetection')}`);
  console.log(`semantic precision (checklist)    ${tally(results, 'closedPrecision')}`);
  console.log(`semantic strict (both)            ${tally(results, 'closed')}`);
  console.log(`semantic source                   ${source}`);

  const unstable = results.filter((result) => result.unstable === true).map((result) => result.id);
  if (unstable.length > 0) console.log(`unstable across repeats: ${unstable.join(', ')}`);
}

// ------------------------------------------------------------ baseline

function loadBaseline(path: string): Record<string, Record<string, boolean>> {
  if (!existsSync(path)) return {};
  const parsed = parseJsonOrNull(readFileSync(path, 'utf8'));
  if (!isRecord(parsed) || !isRecord(parsed.cases)) return {};
  const cases: Record<string, Record<string, boolean>> = {};
  for (const [id, value] of Object.entries(parsed.cases)) {
    if (!isRecord(value)) continue;
    const entry: Record<string, boolean> = {};
    for (const [key, flag] of Object.entries(value)) if (typeof flag === 'boolean') entry[key] = flag;
    cases[id] = entry;
  }
  return cases;
}

/**
 * A case that used to pass and now fails every repeat is a regression. One that
 * still passes some repeats is flaky — the tier is not deterministic even at
 * temperature 0, and treating a single flip as a regression would make the gate
 * cry wolf until nobody read it.
 */
function compare(
  results: readonly CaseResult[],
  baseline: Record<string, Record<string, boolean>>,
): { regressed: readonly string[]; flaky: readonly string[] } {
  const regressed: string[] = [];
  const flaky: string[] = [];

  for (const result of results) {
    const previous = baseline[result.id];
    if (previous === undefined) continue;
    for (const key of SCORE_KEYS) {
      if (previous[key] !== true || result[key] !== false) continue;
      const observed = result.rates?.[key];
      const passedSome = observed !== undefined && !observed.startsWith('0/');
      (passedSome ? flaky : regressed).push(`${result.id}.${key}`);
    }
  }

  return { regressed, flaky };
}

// ------------------------------------------------------------------ run

interface Options {
  readonly repeat: number;
  /** Whether --repeat was given, as opposed to defaulted. */
  readonly repeatExplicit: boolean;
  readonly rescore: boolean;
  readonly refresh: boolean;
  readonly transcripts: string;
  readonly criteria: readonly string[];
}

type SemanticOutcome =
  | { readonly kind: 'skip'; readonly reason: string }
  | { readonly kind: 'stale'; readonly reason: string }
  | { readonly kind: 'scored'; readonly result: CaseResult };

async function runSemanticCase(
  entry: Record<string, unknown>,
  id: string,
  className: string,
  options: Options,
): Promise<SemanticOutcome> {
  const expected = {
    model: VISION_MODEL,
    imagesKey: imagesKey(entry),
    prompts: { open: sha(openPrompt(entry)), closed: sha(closedPrompt(entry, options.criteria)) },
  };

  const existing = options.refresh ? null : readTranscript(options.transcripts, id);
  if (existing !== null) {
    const stale = staleReason(existing, expected);
    if (stale !== null) return { kind: 'stale', reason: stale };
  }

  // Re-scoring defaults to every repeat that was paid for. Scoring one sample of
  // a baseline recorded from three would disagree with it for no reason but
  // sampling, and the disagreement would read as a regression.
  const count = options.rescore && !options.repeatExplicit && existing !== null
    ? Math.max(existing.repeats.length, 1)
    : options.repeat;

  const kept: TranscriptRepeat[] = [];
  const samples: { open: { pass: boolean; detail: string }; closed: ClosedScore }[] = [];
  let images: ResolvedImages | null = null;

  for (let index = 0; index < count; index += 1) {
    let recorded = existing?.repeats.find((repeat) => repeat.index === index);

    if (recorded === undefined) {
      if (options.rescore) {
        return { kind: 'skip', reason: `no recorded transcript for repeat ${String(index)} — run the collection first` };
      }
      if (images === null) {
        images = resolveImages(entry);
        if (images.missing !== null) return { kind: 'skip', reason: `fixture absent: ${images.missing}` };
      }
      recorded = {
        index,
        open: await askVision(openPrompt(entry), images.uris),
        closed: await askVision(closedPrompt(entry, options.criteria), images.uris),
      };
    }

    kept.push(recorded);
    samples.push({
      open: scoreOpenAnswer(entry, recorded.open),
      closed: scoreClosedAnswer(entry, recorded.closed, options.criteria),
    });
  }

  // Repeats beyond the requested count are kept so lowering --repeat does not
  // throw away answers that were paid for.
  const surplus = (existing?.repeats ?? []).filter((repeat) => repeat.index >= count);
  if (!options.rescore) {
    writeTranscript(options.transcripts, id, { ...expected, repeats: [...kept, ...surplus] });
  }

  return {
    kind: 'scored',
    result: aggregate(id, className, 'semantic', samples, relative(ROOT, transcriptPath(options.transcripts, id))),
  };
}

function countPlannedCalls(cases: readonly unknown[], options: Options, only: string | undefined): number {
  let calls = 0;
  for (const value of cases) {
    if (!isRecord(value) || String(value.tier) !== 'semantic') continue;
    if (only !== undefined && String(value.class) !== only) continue;
    const existing = options.refresh ? null : readTranscript(options.transcripts, String(value.id));
    for (let index = 0; index < options.repeat; index += 1) {
      if (existing?.repeats.some((repeat) => repeat.index === index) !== true) calls += 2;
    }
  }
  return calls;
}

async function main(): Promise<number> {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      json: { type: 'boolean' },
      only: { type: 'string' },
      repeat: { type: 'string' },
      rescore: { type: 'boolean' },
      refresh: { type: 'boolean' },
      'update-baseline': { type: 'boolean' },
      'print-prompts': { type: 'boolean' },
      taxonomy: { type: 'string' },
      baseline: { type: 'string' },
      transcripts: { type: 'string' },
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

  const repeat = values.repeat === undefined ? 1 : Number(values.repeat);
  if (!Number.isInteger(repeat) || repeat < 1 || repeat > MAX_REPEAT) {
    console.error(`--repeat must be an integer between 1 and ${String(MAX_REPEAT)}`);
    return EXIT_USAGE;
  }

  const taxonomyPath = values.taxonomy ?? DEFAULT_TAXONOMY;
  const baselinePath = values.baseline ?? DEFAULT_BASELINE;

  const taxonomy = parseJsonOrNull(readFileSync(taxonomyPath, 'utf8'));
  if (!isRecord(taxonomy) || !Array.isArray(taxonomy.cases)) throw new Error('taxonomy.cases must be an array');

  const options: Options = {
    repeat,
    repeatExplicit: values.repeat !== undefined,
    rescore: values.rescore === true,
    refresh: values.refresh === true,
    transcripts: values.transcripts ?? DEFAULT_TRANSCRIPTS,
    criteria: Array.isArray(taxonomy.criteria) ? taxonomy.criteria.map(String) : [],
  };

  // Exactly what the reviewer is asked, and the digests its transcripts are
  // keyed on. Auditing a score means reading the question as well as the answer.
  if (values['print-prompts'] === true) {
    const cases = taxonomy.cases.filter(isRecord).filter((entry) => String(entry.tier) === 'semantic');
    console.log(JSON.stringify({
      model: VISION_MODEL,
      cases: cases.map((entry) => {
        const open = openPrompt(entry);
        const closed = closedPrompt(entry, options.criteria);
        return {
          id: String(entry.id),
          imagesKey: imagesKey(entry),
          prompts: { open: { sha: sha(open), text: open }, closed: { sha: sha(closed), text: closed } },
        };
      }),
    }, null, 2));
    return 0;
  }

  const semanticRequested = process.env.RUN_SEMANTIC_BENCHMARK === '1';
  const hasToken = (process.env.REPLICATE_API_TOKEN ?? '') !== '';
  const semanticRan = options.rescore || (semanticRequested && hasToken);

  if (semanticRan && !options.rescore) {
    const planned = countPlannedCalls(taxonomy.cases, options, values.only);
    console.error(`collecting ${String(planned)} paid calls (${String(repeat)} repeat(s) × 2 passes per uncached case)`);
  }

  const results: CaseResult[] = [];
  const stale: string[] = [];

  for (const value of taxonomy.cases) {
    if (!isRecord(value)) continue;
    const id = String(value.id);
    const className = String(value.class);
    const tier = String(value.tier);
    if (values.only !== undefined && className !== values.only) continue;

    if (tier === 'deterministic') {
      const scored = scoreDeterministic(value);
      results.push({ id, class: className, tier, deterministic: scored.pass, detail: scored.detail });
      continue;
    }

    if (!semanticRan) {
      results.push({
        id, class: className, tier, detail: '',
        skipped: semanticRequested ? 'REPLICATE_API_TOKEN is not set' : 'semantic tier not requested',
      });
      continue;
    }

    const outcome = await runSemanticCase(value, id, className, options);
    if (outcome.kind === 'stale') {
      stale.push(`${id}: ${outcome.reason}`);
      results.push({ id, class: className, tier, detail: '', skipped: `stale transcript — ${outcome.reason}` });
      continue;
    }
    if (outcome.kind === 'skip') {
      results.push({ id, class: className, tier, detail: '', skipped: outcome.reason });
      continue;
    }
    results.push(outcome.result);
  }

  const baseline = loadBaseline(baselinePath);
  const { regressed, flaky } = compare(results, baseline);
  const source = options.rescore ? 'recorded transcripts' : 'live model';

  if (values.json) console.log(JSON.stringify({ results, semanticRan, regressions: regressed, flaky, stale }, null, 2));
  else printReport(results, semanticRan, source);

  if (values['update-baseline'] === true) {
    if (stale.length > 0) {
      console.error('refusing to update the baseline while transcripts are stale:');
      for (const line of stale) console.error(`  ${line}`);
      return EXIT_FAILED;
    }
    const cases: Record<string, Record<string, unknown>> = { ...baseline };
    for (const result of results) {
      if (result.skipped !== undefined) continue;
      const entry: Record<string, unknown> = { ...cases[result.id] };
      for (const key of SCORE_KEYS) if (result[key] !== undefined) entry[key] = result[key];
      if (result.rates !== undefined && Object.keys(result.rates).length > 0) entry.rates = result.rates;
      cases[result.id] = entry;
    }
    writeFileSync(baselinePath, `${JSON.stringify({ cases }, null, 2)}\n`);
    console.log(`baseline written: ${baselinePath}`);
    return 0;
  }

  // In --json mode these already travel in the payload; printing them again
  // would put prose after the closing brace and make the output unparsable.
  const narrate = values.json !== true;

  if (stale.length > 0) {
    if (narrate) {
      console.log('');
      for (const line of stale) console.log(`STALE TRANSCRIPT: ${line}`);
      console.log('re-collect with --refresh, or revert the change to the case');
    }
    return EXIT_FAILED;
  }

  if (flaky.length > 0 && narrate) {
    console.log('');
    console.log(`FLAKY: ${flaky.join(', ')} — passed some repeats, not treated as a regression`);
  }

  if (regressed.length > 0) {
    if (narrate) {
      console.log('');
      console.log(`REGRESSION: ${regressed.join(', ')}`);
    }
    return EXIT_FAILED;
  }

  const deterministicFailures = results.filter((result) => result.deterministic === false);
  return deterministicFailures.length > 0 ? EXIT_FAILED : 0;
}

try {
  process.exitCode = await main();
} catch (error: unknown) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = EXIT_USAGE;
}
