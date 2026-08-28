#!/usr/bin/env node
/**
 * Lints a production directory for the failures that a finished video does not
 * reveal: decisions marked approved with nobody recorded as approving them, and
 * edit decisions that no longer describe the delivered master.
 *
 * Reads artifacts only. Generates nothing, calls no provider.
 *
 * `candidates/` and `review/` are deliberately not audited: they hold working
 * copies and review packs whose canonical artifacts live at their selected
 * locations, and auditing the copies double-reports every finding.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';

const EXIT_USAGE = 2;
const EXIT_FINDINGS = 1;

const APPROVED_STATES = new Set(['approved', 'locked']);
const SKIP_DIRECTORIES = new Set(['node_modules', '.git', 'candidates', 'review']);
const DURATION_TOLERANCE_SECONDS = 0.25;

interface Finding {
  readonly rule: string;
  readonly file: string;
  readonly message: string;
}

interface ArtifactMetadata {
  readonly decisionState?: string;
  readonly approvedBy?: string;
}

function usage(): void {
  console.log('Usage: validate-production.ts <production-dir> [--json]');
}

function walk(directory: string): readonly string[] {
  const found: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRECTORIES.has(entry.name)) continue;
      found.push(...walk(path));
      continue;
    }
    found.push(path);
  }
  return found;
}

/**
 * Values that spell out the absence of an approver rather than naming one. The
 * artifact specification's own unapproved example writes `approvedBy: null`, so
 * a lint that reads "null" as a person defeats itself.
 */
const ABSENT_APPROVERS = new Set(['', 'null', '~', 'none', 'n/a', 'tbd', '-', 'false', '[]', '{}']);

function normalizeApprover(raw: string | undefined): string | undefined {
  if (raw === undefined) return undefined;
  const cleaned = raw
    .replace(/[`*]/g, '')
    .trim()
    .replace(/^["']+|["']+$/g, '')
    .trim();
  return ABSENT_APPROVERS.has(cleaned.toLowerCase()) ? undefined : cleaned;
}

/**
 * Accepts both the YAML frontmatter form from the artifact specification and
 * the `- **key:** value` form documents use when the same fields are written
 * for a human reader.
 */
function readMarkdownMetadata(file: string): ArtifactMetadata {
  const text = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const metadata: Record<string, string> = {};

  const frontmatter = /^---\n([\s\S]*?)\n---/.exec(text);
  if (frontmatter?.[1] !== undefined) {
    for (const line of frontmatter[1].split('\n')) {
      const match = /^\s*([A-Za-z][A-Za-z0-9_]*)\s*:\s*(\S.*?)\s*$/.exec(line);
      if (match?.[1] !== undefined && match[2] !== undefined) metadata[match[1]] = match[2];
    }
  }

  for (const match of text.matchAll(/\*\*([A-Za-z][A-Za-z0-9_]*)\s*:?\*\*\s*:?\s*([^\n]*)/g)) {
    const key = match[1];
    const value = match[2];
    if (key === undefined || value === undefined) continue;
    if (metadata[key] === undefined) metadata[key] = value;
  }

  // Values are written for readers: emphasis, code ticks, and a trailing
  // parenthetical gloss are all common. Reduce to the bare state word.
  const decisionState = metadata.decisionState
    ?.replace(/[`*]/g, '')
    .trim()
    .split(/[\s(|]/, 1)[0]
    ?.toLowerCase();
  const approvedBy = normalizeApprover(metadata.approvedBy);

  return {
    ...(decisionState === undefined ? {} : { decisionState }),
    ...(approvedBy === undefined ? {} : { approvedBy }),
  };
}

/** Timelines and manifests carry the same decision metadata as top-level JSON keys. */
function readJsonMetadata(file: string): ArtifactMetadata {
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(file, 'utf8')) as unknown;
  } catch {
    return {};
  }
  if (!isRecord(parsed)) return {};
  const decisionState =
    typeof parsed.decisionState === 'string' ? parsed.decisionState.trim().toLowerCase() : undefined;
  const approvedBy = normalizeApprover(
    typeof parsed.approvedBy === 'string' ? parsed.approvedBy : undefined,
  );
  return {
    ...(decisionState === undefined || decisionState === '' ? {} : { decisionState }),
    ...(approvedBy === undefined ? {} : { approvedBy }),
  };
}

function readArtifactMetadata(file: string): ArtifactMetadata | null {
  if (file.endsWith('.md')) return readMarkdownMetadata(file);
  if (file.endsWith('.json')) return readJsonMetadata(file);
  return null;
}

// A missing ffprobe must surface as a finding, not as silently skipped
// cross-checks — a gate that cannot gather evidence has not passed.
let ffprobeMissing = false;

function probe(video: string, entries: string): readonly string[] {
  const result = spawnSync(
    'ffprobe',
    ['-v', 'error', '-select_streams', 'v:0', '-show_entries', entries, '-of', 'csv=p=0', video],
    { encoding: 'utf8' },
  );
  if (result.error !== undefined) {
    ffprobeMissing = true;
    return [];
  }
  if (result.status !== 0) return [];
  return result.stdout.trim().split(',');
}

function mediaDuration(video: string): number | null {
  const result = spawnSync(
    'ffprobe',
    ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', video],
    { encoding: 'utf8' },
  );
  if (result.error !== undefined) {
    ffprobeMissing = true;
    return null;
  }
  if (result.status !== 0) return null;
  const duration = Number(result.stdout.trim());
  return Number.isFinite(duration) ? duration : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function checkApprovals(files: readonly string[], root: string): readonly Finding[] {
  const findings: Finding[] = [];
  let sawDecisionState = false;

  for (const file of files) {
    const metadata = readArtifactMetadata(file);
    if (metadata === null || metadata.decisionState === undefined) continue;
    sawDecisionState = true;

    if (!APPROVED_STATES.has(metadata.decisionState)) continue;
    if (metadata.approvedBy !== undefined) continue;

    findings.push({
      rule: 'approval-without-approver',
      file: file.slice(root.length + 1),
      message:
        `decisionState is "${metadata.decisionState}" but no approvedBy is recorded. ` +
        'Approval is a human act; an agent may only advance an artifact to "selected".',
    });
  }

  if (!sawDecisionState) {
    findings.push({
      rule: 'no-artifact-metadata',
      file: basename(root),
      message:
        'no artifact declares a decisionState, so approval cannot be audited. ' +
        'Record decisionState and approvedBy on creative artifacts.',
    });
  }

  return findings;
}

interface TimelinePlan {
  readonly file: string;
  readonly plannedDuration: number;
  readonly render?: Record<string, unknown>;
  readonly renderOutput?: string;
  readonly decisionState?: string;
}

function checkTimelines(files: readonly string[], root: string): readonly Finding[] {
  const findings: Finding[] = [];

  const timelineFiles = files.filter((file) => basename(file).startsWith('timeline') && file.endsWith('.json'));
  const masters = files.filter(
    (file) => /master/i.test(basename(file)) && /\.(mp4|mov|mkv)$/i.test(file),
  );

  const plans: TimelinePlan[] = [];
  for (const timelineFile of timelineFiles) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(readFileSync(timelineFile, 'utf8')) as unknown;
    } catch {
      findings.push({
        rule: 'timeline-unreadable',
        file: timelineFile.slice(root.length + 1),
        message: 'timeline is not valid JSON',
      });
      continue;
    }
    if (!isRecord(parsed) || !Array.isArray(parsed.shots)) continue;

    const baseDir = dirname(timelineFile);
    let plannedDuration = 0;

    for (const [index, shot] of parsed.shots.entries()) {
      if (!isRecord(shot) || typeof shot.source !== 'string') continue;
      const source = isAbsolute(shot.source) ? shot.source : resolve(baseDir, shot.source);
      if (!existsSync(source)) {
        findings.push({
          rule: 'timeline-source-missing',
          file: timelineFile.slice(root.length + 1),
          message: `shots[${String(index)}] references a missing source: ${shot.source}`,
        });
      }
      if (typeof shot.duration === 'number') plannedDuration += shot.duration;
    }

    const render = isRecord(parsed.render) ? parsed.render : undefined;
    plans.push({
      file: timelineFile,
      plannedDuration,
      ...(render === undefined ? {} : { render }),
      ...(render !== undefined && typeof render.output === 'string' ? { renderOutput: render.output } : {}),
      ...(typeof parsed.decisionState === 'string'
        ? { decisionState: parsed.decisionState.trim().toLowerCase() }
        : {}),
    });
  }

  if (plans.length === 0 || masters.length === 0) return findings;

  // Probe each master exactly once rather than per (timeline, master) pair.
  const probed = new Map<string, { width: number; height: number; duration: number | null }>();
  for (const master of masters) {
    const [widthText, heightText] = probe(master, 'stream=width,height');
    probed.set(master, {
      width: Number(widthText),
      height: Number(heightText),
      duration: mediaDuration(master),
    });
  }

  for (const plan of plans) {
    // A superseded draft left at the top level must not indict the master the
    // current plan produced. A timeline that names its render output is checked
    // against that file alone; with several timelines and no named outputs,
    // only the ones a human approved or locked speak for the delivery.
    const targets =
      plan.renderOutput !== undefined
        ? masters.filter((master) => basename(master) === basename(String(plan.renderOutput)))
        : plans.length === 1 || APPROVED_STATES.has(plan.decisionState ?? '')
          ? masters
          : [];

    const timelinePath = plan.file.slice(root.length + 1);

    for (const master of targets) {
      const info = probed.get(master);
      if (info === undefined) continue;

      if (plan.render !== undefined && Number.isFinite(info.width) && Number.isFinite(info.height)) {
        if (plan.render.width !== info.width || plan.render.height !== info.height) {
          findings.push({
            rule: 'plan-delivery-mismatch',
            file: master.slice(root.length + 1),
            message:
              `master is ${String(info.width)}x${String(info.height)} but ${timelinePath} ` +
              `renders ${String(plan.render.width)}x${String(plan.render.height)}`,
          });
        }
      }

      if (info.duration !== null && plan.plannedDuration > 0) {
        const drift = Math.abs(info.duration - plan.plannedDuration);
        if (drift > DURATION_TOLERANCE_SECONDS) {
          findings.push({
            rule: 'plan-delivery-mismatch',
            file: master.slice(root.length + 1),
            message:
              `master runs ${info.duration.toFixed(2)}s but ${timelinePath} ` +
              `plans ${plan.plannedDuration.toFixed(2)}s. Reconcile the plan or record an explicit reopening.`,
          });
        }
      }
    }
  }

  if (ffprobeMissing) {
    findings.push({
      rule: 'ffprobe-unavailable',
      file: basename(root),
      message:
        'ffprobe is required but was not found in PATH; plan-delivery cross-checks did not run. ' +
        'A gate that cannot gather evidence has not passed.',
    });
  }

  return findings;
}

function main(): number {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      json: { type: 'boolean' },
      help: { type: 'boolean', short: 'h' },
    },
    strict: true,
  });

  if (values.help) {
    usage();
    return 0;
  }

  const target = positionals[0];
  if (positionals.length !== 1 || target === undefined) {
    usage();
    return EXIT_USAGE;
  }

  const root = resolve(target);
  if (!existsSync(root) || !statSync(root).isDirectory()) {
    console.error(`production directory does not exist: ${target}`);
    return EXIT_USAGE;
  }

  const files = walk(root);
  const findings = [...checkApprovals(files, root), ...checkTimelines(files, root)];

  if (values.json) {
    console.log(JSON.stringify({ root, findings, ok: findings.length === 0 }, null, 2));
  } else if (findings.length === 0) {
    console.log('no findings');
  } else {
    for (const finding of findings) {
      console.log(`${finding.rule}: ${finding.file}`);
      console.log(`  ${finding.message}`);
    }
  }

  return findings.length === 0 ? 0 : EXIT_FINDINGS;
}

try {
  process.exitCode = main();
} catch (error: unknown) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = EXIT_USAGE;
}
