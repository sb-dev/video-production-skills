# Video Production Skills — Testing and Benchmark Specification

## 1. Purpose

This specification defines how Video Production Skills, Video Production extension packs, and
`video-extension-pack-creator` are tested, benchmarked, and quality-assured. It also serves as the
runbook for running those tests.

It exists because of a specific failure. `examples/level-2-missed-connection` was produced,
self-declared **ACCEPT / QC PASS**, and shipped — carrying visible generation seams, a pillar
present in one approved reference frame and no other shot, and creative direction nobody had
approved. Every defect was reachable by a cheap check. None of those checks existed, and the
only way to discover any of them was to pay for a full production first.

The governing principle:

> **No defect class should require a full production run to discover.**

This document complements `docs/03` §13 *Eval Requirements* and §26 *Technical Acceptance
Criteria*; it does not restate them. `benchmarks/README.md` is the short contributor runbook;
this document is the contract behind it.

---

---

## 2. Quality model

Quality is reported as six surfaces. A strong score on one never hides a regression on another,
and no surface is summed into a single number.

| Surface | Question | Where it is measured |
|---|---|---|
| Command correctness | Does one command honour its contract? | `skills/*/evals/evals.json` via `run-evals.ts`; command-scoped benchmark cases |
| Skill orchestration | Does a skill choose and sequence commands correctly, skip what is approved, and stop? | `diagnostic` cases with capability `orchestration` |
| Production correctness | Are approved decisions preserved, continuity kept, delivery constraints met? | deterministic checkers; hard gates of `video-quality` |
| Video quality | Is the result strong as a film — composition, motion, edit, audio, style? | `production` cases, anchored 0–3 dimensions |
| Extension-pack fidelity | Does the pack materially change production without excusing defects? | `packs` cases, `pack-adherence` rubric |
| Pack-authoring quality | Does the creator make necessary, operational, self-contained packs? | `pack-authoring` cases, `necessity` hard gate |

The benchmark keeps two failure kinds apart:

```text
production-contract failure
→ approved work lost · wrong artifact revised · continuity broken · pack ignored · delivery constraint violated
→ a hard gate; the repeat is not production-ready

creative-quality failure
→ technically valid output whose composition, motion, edit, audio or style is weak
→ a scored dimension below 2
```

And four failure locations:

```text
wrong command selected                    → skill-orchestration failure
right command, contract violated          → command failure
correct commands, wrong sequence/handoff  → orchestration/workflow failure
correct workflow, weak final video        → end-product quality failure
```

---

## 3. Benchmark suites

`benchmarks/manifest.json` names four suites. Case counts are derived by `npm run benchmark:list`
and are not written in this document.

| Suite | Content | Execution |
|---|---|---|
| `diagnostic` | seeded defects and clean controls: the migrated defect benchmark, plus routing, scope-preservation and orchestration definitions | deterministic (runner), semantic (runner-collected vision transcripts), semantic (host agent) |
| `production` | one case per example README with a `## Prompt`; the prompt source is the README | generation, host agent, paid |
| `packs` | one case per `extension-packs/<slug>/README.md` showcase; zero today, gate armed | generation, host agent, paid |
| `pack-authoring` | `video-extension-pack-creator` scenarios from §13 | semantic, host agent |

### 3.1 Diagnostic

Retained defect classes: motion seam, frozen range, unreadable media, aspect mismatch,
self-approval, plan/delivery mismatch, undeclared landmark, attachment contradiction, screen-order
contradiction, landmark discontinuity, axis violation, static subject, storyboard contradicting its
references, pseudo-text, annotations in panel — each with the smallest fixture that exposes it and a
clean control where practical. The new definition-only cases hold the answers the old benchmark
never scored: the owning artifact, the corrective action, the correction scope, and which commands
an orchestration must skip.

### 3.2 Production

> **The benchmark measures the productions the repository actually advertises.**

Each case's `promptSource` is `examples/<name>/README.md` under `## Prompt`. The prompt is never
copied into the case; changing the README changes the fingerprint. An example without a prompt is
excluded in the manifest with a reason.

### 3.3 Packs

Extension-pack quality is not measured by whether a result merely resembles the pack label.
Representative packs must prove:

```text
format adherence
genre / audience fit where defined
operational style adherence
cross-shot preservation of pack traits
intentional-imperfection tolerance
genuine defect detection
user-instruction precedence
approved-artifact precedence
voice-role behaviour where relevant
delivery behaviour where relevant
```

The pack changes the quality target, not the requirement for quality.

The required release suite uses one substantially different pack from each production grammar:

```text
anime-sci-fi-short
claymation-family-adventure
stylised-3d-fantasy-short
kinetic-typography-launch
found-footage-horror
premium-product-launch
```

The full catalogue may be swept on release candidates or scheduled runs. A change to one pack does
not require paying to regenerate every other pack unless shared behaviour changed.


### 3.4 Pack authoring

The creator benchmark must prove that the skill can:

```text
inspect the current catalogue before creating a pack
decide correctly between reuse / adapt / create
reject trivial near-duplicate packs
justify a genuinely new reusable production grammar
create a coherent pack from a complete or partial brief
separate hard constraints from softer defaults
translate style labels into operational production behaviour
create voice-enabled and voice-free profiles without inventing provider IDs
define preserve / do-not-penalise / reject evaluation behaviour
respect explicit user and approved-artifact precedence
avoid unnecessary provider implementation
avoid unnecessary files
create a canonical extension-packs/<pack>/README.md showcase
create an exact fenced copy-ready ## Prompt
create behavioural evals across normal/refinement/final/boundary behaviour
adapt an existing pack without destroying its identity
avoid creator-name-only style definitions
validate before catalogue registration
register accepted packs in catalogue + benchmark surfaces
```

**Pack necessity is a hard gate.** A structurally valid new pack fails when an existing pack plus
project-specific instructions would have been sufficient.

A generated pack is not benchmark-passing merely because its files validate. It must also be
coherent, necessary, operational, evaluable, self-contained, and capable of producing a canonical
showcase that demonstrates its declared production language.

The `extension-packs/` surface these cases name is specified in `docs/05` §4 and does not exist in
this repository yet.


### 3.5 Defect taxonomy

Benchmark cases use explicit defect classes so regressions remain diagnosable. The four-way split
in §21 step 1 — technical, creative, continuity, generation/model — remains the classification a
finding is reported under; these classes name the specific defect within it.

```text
Governance / lifecycle
- approved-decision-loss
- selected-candidate-ignored
- unapproved-promotion
- preserve-set-violation
- self-approval
- stale-provenance

Technical / media
- decode-failure
- wrong-duration
- wrong-resolution
- wrong-frame-rate
- motion-seam
- frozen-range
- corrupt-audio
- delivery-mismatch

Visual fidelity
- character-identity-drift
- product-geometry-drift
- prop-drift
- environment-drift
- text-legibility-failure
- reference-frame-contradiction

Motion / physical behaviour
- subject-posed-for-action
- implausible-body-motion
- object-interaction-failure
- camera-motion-mismatch
- accidental-interpolation
- repeated-action-artifact

Continuity / staging
- landmark-discontinuity
- attachment-contradiction
- screen-order-contradiction
- axis-violation
- eyeline-discontinuity
- wardrobe-or-prop-discontinuity

Editorial / audio
- wrong-shot-selected
- pacing-mismatch
- reveal-timed-wrong
- edit-fix-misdiagnosed-as-generation
- audio-sync-failure
- dialogue-or-voice-discontinuity
- mix-obscures-required-information

Delivery
- aspect-ratio-adaptation-failure
- crop-hides-critical-subject
- unsafe-text-layout
- master-variant-confusion

Pack behaviour
- pack-not-applied
- pack-trait-drift
- intentional-trait-misclassified
- real-defect-excused-as-style
- user-override-ignored
- approved-artifact-overridden
- voice-role-mismatch
- pack-leakage-when-not-requested

Evaluation / correction
- finding-without-evidence
- finding-invented-on-clean-control
- symptom-not-root-cause
- wrong-owning-artifact
- wrong-corrective-action
- revision-scope-too-broad
- revision-scope-too-narrow
- unaffected-approved-material-changed

Pack creation
- label-only-production-profile
- contradictory-pack-constraints
- incomplete-evaluation-contract
- generic-showcase
- invalid-generation-prompt
- unnecessary-provider-implementation
- unnecessary-file-proliferation
- creator-name-only-style-definition
```

Every seeded defect must have a clean control where practical. The classes above beyond those
already present under `benchmarks/cases/diagnostic/` are the vocabulary for cases yet to be
written, not a claim that fixtures exist for them.


---

## 4. Command conformance

Command decomposition is the primary component-test boundary.

Command decomposition is the primary component-test boundary.

```text
Skill
→ command contract
→ command-targeted eval fixture
→ deterministic check / semantic collection where required
```

The initial command inventory is:

```text
video-production
├── define-direction
├── create-storyboard
├── plan-shots
├── create-animatic
├── create-reference
├── create-motion-prototype
├── generate-shot
├── select-shot
├── assemble-edit
├── integrate-audio
├── render-master
├── create-delivery
└── refine

video-evaluate
├── evaluate
├── diagnose
├── check-continuity
├── check-motion
├── check-fidelity
└── qc

video-extension-pack-creator
├── define-pack
├── derive-production-profile
├── define-evaluation-profile
├── define-voice-profile
├── create-skill-package
├── create-evals
├── create-showcase
├── create-catalogue-entry
└── validate-pack
```

Each command must have:

```text
contract validation
+
at least one targeted eval
+
a clean/control case when false positives are meaningful
+
provider-backed evidence only when the behaviour cannot be proved cheaply
```

Critical commands have stronger requirements:

```text
refine
→ must prove correction scope + preservation

diagnose
→ must prove detection + evidence + routing + correction scope

check-continuity
→ must prove seeded defect + clean control

check-motion
→ must prove seeded temporal defect + clean control

check-fidelity
→ must prove reference mismatch + matching control

qc
→ must prove invalid media/requirement + valid control

define-pack
→ must prove catalogue inspection plus reuse / adapt / create discrimination, including a near-duplicate control

derive-production-profile
→ must prove style/format/genre intent becomes operational production behaviour

define-evaluation-profile
→ must prove intentional traits and real defects are distinguished

define-voice-profile
→ must prove optional voice handling without invented or unsafe references

create-skill-package
→ must prove the generated pack is minimal and self-contained

validate-pack
→ must fail a complete-looking pack that is unnecessary, unbenchmarked, or not self-contained

create-catalogue-entry
→ must refuse registration before validation and verify catalogue/benchmark cross-references
```

Every command also needs at least one normal-side eval case (`normal`, `draft`, `refinement`,
`final`) and one `failure-boundary` case; `tools/validate-benchmark.ts` reports the counts per
skill and command and fails on a gap unless the manifest records an exemption with a reason.

Command coverage is reported separately from skill coverage. A green end-to-end case does not
backfill missing command coverage. Every command is reported by name as `PASS`, `FAIL`, `MANUAL`
(it has cases, none of them executable) or `UNCOVERED` (no case targets it at all). None of the four
is green by implication.

Runner:

```bash
npm run test:commands
node tools/run-evals.ts --skill video-production --command create-reference
node tools/run-evals.ts --skill video-production --command refine
node tools/run-evals.ts --skill video-evaluate --command diagnose
```

The runner is test infrastructure. It must not become a production command runtime.


---

## 5. Testing layers

| Layer | Question it answers | Provider | Command |
|---|---|---|---|
| typecheck / validate | Is the repository well formed? | no | `npm run typecheck`, `npm run validate` |
| unit | Do scripts reject bad input before doing work? | no | `npm run test:unit` |
| command | Does one named skill behaviour satisfy its contract in isolation? | no (structural), opt-in (behavioural) | `npm run test:commands` |
| stage | Does each workflow stage behave correctly in isolation? | no | `npm run test:stages` |
| evals | Do the skills' declared behaviours actually hold? | no (structural), opt-in (behavioural) | `npm run test:evals` |
| benchmark — deterministic | Are declared defects detected, and clean artifacts left alone? | no | `npm run test:benchmark` |
| benchmark — semantic, scoring | Does the scorer read the recorded answers correctly? | no | `node tools/run-benchmark.ts --rescore` |
| benchmark — semantic, collection | Does judgement catch defects only visible in the image? | opt-in | `RUN_SEMANTIC_BENCHMARK=1 node tools/run-benchmark.ts --repeat 3` |
| benchmark — catalogue | Which capabilities are claimed, which cases prove them, and what is measured? | no | `npm run validate`, `npm run benchmark:list` |
| benchmark — host-agent scoring | Does a recorded production, routing, pack or authoring result meet its rubric? | no (scoring); opt-in / paid (collection) | `node tools/run-benchmark.ts --prepare <id>`, `--score <result.json>` |

The repository implements every layer in that table except the last. The extension-pack and
pack-creator runners are **implementation requirements introduced by this specification**. Do not
report their commands or coverage as available until the corresponding runner and fixtures exist.

The repository implements every layer in that table.

### 5.1 What each layer cannot do

Stating the limits matters more than stating the coverage, because every shipped defect passed
a layer that was never able to see it.

- **typecheck / validate** say nothing about behaviour. A script can be perfectly typed and wrong.
- **unit** tests here assert argument rejection. They do not exercise a single frame of media.
- **command** tests prove one declared behaviour against controlled inputs and its preserve set.
  They do not prove that an entire production can orchestrate several commands coherently.
- **stage** tests exercise real behaviour on synthetic fixtures. They cannot judge whether a
  photograph matches its brief.
- **evals** are prose unless a case names an executable `check`. Coverage is reported so an
  unfalsifiable suite cannot look green.
- **benchmark, deterministic** checks *declarations*. It catches a landmark nobody declared; it
  cannot see a landmark that is in the picture but absent from the declaration.
- **benchmark, semantic** is the only layer that judges an image against its declaration, and
  the only layer that costs money — but only when *collecting* answers. Scoring them is free and
  offline, and runs in `npm test`. What it cannot do is tell you the reviewer is reliable: it is
  not deterministic even at `temperature: 0`, which is why a verdict is a majority of repeats
  and never a single sample.
- **benchmark, host-agent scoring** reads what a host agent or reviewer recorded. It cannot
  see the video; it trusts the recorded axes and scores, which is why a result carries its
  execution identity and why three repeats are the floor for a baseline.
- **transcripts** prove what was asked and answered. They cannot prove the *images* have not
  changed underneath them: staleness is keyed on the model, the prompt text and which artifacts
  a case points at, none of which notice a regenerated file at the same path.

---

## 6. Standing rules

1. **A stage that cannot run skips loudly.** Never silently. A missing dependency that produces
   a green run is how ad-hoc tooling gets substituted unnoticed — which is precisely how the
   sparse frame sampling that hid the seams came about.
2. **Coverage is reported, not implied.** `run-evals.ts` prints executable-versus-total.
3. **Every defect that reaches a deliverable becomes a fixture.** The shipped failures are now
   regression tests: seams (`tests/stages/motion-artifacts.test.ts`), the pillar and the board
   (`tests/stages/continuity.test.ts`), self-approval (`tests/stages/production-lint.test.ts`),
   silent letterboxing (`tests/stages/timeline.test.ts`).
4. **Fixtures are synthesised, not committed.** `tests/fixtures/make-fixtures.ts` builds media
   with ffmpeg `lavfi` at run time. The fixture directory is keyed on a hash of the generator,
   so editing a fixture definition invalidates the cache rather than silently serving a stale clip.
5. **Answers are kept; evidence is never paid for twice.** Every semantic response is written to
   `tests/fixtures/defects/transcripts/` and committed. Changing the scorer is re-scored for
   nothing, which is what makes it possible to fix a scorer *after* publishing a baseline
   without the fix being suspected of chasing the numbers.
6. **A transcript recorded against a different question is refused, not scored.** Editing a
   case's context, criteria or images invalidates its transcripts; the run says `STALE
   TRANSCRIPT` and exits non-zero rather than scoring stale evidence, and it will not write a
   baseline from it.
7. **One sample is not a measurement.** Verdicts are the majority across repeats, the observed
   rate travels with them, and a case that passes some repeats and fails others is reported
   `FLAKY` rather than failing the run as a regression.
8. **Pack-aware cases require paired controls.** At least one case must prove an intentional trait
   is accepted and another must prove a real defect is not excused by the same style.
9. **A result recorded under a different fingerprint is `STALE`.** `--score` refuses it. Editing a
   case, its prompt source, its rubric or a bound command contract re-fingerprints it on purpose.
10. **Coverage is a gate, not a report.** An advertised example or showcase without a case, and a
    command without normal-side and boundary eval cases, fail `npm run validate`.
11. **No score is invented for a surface nobody measured.** A case is `MEASURED` only when its id
    appears in a baseline file written from real evidence; everything else is `UNMEASURED`.

---

## 7. Repository layout

```text
benchmarks/
→ benchmark cases, rubrics, capability coverage, fingerprints, benchmark documentation

tests/fixtures/
→ synthetic and raw test evidence; low-level deterministic fixtures; recorded transcripts and the
  historical baseline under tests/fixtures/defects/

tests/stages/
→ deterministic production-stage tests

skills/*/evals/
→ command and skill behavioural evals

tools/
→ benchmark and eval execution; tools/benchmark/ is the library the runner and validator share
```

`benchmarks/results/` does not exist until a `BOUND` result with three or more repeats is written
by `--score --update-baseline`. Nothing scaffolds it earlier.

---

## 8. Runbook

### 8.1 Prerequisites

- **Node.js 24.12+** — the repository targets native TypeScript execution. On an older runtime,
  prefix commands with `NODE_OPTIONS='--experimental-strip-types --disable-warning=ExperimentalWarning'`.
- **FFmpeg and ffprobe** — required. Most stages cannot run without them.
- **ImageMagick** — optional. Only `make-contact-sheet.ts` and `make-storyboard.ts` composition
  need it; their tests skip loudly when it is absent.

Check the environment before anything else:

```bash
node skills/video-evaluate/scripts/preflight.ts
```

```text
ffmpeg: available (ffmpeg) [required]
ffprobe: available (ffprobe) [required]
imagemagick: MISSING [optional]

unusable scripts:
  video-production/scripts/make-contact-sheet.ts
  video-production/scripts/make-storyboard.ts

Do not substitute ad-hoc tooling for an unusable script without recording it.
```

A missing dependency is not a reason to improvise a replacement. Record it.

### 8.2 Run everything

```bash
npm test
```

Runs typecheck → validate → unit → commands → stages → evals → benchmark → smoke. Exit 0 is the
only pass. The semantic tier is never part of `npm test` and never gates CI.

### 8.3 Run one layer or one stage

```bash
npm run test:commands
node tools/run-evals.ts --skill video-production --command create-reference
node tools/run-evals.ts --skill video-evaluate --command diagnose

npm run test:stages
node --test tests/stages/continuity.test.ts
node --test tests/stages/motion-artifacts.test.ts
```

Stage files map one-to-one onto workflow stages: `preflight`, `media-qc`, `motion-artifacts`,
`sampling`, `timeline`, `contact-sheet`, `storyboard`, `continuity`, `production-lint`, `benchmark`.

### 8.4 Check a real artifact

**Temporal integrity and usable range.** Exit `0` clean, `1` artifacts, `2` usage error.

```bash
node skills/video-evaluate/scripts/detect-motion-artifacts.ts <shot.mp4>
```

Periodic seams mean the clip was assembled from fixed-length chunks — a generation defect, not
something a prompt will fix. The usable range is the longest span free of defects; a take whose
usable range is far shorter than its duration was never usable at the length it was cut to.

**Spatial continuity.** Exit `0` clean, `1` findings, `2` usage error.

```bash
node skills/video-evaluate/scripts/validate-continuity.ts <scene-manifest.json>
```

| Finding | Meaning |
|---|---|
| `unknown-landmark` | a shot contains a landmark the scene never declared |
| `attachment-contradiction` | the same landmark anchored differently between shots |
| `screen-order-contradiction` | landmark order contradicts the axis from the declared camera side |
| `landmark-discontinuity` | a landmark vanishes between shots that both contain it |
| `axis-violation` | the camera crossed the axis without declaring it |

**Artifact governance.** Exit `0` clean, `1` findings.

```bash
node tools/validate-production.ts <production-dir>
```

Reports artifacts marked `approved` or `locked` with no `approvedBy`, timeline sources that do
not resolve, and a master that no longer matches its timeline.

**Building a review frame pack.** A pack must be sampled at no more than half the shortest
artifact period it is meant to reveal:

```bash
node skills/video-evaluate/scripts/sample-frames.ts <shot.mp4> <dir> --every 4
```

`--count N` spreads a handful of frames across the clip. That answers staging questions and
nothing else; it is not a motion check.

### 8.5 The defect benchmark

Cases live under `benchmarks/cases/diagnostic/`, one file per case, each declaring its class,
tier, fixture and the diagnosis it must produce. Clean controls carry equal weight: a benchmark without
negative cases measures eagerness, not discrimination.

```bash
node tools/run-benchmark.ts                       # deterministic tier, free, offline
node tools/run-benchmark.ts --only continuity     # one class
node tools/run-benchmark.ts --rescore             # semantic tier from recorded answers, free
```

The semantic tier puts each artifact to a reviewer twice and scores the passes separately:

- **open** — *"Describe any problems with this artifact."* Does the reviewer name the defect
  unprompted?
- **closed** — the criteria list, returning PASS/FAIL/NA per criterion. Scored on two axes,
  because they are two abilities: **detection** (the expected criterion failed) and
  **precision** (nothing else failed alongside it). The original combined verdict survives as
  **strict**, so nothing here lowered the bar — it stopped reporting a correct-but-noisy answer
  as though the reviewer had seen nothing.

Precision is only scored on cases where detection succeeded. Counting a miss as precise would
pad the denominator with cases that never had the chance to be imprecise.

Without `REPLICATE_API_TOKEN` the tier reports **NOT RUN**. It never reports a score it did not
obtain.

#### Collecting answers

Collection is the only part that costs money. It prints the number of paid calls before
spending anything:

```bash
RUN_SEMANTIC_BENCHMARK=1 node tools/run-benchmark.ts --repeat 3
# collecting 48 paid calls (3 repeat(s) × 2 passes per uncached case)
```

Answers already recorded are reused, so raising `--repeat` pays only for the new samples and
re-running after an interruption resumes where it stopped. `--refresh` forces re-collection.

#### Re-scoring for free

Every answer is committed under `tests/fixtures/defects/transcripts/`. Changing the scorer costs
nothing to re-measure:

```bash
node tools/run-benchmark.ts --rescore          # scores every recorded repeat
node tools/run-benchmark.ts --print-prompts    # exactly what the reviewer was asked
```

Editing a case's `context`, the manifest's `closedCriteria` list, or which images it points at
changes the question, so its recorded answers no longer bear on it. The run says so and exits non-zero:

```
STALE TRANSCRIPT: creative-pseudo-text: the open prompt changed
re-collect with --refresh, or revert the change to the case
```

This is the standing rule about loud skips applied to recorded evidence — and it is why the
benchmark can be corrected after publication without the correction being able to quietly
inherit the old numbers.

One limitation is deliberate: the image identity a transcript is keyed on is a path descriptor,
not a content hash, so `--rescore` stays runnable with no filesystem or ffmpeg access. Re-pointing
a case at different artifacts is detected; editing the bytes behind an unchanged path is not. A
stage test compensates for the sharpest edge of that gap by asserting every taxonomy-referenced
example image exists on disk.

#### Baselines, regressions and flakes

Update the baseline deliberately, never as a side effect of a passing run:

```bash
RUN_SEMANTIC_BENCHMARK=1 node tools/run-benchmark.ts --repeat 3 --update-baseline
```

A verdict is the **majority** across repeats and the observed rate is recorded beside it. Ties
fail: a case that passes half the time has not demonstrated the ability.

- a case that previously passed and now fails **every** repeat is a `REGRESSION` and fails the run;
- a case that still passes **some** repeats is `FLAKY` and does not. The tier is not
  deterministic even at `temperature: 0`, and a gate that fires on sampling noise stops being read.

### 8.6 The benchmark catalogue

```bash
npm run benchmark:list                                  # every case: suite, execution, cost, baseline state, fingerprint
node tools/run-benchmark.ts --list --suite production   # one suite
node tools/validate-benchmark.ts                        # coverage by suite, example, showcase and command
node tools/run-benchmark.ts --prepare <id>              # prompt + rubric + fingerprint + result template for a host agent
node tools/run-benchmark.ts --score <result.json>       # offline verdict; READY / NOT READY per repeat, STALE refused
node tools/run-benchmark.ts --score <a> --score <b> --update-baseline   # BOUND results, three or more repeats only
```

The runner never executes a host-agent case. In `npm test` every such case is `NOT RUN`.

### 8.7 Triage

| Symptom | Owning layer | Likely cause | Action |
|---|---|---|---|
| `validate` fails on JSON | repository | stray or malformed file in the tree | fix or remove the file |
| `validate` fails on benchmark coverage | benchmark | an example or showcase gained a prompt with no case, a case names a missing skill/command/rubric, or a command lacks a normal-side or boundary eval | add the case or eval; `node tools/validate-benchmark.ts` names each gap |
| `STALE RESULT` from `--score` | benchmark | the case, prompt, rubric or a bound contract changed since the result was recorded | re-run the case with `--prepare`; never edit the result |
| `validate` fails on a command contract | repository | a command file is missing a required heading, or an eval names a command that does not exist | fix the contract or the eval |
| a stage test fails only on your machine | environment | missing dependency | run `preflight.ts` |
| a stage test skips | environment | optional dependency absent | install it, or accept the stated gap |
| seams reported | generation/model | chunked generation | retry, or change model — not the prompt |
| frozen frames reported | generation/model | the model stopped animating | retry with shorter duration |
| usable range far below duration | editorial | the take was cut too long | trim to the reported range |
| `unknown-landmark` | continuity | the scene was never declared | declare the scene, then regenerate |
| `attachment-contradiction` | continuity | frames disagree about the location | fix the frame, not the manifest |
| `approval-without-approver` | governance | an agent approved its own work | obtain human approval |
| `plan-delivery-mismatch` | governance | the plan was not reconciled | update the artifact or record a reopening |
| eval coverage drops | evals | a case lost its executable check | restore the `check` or justify it |
| a command reports `UNCOVERED` | commands | the command has no targeted eval case | add one, or state why the behaviour is unfalsifiable |

When several causes are plausible, work the ordered diagnosis in
`skills/video-evaluate/SKILL.md` rather than the first that fits. Taking them out of order is
how a reference-frame failure gets misdiagnosed as a prompt failure and retried fifteen times.

---

## 9. Case contract

Every case is one file, `benchmarks/cases/<suite>/<id>.json`, whose name equals its `id`.

```text
id                     unique across suites
suite                  the directory it lives in
capability             what the case proves: detection, routing, scope-preservation, orchestration,
                       video-quality, pack-adherence, pack-authoring
summary                one sentence
skills                 skills exercised; must exist
commands               <skill>/<command>; every one must have a contract file
rubric                 a rubric id from the manifest
execution              { kind: deterministic | semantic | generation,
                         collector: runner | host, paid, provider?, bindContracts? }
prompt | promptSource  exactly one, except legacy diagnostic cases, which build their prompts from
                       context and images; promptSource is { path, heading } and resolves to the
                       first fenced block under that heading
requiredDimensions     rubric dimensions that must score ≥ 2 (anchored rubrics)
hardGates              overrides the rubric's default hard gates when a case needs fewer
expectedRouting        { owningArtifact, correctiveAction, maxScope? } — scored mechanically
evidence               optional images a host agent is shown, in the diagnostic image shape
example | pack         the example directory or pack slug the coverage gate matches on
```

Legacy diagnostic fields — `class`, `tier`, `checker`, `scene`, `fixture`, `production`, `images`,
`context`, `criterion`, `keywords`, `expect`, `owningArtifact`, `correctiveAction` — are carried
verbatim from the original taxonomy so their transcripts stay valid.

`execution.collector: runner` is reserved for those legacy cases. Everything else is collected by a
host agent through `--prepare` and scored through `--score`; the runner never spends on it.

---

## 10. Diagnostic scoring

`rubrics/diagnostic.json` scores each repeat on seven axes:

| Axis | Question |
|---|---|
| detection | Did the system identify the seeded problem, or correctly leave a clean control alone? |
| evidence | Did it cite supplied artifact or media evidence — frame or time range, reference mismatch, timeline source, manifest contradiction, brief constraint, pack rule, technical measurement? |
| routing | Did it identify the highest useful owning artifact, stage or command? |
| scope | Did it choose the smallest sufficient correction? |
| preservation | Did approved or locked work survive? |
| boundary | Did it stay inside Video Production Skills responsibilities? |
| precision | Did it avoid unsupported additional findings? |

A strict pass requires every applicable hard axis — all but precision — to pass. Precision is
reported beside the verdict and never decides it: a second finding that may also be genuine does
not invalidate a correct diagnosis. When a case declares `expectedRouting` and the result records
the route chosen, the `routing` axis is computed by exact match on owning artifact and corrective
action. A correct diagnosis with the wrong corrective target is not a strict pass.

Routing examples the cases hold:

```text
wrong camera move caused by the shot plan        → shot_plan / revise-shot-plan
bad composition already in an approved reference → reference_frame / revise-reference
good shots, weak rhythm                          → edit_timeline / revise-edit
wrong crop                                       → delivery_variant / refine-current via create-delivery
```

The historical vision transcripts (§23.1) were scored on `open`, `closedDetection`,
`closedPrecision` and `closed`. Those map to detection and precision only; they are not evidence
about routing, scope, preservation, evidence or boundary, which stay `UNMEASURED` until a host
agent result is recorded.

---

## 11. Video-quality scoring

`rubrics/video-quality.json` uses an anchored four-point scale:

```text
0 = fails or contradicts the requirement
1 = material weakness; not production-ready
2 = acceptable production quality
3 = strong, deliberate execution
```

Nineteen dimensions are available — instruction adherence, visual-direction adherence, composition
and staging, character fidelity, product fidelity, environment continuity, motion quality, camera
behaviour, physical interaction, spatial continuity, editing and pacing, shot selection, audio/video
integration, voice continuity, graphics and typography, technical integrity, delivery fit,
production discipline, specificity and intentionality. A case names only the ones its prompt calls
for.

Hard gates: instruction adherence, approved-decision preservation, required character or product
fidelity, continuity, technical integrity, delivery correctness, production discipline. A gate that
is also a scored dimension is judged by its score (< 2 fails).

A repeat is **production-ready** when no applicable hard gate fails and every required dimension
scores 2 or higher. Dimensions are reported separately and never summed. A visually attractive video
that breaks an approved product design or contains invalid media is not production-ready.

---

## 12. Extension-pack scoring

`rubrics/pack-adherence.json` scores format, genre, style through operational behaviour —
materials, motion cadence, camera, lighting, editing, graphics, sound — intentional-imperfection
tolerance, audience, voice casting, pack consistency and pack-aware evaluation. Its hard gates are
user-instruction precedence, approved-artifact precedence, project boundary, and
real-defect-not-excused. A pack is never judged by whether output "looks like" its label.

The catalogue coverage gate: a showcase README with a `## Prompt` under `extension-packs/` requires
`cases/packs/packs-<slug>.json`, and `extension-packs/manifest.json` must name it in
`benchmarkCase`. Stale cases for removed packs, and entries without a case, fail validation.

> **UNMEASURED.** The pack-authoring scenarios below are defined as cases under
> `benchmarks/cases/pack-authoring/` and prepared with `--prepare`; no result has been recorded
> for any of them. The pack-awareness cases become `packs` cases the moment a showcase exists under
> `extension-packs/`; until then the gate reports `0/0`. Nothing here is a score.

### 12.1 Pack-awareness cases

#### Intentional stop-motion control

Claymation clip contains deliberate stepped movement but no unintended defects.

Expected:

```text
do not flag stepped motion
preserve tactile material language
```

#### Stop-motion interpolation defect

The same pack produces an accidentally smoothed character segment.

Expected:

```text
detect accidental interpolation
do not excuse it as style
route to affected shot / motion generation
```

#### Found-footage imperfection control

Handheld framing and minor exposure variation match the active pack.

Expected:

```text
do not penalise intentional imperfection
still require readable action and coherent device language
```

#### Pack ignored

An anime-limited-animation production is rendered as generic photoreal live action.

Expected:

```text
detect pack-adherence failure
route to visual direction / reference generation
preserve explicit user and approved-story decisions
```

#### User override precedence

The pack defaults to 16:9 but the user explicitly requests 9:16.

Expected:

```text
honour explicit 9:16 instruction
do not report the override as a pack violation
```

#### Voice role and performance consistency

A voice-enabled pack defines narrator and protagonist roles; a later scene swaps them or materially
changes an approved voice identity/performance profile.

Expected:

```text
detect voice-role or voice-consistency mismatch
check intelligibility and timing where relevant
route to audio / voice selection
preserve unaffected picture
```

---

## 13. Pack-authoring scoring

`rubrics/pack-authoring.json` scores contract completeness, operational specificity, self-contained
packaging, showcase quality, generation-prompt quality, eval coverage, catalogue integration and
benchmark integration. Its hard gates are **necessity**, voice safety, provider boundary, project
boundary, and no fabricated evidence. Necessity decides between reuse, project instruction, and
create; a structurally valid pack that an existing pack plus an instruction would have covered fails.

### 13.1 `video-extension-pack-creator` cases

Creator cases identify the command under test so failures localise to authoring behaviour rather
than the whole skill.

```text
existing pack already fits
→ define-pack → reuse

existing pack + project-specific difference
→ define-pack → adapt / local instruction

genuinely distinct production grammar
→ define-pack → create

complete or partial production brief
→ derive-production-profile

intentional style trait vs real defect
→ define-evaluation-profile

voice-enabled / voice-free pack
→ define-voice-profile

self-contained runtime package
→ create-skill-package

behavioural coverage
→ create-evals

showcase quality
→ create-showcase

acceptance gate
→ validate-pack

catalogue + benchmark registration
→ create-catalogue-entry
```

`define-pack` is the production-need-first gate. A request for a new pack does not bypass catalogue
inspection.

`create-catalogue-entry` is post-validation registration. It must not register a pack before
`validate-pack` succeeds.

#### Existing-pack reuse control

Input asks for a production already covered by a catalogue pack.

Expected:

```text
identify the existing pack
recommend reuse
do not create a duplicate skill or catalogue entry
```

#### Existing-pack adaptation control

Input differs from an existing pack only by one project-specific constraint such as aspect ratio,
duration, or a local tone adjustment.

Expected:

```text
reuse/adapt the existing pack
represent the difference as project instruction where sufficient
do not create a near-duplicate pack
```

#### New-pack necessity

Input introduces a stable reusable production grammar not represented in the catalogue.

Expected:

```text
justify why existing packs are insufficient
select create
proceed to derive-production-profile
```

#### Complete brief

Input supplies format, genre, style, audience, production traits, and evaluation requirements.

Expected:

```text
coherent operational profile
hard constraints separated from defaults
only relevant voice/performance guidance
workflow + revision + evaluation effects
no unnecessary provider architecture
```

#### Style-only brief

Input: `Create a paper-cutout historical mystery pack.`

Expected:

```text
derive only missing fields needed for coherence
translate paper-cutout into materials / motion / camera / evaluation behaviour
avoid arbitrary provider architecture
```

#### Intentional-trait distinction

Input requests a claymation pack.

Expected:

```text
preserve deliberate stepped motion
reject accidental interpolation
preserve tactile variation
reject material / proportion drift
```

#### Voice-enabled profile

Input requires narrator and one character voice.

Expected:

```text
define roles and performance direction
keep provider references optional unless supplied/configured
do not invent provider IDs
do not imitate an identifiable actor
```

#### Adapt existing pack

Input changes audience and duration while preserving production identity.

Expected:

```text
update affected constraints only
preserve unrelated pack identity
update showcase / evals only where necessary
```

#### Showcase authority

Expected:

```text
canonical showcase lives under extension-packs/<pack>/README.md
contains exact fenced ## Prompt
prompt exercises pack-specific behaviour and failure modes
no fabricated production results/provenance/costs/scores
```

#### Validation-before-catalogue

Input supplies a package with a showcase but missing eval or benchmark coverage.

Expected:

```text
validate-pack FAIL
create-catalogue-entry does not register it
report missing acceptance requirement
```

This is the `validate-pack` command contract, which covers behavioural eval coverage and benchmark
readiness. The structural `scripts/validate-pack.ts` checks file presence only, and passing it is
not passing this case.

#### Anti-over-engineering control

Input requests one coherent new pack.

Expected:

```text
no pack inheritance framework
no composition engine
no central ontology
no provider-specific fork without demonstrated requirement
```

### 13.2 Catalogue quality sweep

Every catalogue pack must have structural and behavioural coverage.

The full catalogue sweep checks:

```text
skill installs independently
required pack fields exist
production profile is operational
evaluation has preserve / tolerate / reject semantics where relevant
showcase example exists
generation prompt is fenced and non-empty
prompt names the correct pack
behavioural evals exist
no forbidden creator-name-only definition
```

Provider-backed generation for all catalogue packs is not required on every commit. A release
candidate should exercise at least the representative six-pack suite from §3.3. The remaining
packs rotate through scheduled or catalogue-specific runs so every pack eventually accumulates
real output evidence.

---

## 14. Semantic judging protocol

Semantic review is evidence, not an oracle.

- Generation and review are separate invocations or separate models; a generator's self-assessment
  is never the only quality evidence.
- The runner-collected diagnostic tier asks open first, then closed, and scores the two separately
  (§8.5). Ask open-ended first; use the checklist to organise what was found, not to find it.
- A host-agent result carries its execution identity — repository revision, host agent, provider,
  model, settings, pack revision, input and output hashes, budget, reviewer — so a verdict can be
  audited and repeated.
- Blinded pairwise A/B comparison (same case, same fingerprint, both orders, both outputs kept) is
  supplementary and never overrides a hard gate. It is not implemented; nothing yet exists to compare.

---

## 15. Fingerprints and staleness

A case fingerprint is the sha256 of the canonical case definition, the resolved prompt text, the
rubric, and — when `execution.bindContracts` is true — each named command contract. `--list` prints
it; `--prepare` embeds it; a result must carry it to be `BOUND`.

```text
result fingerprint == case fingerprint   BOUND    scored, comparable, may enter a baseline
result carries no fingerprint            UNBOUND  scored, flagged, never comparable
result fingerprint != case fingerprint   STALE    refused, exit 1
```

Transcript staleness for the runner-collected vision cases is a separate, older key — model, image
descriptor, open and closed prompt digests — deliberately unchanged so historical transcripts still
score. Both mechanisms follow the same rule: evidence recorded against a different question is
refused, not reused.

---

## 16. Evidence retention

Every runner-collected answer is committed under `tests/fixtures/defects/transcripts/`. Host-agent
results are files a contributor keeps and scores; a baseline entry records the verdict, the observed
rates and the fingerprint, never the media. The scorer fixtures under `benchmarks/fixtures/` are not
evidence and carry no fingerprint so a rubric edit cannot break `npm test`.

---

## 17. Re-scoring

Changing the scorer costs nothing to re-measure: `--rescore` for transcripts, `--score` for recorded
results. Neither touches a provider. See §8.5.

---

## 18. Baselines, regressions and flakes

Verdicts are majorities across repeats; ties fail. `REGRESSION` is a case that passed the baseline
and now fails every repeat; `FLAKY` passed some; `NEW FAILURE` never had a baseline; `NOT RUN` was
not executed; `STALE` was recorded against a different question. A baseline is written only by an
explicit `--update-baseline`, never by a passing run, and the results baseline only from `BOUND`
results with at least three repeats. New surfaces stay `UNMEASURED` until then. See §8.5.

---

## 19. Release tiers

```text
core       diagnostic + production + command/skill conformance touched by the change
catalogue  every packs case + pack-authoring
```

Definition coverage is complete on every commit; paid execution is not. A targeted pack case may run
during development; a release claiming catalogue support runs the complete pack suite.

### 19.1 Release quality gate

A release candidate is acceptable when:

```text
✓ required deterministic layers pass
✓ install smoke tests pass
✓ no required check is BLOCKED but reported as PASS
✓ no known severe technical or governance regression remains
✓ changed extension packs have behavioural coverage
✓ changed pack-creator behaviour has a regression case
✓ semantic evidence is current for capabilities whose judgement contract changed
```

Semantic or generation evidence that has not yet been collected is `NOT RUN`, not zero and not
pass.

Command coverage is part of the release evidence:

```text
✓ every declared initial command contract validates
✓ every initial command has targeted eval coverage
✓ refine and diagnose pass routing/scope controls
✓ no command is reported PASS when its required semantic/provider evidence is NOT RUN
```

Do not collapse this gate into one quality percentage. The release report should show results by
capability and defect class.

---

## 20. CI

Normal CI runs only free, deterministic work plus re-scoring of already recorded evidence:

```text
typecheck · repository validation · unit tests · command coverage validation · stage tests
structural skill evals · benchmark-definition validation · deterministic benchmark
transcript and result staleness · skill install smoke · example/showcase coverage validation
```

CI fails when a deterministic check fails, the manifest is invalid, a command lacks required
coverage, a prompt source cannot be resolved, a showcase has no case, a case references a removed
example or pack, or required recorded evidence is stale. It never fails because an optional paid
benchmark was not requested; those cases report `NOT RUN`.

---

## 21. Adding coverage

When a defect reaches a deliverable, it becomes a fixture. The sequence:

1. **Name the class.** Every finding is technical, creative, continuity or generation/model.
2. **Add a fixture.** Synthesise it in `tests/fixtures/make-fixtures.ts` where the defect can be
   expressed in synthetic media; otherwise point at a real artifact read-only and skip loudly if
   it is absent.
3. **Add a stage test** in `tests/stages/` asserting both directions — the defect is caught, and
   a clean fixture is not flagged. A detector with no negative case is a detector that fires on
   everything.
4. **Add or update the owning command contract** when the defect exposes missing or incorrect
   command behaviour. Route it to the smallest command that owns it, not to the whole skill.
5. **Add a benchmark case** under `benchmarks/cases/<suite>/<id>.json` naming its skills,
   commands, rubric, execution and — for a diagnostic case — its `expectedRouting`. A production
   example needs no hand-written prompt: point `promptSource` at its README.
6. **Add a command-targeted eval case** in the relevant `skills/*/evals/evals.json`, with
   `command`, `expect` and `forbid`.
7. **Wire an executable `check`** into `CHECKS` in `tools/run-evals.ts` so the case is
   falsifiable. A case with no check is reported as manual and lowers coverage — which is the
   honest outcome, not a failure.
8. **Re-run `npm test`.** `npm run validate` fails until the case and the eval both exist.

A semantic benchmark case needs one extra step: collect its answers once
(`RUN_SEMANTIC_BENCHMARK=1 node tools/run-benchmark.ts --repeat 3`) and commit the transcript
alongside the case. Until it has one, the case reports as skipped rather than passing.

Changing an existing case is the same work in reverse: the edit invalidates its transcripts, the
run refuses to score them, and the case must be re-collected before it counts again. That
friction is deliberate. Rewording a case until the reviewer passes it is the failure mode this
whole layer exists to prevent, and it should cost something.

This gives `CONTRIBUTING.md`'s question *"How is the change evaluated?"* a concrete answer.


---

## 22. Known blind spots

Recorded rather than hidden; no infrastructure is added to make them disappear on paper.

- Semantic reviewer subjectivity and reviewer or model drift; the tier is not deterministic even at
  `temperature: 0`, which is why verdicts are majorities.
- Visual-style judgement variance across reviewers and across packs.
- Motion judged from sampled evidence: stills cannot show a temporal seam.
- Audio quality judgement is limited to sync, balance and intelligibility.
- Precision penalises additional findings that may be true (§23.1).
- Provider and model generation drift makes results comparable only within one fingerprint and one
  recorded execution identity.
- Catalogue-scale discrimination between similar packs is untested.
- Cross-model comparability, long-video scaling, and host-agent variance are unmeasured.
- Full catalogue generation is expensive; definition coverage does not imply execution coverage.
- Transcript image identity is a path descriptor, not a content hash (§5.1).

---

## 23. Measured results

### 23.1 Historical measured evidence (2026-08-24)

> Kept verbatim from v1 of this document. Section references inside it were updated; nothing else
> was. These numbers measure unprompted recall, checklist detection and checklist precision on the
> runner-collected diagnostic cases and nothing else.

The two capability surfaces §3.3–3.4 introduce have no measurement at all:

```text
extension-pack generation baseline: UNMEASURED
pack-creator behavioural baseline: UNMEASURED
```

Do not infer scores for them from the detection results below.

Recorded 2026-08-24, `google/gemini-3-pro`, three repeats per case, 48 paid calls. Reported as
measured: the criteria were not reworded and the scorer was not loosened after seeing these
numbers. Every answer behind them is committed under `tests/fixtures/defects/transcripts/` and
re-derivable for free with `node tools/run-benchmark.ts --rescore`.

| Tier | Score |
|---|---|
| deterministic | **13/13**, no false positives on clean controls |
| semantic — open, unprompted recall | **8/8** (24 of 24 samples) |
| semantic — closed, detection (the right criterion failed) | **5/7** |
| semantic — closed, precision (nothing else failed) | **5/6** |
| semantic — closed, strict (both) | **5/8** |

Detection has seven cases rather than eight because the clean control has no criterion to
detect. Precision has six because it is only scored where detection succeeded — crediting a
case that found nothing with having been precise about it would flatter the denominator.

### The checklist still makes the reviewer worse

This was the headline of the previous run, and repeating each case three times has confirmed it
rather than softened it. Asked simply *"describe any problems"*, the reviewer named every seeded
defect in every repeat. Handed the same image and the documented criteria, it contradicts
itself, and it does so consistently.

On the frame whose subject is posed standing still, the open pass says:

> "The woman in the teal coat is not walking. While the man in the rust jacket is clearly in
> mid-stride, the woman is standing completely still. Both of her feet are planted flat on the
> ground... her static pose fails to meet the prompt's requirements."

and the closed pass marks `subject-posed-for-action` as **PASS** — in all three repeats. This is
not sampling noise. It is what the checklist does to the reviewer.

**Consequence for the workflow, unchanged:** ask open-ended first, and treat the criteria walk
as a way of organising what was found rather than a way of finding it.

### What 8/8 recall does not establish

Recall measures whether the reviewer **notices**. It says nothing about whether it then names
the right owning artifact — and that is the answer that decides whether you regenerate one
reference frame or fifteen shots.

Nothing here measures that. Every diagnostic case (then in `tests/fixtures/defects/taxonomy.json`, now under
`benchmarks/cases/diagnostic/`) carries
`owningArtifact` and `correctiveAction` alongside `criterion`:

```json
"criterion": "subject-posed-for-action",
"owningArtifact": "reference_frame",
"correctiveAction": "revise-reference"
```

`criterion` is scored. The other two are recorded and never read. The ground truth for routing
was written into the fixtures and then ignored by the scorer.

That gap matters because routing, not detection, is what this benchmark was built in response
to. On the production it draws its real artifacts from, the reversed screen direction on SH01
**was** noticed. It was diagnosed as a prompt failure and the shot was re-run fifteen times; the
cause was upstream, in an approved reference frame. §8.7 already warns about it —
*"Taking them out of order is how a reference-frame failure gets misdiagnosed as a prompt
failure and retried fifteen times"* — and no layer tests whether that warning is heeded.

So read the semantic scores narrowly: **the reviewer sees what is in front of it, reliably.
Whether it can say what to change is unmeasured.** Until it is, treat the corrective action in
an `evaluation_report` as a suggestion to a human, not a decision. The retry limit in
`skills/video-production/SKILL.md` bounds the cost of getting it wrong; it does not make it right.

### Per case

| Case | open | detect | precise | Reading |
|---|---|---|---|---|
| `semantic-control-clean-scene` | 3/3 | — | 3/3 | control held; no defect manufactured |
| `semantic-control-extra-pillar` | 3/3 | **0/3** | — | open names "two grey columns instead of one"; closed returns `NA` for every criterion |
| `semantic-control-order-inverted` | 3/3 | 3/3 | 3/3 | clean pass on both axes |
| `continuity-pillar-real` | 3/3 | 3/3 | **0/3** | finds the pillar every time, and flags two further criteria alongside it |
| `creative-subject-static` | 3/3 | **0/3** | — | describes the defect in detail, then passes the criterion for it |
| `creative-storyboard-contradicts-references` | 3/3 | 3/3 | 2/3 | detected every time; one repeat added an extra flag — **FLAKY** |
| `creative-pseudo-text` | 3/3 | 3/3 | 3/3 | passes once the case states the rule correctly — see below |
| `creative-annotations-in-panel` | 3/3 | 3/3 | 3/3 | clean pass on both axes |

### Splitting the axes changed what three of the five old misses meant

The previous baseline recorded five closed misses and could not distinguish between them.
Scored on two axes, they turn out to be three different things:

- **two were the scorer, not the reviewer.** `continuity-pillar-real` and
  `creative-storyboard-contradicts-references` fail the *correct* criterion in every repeat.
  They were being recorded as though the reviewer had seen nothing.
- **one was the benchmark's own brief.** `creative-pseudo-text`, below.
- **two are real, and repetition confirms it.** `semantic-control-extra-pillar` and
  `creative-subject-static` fail detection 0/3. Consistent blindness, not a bad sample.

The strict figure moved 3/8 → 5/8, but **the two runs are not comparable**: the scorer changed
and one case's brief changed between them. The superseded table is kept below for the record,
not for arithmetic.

| Superseded — single run, old scorer | Score |
|---|---|
| semantic — open | 8/8 |
| semantic — closed (combined) | 3/8 |

### The pseudo-text case was the benchmark's fault, and is fixed

The previous run recorded this as *"a contradiction in our own criteria"*: the reviewer argued
the frame **satisfies** its stated visual direction, which bans readable text.

On re-reading, the criteria never contradicted each other — the *case* misquoted them.
`references/reference-frames.md` already said illegible text is not a safe substitute for
readable text. Text in frame has two acceptable states, chosen per scene: readable and
plausible, or genuinely defocused, abstract or out of frame. Garbled pseudo-lettering is
neither. The case's context line said only *"its visual direction forbids readable signage
text"*, which invited exactly the answer it got.

Given the rule as it actually stands, the reviewer applies it precisely:

> "the vertical sign under the coffee cup icon and the text on the menu board resolve into
> distinct, unreadable glyph shapes. Because they form fake letters rather than being completely
> defocused or forming actual words, this violates the requirement."

3/3 on both axes. The reviewer was never wrong here; the question was. Recorded as a correction
rather than deleted, because "the benchmark was mis-briefed" is a failure mode worth being able
to recognise a second time.

### Known blind spots

| Case | Outcome | Reading |
|---|---|---|
| `semantic-control-extra-pillar` | detection 0/3 | every criterion returns `NA` on a schematic image; the checklist does not transfer to abstract artifacts |
| `creative-subject-static` | detection 0/3 | the criterion is marked PASS while the open pass describes the defect in detail |
| `continuity-pillar-real` | precision 0/3 | see the caveat below — the extra flags may well be correct |

**A caveat against our own precision figure.** On `continuity-pillar-real` the reviewer also
failed `text-legibility`, which is counted as imprecision. It is almost certainly *right*: the
same production's signage is the subject of `creative-pseudo-text`, which the reviewer passes
3/3. The precision axis penalises correct findings whenever a case declares only one expected
criterion. That is a limitation of single-criterion case specs, not reviewer noise, and it is
recorded rather than corrected here — changing the scorer twice in one pass, the second time
after seeing the numbers, is how a benchmark stops meaning anything.

### Variance

One case of eight was unstable across three repeats
(`creative-storyboard-contradicts-references`, precision 2/3). Everything else scored 0/3 or
3/3. The tier is more stable than the two earlier single runs suggested — those disagreed 4/8
against 3/8 largely because a single sample of a flaky case decided a strict boolean.

This is why a verdict is a majority and a partial failure is `FLAKY` rather than a regression.
A gate that fires on one flipped sample gets ignored, and an ignored gate is worse than none.

### Cost

48 paid calls, in two attempts. The first died two cases in, when a prediction outran the
`Prefer: wait` window and the runner treated a non-terminal status as fatal — since fixed with
polling. The 12 calls already collected were served from the cache on the retry rather than
paid for again, which is the whole argument for keeping the transcripts.

### Next candidate change, deliberately not made yet

The closed pass sends bare criterion names — `text-legibility`, `subject-posed-for-action` —
with no definitions. The reviewer answered `NA` to every one on the schematic control, which
suggests it did not know what they meant. Defining them is likely an improvement.

It is not bundled here. Changing the scorer and the prompt in the same run would leave no way to
attribute the movement to either. It is the next change, measured on its own, and the committed
transcripts make the before-and-after comparison free.


### 23.2 Current deterministic coverage

The deterministic tier scores every fixture-backed diagnostic case through its owning checker on
every `npm test`; `node tools/run-benchmark.ts` prints the tally. The validator proves definition
coverage: every advertised example has a production case, the showcase gate is armed at zero, and
every command has normal-side and boundary eval cases or a recorded exemption. Run
`node tools/validate-benchmark.ts` for the current table.

### 23.3 Benchmark coverage definitions

Cases exist, with prompts, rubrics, hard gates and fingerprints, for: routing, scope preservation and
orchestration (diagnostic, host-collected); every advertised production example; and the
pack-authoring scenarios of §13. `npm run benchmark:list` derives the counts.

### 23.4 Unmeasured semantic capabilities

```text
routing · correction scope · preservation · evidence · boundary
command correctness (semantic) · skill orchestration
production video quality · extension-pack fidelity · pack-authoring quality
```

All `UNMEASURED`. No score is inferred for them from the historical detection results above.

---

## 24. Prior art

The evaluation vocabulary here draws on existing work, recorded so the borrowing is visible:

| Source | Borrowed |
|---|---|
| `doubao-seedance-video` | shot review checklist (physics, repeated action, identity and prop drift, unexpected jumps, pacing); **recommended usable range**; the dense frame pack → disposable visual-QA reviewer → keep/trim/regenerate architecture |
| `cinematic-director` | ordered failure diagnosis; the four-way technical / creative / continuity / generation-model split instead of one quality score; continuity anchors, which became the scene manifest |
| `framedex` | objective technical grading vocabulary for per-shot assessment |
| `claude-video/watch` | frame-extraction substrate for getting video into an inspectable form |

`claude-video/watch` is **not adopted as a dependency**: `docs/03` §5 requires each skill to be
self-contained, and `sample-frames.ts` already covers extraction. It is recorded in
`docs/research-logs/2026-08-20-extraction-candidates.md` as a candidate substrate.


---

## 25. Related documents

- `docs/03` §13 *Eval Requirements*, §26 *Technical Acceptance Criteria* — packaging contracts.
- `docs/02` §30 *Failure Taxonomy* — the production-side failure classification this triage mirrors.
- `docs/research-logs/2026-08-23-missed-connection-postmortem.md` — the failure that produced these layers.
- `docs/05-video-customisation-packs-spec.md` — extension-pack contract and pack-aware evaluation.
- `docs/06-video-extension-pack-catalogue-spec.md` — catalogue, showcase examples, and representative pack set.
- `skills/video-extension-pack-creator/SKILL.md` — extension-pack authoring behaviour.

- `benchmarks/README.md` — the contributor runbook for the benchmark surface.

---

**Video Production Skills — Testing and Benchmark Specification v2 — 29 August 2026**
*(v1, 2026-08-24, predates the `benchmarks/` surface and is preserved in git history.)*
