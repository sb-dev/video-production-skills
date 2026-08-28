/**
 * Stage: spatial continuity.
 *
 * Cover for the defect Samir found in examples/level-2-missed-connection: a
 * pillar present in an approved reference frame and in no other shot, and a
 * departure board mounted on a column in one frame and hanging free in the
 * next. Nothing in the repository could notice, because nothing declared what
 * the scene contained.
 */
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';
import { ROOT, isRecord, parseJson, runScript } from './harness.ts';

const SCRIPT = 'skills/video-evaluate/scripts/validate-continuity.ts';

interface SceneShot {
  present: string[];
  screenOrder?: string[];
  cameraSide?: string;
  crossesAxis?: boolean;
  attachments?: Record<string, string | null>;
}

function scene(overrides: {
  landmarks?: { id: string; attachedTo?: string | null }[];
  shots: Record<string, SceneShot>;
  order?: string[];
}): string {
  const directory = mkdtempSync(join(tmpdir(), 'vps-scene-'));
  const path = join(directory, 'scene.json');
  writeFileSync(
    path,
    JSON.stringify({
      sceneId: 'test-scene',
      cameraSide: 'south',
      axis: { name: 'west-east', order: overrides.order ?? ['kiosk', 'board', 'column'] },
      landmarks: overrides.landmarks ?? [{ id: 'kiosk' }, { id: 'board' }, { id: 'column' }],
      shots: overrides.shots,
    }),
  );
  return path;
}

function rules(path: string): readonly string[] {
  const result = runScript(SCRIPT, [path, '--json']);
  const parsed = parseJson(result.stdout);
  assert.ok(isRecord(parsed));
  const findings = parsed.findings;
  assert.ok(Array.isArray(findings));
  return findings.filter(isRecord).map((finding) => String(finding.rule));
}

test('a consistent scene produces no findings', () => {
  const path = scene({
    shots: {
      SH01: { present: ['kiosk', 'board'], screenOrder: ['kiosk', 'board'] },
      SH02: { present: ['board', 'column'], screenOrder: ['board', 'column'] },
    },
  });
  assert.equal(runScript(SCRIPT, [path]).status, 0);
  assert.deepEqual(rules(path), []);
});

test('a landmark that exists in no scene declaration is reported', () => {
  const path = scene({
    shots: {
      SH01: { present: ['board'] },
      SH02: { present: ['board', 'column-foreground'] },
    },
  });
  assert.ok(rules(path).includes('unknown-landmark'), 'the pillar must be caught');
  assert.equal(runScript(SCRIPT, [path]).status, 1);
});

test('the same landmark anchored differently between shots is reported', () => {
  const path = scene({
    landmarks: [{ id: 'kiosk' }, { id: 'board', attachedTo: 'column' }, { id: 'column' }],
    shots: {
      SH01: { present: ['board', 'column'], attachments: { board: 'column' } },
      SH02: { present: ['board', 'column'], attachments: { board: null } },
    },
  });
  assert.ok(rules(path).includes('attachment-contradiction'));
});

test('screen order contradicting the axis is reported', () => {
  const path = scene({
    shots: {
      SH01: { present: ['kiosk', 'board'], screenOrder: ['kiosk', 'board'] },
      SH02: { present: ['kiosk', 'board'], screenOrder: ['board', 'kiosk'] },
    },
  });
  assert.ok(rules(path).includes('screen-order-contradiction'));
});

/**
 * Axis order reads left-to-right from the declared camera side, so a shot from
 * the opposite side must see it reversed. Mirror-image staging seen from across
 * the axis used to pass, because ascending order was accepted before the
 * camera side was ever consulted.
 */
test('ascending order from the opposite side is a contradiction', () => {
  const path = scene({
    shots: {
      SH01: { present: ['kiosk', 'board'], screenOrder: ['kiosk', 'board'] },
      SH02: {
        present: ['kiosk', 'board'],
        screenOrder: ['kiosk', 'board'],
        cameraSide: 'north',
        crossesAxis: true,
      },
    },
  });
  assert.ok(rules(path).includes('screen-order-contradiction'), 'across the axis the order must reverse');
});

test('descending order from a declared crossing is clean', () => {
  const path = scene({
    shots: {
      SH01: { present: ['kiosk', 'board'], screenOrder: ['kiosk', 'board'] },
      SH02: {
        present: ['kiosk', 'board'],
        screenOrder: ['board', 'kiosk'],
        cameraSide: 'north',
        crossesAxis: true,
      },
    },
  });
  assert.deepEqual(rules(path), [], 'a declared crossing legitimately reverses the order');
});

test('an attachment naming an undeclared landmark or anchor is reported', () => {
  const phantom = scene({
    shots: {
      SH01: { present: ['board'], attachments: { 'phantom-pillar': 'board' } },
    },
  });
  assert.ok(rules(phantom).includes('unknown-landmark'), 'an attached phantom is still an invention');

  const ghostAnchor = scene({
    shots: {
      SH01: { present: ['board'], attachments: { board: 'ghost-column' } },
    },
  });
  assert.ok(rules(ghostAnchor).includes('unknown-landmark'), 'an undeclared anchor is an invention too');

  const sceneLevel = scene({
    landmarks: [{ id: 'kiosk' }, { id: 'board', attachedTo: 'ghost' }, { id: 'column' }],
    shots: { SH01: { present: ['board'] } },
  });
  assert.ok(rules(sceneLevel).includes('unknown-landmark'), 'a scene-level anchor must be declared');
});

test('a landmark vanishing between shots that both contain it is reported', () => {
  const path = scene({
    shots: {
      SH01: { present: ['kiosk', 'board'] },
      SH02: { present: ['board'] },
      SH03: { present: ['kiosk', 'board'] },
    },
  });
  assert.ok(rules(path).includes('landmark-discontinuity'));
});

test('crossing the axis is a finding unless declared', () => {
  const undeclared = scene({
    shots: {
      SH01: { present: ['board'] },
      SH02: { present: ['board'], cameraSide: 'north' },
    },
  });
  assert.ok(rules(undeclared).includes('axis-violation'));

  const declared = scene({
    shots: {
      SH01: { present: ['board'] },
      SH02: { present: ['board'], cameraSide: 'north', crossesAxis: true },
    },
  });
  assert.ok(!rules(declared).includes('axis-violation'), 'a declared crossing is legitimate');
});

/** The shipped failure, reconstructed as a manifest and held as a regression test. */
test('the Missed Connection concourse reproduces the defects that shipped', () => {
  const path = resolve(ROOT, 'tests/fixtures/scenes/missed-connection.json');
  const found = rules(path);

  assert.ok(found.includes('unknown-landmark'), 'the pillar in SH02');
  assert.ok(found.includes('attachment-contradiction'), 'the board mounted in SH01, free in SH02');
  assert.equal(runScript(SCRIPT, [path]).status, 1);
});

test('a missing manifest is rejected', () => {
  const result = runScript(SCRIPT, ['definitely-missing.json']);
  assert.equal(result.status, 2);
});

test('malformed JSON is rejected before analysis', () => {
  const directory = mkdtempSync(join(tmpdir(), 'vps-scene-'));
  const path = join(directory, 'broken.json');
  writeFileSync(path, '{ not json');

  const result = runScript(SCRIPT, [path]);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /invalid scene manifest JSON/);
});

test('a manifest missing required fields is rejected', () => {
  const directory = mkdtempSync(join(tmpdir(), 'vps-scene-'));
  const path = join(directory, 'partial.json');
  writeFileSync(path, JSON.stringify({ sceneId: 'x' }));

  const result = runScript(SCRIPT, [path]);
  assert.equal(result.status, 2);
});

test('integer-like shot ids are rejected before they can reorder', () => {
  const path = scene({
    shots: {
      '0': { present: ['board'] },
      '1': { present: ['board'] },
    } as Record<string, SceneShot>,
  });
  const result = runScript(SCRIPT, [path]);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /must not be bare integers/);
});
