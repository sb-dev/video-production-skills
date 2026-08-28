/**
 * Stage: the eval runner's own honesty.
 *
 * The runner's header promises that a suite which cannot verify its cases says
 * so out loud. A CI image that loses ffmpeg must therefore fail the behavioural
 * tier, not report every check as passing — and the JSON consumed by machines
 * must carry the same signal the human-readable output does.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { isRecord, parseJson, runScript } from './harness.ts';

const SCRIPT = 'tools/run-evals.ts';

test('a missing ffmpeg fails the behavioural tier instead of greening it', () => {
  const result = runScript(SCRIPT, ['--json'], { env: { PATH: '/nonexistent' } });
  assert.equal(result.status, 1, result.stdout + result.stderr);

  const parsed = parseJson(result.stdout);
  assert.ok(isRecord(parsed));
  assert.equal(parsed.ffmpeg, false, 'the JSON must say the dependency is absent');
  assert.equal(parsed.ok, false);
  assert.ok(typeof parsed.skipped === 'number' && parsed.skipped > 0, 'skipped checks must be counted');

  assert.ok(Array.isArray(parsed.results) && parsed.results.length > 0);
  for (const row of parsed.results.filter(isRecord)) {
    assert.equal(row.ok, false, `${String(row.id)} could not run and must not pass`);
    assert.equal(row.skipped, true);
  }
});
