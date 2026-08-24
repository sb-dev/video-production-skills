# Changelog

All notable changes to this project will be documented here.

## Unreleased

### Added

- Initial `video-production` Agent Skill.
- Initial `video-evaluate` Agent Skill.
- Canonical v3 system, workflow/artifact, and repository/contract specifications.
- Lightweight extraction-candidate register.
- TypeScript orchestration for deterministic FFmpeg/ffprobe/ImageMagick helper scripts.
- Strict TypeScript compiler configuration and Node.js 24.12+ stable native TypeScript runtime contract.
- Runtime validation for JSON/CLI trust boundaries and Node built-in CLI argument parsing.
- Node built-in unit tests for CLI validation behaviour.
- Initial skill and end-to-end eval fixtures.
- Three-shot character-sequence example.
- Agent Skills installation contract for project-local Claude Code and Codex installs.
- Pinned `skills@1.5.22` CI discovery/install smoke-test configuration.
- Replicate and optional ElevenLabs peer-skill installation guidance.
- Agent Skills `license` and `compatibility` frontmatter for both core skills.
- Installed-skill self-containment regression tests for Claude Code and Codex project layouts.
- Human approval as an explicit contract: selection is an agent act, approval is a human act recorded in `approvedBy`, with mandatory checkpoints before expensive generation.
- `detect-motion-artifacts.ts` for temporal integrity — periodic generation seams, frozen frames and drift — usable as a selection gate.
- `preflight.ts` reporting declared external dependencies and the scripts a missing one disables.
- `tools/validate-production.ts` linting a production directory for approval without an approver and for plans that no longer describe the delivered master.
- `tools/run-evals.ts` executing the eval suites structurally and behaviourally, reporting behavioural coverage explicitly.
- Per-stage isolation test harness with ffmpeg-synthesised fixtures, so every workflow stage is exercisable without a provider, without ImageMagick and without committed binaries.
- `references/generated-motion-limits.md` describing how to stage around known generated-motion weaknesses.
- Post-mortem for the "Missed Connection" example recording the failure chain and its corrective actions.
- `scene_sheet`, `scene_manifest` and `object_sheet` artifacts, so environment and prop continuity are declared rather than recalled.
- `validate-continuity.ts` reporting undeclared landmarks, attachment contradictions, screen-order contradictions, landmark discontinuities and undeclared axis crossings.
- Recommended usable range in `detect-motion-artifacts.ts`, so editorial has a span to trim against.
- `--every N` dense frame packs in `sample-frames.ts`, with a density rule tied to the artifact period.
- Disposable reviewer, ordered diagnosis, a four-way defect taxonomy and expanded shot and edit review checklists in `video-evaluate`.
- Defect benchmark: `tools/run-benchmark.ts` scoring evaluation against artifacts with known defects, over a deterministic tier and an opt-in semantic tier that measures unprompted recall and checklist competence separately.
- `tests/fixtures/defects/taxonomy.json` and a committed baseline, covering continuity, generation, technical and creative defect classes with clean controls.
- Synthetic scene fixtures acting as controls for the grader itself.
- `docs/04-testing-and-benchmark-spec.md` specifying the testing layers and serving as the runbook for running them.
- `make-storyboard.ts` composing storyboard panels into a numbered, keylined board sheet, with defaults that produce the expected form and `--print-command` for hosts without ImageMagick.

### Changed

- `render-timeline.ts` warns when a source aspect differs from the render aspect instead of letterboxing silently.
- Reference-frame guidance: a reference frame is a photograph of a moment, not a blocking diagram; subjects that must move are posed mid-motion; the environment is its own artifact.
- Storyboard guidance: boards inherit approved references, annotations stay outside the frame, and board approval is not motion validation.
- Motion prototypes are required whenever a subject must translate, turn or change gait.
- Shot selection is gated on motion quality; still frames resolve staging, not motion.
- Media QC covers temporal integrity and sampling adequacy alongside container validity.
- Storyboard guidance specifies board form: one sheet of small numbered keylined sketch panels, more panels than the sequence has shots, panels generated individually and composed deterministically.
