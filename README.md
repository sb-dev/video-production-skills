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

List the skills exposed by this repository:

```bash
npx skills add <org>/video-production-skills --list
```

Install one skill:

```bash
npx skills add <org>/video-production-skills --skill video-production
npx skills add <org>/video-production-skills --skill video-evaluate
```

Stage 12 of the project bootstrap validates and finalises these installation commands against the current Agent Skills CLI.

### Local deterministic runtime

Repository automation and deterministic media orchestration are implemented in **TypeScript** on Node.js 22.6 or later. The scripts run directly with Node's TypeScript type-stripping support and have no npm runtime dependencies.

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

The project has completed the first ten stages of the Creative Production Skills bootstrap process. This scaffold is Stage 11: the first source repository that encodes the approved architecture.

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
