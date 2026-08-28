/**
 * Stage: environment preflight.
 *
 * The production run that produced examples/level-2-missed-connection started
 * without ImageMagick, which the skill declares as a dependency. The contact
 * sheet script was therefore unusable, ad-hoc tooling was substituted silently,
 * and the review method drifted away from the one the skill specifies.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { commandAvailable, isRecord, parseJson, runScript } from './harness.ts';

const SCRIPT = 'skills/video-evaluate/scripts/preflight.ts';

interface DependencyShape {
  readonly id: string;
  readonly required: boolean;
  readonly available: boolean;
  readonly enables: readonly string[];
}

function dependencies(report: Record<string, unknown>): readonly DependencyShape[] {
  const value = report.dependencies;
  assert.ok(Array.isArray(value), 'report must list dependencies');

  return value.map((entry) => {
    assert.ok(isRecord(entry));
    assert.equal(typeof entry.id, 'string');
    assert.equal(typeof entry.required, 'boolean');
    assert.equal(typeof entry.available, 'boolean');
    assert.ok(Array.isArray(entry.enables));
    return entry as unknown as DependencyShape;
  });
}

function report(): Record<string, unknown> {
  const result = runScript(SCRIPT, ['--json']);
  const parsed = parseJson(result.stdout);
  assert.ok(isRecord(parsed));
  return parsed;
}

test('every declared dependency is reported with its availability', () => {
  const listed = dependencies(report()).map((entry) => entry.id);
  for (const expected of ['ffmpeg', 'ffprobe', 'imagemagick']) {
    assert.ok(listed.includes(expected), `preflight must report ${expected}`);
  }
});

test('a missing dependency names the scripts it makes unusable', () => {
  const parsed = report();
  const unusable = parsed.unusableScripts;
  assert.ok(Array.isArray(unusable));

  for (const dependency of dependencies(parsed)) {
    if (dependency.available) continue;
    for (const script of dependency.enables) {
      assert.ok(
        unusable.includes(script),
        `${script} depends on the missing ${dependency.id} and must be reported unusable`,
      );
    }
  }
});

test('preflight agrees with the actual environment', () => {
  for (const dependency of dependencies(report())) {
    if (dependency.id === 'imagemagick') {
      const actual = commandAvailable('magick') || commandAvailable('convert');
      assert.equal(dependency.available, actual);
      continue;
    }
    assert.equal(dependency.available, commandAvailable(dependency.id));
  }
});

test('a missing required dependency is a non-zero exit', () => {
  const result = runScript(SCRIPT, []);
  const parsed = report();
  const required = dependencies(parsed).filter((entry) => entry.required);
  const allPresent = required.every((entry) => entry.available);
  assert.equal(result.status, allPresent ? 0 : 1);
});

test('unexpected arguments are rejected', () => {
  const result = runScript(SCRIPT, ['unexpected']);
  assert.equal(result.status, 2);
});
