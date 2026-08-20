# Video Production Skills

Domain-native Agent Skills for directing AI-assisted video production from a creative brief to an edited, evaluated video master.

The project is deliberately **not** another image/video generation wrapper. It owns production judgement — planning, draft strategy, decision preservation, continuity, editorial progression, evaluation and targeted refinement — while existing provider skills and deterministic media tools own execution.

## Core skills

| Skill | Purpose |
|---|---|
| `video-production` | Plan, draft, produce, select, edit and finish video while preserving approved production decisions. |
| `video-evaluate` | Evaluate video-production artifacts, diagnose the failure layer and recommend the smallest corrective action. |

## Production model

```text
Brief
→ Visual Direction
→ Storyboard
→ Shot Plan
→ Optional Animatic
→ Reference Frames
→ Optional Motion Prototypes
→ Video Shots
→ Edit Timeline
→ Picture Lock
→ Finishing / Audio
→ Video Master
→ Evaluation + QC
```

Not every production needs every stage. The core rule is:

> Use the least expensive representation that can resolve the current production uncertainty.

And once a decision is approved:

> Preserve approved decisions and change only what needs to change.

## Execution layer

Video Production Skills sits above existing execution tools:

- **Replicate Agent Skills** — default image/video model discovery, comparison, prompting and execution;
- **ElevenLabs Agent Skills** — optional speech, transcription and generated sound effects;
- **FFmpeg / ffprobe** — deterministic media inspection, assembly, rendering and QC evidence;
- **ImageMagick** — deterministic storyboard/reference/contact sheets;
- **fal.ai / genmedia** — optional secondary image/video execution for a real capability gap or explicit user choice.

The repository does not implement provider SDKs, static model catalogues, a generic provider interface, a workflow engine or an artifact graph database.

## Install

The project uses the open `skills` CLI. Project-local installation is the default.

### Inspect available skills

```bash
npx skills add <org>/video-production-skills --list
```

The repository exposes:

```text
video-production
video-evaluate
```

### Install for Claude Code

Install one skill:

```bash
npx skills add <org>/video-production-skills \
  --skill video-production \
  --agent claude-code
```

Install both:

```bash
npx skills add <org>/video-production-skills \
  --skill video-production \
  --skill video-evaluate \
  --agent claude-code
```

### Install for Codex

```bash
npx skills add <org>/video-production-skills \
  --skill video-production \
  --skill video-evaluate \
  --agent codex
```

Use `--copy --yes` for non-interactive or CI installs where real copied files are preferable to symlinks:

```bash
npx skills add <org>/video-production-skills \
  --skill video-production \
  --agent claude-code \
  --copy \
  --yes
```

### Default image/video execution skills

`video-production` delegates image/video model discovery and execution to Replicate's Agent Skills. Install the five peer skills used by the core workflow into the same target agent:

```bash
npx skills add replicate/skills \
  --skill find-models \
  --skill compare-models \
  --skill prompt-images \
  --skill prompt-videos \
  --skill run-models \
  --agent claude-code
```

Set the Replicate credential only when provider execution is required:

```bash
export REPLICATE_API_TOKEN=...
```

For Codex, replace `--agent claude-code` with `--agent codex`.

### Optional ElevenLabs audio skills

Install only the specialist capabilities the production needs. The core audio set is:

```bash
npx skills add elevenlabs/skills \
  --skill text-to-speech \
  --skill speech-to-text \
  --skill sound-effects \
  --agent claude-code
```

When used:

```bash
export ELEVENLABS_API_KEY=...
```

ElevenLabs is optional. Silent productions and productions with supplied audio do not require it.

### Optional secondary image/video execution

fal.ai/genmedia remains a capability fallback, not a default dependency. Do not install or configure it unless a concrete workflow requires a capability unavailable through the default execution path or the user explicitly selects fal.ai.

### Installation validation contract

Repository CI is configured against `skills` CLI **1.5.22** for reproducibility. User-facing commands intentionally remain unpinned so normal installs use the current CLI.

CI validates:

- repository discovery with `--list`;
- individual installation of both skills;
- Claude Code and Codex target paths;
- copied `SKILL.md`, `references/`, and `scripts/` contents;
- non-interactive installation with `--copy --yes`.

Stage 13 performs the same installation checks locally in clean temporary consumer projects before publication.

### TypeScript runtime and development

Repository automation and deterministic media orchestration are implemented in **TypeScript**. Runtime scripts target **Node.js 24.12+**, where native TypeScript type stripping is stable, and use only erasable TypeScript syntax so installed skills require no TypeScript runtime package.

Development uses a strict `tsconfig.json` and a pinned TypeScript compiler for static checking. Install development dependencies and run the quality gate with:

```bash
npm ci
npm test
```

The compiler configuration enables strict checking plus `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`. External JSON and CLI inputs are validated at runtime instead of being trusted through unchecked type assertions.

### Local deterministic dependencies

Install the tools required by the workflow you intend to use:

```text
ffmpeg
ffprobe
ImageMagick
```

Provider credentials are required only when that provider is actually used.

## Quick start

For production, give the agent a brief and any existing approved references/artifacts. The agent should choose the shortest credible production path instead of mechanically running every stage.

For evaluation, give `video-evaluate` the artifact plus the most specific available parents and constraints — for example a shot plan and reference frame for a generated shot.

See [`examples/three-shot-character-sequence`](examples/three-shot-character-sequence/) for the initial repository scenario.

## Project status

Stages 1–12 of the Creative Production Skills bootstrap process are complete. Stage 12 configures repository discovery, project-local Claude Code/Codex installation, peer execution skills, and reproducible CI install checks. Stage 13 performs clean local installation validation before publication.

The initial proof deliberately excludes full character-design, product-video, UGC, advanced sound post, advanced finishing, multi-platform delivery, provider optimisation and shared creative-production infrastructure.

## Specifications

The canonical engineering specifications are:

- [`docs/01-creative-skills-system-spec.md`](docs/01-creative-skills-system-spec.md)
- [`docs/02-creative-skills-workflows-and-artifacts-spec.md`](docs/02-creative-skills-workflows-and-artifacts-spec.md)
- [`docs/03-creative-skills-repository-and-contracts-spec.md`](docs/03-creative-skills-repository-and-contracts-spec.md)

Potential shared abstractions are tracked in [`docs/extraction-candidates.md`](docs/extraction-candidates.md) and remain local until at least two production domains independently prove equivalent semantics.

## Contributing

Contributions should solve a demonstrated production problem, preserve approved behaviour, include an eval, and avoid adding generic infrastructure before real workflows justify it. See [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Licence

Apache-2.0. See [`LICENSE`](LICENSE).
