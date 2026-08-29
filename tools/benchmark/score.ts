/**
 * Offline scoring of a recorded benchmark result against its rubric.
 *
 * A host agent or a human reviewer records what they observed as a structured
 * result file; this module turns it into a verdict without a provider call.
 * Dimensions are reported one by one and never summed: a strong score in one
 * surface must not hide a regression in another.
 */
import type { BenchmarkCase, Rubric } from './manifest.ts';
import { isRecord } from './manifest.ts';

export const RESULT_SCHEMA = 'vps-benchmark-result/1';

export type GateValue = boolean | 'na';
export type Score = 0 | 1 | 2 | 3;

export interface RepeatResult {
  readonly index: number;
  readonly gates?: Readonly<Record<string, GateValue>>;
  readonly dimensions?: Readonly<Record<string, Score>>;
  readonly axes?: Readonly<Record<string, GateValue>>;
  readonly routing?: { readonly owningArtifact?: string; readonly correctiveAction?: string; readonly scope?: string };
  readonly notes?: string;
}

export interface RecordedResult {
  readonly schema: typeof RESULT_SCHEMA;
  readonly caseId: string;
  readonly fingerprint?: string;
  readonly execution?: Readonly<Record<string, unknown>>;
  readonly repeats: readonly RepeatResult[];
}

export interface RepeatVerdict {
  readonly index: number;
  readonly ready: boolean;
  readonly reasons: readonly string[];
  /** Diagnostic rubric only: precision travels beside the verdict, never inside it. */
  readonly precision?: boolean;
  readonly dimensions: Readonly<Record<string, Score>>;
}

export type Binding = 'BOUND' | 'UNBOUND' | 'STALE';

export interface ScoreReport {
  readonly caseId: string;
  readonly binding: Binding;
  readonly repeats: readonly RepeatVerdict[];
  readonly majorityReady: boolean;
  readonly rates: Readonly<Record<string, string>>;
  readonly unstable: boolean;
}

// ------------------------------------------------------------ aggregation

/**
 * Ties fail. With an even repeat count a case that passes half the time has not
 * demonstrated the ability, and the conservative reading is the honest one.
 */
export function majority(values: readonly boolean[]): boolean | undefined {
  if (values.length === 0) return undefined;
  return values.filter(Boolean).length * 2 > values.length;
}

export function observedRates(axes: Readonly<Record<string, readonly boolean[]>>): { rates: Record<string, string>; unstable: boolean } {
  const rates: Record<string, string> = {};
  let unstable = false;
  for (const [axis, values] of Object.entries(axes)) {
    if (values.length === 0) continue;
    const passed = values.filter(Boolean).length;
    rates[axis] = `${String(passed)}/${String(values.length)}`;
    if (passed !== 0 && passed !== values.length) unstable = true;
  }
  return { rates, unstable };
}

// ----------------------------------------------------------------- parsing

function isGateValue(value: unknown): value is GateValue {
  return typeof value === 'boolean' || value === 'na';
}

function isScore(value: unknown): value is Score {
  return value === 0 || value === 1 || value === 2 || value === 3;
}

function gateMap(value: unknown, where: string): Readonly<Record<string, GateValue>> | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) throw new Error(`${where} must be an object`);
  const out: Record<string, GateValue> = {};
  for (const [key, item] of Object.entries(value)) {
    if (!isGateValue(item)) throw new Error(`${where}.${key} must be true, false or "na"`);
    out[key] = item;
  }
  return out;
}

export function parseRecordedResult(value: unknown): RecordedResult {
  if (!isRecord(value)) throw new Error('result must be an object');
  if (value.schema !== RESULT_SCHEMA) throw new Error(`result.schema must be "${RESULT_SCHEMA}"`);
  if (typeof value.caseId !== 'string' || value.caseId === '') throw new Error('result.caseId is required');
  if (value.fingerprint !== undefined && typeof value.fingerprint !== 'string') throw new Error('result.fingerprint must be a string');
  if (value.execution !== undefined && !isRecord(value.execution)) throw new Error('result.execution must be an object');
  if (!Array.isArray(value.repeats) || value.repeats.length === 0) throw new Error('result.repeats must be a non-empty array');

  const repeats = value.repeats.map((item, position): RepeatResult => {
    const where = `result.repeats[${String(position)}]`;
    if (!isRecord(item)) throw new Error(`${where} must be an object`);
    if (typeof item.index !== 'number') throw new Error(`${where}.index must be a number`);
    const gates = gateMap(item.gates, `${where}.gates`);
    const axes = gateMap(item.axes, `${where}.axes`);
    let dimensions: Record<string, Score> | undefined;
    if (item.dimensions !== undefined) {
      if (!isRecord(item.dimensions)) throw new Error(`${where}.dimensions must be an object`);
      dimensions = {};
      for (const [key, score] of Object.entries(item.dimensions)) {
        if (!isScore(score)) throw new Error(`${where}.dimensions.${key} must be 0, 1, 2 or 3`);
        dimensions[key] = score;
      }
    }
    let routing: RepeatResult['routing'];
    if (item.routing !== undefined) {
      if (!isRecord(item.routing)) throw new Error(`${where}.routing must be an object`);
      routing = {
        ...(typeof item.routing.owningArtifact === 'string' ? { owningArtifact: item.routing.owningArtifact } : {}),
        ...(typeof item.routing.correctiveAction === 'string' ? { correctiveAction: item.routing.correctiveAction } : {}),
        ...(typeof item.routing.scope === 'string' ? { scope: item.routing.scope } : {}),
      };
    }
    return {
      index: item.index,
      ...(gates === undefined ? {} : { gates }),
      ...(dimensions === undefined ? {} : { dimensions }),
      ...(axes === undefined ? {} : { axes }),
      ...(routing === undefined ? {} : { routing }),
      ...(typeof item.notes === 'string' ? { notes: item.notes } : {}),
    };
  });

  return {
    schema: RESULT_SCHEMA,
    caseId: value.caseId,
    ...(typeof value.fingerprint === 'string' ? { fingerprint: value.fingerprint } : {}),
    ...(isRecord(value.execution) ? { execution: value.execution } : {}),
    repeats,
  };
}

// ----------------------------------------------------------------- scoring

function normaliseScope(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Scores one repeat. Pure: the same inputs always produce the same verdict. */
export function scoreRepeat(rubric: Rubric, entry: BenchmarkCase, repeat: RepeatResult): RepeatVerdict {
  const reasons: string[] = [];
  const hardGates = entry.hardGates ?? rubric.hardGates;

  if (rubric.kind === 'axes') {
    const axes = { ...(repeat.axes ?? {}) };
    // Routing and scope are mechanical whenever the case declares them. The
    // recorded route decides the axis; a reviewer boolean never overrides it,
    // and an absent route is a failure, not a pass by omission.
    const explained = new Set<string>();
    if (entry.expectedRouting !== undefined) {
      const { owningArtifact, correctiveAction, maxScope } = entry.expectedRouting;
      const recorded = repeat.routing;
      if (recorded === undefined) {
        axes.routing = false;
        explained.add('routing');
        reasons.push(`routing not recorded; case declares expectedRouting ${owningArtifact}/${correctiveAction}`);
      } else {
        const matched = recorded.owningArtifact === owningArtifact && recorded.correctiveAction === correctiveAction;
        axes.routing = matched;
        if (!matched) {
          explained.add('routing');
          reasons.push(
            `routing expected ${owningArtifact}/${correctiveAction}, recorded ` +
            `${recorded.owningArtifact ?? '?'}/${recorded.correctiveAction ?? '?'}`,
          );
        }
      }
      if (maxScope !== undefined) {
        const scope = recorded?.scope;
        if (scope === undefined) {
          axes.scope = false;
          explained.add('scope');
          reasons.push(`scope not recorded; case declares maxScope "${maxScope}"`);
        } else {
          const matched = normaliseScope(scope) === normaliseScope(maxScope);
          axes.scope = matched;
          if (!matched) {
            explained.add('scope');
            reasons.push(`scope expected "${maxScope}", recorded "${scope}"`);
          }
        }
      }
    }
    for (const axis of hardGates) {
      const value = axes[axis];
      if (value === undefined) reasons.push(`axis ${axis} unscored`);
      else if (value === false && !explained.has(axis)) reasons.push(`axis ${axis} failed`);
    }
    const precision = axes.precision;
    return {
      index: repeat.index,
      ready: reasons.length === 0,
      reasons,
      ...(typeof precision === 'boolean' ? { precision } : {}),
      dimensions: {},
    };
  }

  const gates = repeat.gates ?? {};
  const dimensions = repeat.dimensions ?? {};
  for (const gate of hardGates) {
    // A hard gate that is also a dimension may be answered by its score.
    const explicit = gates[gate];
    const scored = dimensions[gate];
    if (explicit === false) reasons.push(`gate ${gate} failed`);
    else if (explicit === undefined && scored === undefined) reasons.push(`gate ${gate} unscored`);
    else if (explicit === undefined && scored !== undefined && scored < 2) reasons.push(`gate ${gate} failed (${String(scored)} < 2)`);
  }
  for (const dimension of entry.requiredDimensions ?? []) {
    if (hardGates.includes(dimension)) continue; // already judged as a gate
    const score = dimensions[dimension];
    if (score === undefined) reasons.push(`dimension ${dimension} unscored`);
    else if (score < 2) reasons.push(`${dimension}=${String(score)} < 2`);
  }
  return { index: repeat.index, ready: reasons.length === 0, reasons, dimensions };
}

export function scoreResult(rubric: Rubric, entry: BenchmarkCase, result: RecordedResult, binding: Binding): ScoreReport {
  const repeats = result.repeats.map((repeat) => scoreRepeat(rubric, entry, repeat));
  const axes: Record<string, readonly boolean[]> = { ready: repeats.map((verdict) => verdict.ready) };
  const precision = repeats.map((verdict) => verdict.precision).filter((value): value is boolean => value !== undefined);
  if (precision.length > 0) axes.precision = precision;
  for (const verdict of repeats) {
    for (const [dimension, score] of Object.entries(verdict.dimensions)) {
      const list = [...(axes[`dim:${dimension}`] ?? []), score >= 2];
      axes[`dim:${dimension}`] = list;
    }
  }
  const { rates } = observedRates(axes);
  // Flakiness is about the verdict, not about a dimension moving between 2 and 3.
  const { unstable } = observedRates({ ready: axes.ready ?? [], ...(axes.precision === undefined ? {} : { precision: axes.precision }) });
  return {
    caseId: result.caseId,
    binding,
    repeats,
    majorityReady: majority(axes.ready ?? []) === true,
    rates,
    unstable,
  };
}

export function formatScoreReport(report: ScoreReport): string {
  const lines: string[] = [];
  lines.push(`${report.caseId}  ${report.binding}${report.binding === 'UNBOUND' ? ' (result carries no fingerprint; scored, not comparable)' : ''}`);
  for (const verdict of report.repeats) {
    const precision = verdict.precision === undefined ? '' : `  precision ${verdict.precision ? 'ok' : 'MISS'}`;
    lines.push(`  repeat ${String(verdict.index)}  ${verdict.ready ? 'READY' : 'NOT READY'}${precision}`);
    for (const reason of verdict.reasons) lines.push(`    - ${reason}`);
    const scored = Object.entries(verdict.dimensions);
    if (scored.length > 0) lines.push(`    ${scored.map(([dimension, score]) => `${dimension}=${String(score)}`).join('  ')}`);
  }
  lines.push(`  majority ${report.majorityReady ? 'READY' : 'NOT READY'} (${report.rates.ready ?? 'n/a'})${report.unstable ? '  FLAKY' : ''}`);
  return lines.join('\n');
}
