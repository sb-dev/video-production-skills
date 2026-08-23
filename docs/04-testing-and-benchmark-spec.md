# Video Production Skills — Testing and Benchmark Specification

## 1. Purpose

This specification defines how Video Production Skills is tested, and serves as the runbook for
running those tests.

It exists because of a specific failure. `examples/level-2-missed-connection` was produced,
self-declared **ACCEPT / QC PASS**, and shipped — carrying visible generation seams, a pillar
present in one approved reference frame and no other shot, and creative direction nobody had
approved. Every defect was reachable by a cheap check. None of those checks existed, and the
only way to discover any of them was to pay for a full production first.

The governing principle:

> **No defect class should require a full production run to discover.**

This document complements `docs/03` §13 *Eval Requirements* and §26 *Technical Acceptance
Criteria*; it does not restate them.

---

## 2. Testing layers

| Layer | Question it answers | Provider | Command |
|---|---|---|---|
| typecheck / validate | Is the repository well formed? | no | `npm run typecheck`, `npm run validate` |
| unit | Do scripts reject bad input before doing work? | no | `npm run test:unit` |
| stage | Does each workflow stage behave correctly in isolation? | no | `npm run test:stages` |
| evals | Do the skills' declared behaviours actually hold? | no (structural), opt-in (behavioural) | `npm run test:evals` |
| benchmark — deterministic | Are declared defects detected, and clean artifacts left alone? | no | *Pass 2* |
| benchmark — semantic | Does judgement catch defects only visible in the image? | opt-in | *Pass 2* |

The benchmark rows are specified here and not yet built. They are listed so the gap is visible
rather than implied.

### 2.1 What each layer cannot do

Stating the limits matters more than stating the coverage, because every shipped defect passed
a layer that was never able to see it.

- **typecheck / validate** say nothing about behaviour. A script can be perfectly typed and wrong.
- **unit** tests here assert argument rejection. They do not exercise a single frame of media.
- **stage** tests exercise real behaviour on synthetic fixtures. They cannot judge whether a
  photograph matches its brief.
- **evals** are prose unless a case names an executable `check`. Coverage is reported so an
  unfalsifiable suite cannot look green.
- **benchmark, deterministic** checks *declarations*. It catches a landmark nobody declared; it
  cannot see a landmark that is in the picture but absent from the declaration.
- **benchmark, semantic** is the only layer that judges an image against its declaration, and
  it is the only layer that costs money.

### 2.2 Standing rules

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

---

## 3. Runbook

### 3.1 Prerequisites

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

### 3.2 Run everything

```bash
npm test
```

Runs typecheck → validate → unit → stages → evals → smoke. Exit 0 is the only pass.

### 3.3 Run one layer or one stage

```bash
npm run test:stages
node --test tests/stages/continuity.test.ts
node --test tests/stages/motion-artifacts.test.ts
```

Stage files map one-to-one onto workflow stages: `preflight`, `media-qc`, `motion-artifacts`,
`sampling`, `timeline`, `contact-sheet`, `storyboard`, `continuity`, `production-lint`.

### 3.4 Check a real artifact

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

### 3.5 Triage

| Symptom | Owning layer | Likely cause | Action |
|---|---|---|---|
| `validate` fails on JSON | repository | stray or malformed file in the tree | fix or remove the file |
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

When several causes are plausible, work the ordered diagnosis in
`skills/video-evaluate/SKILL.md` rather than the first that fits. Taking them out of order is
how a reference-frame failure gets misdiagnosed as a prompt failure and retried fifteen times.

---

## 4. Adding coverage

When a defect reaches a deliverable, it becomes a fixture. The sequence:

1. **Name the class.** Every finding is technical, creative, continuity or generation/model.
2. **Add a fixture.** Synthesise it in `tests/fixtures/make-fixtures.ts` where the defect can be
   expressed in synthetic media; otherwise point at a real artifact read-only and skip loudly if
   it is absent.
3. **Add a stage test** in `tests/stages/` asserting both directions — the defect is caught, and
   a clean fixture is not flagged. A detector with no negative case is a detector that fires on
   everything.
4. **Add an eval case** in the relevant `skills/*/evals/evals.json`, with `expect` and `forbid`.
5. **Wire an executable `check`** into `CHECKS` in `tools/run-evals.ts` so the case is
   falsifiable. A case with no check is reported as manual and lowers coverage — which is the
   honest outcome, not a failure.
6. **Re-run `npm test`.**

This gives `CONTRIBUTING.md`'s question *"How is the change evaluated?"* a concrete answer.

---

## 5. Prior art

The evaluation vocabulary here draws on existing work, recorded so the borrowing is visible:

| Source | Borrowed |
|---|---|
| `doubao-seedance-video` | shot review checklist (physics, repeated action, identity and prop drift, unexpected jumps, pacing); **recommended usable range**; the dense frame pack → disposable visual-QA reviewer → keep/trim/regenerate architecture |
| `cinematic-director` | ordered failure diagnosis; the four-way technical / creative / continuity / generation-model split instead of one quality score; continuity anchors, which became the scene manifest |
| `framedex` | objective technical grading vocabulary for per-shot assessment |
| `claude-video/watch` | frame-extraction substrate for getting video into an inspectable form |

`claude-video/watch` is **not adopted as a dependency**: `docs/03` §5 requires each skill to be
self-contained, and `sample-frames.ts` already covers extraction. It is recorded in
`docs/2026-08-20-extraction-candidates.md` as a candidate substrate.

---

## 6. Related documents

- `docs/03` §13 *Eval Requirements*, §26 *Technical Acceptance Criteria* — packaging contracts.
- `docs/02` §30 *Failure Taxonomy* — the production-side failure classification this triage mirrors.
- `docs/2026-08-23-missed-connection-postmortem.md` — the failure that produced these layers.
