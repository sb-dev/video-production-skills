# Benchmarks

The benchmark measures whether the skills catch defects, route them to the artifact that owns them, preserve approved work, and produce the videos the repository advertises. `manifest.json` is the coverage authority: every claim the benchmark makes is a case file under `cases/`, and `npm run validate` fails when a claim does not resolve.

Full specification: `docs/04-testing-and-benchmark-spec.md`. This file is the runbook.

## What is benchmarked

| Suite | Cases | Measures | Prompt source |
|---|---|---|---|
| `diagnostic` | seeded defects and clean controls | detection, evidence, routing, scope, preservation, boundary, precision | case `context` + images, or an inline `prompt` |
| `production` | one per advertised example | anchored video-quality dimensions and hard gates | the fenced block under `## Prompt` in `examples/<example>/README.md` |
| `packs` | one per extension-pack showcase | pack adherence through operational behaviour | `extension-packs/<pack>/README.md` — none exist yet |
| `pack-authoring` | `video-extension-pack-creator` scenarios | necessity first, then contract, packaging, showcase, evals | inline `prompt` |

Counts are derived, never written down. Ask the runner:

```bash
npm run benchmark:list
node tools/run-benchmark.ts --list --suite production
```

Each line shows suite, id, execution kind and collector, cost, baseline state (`MEASURED` or `UNMEASURED`), the case fingerprint, and the skills and commands it exercises.

## Free and paid

| What | Cost | Command |
|---|---|---|
| Manifest validation and coverage gates | free | `npm run validate` or `node tools/validate-benchmark.ts` |
| Deterministic diagnostic tier | free, needs ffmpeg | `node tools/run-benchmark.ts` |
| Re-scoring recorded transcripts | free, offline | `node tools/run-benchmark.ts --rescore` |
| Scoring a recorded structured result | free, offline | `node tools/run-benchmark.ts --score <result.json>` |
| Collecting vision-reviewer transcripts | **paid** | `RUN_SEMANTIC_BENCHMARK=1 node tools/run-benchmark.ts --repeat 3` |
| Production, packs and pack-authoring cases | **paid or host-agent time**, never run by the runner | `--prepare` then `--score` |

`npm test` runs only the free rows. Paid cases report `NOT RUN`, never `PASS`.

## Run the deterministic validation

```bash
npm run validate          # manifest, rubrics, prompt sources, coverage gates, command conformance
npm run test:benchmark    # deterministic tier, then re-scoring of committed transcripts
```

## Prepare one semantic case for a host agent

```bash
node tools/run-benchmark.ts --prepare routing-pacing-to-edit > bundle.json
```

The bundle carries the exact prompt, the rubric, the hard gates, the fingerprint, and a `resultTemplate`. Hand the prompt to the agent or reviewer, record what was observed in the template's shape, and keep the fingerprint. Repeat at least three times before calling anything a baseline.

Diagnostic results record `axes` (`true`, `false` or `"na"`) and, where the case declares `expectedRouting`, the `routing` the agent chose: `owningArtifact`, `correctiveAction` and, where the case declares `maxScope`, `scope`. Record the case's `maxScope` label verbatim when the proposed correction fits inside it; otherwise record the scope actually proposed. The scorer decides the `routing` and `scope` axes from these fields; a missing `routing` or `scope` fails the axis regardless of the reviewer's boolean. Anchored results record `gates` and `dimensions` scored 0–3.

## Score recorded evidence

```bash
node tools/run-benchmark.ts --score result.json
node tools/run-benchmark.ts --score a.json --score b.json --json
```

| Line | Meaning |
|---|---|
| `BOUND` | the result's fingerprint matches the case as it stands; comparable |
| `UNBOUND` | the result carries no fingerprint; scored, never comparable, never a baseline |
| `STALE RESULT` | recorded under a different fingerprint; refused, exit 1 |
| `READY` / `NOT READY` | per repeat: no hard gate failed and every required dimension ≥ 2 |
| `FLAKY` | the repeats disagreed on readiness |

A baseline is written only by `--score --update-baseline`, only from `BOUND` results with three or more repeats, into `results/baseline.json`. Nothing else ever creates that file.

## Add a new defect

1. Synthesise the failure in `tests/fixtures/make-fixtures.ts` where it can be expressed in synthetic media.
2. Add a stage test in `tests/stages/` asserting both directions — caught, and not flagged on a clean fixture.
3. Add `cases/diagnostic/<id>.json`. Deterministic: `checker`, `fixture` or `scene`, `expect`. Semantic: `images`, `context`, `criterion`, `keywords`. Every case names `skills`, `commands`, `capability`, `execution`, and an `expectedRouting` where routing is the point.
4. Add a command-targeted eval case in `skills/<skill>/evals/evals.json` and, where possible, a `check` in `tools/run-evals.ts`.
5. For a runner-collected semantic case, collect its transcript once and commit it. Until then it reports as skipped.

Editing a case's `context`, images or the closed criteria invalidates its transcripts; the runner says `STALE TRANSCRIPT` and refuses to score them.

## Add a production example

Add `examples/<name>/README.md` with the generation prompt fenced under `## Prompt`. `npm run validate` then fails until `cases/production/production-<name>.json` exists, pointing at that README with `promptSource`. Choose only the `requiredDimensions` the prompt asks for. Editing the prompt changes the fingerprint; recorded results for the old prompt become `STALE`.

An example without a `## Prompt` must be listed under `coverage.examples.exclude` in the manifest, with the reason.

## Add an extension pack

The moment `extension-packs/<slug>/README.md` carries a `## Prompt`, validation requires `cases/packs/packs-<slug>.json` with `"pack": "<slug>"` and a `promptSource` pointing at that README, and `extension-packs/manifest.json` must name it in `benchmarkCase`. Pair every intentional-trait case with a real-defect case so the pack changes the target, not the requirement for quality.

## Fingerprints and staleness

A fingerprint is the sha256 of the case definition, the resolved prompt text, the rubric, and — when `execution.bindContracts` is true — the command contracts it names. Two things are deliberately separate:

- **Transcript staleness** (diagnostic vision cases) keys on the model, the image descriptor and the two prompt digests. It is unchanged from before `benchmarks/` existed, so every historical transcript still scores.
- **Result staleness** (`--score`) keys on the fingerprint. A rubric edit re-fingerprints every case that uses it, on purpose.

Baseline state is derived, not declared: a case is `MEASURED` when its id appears in `tests/fixtures/defects/baseline.json` or `benchmarks/results/baseline.json`, and `UNMEASURED` otherwise.

## Layout

```text
benchmarks/
├── manifest.json     suites, rubrics, evidence pointers, coverage rules, release tiers
├── rubrics/          diagnostic (axes), video-quality, pack-adherence, pack-authoring (anchored 0–3)
├── cases/<suite>/    one <id>.json per case
└── fixtures/         scorer-pass.json and scorer-fail.json — exercise the scorer, never evidence

tests/fixtures/defects/   transcripts and the historical baseline (evidence, unchanged)
tools/benchmark/          the shared library the runner, validator and repository check import
```
