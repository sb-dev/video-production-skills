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
 */
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_TAXONOMY = join(ROOT, 'tests/fixtures/defects/taxonomy.json');
const DEFAULT_BASELINE = join(ROOT, 'tests/fixtures/defects/baseline.json');
const EXAMPLE_ROOT = join(ROOT, 'examples/level-2-missed-connection');

const EXIT_USAGE = 2;
const EXIT_FAILED = 1;

const VISION_MODEL = 'google/gemini-3-pro';
const MAX_IMAGE_WIDTH = 1024;

interface CaseResult {
  readonly id: string;
  readonly class: string;
  readonly tier: string;
  readonly deterministic?: boolean;
  readonly open?: boolean;
  readonly closed?: boolean;
  readonly detail: string;
  readonly evidence?: string;
  readonly skipped?: string;
}

function usage(): void {
  console.log(
    'Usage: run-benchmark.ts [--json] [--only <class>] [--update-baseline] ' +
      '[--taxonomy <file>] [--baseline <file>]',
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
  readonly roles: readonly string[];
  readonly missing: string | null;
}

function resolveImages(entry: Record<string, unknown>): ResolvedImages {
  const specs = Array.isArray(entry.images) ? entry.images.filter(isRecord) : [];
  const uris: string[] = [];
  const roles: string[] = [];

  for (const spec of specs) {
    let source: string;
    if (typeof spec.fixture === 'string') source = join(fixtures(), spec.fixture);
    else if (typeof spec.example === 'string') source = join(EXAMPLE_ROOT, spec.example);
    else continue;

    if (!existsSync(source)) return { uris: [], roles: [], missing: source };
    uris.push(dataUri(downscale(source)));
    roles.push(typeof spec.role === 'string' ? spec.role : 'artifact under review');
  }

  return { uris, roles, missing: null };
}

async function askVision(prompt: string, images: readonly string[]): Promise<string> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (token === undefined || token === '') throw new Error('REPLICATE_API_TOKEN is not set');

  const response = await fetch(`https://api.replicate.com/v1/models/${VISION_MODEL}/predictions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'wait' },
    body: JSON.stringify({ input: { prompt, images: [...images], temperature: 0 } }),
  });
  if (!response.ok) throw new Error(`vision request failed ${String(response.status)}: ${await response.text()}`);

  const parsed: unknown = await response.json();
  if (!isRecord(parsed)) throw new Error('unexpected vision response');
  if (parsed.status !== 'succeeded') throw new Error(`vision ${String(parsed.status)}: ${String(parsed.error)}`);

  const output = parsed.output;
  return Array.isArray(output) ? output.join('') : String(output ?? '');
}

function describeImages(roles: readonly string[]): string {
  if (roles.length <= 1) return '';
  return `The images are, in order: ${roles.map((role, index) => `(${String(index + 1)}) ${role}`).join('; ')}.\n\n`;
}

/** Open pass: does a reviewer name the defect without being told what to look for. */
async function scoreOpen(entry: Record<string, unknown>, images: ResolvedImages): Promise<{ pass: boolean; detail: string; evidence: string }> {
  const context = typeof entry.context === 'string' ? `${entry.context}\n\n` : '';
  const answer = await askVision(
    `${context}${describeImages(images.roles)}Describe any problems with this artifact. ` +
      'If it is fine, say so plainly. Be specific and concrete.',
    images.uris,
  );

  const expect = isRecord(entry.expect) ? entry.expect : {};
  const lower = answer.toLowerCase();
  const keywords = Array.isArray(entry.keywords) ? entry.keywords.map(String) : [];
  const matched = keywords.find((keyword) => lower.includes(keyword.toLowerCase()));

  if (expect.clean === true) {
    // A control passes when the reviewer does not manufacture a defect.
    const invented = /\b(problem|issue|inconsist|wrong|missing|error|defect)\b/.test(lower) &&
      !/\bno (problems|issues)\b|\bnothing (wrong|amiss)\b|\bfine\b|\bconsistent\b/.test(lower);
    return {
      pass: !invented,
      detail: invented ? 'invented a defect on a clean control' : 'no defect claimed',
      evidence: answer.slice(0, 400),
    };
  }

  return {
    pass: matched !== undefined,
    detail: matched === undefined ? 'defect not named unprompted' : `named via "${matched}"`,
    evidence: answer.slice(0, 400),
  };
}

/** Closed pass: given the documented criteria, does the right one fail. */
async function scoreClosed(
  entry: Record<string, unknown>,
  images: ResolvedImages,
  criteria: readonly string[],
): Promise<{ pass: boolean; detail: string; evidence: string }> {
  const context = typeof entry.context === 'string' ? `${entry.context}\n\n` : '';
  const answer = await askVision(
    `${context}${describeImages(images.roles)}Assess this artifact against each criterion below. ` +
      'Reply with JSON only, an object mapping each criterion name to one of "PASS", "FAIL" or "NA", ' +
      'like {"criterion-name": "PASS"}. Use FAIL only when the criterion is genuinely violated.\n\n' +
      criteria.map((criterion) => `- ${criterion}`).join('\n'),
    images.uris,
  );

  const jsonText = /\{[\s\S]*\}/.exec(answer)?.[0] ?? '';
  const parsed = parseJsonOrNull(jsonText);
  if (!isRecord(parsed)) {
    return { pass: false, detail: 'no parsable verdict', evidence: answer.slice(0, 400) };
  }

  const failed = criteria.filter((criterion) => String(parsed[criterion] ?? '').toUpperCase() === 'FAIL');
  const expect = isRecord(entry.expect) ? entry.expect : {};

  if (expect.clean === true) {
    return {
      pass: failed.length === 0,
      detail: failed.length === 0 ? 'all criteria pass' : `false failures: ${failed.join(', ')}`,
      evidence: jsonText.slice(0, 400),
    };
  }

  const wanted = String(entry.criterion);
  const correct = failed.includes(wanted);
  const spurious = failed.filter((criterion) => criterion !== wanted);
  return {
    pass: correct && spurious.length === 0,
    detail: correct
      ? spurious.length === 0 ? `${wanted} failed` : `${wanted} failed, also flagged ${spurious.join(', ')}`
      : `${wanted} passed; failed [${failed.join(', ')}]`,
    evidence: jsonText.slice(0, 400),
  };
}

// -------------------------------------------------------------- report

function rate(passed: number, total: number): string {
  return total === 0 ? 'n/a' : `${String(passed)}/${String(total)} (${String(Math.round((passed / total) * 100))}%)`;
}

function printReport(results: readonly CaseResult[], semanticRan: boolean): void {
  for (const result of results) {
    if (result.skipped !== undefined) {
      console.log(`SKIP ${result.id} — ${result.skipped}`);
      continue;
    }
    const marks: string[] = [];
    if (result.deterministic !== undefined) marks.push(`det ${result.deterministic ? 'ok' : 'MISS'}`);
    if (result.open !== undefined) marks.push(`open ${result.open ? 'ok' : 'MISS'}`);
    if (result.closed !== undefined) marks.push(`closed ${result.closed ? 'ok' : 'MISS'}`);
    console.log(`${marks.join('  ')}  ${result.id} — ${result.detail}`);
  }

  const det = results.filter((result) => result.deterministic !== undefined);
  console.log('');
  console.log(`deterministic  ${rate(det.filter((r) => r.deterministic === true).length, det.length)}`);

  if (semanticRan) {
    const open = results.filter((result) => result.open !== undefined);
    const closed = results.filter((result) => result.closed !== undefined);
    console.log(`semantic recall (unprompted)   ${rate(open.filter((r) => r.open === true).length, open.length)}`);
    console.log(`semantic competence (checklist) ${rate(closed.filter((r) => r.closed === true).length, closed.length)}`);
  } else {
    console.log('semantic       NOT RUN — set RUN_SEMANTIC_BENCHMARK=1 and REPLICATE_API_TOKEN');
  }
}

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

function regressions(results: readonly CaseResult[], baseline: Record<string, Record<string, boolean>>): readonly string[] {
  const found: string[] = [];
  for (const result of results) {
    const previous = baseline[result.id];
    if (previous === undefined) continue;
    for (const key of ['deterministic', 'open', 'closed'] as const) {
      const now = result[key];
      if (previous[key] === true && now === false) found.push(`${result.id}.${key}`);
    }
  }
  return found;
}

async function main(): Promise<number> {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      json: { type: 'boolean' },
      only: { type: 'string' },
      'update-baseline': { type: 'boolean' },
      taxonomy: { type: 'string' },
      baseline: { type: 'string' },
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

  const taxonomyPath = values.taxonomy ?? DEFAULT_TAXONOMY;
  const baselinePath = values.baseline ?? DEFAULT_BASELINE;

  const taxonomy = parseJsonOrNull(readFileSync(taxonomyPath, 'utf8'));
  if (!isRecord(taxonomy) || !Array.isArray(taxonomy.cases)) throw new Error('taxonomy.cases must be an array');
  const criteria = Array.isArray(taxonomy.criteria) ? taxonomy.criteria.map(String) : [];

  const semanticRequested = process.env.RUN_SEMANTIC_BENCHMARK === '1';
  const hasToken = (process.env.REPLICATE_API_TOKEN ?? '') !== '';
  const semanticRan = semanticRequested && hasToken;

  const results: CaseResult[] = [];

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

    const images = resolveImages(value);
    if (images.missing !== null) {
      results.push({ id, class: className, tier, detail: '', skipped: `fixture absent: ${images.missing}` });
      continue;
    }

    const open = await scoreOpen(value, images);
    const closed = await scoreClosed(value, images, criteria);
    results.push({
      id, class: className, tier,
      open: open.pass, closed: closed.pass,
      detail: `open: ${open.detail} | closed: ${closed.detail}`,
      evidence: `OPEN: ${open.evidence}\nCLOSED: ${closed.evidence}`,
    });
  }

  const baseline = loadBaseline(baselinePath);
  const regressed = regressions(results, baseline);

  if (values.json) console.log(JSON.stringify({ results, semanticRan, regressions: regressed }, null, 2));
  else printReport(results, semanticRan);

  if (values['update-baseline'] === true) {
    const cases: Record<string, Record<string, boolean>> = { ...baseline };
    for (const result of results) {
      if (result.skipped !== undefined) continue;
      const entry: Record<string, boolean> = { ...cases[result.id] };
      if (result.deterministic !== undefined) entry.deterministic = result.deterministic;
      if (result.open !== undefined) entry.open = result.open;
      if (result.closed !== undefined) entry.closed = result.closed;
      cases[result.id] = entry;
    }
    writeFileSync(baselinePath, `${JSON.stringify({ cases }, null, 2)}\n`);
    console.log(`baseline written: ${baselinePath}`);
    return 0;
  }

  if (regressed.length > 0) {
    console.log('');
    console.log(`REGRESSION: ${regressed.join(', ')}`);
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
