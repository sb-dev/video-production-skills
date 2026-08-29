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
- `benchmarks/` as a first-class surface: `manifest.json` as the coverage authority, anchored rubrics (`diagnostic`, `video-quality`, `pack-adherence`, `pack-authoring`), and cases across four suites — the migrated diagnostic cases plus routing, scope and orchestration definitions, one production case per advertised example, and pack-authoring scenarios.
- `tools/validate-benchmark.ts` and `tools/benchmark/`: manifest validation, example and showcase coverage gates, command normal/boundary conformance, deterministic case fingerprints; wired into `npm run validate`.
- `run-benchmark.ts --list`, `--suite`, `--case`, `--prepare <id>` and `--score <result.json>`: host-agent cases are prepared and scored offline, report `NOT RUN` until measured, and refuse `STALE` results.
- `npm run benchmark:list`, `npm run validate:benchmark`, and scorer fixtures under `benchmarks/fixtures/`.
- Eval cases so every command has normal-side and boundary coverage, with two new deterministic checks (`continuity:passes-clean-scene`, `qc:accepts-valid-media`).
- `make-storyboard.ts` composing storyboard panels into a numbered, keylined board sheet, with defaults that produce the expected form and `--print-command` for hosts without ImageMagick.
- Committed semantic transcripts under `tests/fixtures/defects/transcripts/`, with `--rescore` scoring them offline and `--print-prompts` showing exactly what the reviewer was asked. Re-scoring after a scorer change costs nothing, and a transcript recorded against a changed prompt, model or image set is refused rather than scored.
- `--repeat N` sampling each semantic case several times: verdicts are the majority across repeats, the observed rate is recorded beside them, and a case that passes some repeats and fails others is reported `FLAKY` instead of failing the run as a regression.
- Skill-local command contracts under `skills/*/commands/`: thirteen for `video-production`, six for `video-evaluate`, nine for `video-extension-pack-creator`. Each declares its purpose, inputs, outputs, preconditions, invariants (its preserve set), forbidden behaviour, failure routing and evaluation hooks, so a behaviour can be tested, diagnosed and benchmarked in isolation without introducing a command runtime.
- Command-targeted eval cases and command coverage reporting: `run-evals.ts` accepts `--skill` and `--command`, validates a case's `command` against a real contract, and reports every command as `PASS`, `FAIL`, `MANUAL` or `UNCOVERED` so a command with no evidence cannot look green by implication. `npm run test:commands` runs each skill's suite on its own.
- Command contract validation in `tools/validate-repo.ts`: required headings, heading order, frontmatter identity, and every skill-local or repository resource a contract names must exist.
- `video-extension-pack-creator` Agent Skill for authoring, validating and cataloguing reusable extension packs, with `scripts/validate-pack.ts` for structural acceptance.
- `docs/05-video-customisation-packs-spec.md` — the extension-pack contract: reusable production profiles distributed as installable Agent Skills, ranked strictly below user instructions and approved artifacts.
- `docs/06-video-extension-pack-catalogue-spec.md` — the curated catalogue, its entry contract, and showcase requirements.

### Changed

- The defect benchmark's cases moved losslessly from `tests/fixtures/defects/taxonomy.json` to `benchmarks/cases/diagnostic/<id>.json`; transcripts and the historical baseline stay where they were and every recorded transcript still scores. `run-benchmark.ts --taxonomy` became `--manifest`.
- `docs/04` rewritten to v2 around the `benchmarks/` surface, keeping the 2026-08-24 measured results verbatim as historical evidence; `docs/03` v7 and `docs/06` v3.2 record the benchmark contract.
- `render-timeline.ts` warns when a source aspect differs from the render aspect instead of letterboxing silently.
- Reference-frame guidance: a reference frame is a photograph of a moment, not a blocking diagram; subjects that must move are posed mid-motion; the environment is its own artifact.
- Storyboard guidance: boards inherit approved references, annotations stay outside the frame, and board approval is not motion validation.
- Motion prototypes are required whenever a subject must translate, turn or change gait.
- Shot selection is gated on motion quality; still frames resolve staging, not motion.
- Media QC covers temporal integrity and sampling adequacy alongside container validity.
- Storyboard guidance specifies board form: one sheet of small numbered keylined sketch panels, more panels than the sequence has shots, panels generated individually and composed deterministically.
- Closed-pass benchmark scoring is reported on two axes — detection (the expected criterion failed) and precision (nothing else failed alongside it) — with the original combined verdict kept as `strict`. A reviewer that finds the defect and is noisy about it is no longer scored as though it had found nothing.
- The semantic scorer is covered by `npm test` without a provider token, since it runs against recorded answers.
- Retry and failure diagnosis carries a limit rather than advice: a second failure with the same diagnosis stops the loop, and a third attempt on a shot requires a changed upstream artifact or a human decision. Retrying against unchanged inputs is the same experiment, and cost scales with attempts while the odds of a different outcome do not.
- Reference-frame guidance states the two acceptable states for text in frame — readable and plausible, or genuinely defocused, abstract or out of frame — and that banning readable signage does not thereby permit garbled signage.
