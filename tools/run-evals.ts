#!/usr/bin/env node
/**
 * Executes the skill eval suites.
 *
 * The suites were previously declarative prose with no runner, so a case could
 * assert anything and never be contradicted. Two tiers now apply:
 *
 *   structural  - every case is well formed and uniquely identified.
 *   behavioural - a case may name a `check`, which the runner executes.
 *
 * Coverage is reported explicitly: a suite where most cases are unfalsifiable
 * prose should say so out loud rather than look green.
 */
import { existsSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const EXIT_USAGE = 2;
const EXIT_FAILED = 1;
const SKILLS = ['video-production', 'video-evaluate', 'video-extension-pack-creator'] as const;

type SkillName = (typeof SKILLS)[number];

function isSkillName(value: string): value is SkillName {
  return (SKILLS as readonly string[]).includes(value);
}

interface CheckResult {
  readonly ok: boolean;
  readonly detail: string;
}

interface EvalCase {
  readonly id: string;
  readonly class: string;
  readonly command?: string;
  readonly check?: string;
}

function usage(): void {
  console.log('Usage: run-evals.ts [--json] [--skill <name>] [--command <name>]');
  console.log('');
  console.log(`  --skill    one of: ${SKILLS.join(', ')}`);
  console.log('  --command  a command declared under skills/<skill>/commands/; requires --skill');
}

/**
 * The command inventory is the directory, not a registry file. A command exists
 * because its contract exists; there is nothing else to fall out of step with.
 */
const commandsCache = new Map<string, readonly string[]>();

function commandsFor(skill: string): readonly string[] {
  const cached = commandsCache.get(skill);
  if (cached !== undefined) return cached;

  const directory = join(ROOT, 'skills', skill, 'commands');
  const names = existsSync(directory)
    ? readdirSync(directory)
        .filter((entry) => extname(entry) === '.md')
        .map((entry) => basename(entry, '.md'))
        .sort()
    : [];

  commandsCache.set(skill, names);
  return names;
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

function ffmpegAvailable(): boolean {
  const result = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
  return result.status === 0 && result.error === undefined;
}

let fixturesCache: string | null = null;

function fixtures(): string {
  if (fixturesCache !== null) return fixturesCache;
  const directory = mkdtempSync(join(tmpdir(), 'vps-evals-'));
  const result = runScript('tests/fixtures/make-fixtures.ts', [directory]);
  if (result.status !== 0) throw new Error(`fixture generation failed: ${result.stderr.trim()}`);
  fixturesCache = directory;
  return directory;
}

const DETECTOR = 'skills/video-evaluate/scripts/detect-motion-artifacts.ts';
const CONTINUITY = 'skills/video-evaluate/scripts/validate-continuity.ts';

const CHECKS: Readonly<Record<string, () => CheckResult>> = {
  'motion:detects-periodic-seams': () => {
    const result = runScript(DETECTOR, [join(fixtures(), 'seams.mp4'), '--json']);
    const parsed: unknown = JSON.parse(result.stdout);
    const periodic = isRecord(parsed) ? parsed.periodic : undefined;
    const detected = isRecord(periodic) && periodic.detected === true;
    return {
      ok: detected && result.status === 1,
      detail: detected ? 'periodic seams detected and gated' : 'seams were not detected',
    };
  },
  'motion:passes-clean-motion': () => {
    const result = runScript(DETECTOR, [join(fixtures(), 'clean.mp4')]);
    return { ok: result.status === 0, detail: `exit ${String(result.status)}` };
  },
  'motion:reports-frozen-frames': () => {
    const result = runScript(DETECTOR, [join(fixtures(), 'frozen.mp4'), '--json']);
    const parsed: unknown = JSON.parse(result.stdout);
    const runs = isRecord(parsed) && Array.isArray(parsed.frozenRuns) ? parsed.frozenRuns.length : 0;
    return { ok: runs > 0, detail: `${String(runs)} frozen run(s)` };
  },
  'qc:rejects-unreadable-media': () => {
    const result = runScript('skills/video-evaluate/scripts/inspect-video.ts', [join(fixtures(), 'corrupt.mp4')]);
    const parsed: unknown = JSON.parse(result.stdout);
    const readable = isRecord(parsed) ? parsed.readable : true;
    return { ok: readable === false, detail: `readable=${String(readable)}` };
  },
  'editorial:warns-on-aspect-mismatch': () => {
    const directory = mkdtempSync(join(tmpdir(), 'vps-evals-timeline-'));
    const timeline = join(directory, 'timeline.json');
    writeFileSync(
      timeline,
      JSON.stringify({
        shots: [{ source: join(fixtures(), 'offsize.mp4'), in: 0, duration: 1 }],
        render: { width: 1920, height: 1080, fps: 24 },
      }),
    );

    const result = runScript('skills/video-production/scripts/render-timeline.ts', [
      timeline,
      join(directory, 'out.mp4'),
    ]);
    const warned = /will be padded/.test(result.stderr);
    return { ok: warned, detail: warned ? 'operator warned' : 'padding happened silently' };
  },
  'motion:reports-usable-range': () => {
    const result = runScript(DETECTOR, [join(fixtures(), 'clean.mp4'), '--json']);
    const parsed: unknown = JSON.parse(result.stdout);
    const range = isRecord(parsed) ? parsed.usableRange : undefined;
    const reported = isRecord(range) && typeof range.seconds === 'number' && range.seconds > 0;
    return {
      ok: reported,
      detail: reported ? `usable range ${String((range as Record<string, unknown>).seconds)}s` : 'no usable range',
    };
  },
  'continuity:flags-undeclared-landmark': () => {
    const directory = mkdtempSync(join(tmpdir(), 'vps-evals-continuity-'));
    const path = join(directory, 'scene.json');
    writeFileSync(
      path,
      JSON.stringify({
        sceneId: 'eval-scene',
        cameraSide: 'south',
        axis: { name: 'west-east', order: ['board'] },
        landmarks: [{ id: 'board' }],
        shots: { SH01: { present: ['board'] }, SH02: { present: ['board', 'pillar'] } },
      }),
    );

    const result = runScript(CONTINUITY, [path, '--json']);
    const parsed: unknown = JSON.parse(result.stdout);
    const found =
      isRecord(parsed) && Array.isArray(parsed.findings)
        ? parsed.findings.some((finding) => isRecord(finding) && finding.rule === 'unknown-landmark')
        : false;
    return { ok: found && result.status === 1, detail: found ? 'undeclared landmark flagged' : 'pillar missed' };
  },
  'continuity:flags-attachment-contradiction': () => {
    const directory = mkdtempSync(join(tmpdir(), 'vps-evals-continuity-'));
    const path = join(directory, 'scene.json');
    writeFileSync(
      path,
      JSON.stringify({
        sceneId: 'eval-scene',
        cameraSide: 'south',
        axis: { name: 'west-east', order: ['board', 'column'] },
        landmarks: [{ id: 'board', attachedTo: 'column' }, { id: 'column' }],
        shots: {
          SH01: { present: ['board', 'column'], attachments: { board: 'column' } },
          SH02: { present: ['board', 'column'], attachments: { board: null } },
        },
      }),
    );

    const result = runScript(CONTINUITY, [path, '--json']);
    const parsed: unknown = JSON.parse(result.stdout);
    const found =
      isRecord(parsed) && Array.isArray(parsed.findings)
        ? parsed.findings.some((finding) => isRecord(finding) && finding.rule === 'attachment-contradiction')
        : false;
    return { ok: found, detail: found ? 'attachment contradiction flagged' : 'contradiction missed' };
  },
  'storyboard:composes-numbered-board': () => {
    const directory = mkdtempSync(join(tmpdir(), 'vps-evals-storyboard-'));
    const panels = ['a', 'b', 'c', 'd'].map((name) => {
      const file = join(directory, `panel-${name}.png`);
      writeFileSync(file, '');
      return file;
    });

    const result = runScript('skills/video-production/scripts/make-storyboard.ts', [
      join(directory, 'board.png'),
      ...panels,
      '--print-command',
    ]);
    const command = result.stdout;
    const formed =
      /-tile 3x/.test(command) &&
      /-set label/.test(command) &&
      /-bordercolor black/.test(command) &&
      /-background white/.test(command);

    return {
      ok: result.status === 0 && formed,
      detail: formed ? 'numbered, keylined board grid composed' : 'board form not composed',
    };
  },
  'governance:flags-approval-without-approver': () => {
    const directory = mkdtempSync(join(tmpdir(), 'vps-evals-governance-'));
    writeFileSync(join(directory, 'direction.md'), '---\ndecisionState: approved\n---\n');

    const result = runScript('tools/validate-production.ts', [directory, '--json']);
    const parsed: unknown = JSON.parse(result.stdout);
    const found =
      isRecord(parsed) && Array.isArray(parsed.findings)
        ? parsed.findings.some((finding) => isRecord(finding) && finding.rule === 'approval-without-approver')
        : false;
    return { ok: found, detail: found ? 'self-approval flagged' : 'self-approval went unnoticed' };
  },
};

function loadCases(skill: string): readonly EvalCase[] {
  const file = join(ROOT, 'skills', skill, 'evals', 'evals.json');
  if (!existsSync(file)) throw new Error(`missing evals for ${skill}`);

  const parsed: unknown = JSON.parse(readFileSync(file, 'utf8'));
  if (!isRecord(parsed) || !Array.isArray(parsed.cases)) throw new Error(`${skill}: cases must be an array`);

  const seen = new Set<string>();
  return parsed.cases.map((value, index) => {
    if (!isRecord(value)) throw new Error(`${skill}: cases[${String(index)}] must be an object`);

    const id = value.id;
    const className = value.class;
    if (typeof id !== 'string' || id === '') throw new Error(`${skill}: cases[${String(index)}] needs an id`);
    if (seen.has(id)) throw new Error(`${skill}: duplicate eval id ${id}`);
    seen.add(id);

    if (typeof className !== 'string' || className === '') throw new Error(`${skill}/${id}: needs a class`);
    if (typeof value.given !== 'string' || value.given === '') throw new Error(`${skill}/${id}: needs a given`);
    if (!Array.isArray(value.expect) || value.expect.length === 0) {
      throw new Error(`${skill}/${id}: needs at least one expectation`);
    }

    const check = value.check;
    if (check !== undefined && (typeof check !== 'string' || CHECKS[check] === undefined)) {
      throw new Error(`${skill}/${id}: unknown check "${String(check)}"`);
    }

    // A case may target one command. An unknown target is refused rather than
    // ignored: a case pointing at a command that does not exist reports coverage
    // for a behaviour nobody wrote a contract for.
    const command = value.command;
    if (command !== undefined) {
      if (typeof command !== 'string' || command === '') throw new Error(`${skill}/${id}: command must be a string`);
      if (!commandsFor(skill).includes(command)) {
        throw new Error(`${skill}/${id}: unknown command "${command}"`);
      }
    }

    return {
      id,
      class: className,
      ...(typeof command === 'string' ? { command } : {}),
      ...(typeof check === 'string' ? { check } : {}),
    };
  });
}

/**
 * Command coverage is reported separately from case coverage, because a suite
 * can be green on every case it happens to contain and still say nothing about
 * a command nobody wrote a case for. `UNCOVERED` is the honest word for that.
 */
type CommandState = 'PASS' | 'FAIL' | 'MANUAL' | 'UNCOVERED';

interface CommandCoverage {
  readonly skill: string;
  readonly command: string;
  readonly state: CommandState;
  readonly passed: number;
  readonly executable: number;
  readonly cases: number;
}

function main(): number {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      json: { type: 'boolean' },
      help: { type: 'boolean', short: 'h' },
      skill: { type: 'string' },
      command: { type: 'string' },
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

  const requestedSkill = values.skill;
  const commandFilter = values.command;

  let skillFilter: SkillName | undefined;
  if (requestedSkill !== undefined) {
    if (!isSkillName(requestedSkill)) {
      console.error(`unknown skill "${requestedSkill}"; expected one of: ${SKILLS.join(', ')}`);
      return EXIT_USAGE;
    }
    skillFilter = requestedSkill;
  }

  // A command name is only meaningful inside one skill, so it is not a filter
  // on its own. Guessing which skill was meant is how a typo runs the wrong set.
  if (commandFilter !== undefined && skillFilter === undefined) {
    console.error('--command requires --skill');
    return EXIT_USAGE;
  }
  if (commandFilter !== undefined && skillFilter !== undefined && !commandsFor(skillFilter).includes(commandFilter)) {
    console.error(`unknown command "${commandFilter}" for ${skillFilter}`);
    return EXIT_USAGE;
  }

  const selectedSkills: readonly SkillName[] = skillFilter === undefined ? SKILLS : [skillFilter];

  const canExecute = ffmpegAvailable();
  const results: { skill: string; id: string; command?: string; check: string; ok: boolean; skipped?: boolean; detail: string }[] = [];
  const coverageBySkill: CommandCoverage[] = [];
  let total = 0;
  let executable = 0;

  for (const skill of selectedSkills) {
    const cases = loadCases(skill).filter(
      (evalCase) => commandFilter === undefined || evalCase.command === commandFilter,
    );

    for (const evalCase of cases) {
      total += 1;
      if (evalCase.check === undefined) continue;
      executable += 1;

      // A check that could not run has not passed. ffmpeg is a hard dependency
      // of this gate; its absence fails the run rather than greening it.
      if (!canExecute) {
        results.push({
          skill,
          id: evalCase.id,
          ...(evalCase.command === undefined ? {} : { command: evalCase.command }),
          check: evalCase.check,
          ok: false,
          skipped: true,
          detail: 'skipped: ffmpeg unavailable',
        });
        continue;
      }

      const check = CHECKS[evalCase.check];
      if (check === undefined) continue;
      const outcome = check();
      results.push({
        skill,
        id: evalCase.id,
        ...(evalCase.command === undefined ? {} : { command: evalCase.command }),
        check: evalCase.check,
        ok: outcome.ok,
        detail: outcome.detail,
      });
    }

    const commands = commandsFor(skill).filter((name) => commandFilter === undefined || name === commandFilter);
    for (const command of commands) {
      const owned = cases.filter((evalCase) => evalCase.command === command);
      const runnable = owned.filter((evalCase) => evalCase.check !== undefined);
      const passed = runnable.filter((evalCase) =>
        results.some((result) => result.skill === skill && result.id === evalCase.id && result.ok),
      ).length;

      const state: CommandState =
        owned.length === 0 ? 'UNCOVERED'
        : runnable.length === 0 ? 'MANUAL'
        : passed === runnable.length ? 'PASS'
        : 'FAIL';

      coverageBySkill.push({ skill, command, state, passed, executable: runnable.length, cases: owned.length });
    }
  }

  // An explicit selection that matches nothing is a typo, not a green run.
  if (total === 0 && (skillFilter !== undefined || commandFilter !== undefined)) {
    console.error('no eval cases matched the selection');
    return EXIT_USAGE;
  }

  const failed = results.filter((result) => !result.ok);
  const skipped = results.filter((result) => result.skipped === true);
  const coverage = total === 0 ? 0 : Math.round((executable / total) * 100);
  const uncovered = coverageBySkill.filter((entry) => entry.state === 'UNCOVERED');

  if (values.json) {
    console.log(JSON.stringify(
      {
        total,
        executable,
        coverage,
        ffmpeg: canExecute,
        skipped: skipped.length,
        results,
        commands: coverageBySkill,
        ok: failed.length === 0,
      },
      null,
      2,
    ));
  } else {
    for (const result of results) {
      const where = result.command === undefined ? result.id : `${result.command}/${result.id}`;
      console.log(`${result.ok ? 'ok  ' : 'FAIL'} ${result.skill}/${where} [${result.check}] ${result.detail}`);
    }

    if (coverageBySkill.length > 0) {
      console.log('');
      let current = '';
      for (const entry of coverageBySkill) {
        if (entry.skill !== current) {
          current = entry.skill;
          console.log(current);
        }
        const evidence = entry.state === 'PASS' || entry.state === 'FAIL'
          ? ` ${String(entry.passed)}/${String(entry.executable)}`
          : '';
        console.log(`  ${entry.command.padEnd(28)} ${entry.state}${evidence}`);
      }
    }

    console.log('');
    console.log(`${String(total)} cases, ${String(executable)} executable (${String(coverage)}% behavioural coverage)`);
    if (uncovered.length > 0) {
      console.log(`${String(uncovered.length)} command(s) UNCOVERED: no targeted eval case`);
    }
    if (!canExecute) {
      console.log(`ffmpeg unavailable: ${String(skipped.length)} behavioural checks could NOT be verified`);
    }
    if (failed.length > 0) console.log(`${String(failed.length)} failing`);
  }

  return failed.length === 0 ? 0 : EXIT_FAILED;
}

try {
  process.exitCode = main();
} catch (error: unknown) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = EXIT_USAGE;
}
