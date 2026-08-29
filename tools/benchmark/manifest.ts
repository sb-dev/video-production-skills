/**
 * The benchmark catalogue: manifest, rubrics, cases, fingerprints and the
 * coverage rules the validator enforces.
 *
 * This module has no side effects on import. `run-benchmark.ts`,
 * `validate-benchmark.ts` and `validate-repo.ts` all import it, so a single
 * definition of "what the benchmark covers" serves listing, scoring and CI.
 *
 * The prompt builders for the diagnostic suite live here rather than in the
 * runner so that the digest a transcript is keyed on and the digest a
 * fingerprint binds are computed by the same code.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, extname, join, relative, resolve } from 'node:path';

export const SUITES = ['diagnostic', 'production', 'packs', 'pack-authoring'] as const;
export type Suite = (typeof SUITES)[number];

export const MANIFEST_SCHEMA = 'vps-benchmark-manifest/1';
export const DEFAULT_MANIFEST = 'benchmarks/manifest.json';

// ------------------------------------------------------------------ types

export interface SuiteSpec {
  readonly description: string;
  readonly measures: readonly string[];
}

export interface Manifest {
  readonly schema: typeof MANIFEST_SCHEMA;
  readonly suites: Readonly<Record<Suite, SuiteSpec>>;
  /** Rubric id → path relative to the manifest directory. */
  readonly rubrics: Readonly<Record<string, string>>;
  readonly diagnostic: {
    /** Order is load-bearing: the closed-prompt digest is computed over it. */
    readonly closedCriteria: readonly string[];
    readonly transcripts: string;
    readonly baseline: string;
    readonly exampleRoot: string;
    readonly visionModel: string;
  };
  readonly coverage: {
    readonly examples: {
      readonly root: string;
      readonly promptHeading: string;
      readonly exclude: readonly { readonly path: string; readonly reason: string }[];
    };
    readonly showcases: { readonly root: string; readonly promptHeading: string; readonly caseIdPrefix: string };
    readonly commands: {
      readonly normalClasses: readonly string[];
      readonly boundaryClasses: readonly string[];
      readonly exempt: Readonly<Record<string, string>>;
    };
  };
  readonly tiers: { readonly core: readonly Suite[]; readonly catalogue: readonly Suite[] };
}

export interface Execution {
  readonly kind: 'deterministic' | 'semantic' | 'generation';
  readonly collector: 'runner' | 'host';
  readonly paid: boolean;
  readonly provider?: string;
  /** When true, the sha256 of every listed command contract joins the fingerprint. */
  readonly bindContracts?: boolean;
}

export interface PromptSource {
  readonly path: string;
  readonly heading: string;
}

export interface ImageSpec {
  readonly fixture?: string;
  readonly example?: string;
  readonly role?: string;
}

export interface ExpectedRouting {
  readonly owningArtifact: string;
  readonly correctiveAction: string;
  readonly maxScope?: string;
}

export interface BenchmarkCase {
  readonly id: string;
  readonly suite: Suite;
  readonly capability: string;
  readonly summary: string;
  readonly skills: readonly string[];
  readonly commands?: readonly string[];
  readonly rubric: string;
  readonly execution: Execution;
  readonly prompt?: string;
  readonly promptSource?: PromptSource;
  readonly requiredDimensions?: readonly string[];
  readonly hardGates?: readonly string[];
  readonly expectedRouting?: ExpectedRouting;
  readonly example?: string;
  readonly pack?: string;
  // Legacy diagnostic fields, carried verbatim from the original taxonomy.
  readonly class?: string;
  readonly tier?: 'deterministic' | 'semantic';
  readonly checker?: string;
  readonly scene?: string;
  readonly fixture?: string;
  readonly production?: string;
  readonly images?: readonly ImageSpec[];
  readonly context?: string;
  readonly criterion?: string;
  readonly keywords?: readonly string[];
  readonly expect?: Readonly<Record<string, unknown>>;
  readonly owningArtifact?: string;
  readonly correctiveAction?: string;
  /** Repository-relative path the case was loaded from. Not part of the fingerprint. */
  readonly file: string;
  /** The raw object as loaded, for fingerprinting and legacy scoring. */
  readonly raw: Readonly<Record<string, unknown>>;
}

export interface RubricEntry {
  readonly id: string;
  readonly question: string;
}

export interface Rubric {
  readonly id: string;
  readonly kind: 'axes' | 'anchored';
  readonly scale?: { readonly min: number; readonly max: number; readonly anchors: Readonly<Record<string, string>> };
  readonly dimensions: readonly RubricEntry[];
  readonly gates?: readonly RubricEntry[];
  readonly hardGates: readonly string[];
  readonly readiness: string;
  readonly raw: Readonly<Record<string, unknown>>;
}

export interface Catalogue {
  readonly root: string;
  readonly manifestPath: string;
  readonly manifestDir: string;
  readonly manifest: Manifest;
  readonly rubrics: ReadonlyMap<string, Rubric>;
  readonly cases: readonly BenchmarkCase[];
}

// ---------------------------------------------------------------- helpers

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseJsonOrNull(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

export function sha(text: string): string {
  return createHash('sha256').update(text).digest('hex').slice(0, 16);
}

export function sha256(data: string | Buffer): string {
  return createHash('sha256').update(data).digest('hex');
}

/** Key-sorted JSON so that two equal objects fingerprint identically regardless of key order. */
export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (isRecord(value)) {
    const keys = Object.keys(value).sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function isSuite(value: unknown): value is Suite {
  return typeof value === 'string' && (SUITES as readonly string[]).includes(value);
}

function stringArray(value: unknown): readonly string[] | null {
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) return null;
  return value as readonly string[];
}

function readJson(path: string): unknown {
  return parseJsonOrNull(readFileSync(path, 'utf8'));
}

// ---------------------------------------------------------- prompt builders
//
// Moved verbatim from run-benchmark.ts. The text these produce is the question
// every recorded transcript answered; changing a character here invalidates
// every transcript, which the runner will say out loud.

export function imageSpecs(entry: Record<string, unknown>): readonly Record<string, unknown>[] {
  return Array.isArray(entry.images) ? entry.images.filter(isRecord) : [];
}

function roleList(entry: Record<string, unknown>): readonly string[] {
  return imageSpecs(entry).map((spec) => (typeof spec.role === 'string' ? spec.role : 'artifact under review'));
}

/**
 * A stable description of which images a case sends. Deliberately a descriptor
 * and not a content hash so `--rescore` needs no filesystem or ffmpeg access.
 */
export function imagesKey(entry: Record<string, unknown>): string {
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

export function openPrompt(entry: Record<string, unknown>): string {
  const context = typeof entry.context === 'string' ? `${entry.context}\n\n` : '';
  return (
    `${context}${describeImages(roleList(entry))}Describe any problems with this artifact. ` +
    'If it is fine, say so plainly. Be specific and concrete.'
  );
}

export function closedPrompt(entry: Record<string, unknown>, criteria: readonly string[]): string {
  const context = typeof entry.context === 'string' ? `${entry.context}\n\n` : '';
  return (
    `${context}${describeImages(roleList(entry))}Assess this artifact against each criterion below. ` +
    'Reply with JSON only, an object mapping each criterion name to one of "PASS", "FAIL" or "NA", ' +
    'like {"criterion-name": "PASS"}. Use FAIL only when the criterion is genuinely violated.\n\n' +
    criteria.map((criterion) => `- ${criterion}`).join('\n')
  );
}

// ---------------------------------------------------------- prompt sources

/**
 * The first fenced block directly under `## <heading>`. The example READMEs and
 * the showcase READMEs both advertise their generation prompt this way; the
 * benchmark measures exactly that text and nothing retyped beside it.
 */
export function extractFencedPrompt(markdown: string, heading: string): string | null {
  const lines = markdown.split('\n');
  const target = `## ${heading}`;
  let index = lines.findIndex((line) => line.trim() === target);
  if (index === -1) return null;
  index += 1;
  while (index < lines.length && lines[index]?.trim() === '') index += 1;
  const opener = lines[index];
  if (opener === undefined || !/^```/.test(opener.trim())) return null;
  const body: string[] = [];
  for (index += 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line === undefined || line.trim() === '```') break;
    body.push(line);
  }
  const text = body.join('\n').trim();
  return text === '' ? null : text;
}

export function hasPromptHeading(markdown: string, heading: string): boolean {
  return markdown.split('\n').some((line) => line.trim() === `## ${heading}`);
}

// ----------------------------------------------------------------- loading

function loadRubric(path: string, id: string): Rubric {
  const parsed = readJson(path);
  if (!isRecord(parsed)) throw new Error(`${path}: rubric is not an object`);
  if (parsed.id !== id) throw new Error(`${path}: rubric id must be "${id}"`);
  if (parsed.kind !== 'axes' && parsed.kind !== 'anchored') throw new Error(`${path}: kind must be axes or anchored`);
  const entries = (value: unknown, what: string): readonly RubricEntry[] => {
    if (value === undefined) return [];
    if (!Array.isArray(value)) throw new Error(`${path}: ${what} must be an array`);
    return value.map((item) => {
      if (!isRecord(item) || typeof item.id !== 'string' || typeof item.question !== 'string') {
        throw new Error(`${path}: every ${what} entry needs id and question`);
      }
      return { id: item.id, question: item.question };
    });
  };
  const hardGates = stringArray(parsed.hardGates);
  if (hardGates === null) throw new Error(`${path}: hardGates must be a string array`);
  if (typeof parsed.readiness !== 'string') throw new Error(`${path}: readiness must be a string`);

  let scale: Rubric['scale'];
  if (parsed.kind === 'anchored') {
    const raw = parsed.scale;
    if (!isRecord(raw) || raw.min !== 0 || raw.max !== 3 || !isRecord(raw.anchors)) {
      throw new Error(`${path}: an anchored rubric needs scale {min: 0, max: 3, anchors}`);
    }
    const anchors: Record<string, string> = {};
    for (const step of ['0', '1', '2', '3']) {
      const text = raw.anchors[step];
      if (typeof text !== 'string' || text === '') throw new Error(`${path}: scale.anchors.${step} must be a non-empty string`);
      anchors[step] = text;
    }
    scale = { min: 0, max: 3, anchors };
  }

  return {
    id,
    kind: parsed.kind,
    ...(scale === undefined ? {} : { scale }),
    dimensions: entries(parsed.dimensions, 'dimensions'),
    gates: entries(parsed.gates, 'gates'),
    hardGates,
    readiness: parsed.readiness,
    raw: parsed,
  };
}

function loadManifest(path: string): Manifest {
  const parsed = readJson(path);
  if (!isRecord(parsed)) throw new Error(`${path}: manifest is not valid JSON`);
  if (parsed.schema !== MANIFEST_SCHEMA) throw new Error(`${path}: schema must be "${MANIFEST_SCHEMA}"`);

  if (!isRecord(parsed.suites)) throw new Error(`${path}: suites must be an object`);
  const suites: Partial<Record<Suite, SuiteSpec>> = {};
  for (const suite of SUITES) {
    const spec = parsed.suites[suite];
    const measures = isRecord(spec) ? stringArray(spec.measures) : null;
    if (!isRecord(spec) || typeof spec.description !== 'string' || measures === null) {
      throw new Error(`${path}: suites.${suite} needs description and measures`);
    }
    suites[suite] = { description: spec.description, measures };
  }
  for (const key of Object.keys(parsed.suites)) {
    if (!isSuite(key)) throw new Error(`${path}: unknown suite "${key}"`);
  }

  if (!isRecord(parsed.rubrics)) throw new Error(`${path}: rubrics must be an object`);
  const rubrics: Record<string, string> = {};
  for (const [id, value] of Object.entries(parsed.rubrics)) {
    if (typeof value !== 'string') throw new Error(`${path}: rubrics.${id} must be a path`);
    rubrics[id] = value;
  }

  const diagnostic = parsed.diagnostic;
  const closedCriteria = isRecord(diagnostic) ? stringArray(diagnostic.closedCriteria) : null;
  if (
    !isRecord(diagnostic) || closedCriteria === null ||
    typeof diagnostic.transcripts !== 'string' || typeof diagnostic.baseline !== 'string' ||
    typeof diagnostic.exampleRoot !== 'string' || typeof diagnostic.visionModel !== 'string'
  ) {
    throw new Error(`${path}: diagnostic needs closedCriteria, transcripts, baseline, exampleRoot, visionModel`);
  }

  const coverage = parsed.coverage;
  if (!isRecord(coverage) || !isRecord(coverage.examples) || !isRecord(coverage.showcases) || !isRecord(coverage.commands)) {
    throw new Error(`${path}: coverage needs examples, showcases, commands`);
  }
  const { examples, showcases, commands } = coverage;
  if (typeof examples.root !== 'string' || typeof examples.promptHeading !== 'string' || !Array.isArray(examples.exclude)) {
    throw new Error(`${path}: coverage.examples needs root, promptHeading, exclude`);
  }
  const exclude = examples.exclude.map((item) => {
    if (!isRecord(item) || typeof item.path !== 'string' || typeof item.reason !== 'string' || item.reason === '') {
      throw new Error(`${path}: every coverage.examples.exclude entry needs path and a reason`);
    }
    return { path: item.path, reason: item.reason };
  });
  if (typeof showcases.root !== 'string' || typeof showcases.promptHeading !== 'string' || typeof showcases.caseIdPrefix !== 'string') {
    throw new Error(`${path}: coverage.showcases needs root, promptHeading, caseIdPrefix`);
  }
  const normalClasses = stringArray(commands.normalClasses);
  const boundaryClasses = stringArray(commands.boundaryClasses);
  if (normalClasses === null || boundaryClasses === null || !isRecord(commands.exempt)) {
    throw new Error(`${path}: coverage.commands needs normalClasses, boundaryClasses, exempt`);
  }
  const exempt: Record<string, string> = {};
  for (const [command, reason] of Object.entries(commands.exempt)) {
    if (typeof reason !== 'string' || reason === '') throw new Error(`${path}: exemption for ${command} needs a reason`);
    exempt[command] = reason;
  }

  const tiers = parsed.tiers;
  const core = isRecord(tiers) ? stringArray(tiers.core) : null;
  const catalogue = isRecord(tiers) ? stringArray(tiers.catalogue) : null;
  if (core === null || catalogue === null || ![...core, ...catalogue].every(isSuite)) {
    throw new Error(`${path}: tiers.core and tiers.catalogue must list suites`);
  }

  return {
    schema: MANIFEST_SCHEMA,
    suites: suites as Record<Suite, SuiteSpec>,
    rubrics,
    diagnostic: {
      closedCriteria,
      transcripts: diagnostic.transcripts,
      baseline: diagnostic.baseline,
      exampleRoot: diagnostic.exampleRoot,
      visionModel: diagnostic.visionModel,
    },
    coverage: {
      examples: { root: examples.root, promptHeading: examples.promptHeading, exclude },
      showcases: { root: showcases.root, promptHeading: showcases.promptHeading, caseIdPrefix: showcases.caseIdPrefix },
      commands: { normalClasses, boundaryClasses, exempt },
    },
    tiers: { core: core as readonly Suite[], catalogue: catalogue as readonly Suite[] },
  };
}

function parseExecution(value: unknown, where: string): Execution {
  if (!isRecord(value)) throw new Error(`${where}: execution must be an object`);
  const { kind, collector, paid, provider, bindContracts } = value;
  if (kind !== 'deterministic' && kind !== 'semantic' && kind !== 'generation') {
    throw new Error(`${where}: execution.kind must be deterministic, semantic or generation`);
  }
  if (collector !== 'runner' && collector !== 'host') throw new Error(`${where}: execution.collector must be runner or host`);
  if (typeof paid !== 'boolean') throw new Error(`${where}: execution.paid must be a boolean`);
  if (provider !== undefined && typeof provider !== 'string') throw new Error(`${where}: execution.provider must be a string`);
  if (bindContracts !== undefined && typeof bindContracts !== 'boolean') {
    throw new Error(`${where}: execution.bindContracts must be a boolean`);
  }
  return {
    kind, collector, paid,
    ...(provider === undefined ? {} : { provider }),
    ...(bindContracts === undefined ? {} : { bindContracts }),
  };
}

function loadCase(root: string, path: string, suite: Suite): BenchmarkCase {
  const where = relative(root, path);
  const parsed = readJson(path);
  if (!isRecord(parsed)) throw new Error(`${where}: case is not valid JSON`);

  const id = parsed.id;
  if (typeof id !== 'string' || id === '') throw new Error(`${where}: id must be a non-empty string`);
  if (id !== basename(path, '.json')) throw new Error(`${where}: id "${id}" must equal the file name`);
  if (parsed.suite !== suite) throw new Error(`${where}: suite must be "${suite}" (the directory it lives in)`);
  if (typeof parsed.capability !== 'string' || parsed.capability === '') throw new Error(`${where}: capability is required`);
  if (typeof parsed.summary !== 'string' || parsed.summary === '') throw new Error(`${where}: summary is required`);
  const skills = stringArray(parsed.skills);
  if (skills === null || skills.length === 0) throw new Error(`${where}: skills must name at least one skill`);
  const commands = parsed.commands === undefined ? undefined : stringArray(parsed.commands);
  if (commands === null) throw new Error(`${where}: commands must be a string array`);
  if (typeof parsed.rubric !== 'string') throw new Error(`${where}: rubric is required`);
  const execution = parseExecution(parsed.execution, where);

  const optionalString = (key: string): string | undefined => {
    const value = parsed[key];
    if (value !== undefined && typeof value !== 'string') throw new Error(`${where}: ${key} must be a string`);
    return value;
  };
  const optionalStrings = (key: string): readonly string[] | undefined => {
    const value = parsed[key];
    if (value === undefined) return undefined;
    const list = stringArray(value);
    if (list === null) throw new Error(`${where}: ${key} must be a string array`);
    return list;
  };

  let promptSource: PromptSource | undefined;
  if (parsed.promptSource !== undefined) {
    const source = parsed.promptSource;
    if (!isRecord(source) || typeof source.path !== 'string' || typeof source.heading !== 'string') {
      throw new Error(`${where}: promptSource needs path and heading`);
    }
    promptSource = { path: source.path, heading: source.heading };
  }

  let expectedRouting: ExpectedRouting | undefined;
  if (parsed.expectedRouting !== undefined) {
    const routing = parsed.expectedRouting;
    if (!isRecord(routing) || typeof routing.owningArtifact !== 'string' || typeof routing.correctiveAction !== 'string') {
      throw new Error(`${where}: expectedRouting needs owningArtifact and correctiveAction`);
    }
    expectedRouting = {
      owningArtifact: routing.owningArtifact,
      correctiveAction: routing.correctiveAction,
      ...(typeof routing.maxScope === 'string' ? { maxScope: routing.maxScope } : {}),
    };
  }

  const tier = parsed.tier;
  if (tier !== undefined && tier !== 'deterministic' && tier !== 'semantic') {
    throw new Error(`${where}: tier must be deterministic or semantic`);
  }
  const images = parsed.images === undefined ? undefined : imageSpecs(parsed).map((spec) => ({
    ...(typeof spec.fixture === 'string' ? { fixture: spec.fixture } : {}),
    ...(typeof spec.example === 'string' ? { example: spec.example } : {}),
    ...(typeof spec.role === 'string' ? { role: spec.role } : {}),
  }));
  const expect = parsed.expect;
  if (expect !== undefined && !isRecord(expect)) throw new Error(`${where}: expect must be an object`);

  const prompt = optionalString('prompt');
  const requiredDimensions = optionalStrings('requiredDimensions');
  const hardGates = optionalStrings('hardGates');
  const example = optionalString('example');
  const pack = optionalString('pack');
  const className = optionalString('class');
  const checker = optionalString('checker');
  const scene = optionalString('scene');
  const fixture = optionalString('fixture');
  const production = optionalString('production');
  const context = optionalString('context');
  const criterion = optionalString('criterion');
  const keywords = optionalStrings('keywords');
  const owningArtifact = optionalString('owningArtifact');
  const correctiveAction = optionalString('correctiveAction');

  return {
    id, suite, capability: parsed.capability, summary: parsed.summary, skills, rubric: parsed.rubric, execution,
    ...(commands === undefined ? {} : { commands }),
    ...(prompt === undefined ? {} : { prompt }),
    ...(promptSource === undefined ? {} : { promptSource }),
    ...(requiredDimensions === undefined ? {} : { requiredDimensions }),
    ...(hardGates === undefined ? {} : { hardGates }),
    ...(expectedRouting === undefined ? {} : { expectedRouting }),
    ...(example === undefined ? {} : { example }),
    ...(pack === undefined ? {} : { pack }),
    ...(className === undefined ? {} : { class: className }),
    ...(tier === undefined ? {} : { tier }),
    ...(checker === undefined ? {} : { checker }),
    ...(scene === undefined ? {} : { scene }),
    ...(fixture === undefined ? {} : { fixture }),
    ...(production === undefined ? {} : { production }),
    ...(images === undefined ? {} : { images }),
    ...(context === undefined ? {} : { context }),
    ...(criterion === undefined ? {} : { criterion }),
    ...(keywords === undefined ? {} : { keywords }),
    ...(expect === undefined ? {} : { expect }),
    ...(owningArtifact === undefined ? {} : { owningArtifact }),
    ...(correctiveAction === undefined ? {} : { correctiveAction }),
    file: where,
    raw: parsed,
  };
}

/**
 * Loads the manifest, its rubrics and every case. Throws on the first
 * structural problem: a catalogue that half-loads would report coverage for
 * cases that do not exist.
 */
export function loadCatalogue(root: string, manifestPath: string = join(root, DEFAULT_MANIFEST)): Catalogue {
  const manifest = loadManifest(manifestPath);
  const manifestDir = dirname(manifestPath);

  const rubrics = new Map<string, Rubric>();
  for (const [id, relativePath] of Object.entries(manifest.rubrics)) {
    const path = resolve(manifestDir, relativePath);
    if (!existsSync(path)) throw new Error(`${relative(root, manifestPath)}: rubric ${id} points at missing ${relativePath}`);
    rubrics.set(id, loadRubric(path, id));
  }

  const casesRoot = join(manifestDir, 'cases');
  const cases: BenchmarkCase[] = [];
  const seen = new Map<string, string>();
  if (existsSync(casesRoot)) {
    for (const entry of readdirSync(casesRoot, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const where = relative(root, join(casesRoot, entry.name));
      if (!entry.isDirectory()) throw new Error(`${where}: only suite directories belong under cases/`);
      if (!isSuite(entry.name)) throw new Error(`${where}: not a suite (expected one of ${SUITES.join(', ')})`);
      const suite = entry.name;
      const files = readdirSync(join(casesRoot, suite)).sort();
      for (const file of files) {
        const path = join(casesRoot, suite, file);
        if (extname(file) !== '.json' || !statSync(path).isFile()) throw new Error(`${relative(root, path)}: only <id>.json case files belong here`);
        const loaded = loadCase(root, path, suite);
        const duplicate = seen.get(loaded.id);
        if (duplicate !== undefined) throw new Error(`${loaded.file}: duplicate case id "${loaded.id}" (also ${duplicate})`);
        seen.set(loaded.id, loaded.file);
        cases.push(loaded);
      }
    }
  }

  return { root, manifestPath, manifestDir, manifest, rubrics, cases };
}

// ------------------------------------------------------------ fingerprint

export function isLegacyDiagnostic(entry: BenchmarkCase): boolean {
  return entry.tier !== undefined;
}

/**
 * The text the case actually puts to a reviewer or a host agent. For the
 * legacy diagnostic cases this is the pair of vision prompts; for the rest it
 * is the inline prompt or the fenced block the promptSource points at.
 */
export function resolvePrompt(catalogue: Catalogue, entry: BenchmarkCase): string {
  if (isLegacyDiagnostic(entry)) {
    const raw = entry.raw as Record<string, unknown>;
    return `${openPrompt(raw)}\n---\n${closedPrompt(raw, catalogue.manifest.diagnostic.closedCriteria)}`;
  }
  if (entry.prompt !== undefined) return entry.prompt;
  if (entry.promptSource !== undefined) {
    const path = join(catalogue.root, entry.promptSource.path);
    if (!existsSync(path)) throw new Error(`${entry.file}: promptSource ${entry.promptSource.path} does not exist`);
    const text = extractFencedPrompt(readFileSync(path, 'utf8'), entry.promptSource.heading);
    if (text === null) {
      throw new Error(`${entry.file}: no fenced block under "## ${entry.promptSource.heading}" in ${entry.promptSource.path}`);
    }
    return text;
  }
  throw new Error(`${entry.file}: a case needs prompt or promptSource`);
}

export function contractPath(root: string, reference: string): string {
  const [skill, command] = reference.split('/');
  return join(root, 'skills', skill ?? '', 'commands', `${command ?? ''}.md`);
}

export interface Fingerprint {
  readonly value: string;
  readonly short: string;
  readonly contracts: Readonly<Record<string, string>>;
}

/**
 * Binds the case definition, the exact prompt it resolves to, the rubric it is
 * scored against and — when the case says so — the command contracts it holds
 * the agent to. A result recorded under a different fingerprint answered a
 * different question.
 */
export function fingerprintCase(catalogue: Catalogue, entry: BenchmarkCase): Fingerprint {
  const rubric = catalogue.rubrics.get(entry.rubric);
  if (rubric === undefined) throw new Error(`${entry.file}: unknown rubric "${entry.rubric}"`);
  const contracts: Record<string, string> = {};
  if (entry.execution.bindContracts === true) {
    for (const reference of entry.commands ?? []) {
      const path = contractPath(catalogue.root, reference);
      if (!existsSync(path)) throw new Error(`${entry.file}: cannot bind missing contract ${reference}`);
      contracts[reference] = sha256(readFileSync(path));
    }
  }
  const value = sha256(canonicalJson({
    case: entry.raw,
    prompt: resolvePrompt(catalogue, entry),
    rubric: canonicalJson(rubric.raw),
    contracts,
  }));
  return { value, short: value.slice(0, 16), contracts };
}

// ---------------------------------------------------------------- evidence

export type BaselineState = 'MEASURED' | 'UNMEASURED';

/** The recorded verdicts the diagnostic suite compares against, keyed by case id. */
export function loadBaseline(path: string): Record<string, Record<string, unknown>> {
  if (!existsSync(path)) return {};
  const parsed = readJson(path);
  if (!isRecord(parsed) || !isRecord(parsed.cases)) return {};
  const cases: Record<string, Record<string, unknown>> = {};
  for (const [id, value] of Object.entries(parsed.cases)) {
    if (!isRecord(value)) continue;
    cases[id] = { ...value };
  }
  return cases;
}

/** Where `--score --update-baseline` records host-collected verdicts. Created only by real evidence. */
export function resultsBaselinePath(catalogue: Catalogue): string {
  return join(catalogue.manifestDir, 'results', 'baseline.json');
}

export function baselineStates(catalogue: Catalogue): ReadonlyMap<string, BaselineState> {
  const measured = new Set([
    ...Object.keys(loadBaseline(resolve(catalogue.root, catalogue.manifest.diagnostic.baseline))),
    ...Object.keys(loadBaseline(resultsBaselinePath(catalogue))),
  ]);
  const states = new Map<string, BaselineState>();
  for (const entry of catalogue.cases) states.set(entry.id, measured.has(entry.id) ? 'MEASURED' : 'UNMEASURED');
  return states;
}

export function transcriptPath(catalogue: Catalogue, id: string): string {
  return resolve(catalogue.root, catalogue.manifest.diagnostic.transcripts, `${id}.json`);
}

// ---------------------------------------------------------------- coverage

export interface ExampleCoverage {
  readonly withPrompt: readonly string[];
  readonly excluded: readonly { readonly path: string; readonly reason: string }[];
  readonly covered: readonly string[];
  readonly missing: readonly string[];
  readonly orphans: readonly string[];
}

export interface ShowcaseCoverage {
  readonly present: boolean;
  readonly showcases: readonly string[];
  readonly covered: readonly string[];
  readonly missing: readonly string[];
  readonly orphans: readonly string[];
  readonly manifestMismatches: readonly string[];
}

export interface CommandCoverage {
  readonly skill: string;
  readonly command: string;
  readonly normal: number;
  readonly boundary: number;
  readonly executable: number;
  readonly benchmarkCases: number;
  readonly state: 'OK' | 'EXEMPT' | 'GAP';
  readonly detail: string;
}

export interface CoverageReport {
  readonly suites: Readonly<Record<Suite, number>>;
  readonly examples: ExampleCoverage;
  readonly showcases: ShowcaseCoverage;
  readonly commands: readonly CommandCoverage[];
  readonly runnerSemantic: { readonly total: number; readonly withTranscript: number };
}

function directories(path: string): readonly string[] {
  if (!existsSync(path)) return [];
  return readdirSync(path, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function exampleCoverage(catalogue: Catalogue): ExampleCoverage {
  const { root, manifest } = catalogue;
  const { root: examplesRoot, promptHeading, exclude } = manifest.coverage.examples;
  const excludedPaths = new Set(exclude.map((item) => item.path));
  const withPrompt: string[] = [];
  for (const name of directories(join(root, examplesRoot))) {
    const readme = join(root, examplesRoot, name, 'README.md');
    if (!existsSync(readme)) continue;
    if (excludedPaths.has(`${examplesRoot}/${name}`)) continue;
    if (hasPromptHeading(readFileSync(readme, 'utf8'), promptHeading)) withPrompt.push(name);
  }
  const production = catalogue.cases.filter((entry) => entry.suite === 'production');
  const byExample = new Map<string, BenchmarkCase[]>();
  for (const entry of production) {
    const list = byExample.get(entry.example ?? '') ?? [];
    list.push(entry);
    byExample.set(entry.example ?? '', list);
  }
  const covered = withPrompt.filter((name) => byExample.has(name));
  const missing = withPrompt.filter((name) => !byExample.has(name));
  const orphans = production
    .filter((entry) => entry.example === undefined || !withPrompt.includes(entry.example))
    .map((entry) => entry.id);
  return { withPrompt, excluded: exclude, covered, missing, orphans };
}

function showcaseCoverage(catalogue: Catalogue): ShowcaseCoverage {
  const { root, manifest } = catalogue;
  const { root: packsRoot, promptHeading } = manifest.coverage.showcases;
  const present = existsSync(join(root, packsRoot));
  const showcases: string[] = [];
  for (const slug of directories(join(root, packsRoot))) {
    const readme = join(root, packsRoot, slug, 'README.md');
    if (existsSync(readme) && hasPromptHeading(readFileSync(readme, 'utf8'), promptHeading)) showcases.push(slug);
  }
  const packs = catalogue.cases.filter((entry) => entry.suite === 'packs');
  const byPack = new Map(packs.map((entry) => [entry.pack ?? '', entry] as const));
  const covered = showcases.filter((slug) => byPack.has(slug));
  const missing = showcases.filter((slug) => !byPack.has(slug));
  const orphans = packs.filter((entry) => entry.pack === undefined || !showcases.includes(entry.pack)).map((entry) => entry.id);

  const manifestMismatches: string[] = [];
  const packsManifest = join(root, packsRoot, 'manifest.json');
  if (existsSync(packsManifest)) {
    const parsed = readJson(packsManifest);
    const entries = isRecord(parsed) && Array.isArray(parsed.packs) ? parsed.packs : Array.isArray(parsed) ? parsed : [];
    const listed = new Set<string>();
    for (const item of entries) {
      if (!isRecord(item) || typeof item.slug !== 'string') continue;
      listed.add(item.slug);
      const expected = byPack.get(item.slug);
      if (expected === undefined) manifestMismatches.push(`${item.slug}: listed in ${packsRoot}/manifest.json with no packs case`);
      else if (item.benchmarkCase !== expected.id) {
        manifestMismatches.push(`${item.slug}: benchmarkCase must be "${expected.id}", found ${JSON.stringify(item.benchmarkCase)}`);
      }
    }
    for (const slug of showcases) {
      if (!listed.has(slug)) manifestMismatches.push(`${slug}: has a showcase but no entry in ${packsRoot}/manifest.json`);
    }
  }
  return { present, showcases, covered, missing, orphans, manifestMismatches };
}

interface EvalCaseSummary {
  readonly command: string | undefined;
  readonly className: string;
  readonly executable: boolean;
}

function evalCases(root: string, skill: string): readonly EvalCaseSummary[] {
  const file = join(root, 'skills', skill, 'evals', 'evals.json');
  if (!existsSync(file)) return [];
  const parsed = readJson(file);
  if (!isRecord(parsed) || !Array.isArray(parsed.cases)) return [];
  return parsed.cases.filter(isRecord).map((entry) => ({
    command: typeof entry.command === 'string' ? entry.command : undefined,
    className: typeof entry.class === 'string' ? entry.class : '',
    executable: typeof entry.check === 'string',
  }));
}

export function commandInventory(root: string): readonly { readonly skill: string; readonly command: string }[] {
  const inventory: { skill: string; command: string }[] = [];
  for (const skill of directories(join(root, 'skills'))) {
    const commandsDir = join(root, 'skills', skill, 'commands');
    if (!existsSync(commandsDir)) continue;
    for (const file of readdirSync(commandsDir).sort()) {
      if (extname(file) === '.md') inventory.push({ skill, command: basename(file, '.md') });
    }
  }
  return inventory;
}

function commandCoverage(catalogue: Catalogue): readonly CommandCoverage[] {
  const { root, manifest } = catalogue;
  const { normalClasses, boundaryClasses, exempt } = manifest.coverage.commands;
  const rows: CommandCoverage[] = [];
  const evalCache = new Map<string, readonly EvalCaseSummary[]>();
  for (const { skill, command } of commandInventory(root)) {
    const cases = evalCache.get(skill) ?? evalCases(root, skill);
    evalCache.set(skill, cases);
    const owned = cases.filter((entry) => entry.command === command);
    const normal = owned.filter((entry) => normalClasses.includes(entry.className)).length;
    const boundary = owned.filter((entry) => boundaryClasses.includes(entry.className)).length;
    const executable = owned.filter((entry) => entry.executable).length;
    const reference = `${skill}/${command}`;
    const benchmarkCases = catalogue.cases.filter((entry) => entry.commands?.includes(reference) === true).length;
    const exemption = exempt[reference];
    let state: CommandCoverage['state'];
    let detail: string;
    if (normal > 0 && boundary > 0) {
      state = 'OK';
      detail = '';
    } else if (exemption !== undefined) {
      state = 'EXEMPT';
      detail = exemption;
    } else {
      state = 'GAP';
      const missing = [normal === 0 ? 'normal-side' : null, boundary === 0 ? 'boundary' : null].filter((item) => item !== null);
      detail = `no ${missing.join(' or ')} eval case`;
    }
    rows.push({ skill, command, normal, boundary, executable, benchmarkCases, state, detail });
  }
  return rows;
}

export function coverageReport(catalogue: Catalogue): CoverageReport {
  const suites: Record<Suite, number> = { diagnostic: 0, production: 0, packs: 0, 'pack-authoring': 0 };
  for (const entry of catalogue.cases) suites[entry.suite] += 1;
  const runnerSemantic = catalogue.cases.filter((entry) => entry.execution.collector === 'runner' && entry.execution.kind === 'semantic');
  return {
    suites,
    examples: exampleCoverage(catalogue),
    showcases: showcaseCoverage(catalogue),
    commands: commandCoverage(catalogue),
    runnerSemantic: {
      total: runnerSemantic.length,
      withTranscript: runnerSemantic.filter((entry) => existsSync(transcriptPath(catalogue, entry.id))).length,
    },
  };
}

// -------------------------------------------------------------- validation

export interface ValidationResult {
  readonly errors: readonly string[];
  readonly report: CoverageReport | null;
  readonly cases: number;
}

/** Names the synthetic fixtures the generator can produce, by reading its source. */
function generatedFixtureNames(root: string): ReadonlySet<string> {
  const generator = join(root, 'tests/fixtures/make-fixtures.ts');
  if (!existsSync(generator)) return new Set();
  const source = readFileSync(generator, 'utf8');
  return new Set([...source.matchAll(/'([a-z0-9-]+\.(?:mp4|png|jpg))'/g)].map((match) => match[1] ?? ''));
}

function validateCase(catalogue: Catalogue, entry: BenchmarkCase, fixtureNames: ReadonlySet<string>, errors: string[]): void {
  const { root, manifest } = catalogue;
  const fail = (message: string): void => {
    errors.push(`${entry.file}: ${message}`);
  };

  for (const skill of entry.skills) {
    if (!existsSync(join(root, 'skills', skill, 'SKILL.md'))) fail(`skill "${skill}" does not exist`);
  }
  for (const reference of entry.commands ?? []) {
    const [skill, command, ...rest] = reference.split('/');
    if (skill === undefined || command === undefined || rest.length > 0) {
      fail(`command "${reference}" must be <skill>/<command>`);
      continue;
    }
    if (!entry.skills.includes(skill)) fail(`command "${reference}" names a skill not listed in skills`);
    if (!existsSync(contractPath(root, reference))) fail(`command "${reference}" has no contract file`);
  }

  const rubric = catalogue.rubrics.get(entry.rubric);
  if (rubric === undefined) {
    fail(`unknown rubric "${entry.rubric}"`);
  } else {
    const dimensionIds = new Set(rubric.dimensions.map((item) => item.id));
    const gateIds = new Set([...dimensionIds, ...(rubric.gates ?? []).map((item) => item.id)]);
    for (const id of entry.requiredDimensions ?? []) {
      if (!dimensionIds.has(id)) fail(`requiredDimensions names "${id}", not a dimension of rubric ${rubric.id}`);
    }
    for (const id of entry.hardGates ?? []) {
      if (!gateIds.has(id)) fail(`hardGates names "${id}", not a gate or dimension of rubric ${rubric.id}`);
    }
  }

  const legacy = isLegacyDiagnostic(entry);
  const promptForms = [entry.prompt !== undefined, entry.promptSource !== undefined].filter(Boolean).length;
  if (!legacy && promptForms !== 1) fail('exactly one of prompt or promptSource is required');
  if (legacy && promptForms !== 0) fail('a legacy diagnostic case builds its prompts from context and images; prompt/promptSource are not allowed');
  if (entry.promptSource !== undefined) {
    try {
      resolvePrompt(catalogue, entry);
    } catch (error: unknown) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  const { execution } = entry;
  if (execution.collector === 'runner' && !(legacy && entry.suite === 'diagnostic')) {
    fail('execution.collector "runner" is reserved for legacy diagnostic cases; new cases are collected by a host agent');
  }
  if (execution.kind === 'generation' && !execution.paid) fail('execution.kind "generation" must be paid');
  if (execution.kind === 'deterministic' && execution.paid) fail('a deterministic case cannot be paid');
  if (legacy && (entry.tier === 'deterministic') !== (execution.kind === 'deterministic')) {
    fail('execution.kind must agree with the legacy tier');
  }
  if (execution.bindContracts === true && (entry.commands ?? []).length === 0) fail('bindContracts requires commands');

  if (entry.suite === 'production' && entry.example === undefined) fail('a production case needs example');
  if (entry.suite === 'packs') {
    if (entry.pack === undefined) fail('a packs case needs pack');
    else if (entry.id !== `${manifest.coverage.showcases.caseIdPrefix}${entry.pack}`) {
      fail(`a packs case for "${entry.pack}" must have id "${manifest.coverage.showcases.caseIdPrefix}${entry.pack}"`);
    }
  }
  if (entry.suite !== 'production' && entry.example !== undefined) fail('example is only meaningful in the production suite');
  if (entry.suite !== 'packs' && entry.pack !== undefined) fail('pack is only meaningful in the packs suite');

  if (legacy) {
    for (const spec of entry.images ?? []) {
      if (spec.example !== undefined && !existsSync(resolve(root, manifest.diagnostic.exampleRoot, spec.example))) {
        fail(`image ${spec.example} is missing under ${manifest.diagnostic.exampleRoot}`);
      }
      if (spec.fixture !== undefined && !fixtureNames.has(spec.fixture)) {
        fail(`image fixture "${spec.fixture}" is not produced by tests/fixtures/make-fixtures.ts`);
      }
    }
    if (entry.fixture !== undefined && !fixtureNames.has(entry.fixture)) {
      fail(`fixture "${entry.fixture}" is not produced by tests/fixtures/make-fixtures.ts`);
    }
    if (entry.criterion !== undefined && !manifest.diagnostic.closedCriteria.includes(entry.criterion)) {
      fail(`criterion "${entry.criterion}" is not in diagnostic.closedCriteria`);
    }
  }
}

/**
 * Every rule the benchmark surface must satisfy before CI may call it green.
 * Errors are collected, not thrown, so a contributor sees all of them at once.
 */
export function validateBenchmark(root: string, manifestPath?: string): ValidationResult {
  let catalogue: Catalogue;
  try {
    catalogue = loadCatalogue(root, manifestPath);
  } catch (error: unknown) {
    return { errors: [error instanceof Error ? error.message : String(error)], report: null, cases: 0 };
  }

  const errors: string[] = [];
  const fixtureNames = generatedFixtureNames(root);

  for (const [id, rubric] of catalogue.rubrics) {
    if (rubric.kind === 'axes' && rubric.hardGates.includes('precision')) {
      errors.push(`rubric ${id}: precision must stay outside hardGates`);
    }
    const known = new Set([...rubric.dimensions, ...(rubric.gates ?? [])].map((item) => item.id));
    for (const gate of rubric.hardGates) {
      if (!known.has(gate)) errors.push(`rubric ${id}: hard gate "${gate}" is neither a dimension nor a gate`);
    }
  }
  for (const suite of SUITES) {
    for (const measure of catalogue.manifest.suites[suite].measures) {
      if (suite === 'diagnostic') {
        const rubric = catalogue.rubrics.get('diagnostic');
        if (rubric !== undefined && !rubric.dimensions.some((item) => item.id === measure)) {
          errors.push(`manifest: suites.diagnostic measures "${measure}", not an axis of the diagnostic rubric`);
        }
      } else if (!catalogue.rubrics.has(measure)) {
        errors.push(`manifest: suites.${suite} measures "${measure}", not a rubric`);
      }
    }
  }
  for (const item of catalogue.manifest.coverage.examples.exclude) {
    if (!existsSync(join(root, item.path))) errors.push(`manifest: excluded example ${item.path} does not exist`);
  }
  for (const reference of Object.keys(catalogue.manifest.coverage.commands.exempt)) {
    if (!existsSync(contractPath(root, reference))) errors.push(`manifest: exemption for unknown command ${reference}`);
  }

  for (const entry of catalogue.cases) validateCase(catalogue, entry, fixtureNames, errors);

  // Fingerprints must be a pure function of the inputs. Computing them twice
  // from fresh object graphs catches any accidental dependence on iteration
  // order or mutable state.
  if (errors.length === 0) {
    const again = loadCatalogue(root, manifestPath);
    for (const entry of catalogue.cases) {
      const twin = again.cases.find((candidate) => candidate.id === entry.id);
      try {
        const first = fingerprintCase(catalogue, entry).value;
        const second = twin === undefined ? '' : fingerprintCase(again, twin).value;
        if (first !== second) errors.push(`${entry.file}: fingerprint is not deterministic`);
      } catch (error: unknown) {
        errors.push(error instanceof Error ? error.message : String(error));
      }
    }
  }

  const report = coverageReport(catalogue);
  for (const name of report.examples.missing) {
    errors.push(`${catalogue.manifest.coverage.examples.root}/${name}/README.md advertises a prompt but has no production benchmark case`);
  }
  for (const id of report.examples.orphans) errors.push(`production case ${id} points at an example that does not advertise a prompt`);
  for (const slug of report.showcases.missing) {
    errors.push(`${catalogue.manifest.coverage.showcases.root}/${slug}/README.md is a showcase with no packs benchmark case`);
  }
  for (const id of report.showcases.orphans) errors.push(`packs case ${id} points at a pack with no showcase`);
  for (const line of report.showcases.manifestMismatches) errors.push(`${catalogue.manifest.coverage.showcases.root}/manifest.json: ${line}`);
  for (const row of report.commands) {
    if (row.state === 'GAP') errors.push(`command ${row.skill}/${row.command}: ${row.detail}`);
  }

  return { errors, report, cases: catalogue.cases.length };
}

// ----------------------------------------------------------------- report

export function summaryLine(result: ValidationResult, manifest: Manifest | null): string {
  const report = result.report;
  if (report === null) return 'benchmark manifest: INVALID';
  const examples = `${String(report.examples.covered.length)}/${String(report.examples.withPrompt.length)}`;
  const showcases = report.showcases.present
    ? `${String(report.showcases.covered.length)}/${String(report.showcases.showcases.length)}`
    : `0/0 (${manifest?.coverage.showcases.root ?? 'extension-packs'} absent)`;
  const okCommands = report.commands.filter((row) => row.state !== 'GAP').length;
  return `benchmark manifest: ${result.errors.length === 0 ? 'OK' : 'FAILED'} (${String(result.cases)} cases; examples ${examples}; showcases ${showcases}; commands ${String(okCommands)}/${String(report.commands.length)})`;
}

export function formatReport(report: CoverageReport, manifest: Manifest): string {
  const lines: string[] = [];
  lines.push('suites');
  for (const suite of SUITES) lines.push(`  ${suite.padEnd(16)} ${String(report.suites[suite])} case(s)`);
  lines.push('');
  lines.push(`examples with ## ${manifest.coverage.examples.promptHeading}: ${String(report.examples.covered.length)}/${String(report.examples.withPrompt.length)} covered`);
  for (const name of report.examples.missing) lines.push(`  MISSING  ${name}`);
  for (const item of report.examples.excluded) lines.push(`  excluded ${item.path} — ${item.reason}`);
  lines.push('');
  if (report.showcases.present) {
    lines.push(`showcases under ${manifest.coverage.showcases.root}/: ${String(report.showcases.covered.length)}/${String(report.showcases.showcases.length)} covered`);
    for (const slug of report.showcases.missing) lines.push(`  MISSING  ${slug}`);
  } else {
    lines.push(`showcases: ${manifest.coverage.showcases.root}/ absent → 0/0 (the gate is armed; the first showcase without a case fails validation)`);
  }
  lines.push('');
  lines.push('commands (normal-side / boundary / executable eval cases; benchmark cases naming the command)');
  let current = '';
  for (const row of report.commands) {
    if (row.skill !== current) {
      current = row.skill;
      lines.push(current);
    }
    const counts = `${String(row.normal)}/${String(row.boundary)}/${String(row.executable)}`.padEnd(9);
    const suffix = row.detail === '' ? '' : ` — ${row.detail}`;
    lines.push(`  ${row.command.padEnd(28)} ${counts} bench ${String(row.benchmarkCases).padEnd(3)} ${row.state}${suffix}`);
  }
  lines.push('');
  lines.push(`runner-collected semantic: ${String(report.runnerSemantic.total)} (transcripts ${String(report.runnerSemantic.withTranscript)})`);
  return lines.join('\n');
}
