# Video Production Skills — Stage 13 Local Validation Report

Date: 2026-08-20

## Result

**Status: PASS.**

All repository-local gates, the deterministic media regression, and the mandatory real `skills@1.5.22` discovery and installation gates pass. No repository defects were found. No code, configuration, test, or skill changes were required.

A previous run on the same commit (`d6df607`) was blocked because the sandbox could not resolve `registry.npmjs.org` (`EAI_AGAIN`). That failure was an environment limitation, not a repository defect. This run was executed in a network-enabled environment and completes Stage 13.

## Environment

- Repository commit validated: `d6df607 Add local installability regression tests`
- Node.js: `v26.2.0` (project requirement: `>=24.12`)
- npm: `11.16.0`
- Agent Skills CLI: `skills@1.5.22` via `npx -y`
- FFmpeg / ffprobe: `8.1.2`
- ImageMagick: `7.1.2-25`
- OS: Ubuntu 26.04 LTS (Linux 6.17, PRoot)
- Network: `registry.npmjs.org` and `github.com` reachable

## Gates

| # | Gate | Command | Result |
|---|---|---|---|
| 1 | Node version | `node --version` | PASS — `v26.2.0` |
| 2 | npm version | `npm --version` | PASS — `11.16.0` |
| 3 | Dependencies | `npm ci` | PASS — 3 packages, 0 vulnerabilities |
| 4 | Strict TypeScript | `npm run typecheck` (`tsc --noEmit`) | PASS |
| 5 | Repository structure | `npm run validate` | PASS — `repository structure: OK (52 files)` |
| 6 | Unit tests | `npm run test:unit` | PASS — 8/8 (4 CLI boundary, 4 installed-skill self-containment) |
| 7 | Script smoke tests | `npm run smoke:scripts` | PASS — all five scripts return `--help` successfully |
| 8 | Deterministic media regression | see below | PASS |
| 9 | Whitespace/patch validation | `git diff --check` | PASS |
| 10 | Python exclusion | `find . -name '*.py' -not -path './node_modules/*'` | PASS — 0 files |
| 11 | Skills CLI discovery | `npx -y skills@1.5.22 add . --list` | PASS — lists `video-evaluate` and `video-production` |
| 12 | Claude Code install — video-production | see install matrix | PASS |
| 13 | Claude Code install — video-evaluate | see install matrix | PASS |
| 14 | Codex install — video-production | see install matrix | PASS |
| 15 | Codex install — video-evaluate | see install matrix | PASS |
| 16 | Installed-content validation | see below | PASS — 4/4 installs |
| 17 | Clean Git worktree | `git status --short` | PASS (only this report and the bootstrap-process reference document were untracked before commit) |

## Deterministic media regression

Input: three synthetic 1-second 320×180 24fps MP4 clips generated with `ffmpeg -f lavfi -i color=...`.

Commands:

```bash
node skills/video-production/scripts/render-timeline.ts timeline.json master.mp4
node skills/video-production/scripts/inspect-media.ts master.mp4
node skills/video-evaluate/scripts/inspect-video.ts master.mp4 --requirements requirements.json
node skills/video-evaluate/scripts/sample-frames.ts master.mp4 frames --count 3
node skills/video-production/scripts/make-contact-sheet.ts contact.png frames/* --columns 3
```

`timeline.json`:

```json
{"shots":[{"source":"clip1.mp4","in":0},{"source":"clip2.mp4","in":0},{"source":"clip3.mp4","in":0}],"render":{"width":320,"height":180,"fps":24}}
```

`requirements.json`:

```json
{"duration":3,"width":320,"height":180,"fps":24,"audioRequired":false}
```

Observed QC report (`inspect-video.ts`):

```json
{
  "input": "master.mp4",
  "readable": true,
  "failures": [],
  "observed": {
    "duration": 3,
    "width": 320,
    "height": 180,
    "fps": 24,
    "videoStream": true,
    "audioStream": false
  },
  "status": "pass"
}
```

`inspect-media.ts` reported one H.264 stream, 320×180, `24/1`, 72 frames, no audio stream. `sample-frames.ts` produced `frame-01.jpg`, `frame-02.jpg`, `frame-03.jpg`. `make-contact-sheet.ts` produced `contact.png` (1608×536 PNG).

## Skills CLI discovery

```bash
npx -y skills@1.5.22 add . --list
```

Output listed both skills with their `SKILL.md` descriptions:

```text
video-evaluate
video-production
```

## Real CLI install matrix

Each install used a fresh temporary directory initialised with `git init`, then:

```bash
npx -y skills@1.5.22 add /home/samir/workspace/video-production-skills \
  --skill <skill> --agent <agent> --copy --yes
```

| Consumer project | Skill | Agent | Exit | Installed path |
|---|---|---|---|---|
| `claude-video-production/` | video-production | claude-code | 0 | `.claude/skills/video-production/` |
| `claude-video-evaluate/` | video-evaluate | claude-code | 0 | `.claude/skills/video-evaluate/` |
| `codex-video-production/` | video-production | codex | 0 | `.agents/skills/video-production/` |
| `codex-video-evaluate/` | video-evaluate | codex | 0 | `.agents/skills/video-evaluate/` |

The CLI also wrote `skills-lock.json` in each consumer project with `sourceType: "local"` and a content hash.

Installed file sets:

```text
video-production/
  SKILL.md
  evals/evals.json
  references/continuity.md
  references/editorial.md
  references/production-workflow.md
  references/reference-frames.md
  references/storyboard-and-shot-planning.md
  scripts/inspect-media.ts
  scripts/make-contact-sheet.ts
  scripts/render-timeline.ts

video-evaluate/
  SKILL.md
  evals/evals.json
  references/artifact-readiness.md
  references/continuity.md
  references/media-qc.md
  scripts/inspect-video.ts
  scripts/sample-frames.ts
```

## Installed-content validation

A throwaway TypeScript check script was run against each of the four installs. For every install it confirmed:

- `SKILL.md` exists;
- frontmatter contains `name` (matching the skill), `description`, `license`, `compatibility`;
- `references/`, `scripts/`, `evals/` exist;
- every skill-local backtick reference (`references/…`, `scripts/…`, `evals/…`) in `SKILL.md` resolves inside the installed skill;
- no installed file contains a `../` path;
- no installed file references repository-level `docs/` or `examples/`;
- no installed file references the sibling skill;
- the sibling skill is not present in the consumer project (selective installation is independent);
- every installed `scripts/*.ts --help` exits 0 under Node 26.

Result: 4/4 PASS.

The permanent `tests/installability.test.ts` regression covers the same self-containment checks for both project layouts using copied installs and runs in `npm test`. CI (`.github/workflows/ci.yml`) runs the real `skills@1.5.22` discovery and the same 2×2 install matrix.

## Fixes required

None.

## Verdict

**Stage 13: PASS.** The repository was cleared for Stage 14 (publication and external GitHub install smoke test). Stage 14 results follow.

---

# Stage 14 — Publication and External GitHub Install Smoke Test

Date: 2026-08-20

## Result

**Status: PASS.**

## Publication

- Repository: <https://github.com/sb-dev/video-production-skills>
- Visibility: public
- Licence: Apache License 2.0
- Default branch: `main`
- Description: "Domain-native Agent Skills for AI-assisted video production and evaluation (Claude Code, Codex)"
- Topics: `agent-skills`, `ai-video`, `claude-code`, `codex`, `ffmpeg`, `typescript`, `video-production`
- Issues: enabled. Discussions: enabled. Wiki: disabled.

Commands:

```bash
gh repo create sb-dev/video-production-skills --public --source=. --remote=origin --push \
  --description "Domain-native Agent Skills for AI-assisted video production and evaluation (Claude Code, Codex)"
gh repo edit sb-dev/video-production-skills --enable-issues --enable-discussions --enable-wiki=false \
  --add-topic agent-skills --add-topic claude-code --add-topic codex --add-topic video-production \
  --add-topic ai-video --add-topic ffmpeg --add-topic typescript
```

Pre-publication change: `<org>/video-production-skills` placeholders in `README.md` and `docs/03-creative-skills-repository-and-contracts-spec.md` were replaced with `sb-dev/video-production-skills` (commit `718dc43`).

## GitHub Actions CI

Both pushes to `main` (`718dc43`, `ea93b4a`) ran the CI workflow. All six jobs succeeded:

| Job | Result |
|---|---|
| validate | success |
| skill-discovery | success |
| skill-install (claude-code, video-production) | success |
| skill-install (claude-code, video-evaluate) | success |
| skill-install (codex, video-production) | success |
| skill-install (codex, video-evaluate) | success |

## External discovery

```bash
npx -y skills@1.5.22 add sb-dev/video-production-skills --list
```

Output listed `video-evaluate` and `video-production`.

## External install matrix

Each install used a fresh temporary directory initialised with `git init`, then:

```bash
npx -y skills@1.5.22 add sb-dev/video-production-skills --skill <skill> --agent <agent> --copy --yes
```

| Skill | Agent | Exit | Installed path | Files | Sibling skill present |
|---|---|---|---|---|---|
| video-production | claude-code | 0 | `.claude/skills/video-production/` | 10 | no |
| video-evaluate | claude-code | 0 | `.claude/skills/video-evaluate/` | 7 | no |
| video-production | codex | 0 | `.agents/skills/video-production/` | 10 | no |
| video-evaluate | codex | 0 | `.agents/skills/video-evaluate/` | 7 | no |

Every installed `scripts/*.ts --help` exited 0 under Node v26.2.0. `skills-lock.json` recorded `sourceType: "github"`, `skillPath: "skills/<skill>/SKILL.md"`, and the same content hash as the local Stage 13 installs (`00c7026d…`).

## Verdict

**Stage 14: PASS.** The repository is published and both skills install independently from GitHub into clean Claude Code and Codex projects.
