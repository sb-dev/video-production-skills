/**
 * Stage: production artifact consistency.
 *
 * Cover for the governance failure in examples/level-2-missed-connection: every
 * creative decision was marked approved by the agent that made it, with no
 * approver recorded, and nothing in the toolchain could notice.
 */
import assert from 'node:assert/strict';
import { copyFileSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fixture, isRecord, parseJson, runScript } from './harness.ts';

const SCRIPT = 'tools/validate-production.ts';

function production(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), 'vps-production-'));
  for (const [relative, contents] of Object.entries(files)) {
    const path = join(root, relative);
    mkdirSync(join(path, '..'), { recursive: true });
    writeFileSync(path, contents);
  }
  return root;
}

function findings(root: string): readonly Record<string, unknown>[] {
  const result = runScript(SCRIPT, [root, '--json']);
  const parsed = parseJson(result.stdout);
  assert.ok(isRecord(parsed));
  const value = parsed.findings;
  assert.ok(Array.isArray(value));
  return value.filter(isRecord);
}

function rules(root: string): readonly string[] {
  return findings(root).map((finding) => String(finding.rule));
}

test('an approved artifact with a recorded approver passes', () => {
  const root = production({
    'direction.md': '---\ntype: visual_direction\ndecisionState: approved\napprovedBy: samir\n---\n\n# Direction\n',
  });
  const result = runScript(SCRIPT, [root]);
  assert.equal(result.status, 0, result.stdout);
});

test('an approved artifact with no approver is a finding', () => {
  const root = production({
    'direction.md': '---\ntype: visual_direction\ndecisionState: approved\n---\n\n# Direction\n',
  });
  assert.deepEqual(rules(root), ['approval-without-approver']);
  assert.equal(runScript(SCRIPT, [root]).status, 1);
});

test('a locked edit with no approver is a finding', () => {
  const root = production({
    'edit.md': '- **decisionState:** **locked** (picture lock)\n',
  });
  assert.deepEqual(rules(root), ['approval-without-approver']);
});

test('selected is an agent decision and needs no approver', () => {
  const root = production({
    'shot.md': '- **decisionState:** selected\n',
  });
  assert.deepEqual(rules(root), []);
});

test('a production that declares no decision state cannot be audited', () => {
  const root = production({ 'notes.md': '# Notes\n\nNothing machine-readable here.\n' });
  assert.deepEqual(rules(root), ['no-artifact-metadata']);
});

test('a timeline referencing a missing source is a finding', () => {
  const root = production({
    'direction.md': '---\ndecisionState: selected\n---\n',
    'edit/timeline.json': JSON.stringify({
      shots: [{ source: '../shots/missing.mp4', in: 0, duration: 1 }],
      render: { width: 640, height: 360, fps: 24 },
    }),
  });
  assert.ok(rules(root).includes('timeline-source-missing'));
});

test('a master that no longer matches its timeline is a finding', () => {
  const root = production({
    'direction.md': '---\ndecisionState: selected\n---\n',
    // The delivered master is the 5s 640x360 fixture. The timeline claims 2s at
    // 1920x1080 — exactly the drift that leaves a plan describing a different
    // film from the one that shipped.
    'edit/timeline.json': JSON.stringify({
      shots: [{ source: fixture('clean.mp4'), in: 0, duration: 2 }],
      render: { width: 1920, height: 1080, fps: 24 },
    }),
  });
  copyFileSync(fixture('clean.mp4'), join(root, 'the-master.mp4'));

  const reported = rules(root);
  assert.ok(reported.includes('plan-delivery-mismatch'), `expected a mismatch, got ${reported.join(', ')}`);
});

test('a master matching its timeline passes', () => {
  const root = production({
    'direction.md': '---\ndecisionState: selected\n---\n',
    'edit/timeline.json': JSON.stringify({
      shots: [{ source: fixture('clean.mp4'), in: 0, duration: 5 }],
      render: { width: 640, height: 360, fps: 24 },
    }),
  });
  copyFileSync(fixture('clean.mp4'), join(root, 'the-master.mp4'));

  assert.deepEqual(rules(root), []);
});
