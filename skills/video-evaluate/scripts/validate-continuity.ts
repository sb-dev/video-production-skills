#!/usr/bin/env node
/**
 * Checks a scene manifest for spatial continuity contradictions.
 *
 * Environment continuity is otherwise judged against recollection: both
 * continuity references list "environment" as a dimension to evaluate, but
 * nothing declares what the environment contains. That is how a pillar reaches
 * an approved reference frame while existing in no other shot.
 *
 * Deterministic. Reads declarations, not images; no provider, no media.
 */
import { existsSync, readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

const EXIT_USAGE = 2;
const EXIT_FINDINGS = 1;

interface Landmark {
  readonly id: string;
  readonly description?: string;
  readonly attachedTo?: string | null;
}

interface ShotDeclaration {
  readonly id: string;
  readonly present: readonly string[];
  readonly screenOrder?: readonly string[];
  readonly cameraSide?: string;
  readonly crossesAxis?: boolean;
  readonly attachments?: Readonly<Record<string, string | null>>;
}

interface SceneManifest {
  readonly sceneId: string;
  readonly cameraSide: string;
  readonly axisOrder: readonly string[];
  readonly landmarks: readonly Landmark[];
  readonly shots: readonly ShotDeclaration[];
}

interface Finding {
  readonly rule: string;
  readonly shot: string;
  readonly message: string;
}

function usage(): void {
  console.log('Usage: validate-continuity.ts <scene-manifest.json> [--json]');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringArray(value: unknown, field: string): readonly string[] {
  if (!Array.isArray(value)) throw new Error(`${field} must be an array of strings`);
  return value.map((entry, index) => {
    if (typeof entry !== 'string' || entry === '') {
      throw new Error(`${field}[${String(index)}] must be a non-empty string`);
    }
    return entry;
  });
}

function parseLandmark(value: unknown, index: number): Landmark {
  if (!isRecord(value)) throw new Error(`landmarks[${String(index)}] must be an object`);

  const id = value.id;
  if (typeof id !== 'string' || id === '') throw new Error(`landmarks[${String(index)}].id is required`);

  const description = value.description;
  const attachedTo = value.attachedTo;
  if (attachedTo !== undefined && attachedTo !== null && typeof attachedTo !== 'string') {
    throw new Error(`landmarks[${String(index)}].attachedTo must be a string or null`);
  }

  return {
    id,
    ...(typeof description === 'string' ? { description } : {}),
    ...(attachedTo === undefined ? {} : { attachedTo }),
  };
}

function parseShot(id: string, value: unknown): ShotDeclaration {
  if (!isRecord(value)) throw new Error(`shots.${id} must be an object`);

  const present = stringArray(value.present, `shots.${id}.present`);
  const screenOrder = value.screenOrder === undefined
    ? undefined
    : stringArray(value.screenOrder, `shots.${id}.screenOrder`);

  const cameraSide = value.cameraSide;
  if (cameraSide !== undefined && typeof cameraSide !== 'string') {
    throw new Error(`shots.${id}.cameraSide must be a string`);
  }

  const crossesAxis = value.crossesAxis;
  if (crossesAxis !== undefined && typeof crossesAxis !== 'boolean') {
    throw new Error(`shots.${id}.crossesAxis must be boolean`);
  }

  const attachments: Record<string, string | null> = {};
  if (value.attachments !== undefined) {
    if (!isRecord(value.attachments)) throw new Error(`shots.${id}.attachments must be an object`);
    for (const [landmark, anchor] of Object.entries(value.attachments)) {
      if (anchor !== null && typeof anchor !== 'string') {
        throw new Error(`shots.${id}.attachments.${landmark} must be a string or null`);
      }
      attachments[landmark] = anchor;
    }
  }

  return {
    id,
    present,
    ...(screenOrder === undefined ? {} : { screenOrder }),
    ...(cameraSide === undefined ? {} : { cameraSide }),
    ...(crossesAxis === undefined ? {} : { crossesAxis }),
    ...(Object.keys(attachments).length === 0 ? {} : { attachments }),
  };
}

function parseManifest(value: unknown): SceneManifest {
  if (!isRecord(value)) throw new Error('scene manifest must be a JSON object');

  const sceneId = value.sceneId;
  if (typeof sceneId !== 'string' || sceneId === '') throw new Error('sceneId is required');

  const cameraSide = value.cameraSide;
  if (typeof cameraSide !== 'string' || cameraSide === '') throw new Error('cameraSide is required');

  if (!isRecord(value.axis)) throw new Error('axis is required');
  const axisOrder = stringArray(value.axis.order, 'axis.order');

  if (!Array.isArray(value.landmarks)) throw new Error('landmarks must be an array');
  const landmarks = value.landmarks.map(parseLandmark);

  if (!isRecord(value.shots)) throw new Error('shots must be an object keyed by shot id');
  // JavaScript hoists integer-like object keys to the front in numeric order,
  // so a manifest keyed "10", "2" would be silently re-sequenced and every
  // order-sensitive check below would examine the wrong neighbours.
  const indexLike = Object.keys(value.shots).filter((key) => /^(0|[1-9]\d*)$/.test(key));
  if (indexLike.length > 0) {
    throw new Error(
      `shot ids must not be bare integers (${indexLike.join(', ')}): JavaScript reorders ` +
        'integer-like keys, so the declared shot order would not survive parsing. Use ids like "SH01".',
    );
  }
  const shots = Object.entries(value.shots).map(([id, shot]) => parseShot(id, shot));

  return { sceneId, cameraSide, axisOrder, landmarks, shots };
}

/** A shot naming a landmark the scene never declared. This is the pillar. */
function checkUnknownLandmarks(manifest: SceneManifest): readonly Finding[] {
  const known = new Set(manifest.landmarks.map((landmark) => landmark.id));
  const findings: Finding[] = [];

  // An anchor is a landmark reference like any other: a landmark declared as
  // attached to something the scene never mentions is the same invention.
  for (const landmark of manifest.landmarks) {
    if (landmark.attachedTo === undefined || landmark.attachedTo === null) continue;
    if (known.has(landmark.attachedTo)) continue;
    findings.push({
      rule: 'unknown-landmark',
      shot: 'scene',
      message:
        `"${landmark.attachedTo}" is named as the anchor of "${landmark.id}" but is not ` +
        'declared in the scene.',
    });
  }

  for (const shot of manifest.shots) {
    const attachments = shot.attachments ?? {};
    for (const id of [...shot.present, ...(shot.screenOrder ?? []), ...Object.keys(attachments)]) {
      if (known.has(id)) continue;
      findings.push({
        rule: 'unknown-landmark',
        shot: shot.id,
        message:
          `"${id}" is not declared in the scene. A landmark that appears in a shot but in no ` +
          'scene manifest is an invention, and downstream shots will not agree about it.',
      });
    }
    for (const [id, anchor] of Object.entries(attachments)) {
      if (anchor === null || known.has(anchor)) continue;
      findings.push({
        rule: 'unknown-landmark',
        shot: shot.id,
        message: `"${anchor}" is named as the anchor of "${id}" but is not declared in the scene.`,
      });
    }
  }

  return [...new Map(findings.map((finding) => [`${finding.shot}:${finding.message}`, finding])).values()];
}

/** The same landmark anchored differently between shots. This is the board. */
function checkAttachments(manifest: SceneManifest): readonly Finding[] {
  const declared = new Map<string, string | null>();
  for (const landmark of manifest.landmarks) {
    if (landmark.attachedTo !== undefined) declared.set(landmark.id, landmark.attachedTo);
  }

  const findings: Finding[] = [];
  const seen = new Map<string, { shot: string; anchor: string | null }>();

  for (const shot of manifest.shots) {
    for (const [id, anchor] of Object.entries(shot.attachments ?? {})) {
      const sceneAnchor = declared.get(id);
      if (sceneAnchor !== undefined && sceneAnchor !== anchor) {
        findings.push({
          rule: 'attachment-contradiction',
          shot: shot.id,
          message:
            `"${id}" is attached to ${anchor ?? 'nothing'} here but the scene declares ` +
            `${sceneAnchor ?? 'nothing'}.`,
        });
      }

      const previous = seen.get(id);
      if (previous !== undefined && previous.anchor !== anchor) {
        findings.push({
          rule: 'attachment-contradiction',
          shot: shot.id,
          message:
            `"${id}" is attached to ${anchor ?? 'nothing'} here but to ` +
            `${previous.anchor ?? 'nothing'} in ${previous.shot}. The same object cannot be ` +
            'mounted and free-hanging in one location.',
        });
      }
      seen.set(id, { shot: shot.id, anchor });
    }
  }

  return findings;
}

/**
 * Axis order reads left-to-right on screen from the scene's declared camera
 * side; from the opposite side the same landmarks read right-to-left. A shot
 * must match the direction its side implies — a mirror-image staging seen from
 * across the axis is exactly as wrong as a reversed one seen from home.
 */
function checkScreenOrder(manifest: SceneManifest): readonly Finding[] {
  const findings: Finding[] = [];
  const axisIndex = new Map(manifest.axisOrder.map((id, index) => [id, index]));

  for (const shot of manifest.shots) {
    if (shot.screenOrder === undefined) continue;

    const indices = shot.screenOrder
      .map((id) => axisIndex.get(id))
      .filter((index): index is number => index !== undefined);
    if (indices.length < 2) continue;

    const ascending = indices.every((value, position) => position === 0 || value > (indices[position - 1] ?? -1));
    const descending = indices.every((value, position) => position === 0 || value < (indices[position - 1] ?? Infinity));
    const side = shot.cameraSide ?? manifest.cameraSide;

    if (side === manifest.cameraSide ? ascending : descending) continue;

    findings.push({
      rule: 'screen-order-contradiction',
      shot: shot.id,
      message:
        `screen order [${shot.screenOrder.join(', ')}] contradicts the scene axis ` +
        `[${manifest.axisOrder.join(', ')}] from the ${side} side` +
        (side === manifest.cameraSide ? '.' : ' — across the axis the order must reverse.'),
    });
  }

  return findings;
}

/** A landmark present either side of a shot it vanishes from, with no move declared. */
function checkDiscontinuity(manifest: SceneManifest): readonly Finding[] {
  const findings: Finding[] = [];

  for (const landmark of manifest.landmarks) {
    const appearances = manifest.shots.map((shot) => shot.present.includes(landmark.id));
    for (let index = 1; index < appearances.length - 1; index += 1) {
      if (appearances[index] !== false) continue;
      if (appearances[index - 1] !== true || appearances[index + 1] !== true) continue;

      const shot = manifest.shots[index];
      if (shot === undefined) continue;
      if (shot.cameraSide !== undefined && shot.cameraSide !== manifest.cameraSide) continue;

      findings.push({
        rule: 'landmark-discontinuity',
        shot: shot.id,
        message:
          `"${landmark.id}" is present in the shots either side of this one but absent here, ` +
          'with no camera move declared to explain it.',
      });
    }
  }

  return findings;
}

/** Crossing the axis without saying so inverts screen direction for everything. */
function checkAxis(manifest: SceneManifest): readonly Finding[] {
  const findings: Finding[] = [];

  for (const shot of manifest.shots) {
    if (shot.cameraSide === undefined || shot.cameraSide === manifest.cameraSide) continue;
    if (shot.crossesAxis === true) continue;

    findings.push({
      rule: 'axis-violation',
      shot: shot.id,
      message:
        `camera is on the ${shot.cameraSide} side but the scene declares ${manifest.cameraSide}, ` +
        'and the shot does not declare crossesAxis. Screen direction reverses silently.',
    });
  }

  return findings;
}

function main(): number {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { json: { type: 'boolean' }, help: { type: 'boolean', short: 'h' } },
    strict: true,
  });

  if (values.help) {
    usage();
    return 0;
  }

  const input = positionals[0];
  if (positionals.length !== 1 || input === undefined) {
    usage();
    return EXIT_USAGE;
  }
  if (!existsSync(input)) {
    console.error(`scene manifest does not exist: ${input}`);
    return EXIT_USAGE;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(input, 'utf8')) as unknown;
  } catch (error: unknown) {
    console.error(`invalid scene manifest JSON: ${error instanceof Error ? error.message : String(error)}`);
    return EXIT_USAGE;
  }

  const manifest = parseManifest(parsed);
  const findings = [
    ...checkUnknownLandmarks(manifest),
    ...checkAttachments(manifest),
    ...checkScreenOrder(manifest),
    ...checkDiscontinuity(manifest),
    ...checkAxis(manifest),
  ];

  if (values.json) {
    console.log(JSON.stringify({ sceneId: manifest.sceneId, findings, ok: findings.length === 0 }, null, 2));
  } else if (findings.length === 0) {
    console.log(`${manifest.sceneId}: no continuity findings`);
  } else {
    for (const finding of findings) {
      console.log(`${finding.rule}: ${finding.shot}`);
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
