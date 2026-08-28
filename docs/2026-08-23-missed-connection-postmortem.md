# Post-mortem — "Missed Connection"

**Date:** 2026-08-23
**Subject:** `examples/level-2-missed-connection`
**Outcome:** an expensive, unusable video that passed every gate the system had.

## Summary

An agent produced a 12.9 s three-shot sequence, self-declared it **ACCEPT / QC PASS**, and
shipped it. On viewing it showed temporal resets, foot sliding, turntable rotation,
background morphing, warping architecture and shifting pseudo-text — and carried creative
direction nobody had agreed to.

Cost: **54 predictions, 40 succeeded, 14 failed, ~60 minutes of provider compute.**

The failure is not one mistake. It is a chain in which each link was individually defensible
and the system had no place to stop it:

> no human approval gate → invented creative direction → reference frames that encode a
> diagram rather than a scene → a motion prototype reasoned away → a still-frame review method
> aliased against the artifact period → container-only QC → a story-only evaluation → shipped

Every root cause below now has a corrective action and, where it is machine-checkable, a test.

---

## A. No human approval gate — the primary cause

`docs/01` §13 and `docs/02` §5 defined approval with **no actor**:

> Approval means: downstream production may rely on this decision.

`SKILL.md` listed `open → selected → approved → locked` and never said who moves the state. An
agent could legitimately read `approved` as "I have decided this is good enough" — and did. The
visual direction, character identities, storyboard, shot plan and every reference frame were
marked `approved`, and picture was `locked`, without a single question being asked.

Meanwhile the public README promised the workflow would *"plan cheaply, approve creative
decisions, preserve continuity…"*, which a reader takes to mean the human approves.

**Everything invented unreviewed:** the characters' ages, ethnicities, wardrobe and names; a
Victorian European terminus; the palette and the rust/teal colour device; the observational
register; every model choice; and **the phone**.

That last one is the clearest evidence that this mattered. A blind comprehension test returned:

> "a missed connection caused by the distraction of technology"

An unasked prop choice redefined what the film was about. The brief never mentioned technology.

**Corrective action.** Approval is now a human act in both specs, in
`skills/video-production/SKILL.md` (*Creative approval*), and in the README (*Approval and cost
control*). `approvedBy` is part of the artifact metadata. `tools/validate-production.ts` reports
any artifact marked `approved` or `locked` with no approver recorded — it finds six in this
example, including the picture lock.

**Test.** `tests/stages/production-lint.test.ts`, eval
`video-production/boundary-self-approved-direction`.

## B. Asking was missing from the cost ladder

The core principle is "use the least expensive representation that can resolve the current
production uncertainty", but every rung of the ladder — visual direction, storyboard, animatic,
reference frame — is a *generated artifact*. A question costs nothing and resolves creative
uncertainty better than any of them.

**Corrective action.** Both specs now define a resolution order: ask first, generate only when
asking cannot settle it. `SKILL.md` gains *Ask before inventing*, with the phone as the worked
counter-example.

## C. No stop rule on retries or spend

The retry section classified failures but never said when to stop. SH01 took **15 generation
attempts** across three reference frames and three models; SH02 absorbed **8 content-filter
refusals**. Neither the trouble nor the spend was ever surfaced.

**Corrective action.** `SKILL.md` gains *Retry and spend ceiling*: agree an attempt ceiling and
a budget; stop and consult when either is reached. Repeated retries at one layer are evidence
that the owning decision is wrong.

**Test.** Eval `video-production/boundary-retry-ceiling`.

## D. Reference frames encoded a diagram, and authored the bug that was chased

In **both** approved reference frames the female lead is **standing still** — feet flat, weight
centred, chin up — while the male lead is in clear mid-stride. The opposing screen vectors the
entire film depends on were half-absent from the source image.

Every generation then produced a woman standing and watching. That was diagnosed as a *prompt*
failure. A landmark-anchored-direction workaround was invented, 15 attempts were spent on it,
and a memory note was saved blaming prompt phrasing. The cause was the approved frame.

Both frames also place two figures in matched lateral profile, symmetrically, at equal scale,
across an implausibly empty polished floor during a supposed rush hour — a blocking chart
rendered photoreally, which is why the result reads as stock. Also present and accepted:
pseudo-text on every board, a garbled clock, and flat cold light that contradicts the approved
"warm at human height" direction. The two approved frames even disagree with each other: SH01
mounts the departure board on the central column, SH02 hangs it free with a *different* column
at frame right — never re-checked after SH01's frame was replaced twice.

The worst line in the original record rationalised an artifact as a feature: an illegible clock
was called *"safer than a legible one"* for continuity.

**Corrective action.** `references/reference-frames.md` now states that a reference frame is a
photograph of a moment, not a blocking diagram; that every subject which must move is posed
mid-motion; that diagram compositions and empty ground are to be avoided; and that illegible
text is an artifact, not a safeguard.

**Test.** Eval `video-evaluate/boundary-static-subject-reference` — a static subject is
diagnosed as `revise-reference` and explicitly **forbids** blaming the prompt.

## E. No environment reference as its own artifact

The station was whatever the first SH01 candidate produced, promoted to "environment lock". The
most-reused asset in the production was never designed or compared, and its defects — garbled
signage, unreadable clock — propagated into every downstream frame.

The concrete symptom, which Samir found on inspection: `SH01-establish-v2.jpg` mounts the
departure board on the central column; `SH02-crossing.jpg` hangs it free with a **different**
column at the right edge. A pillar from nowhere, in two frames marked approved. The kiosk also
appears in SH01 and SH03 but not SH02, with no camera move to explain it.

The structural cause is in the spec. `docs/02` §6 listed `character_sheet`,
`character_manifest` and `product_manifest` — and no environment artifact at all. Both
`continuity.md` files listed "environment" as a dimension to evaluate, so environment continuity
was being judged against something nothing had ever declared.

**Corrective action.** `references/reference-frames.md` gains *The environment is its own
artifact*: design and select it before shot frames derive from it.

`scene_sheet`, `scene_manifest` and `object_sheet` are now first-class artifacts in `docs/02`
§6–§7. The scene manifest declares landmarks, what they are attached to, their order along the
location's axis, which side the camera works from, and which landmarks each shot contains.

`skills/video-evaluate/scripts/validate-continuity.ts` checks it deterministically — no images,
no provider. Run against a manifest reconstructed from the frames that shipped, it reports the
pillar, the board and the kiosk:

```text
unknown-landmark: SH02          "column-foreground" is not declared in the scene
attachment-contradiction: SH02  "board" attached to nothing here but to column in SH01
landmark-discontinuity: SH02    "kiosk" present either side of this shot but absent here
```

**Test.** `tests/stages/continuity.test.ts` holds that manifest as a regression fixture, plus a
case per finding type and a clean manifest that must produce none. Evals
`video-evaluate/boundary-undeclared-landmark` and `boundary-attachment-contradiction`.

## F. Character references were catalogue images, and the colour device fought the register

Four views on grey seamless under flat even light is a clothing-catalogue aesthetic.
Conditioning an "observational documentary" on it pushes every downstream frame toward stock
cleanliness.

The rust/teal "protected colour" device compounded it: complementary colour-blocking against a
desaturated crowd is an advertising technique, directly at odds with the declared register — and
it manufactured its own constraint, since a background teal coat then became a "disqualifying"
defect to be fought.

## G. The storyboard was decorative and contradicted its own parents

`sb-01` shows a man in a pale suit and a woman in a **cloche hat**, 1940s styling, no rust, no
teal, no satchel, no cup — contradicting the character sheet written *before* it. It carries
legible "COFFEE" text the visual direction banned, and annotation arrows drawn inside the frame
so composition cannot be judged.

`storyboard.md` declared the markdown authoritative and the images "illustrative" — so money
was spent on artifacts pre-declared as governing nothing. `review.md` records the contradiction
(*"Nora wears no hat, contrary to SB-01's sketch"*) and marks the stage **APPROVED** anyway.

### The form was wrong too

Shown a reference storyboard — a 3×3 grid of small numbered graphite panels, clean frames, no
text, varied shot scale — the artifact produced here is wrong in every formal respect:

| Reference | Produced |
|---|---|
| One composed sheet, numbered panels, 3 columns | Three separate full-bleed 16:9 images, unnumbered |
| Uniform monochrome sketch, low fidelity | Dense rendered illustrations |
| Clean panels | Bold arrows and dashed sight-lines drawn inside the frames |
| No text in panels | Legible "COFFEE" and "DEPARTURE" |
| Deliberate shot-scale variety incl. inserts | Three similar wide/medium shots |
| More panels than shots — a board explores beats | Exactly one panel per final shot |

The last row is the substantive one. Three panels for a three-shot sequence meant the board
could not test sequence, rhythm or coverage at all; it only illustrated decisions already taken.

The skill is why. The guidance said what a board must *do* and nothing about what a board **is**,
and no tool produced the form — so whatever the image model returned became "the storyboard".

**Corrective action.** `references/storyboard-and-shot-planning.md` now requires boards to
inherit approved references, forbids rendering a board already declared non-authoritative,
keeps annotations outside the frame, and states that board approval is not motion validation.

It also now specifies **form**: one sheet of small numbered keylined sketch panels on a paper
background; many cheap low-fidelity panels rather than a few polished ones; more panels than the
sequence has shots; an identical style clause across panels; panels generated individually so
they stay independently addressable, then composed deterministically.

`skills/video-production/scripts/make-storyboard.ts` produces that form by default — numbered
panels, black keyline, white sheet, three columns — so an agent gets a board right without
knowing which flags to pass. Layout, numbering and framing are deterministic work; an image
model is not asked to lay out a grid, because a generated grid cannot be re-ordered, re-numbered
or have a single panel replaced.

**Test.** `tests/stages/storyboard.test.ts` asserts the composed command carries the grid,
numbering, keyline and background, and does so without ImageMagick via `--print-command`; the
real composition test skips loudly when ImageMagick is absent. Eval
`video-production/normal-storyboard-form` forbids one panel per final shot and annotations
inside panels.

## H. The one stage that would have caught this was reasoned away

`brief.md` records the justification:

> *Motion prototype* — motion in all three shots is pedestrian walking and one head turn. No
> material motion uncertainty to buy down.

Motion was the dominant failure mode of the entire production. The repo's own `.gitignore`
contains a `prototype/` entry — it is an expected stage. A 480p prototype would have exposed the
seams, the sliding and the standing-not-walking for a few dollars, before 54 predictions.

**Corrective action.** `SKILL.md` *Motion prototype* is now required whenever any subject must
translate, turn or change gait, or a shot depends on screen direction, and states explicitly
that "it is only walking" is not grounds to skip.

## I. Plans were rewritten to match output

The six-landmark geography ledger was "corrected" post-hoc when generated frames disagreed.
`shot-plan.md` still specifies SH01 as a **28–35 mm high wide from the mezzanine with a slow
push-in, 5.0 s**; what shipped is a **chest-height ~50 mm locked-off medium-wide, 4.0 s**.

The artifacts that carry approved decisions describe a different film from the one delivered.

**Corrective action.** `SKILL.md` gains *Plan reconciliation*: update the owning artifact or
record an explicit reopening, never silently adjust a plan to match output.
`tools/validate-production.ts` compares timeline render settings and duration against the
delivered master. `references/storyboard-and-shot-planning.md` asks for machine-checkable
duration and framing so plan-versus-delivery can be compared at all.

**Test.** `tests/stages/production-lint.test.ts` — *a master that no longer matches its
timeline is a finding*.

## J. Evaluation measured story only

Frame-difference analysis (`tblend=difference` → `signalstats` YAVG per frame) of the shipped
shots:

| Take | Model | Isolated spikes >30% above neighbours |
|---|---|---|
| `SH03.mp4` **(shipped at full length)** | seedance-2.0 | frames 19, 39, 58, 79, 98 — t = 0.83 / 1.67 / 2.46 / 3.33 / 4.12 s, **49–63% above** |
| `sh01-t5` (rejected) | seedance-2.0 | frames 20, 43, 63, 82, 101 — same ~19.7-frame period |
| `SH02` (shipped) | kling-v3 | none |
| `sh01-k5` (shipped) | kling-v3 | frame 1 only (first-frame conditioning, benign) |

Seedance-2.0 emitted latent-chunk seams every **~19–20 frames (~0.83 s)**; Kling did not. In
master time the SH03 seams land at **8.83 s and 9.67 s** — precisely the "0:09 reset" reported
on viewing. SH03 is 5.04 s of 12.92 s: **39% of the runtime came from the only seam-producing
model, used at full length.**

Why it was invisible:

- **Aliasing.** Contact sheets were sampled every **10 frames** against a **~19.7-frame** period.
- **Stills cannot show a temporal seam** at any sampling rate.
- **The blind test asked one question.** Three runs asked *"what is this about?"* and never
  *"does this look like real footage?"*
- **No gate existed.** `media-qc.md` listed container, duration, resolution, frame rate and
  audio presence — nothing temporal. `artifact-readiness.md` resolved "technically usable" back
  to that same list. `sample-frames.ts` defaults to six frames.

Also retracted: the original report claimed no-dialogue was "verified two ways". A transcriber
returning nothing is weak evidence, not proof.

**Corrective action.** `skills/video-evaluate/scripts/detect-motion-artifacts.ts` reports median
delta, isolated spikes, **periodicity**, frozen runs and drift, and exits non-zero as a gate.
`media-qc.md` gains *Temporal and motion checks* and *Sampling adequacy*.
`artifact-readiness.md` gains a motion-plausibility gate for video shots. Both SKILL files route
to it.

**Test.** `tests/stages/motion-artifacts.test.ts`, `tests/stages/sampling.test.ts`, evals
`video-evaluate/boundary-periodic-seams` and `boundary-frozen-frames`.

Run against the shipped artifacts, the new gate reproduces the defect independently:

```
SH03.mp4              exit 1   periodic seams every 19.75 frames (0.823s), confidence 1
SH02-conformed.mp4    exit 0   clean
SH01-v3-conformed.mp4 exit 0   clean
master                exit 1   artifacts
```

## K. A declared dependency was missing and silently worked around

`video-production` frontmatter declares ImageMagick required. It was **not installed**, so
`make-contact-sheet.ts` — the skill's only review-artifact tool — was unusable. Ad-hoc ffmpeg
tiling was substituted and never reported. `smoke:scripts` runs only `--help`, which passes
without ImageMagick, so CI could not detect it.

This is the head of the chain that produced J:

> missing declared tool → ad-hoc review tooling → arbitrary sampling density → aliased against
> the seam period → defects invisible → shipped

**Corrective action.** `skills/video-evaluate/scripts/preflight.ts` probes declared dependencies
and names the scripts each missing one disables. `video-evaluate/SKILL.md` requires running it
first.

**Test.** `tests/stages/preflight.test.ts`, and `tests/stages/contact-sheet.test.ts` which skips
**loudly** with a stated reason when ImageMagick is absent rather than passing quietly.

## L. There were no behavioural tests anywhere

Before this work the suite consisted of argument-rejection tests and an installability check.
`smoke:scripts` ran `--help`. The `evals/*.json` files were declarative prose with **no runner** —
`validate-repo.ts` checked only that the required eval *classes* existed, never that a case
passed.

Behavioural coverage was zero, so a defect could only surface by producing a whole video.

**Corrective action.** See *Per-stage test harness* below.

## M. The repository's example contract was ignored (recorded, not fixed)

The house layout is `direction/ reference/ shots/ eval/ prototype/` with `SELECTED_*` naming;
the run invented `production/01-brief … 10-evaluation/`. Consequence: the `.gitignore` patterns
(`examples/*/shots/cand*.mp4`, `examples/*/reference/ref_*`) match nothing produced, so **210 MB
of rejected candidates would be committed** — the example is 301 MB against a 93 MB sibling.

Left open by decision. The example's media is not committed.

---

## Per-stage test harness

Every workflow stage is now exercisable on its own — offline, with no provider credentials, no
ImageMagick, and nothing large committed. Failure classes are synthesised with ffmpeg `lavfi`
by `tests/fixtures/make-fixtures.ts`, so they reproduce without a provider.

| Stage | Test | Covers |
|---|---|---|
| Environment preflight | `tests/stages/preflight.test.ts` | K |
| Media QC | `tests/stages/media-qc.test.ts` | container validity, audio requirements |
| Motion quality | `tests/stages/motion-artifacts.test.ts` | J — seams, frozen frames, drift |
| Review sampling | `tests/stages/sampling.test.ts` | J — the aliasing error, stated as arithmetic |
| Editorial assembly | `tests/stages/timeline.test.ts` | conform/letterbox trap, durations |
| Review artifacts | `tests/stages/contact-sheet.test.ts` | K — skips loudly, never silently |
| Artifact governance | `tests/stages/production-lint.test.ts` | A, I |
| Storyboard composition | `tests/stages/storyboard.test.ts` | G — board form |
| Spatial continuity | `tests/stages/continuity.test.ts` | E — the pillar, the board, the kiosk |
| Defect benchmark | `tests/stages/benchmark.test.ts` | all classes — see `docs/04` §5 for measured scores |

Fixtures: `clean`, `seams`, `frozen`, `drift`, `offsize`, `silent`, `withaudio`, `corrupt`. The
fixture directory is keyed on a hash of the generator, so editing a fixture definition
invalidates the cache — caching on filename alone serves a stale clip and the test then measures
the wrong thing.

`tools/run-evals.ts` executes the eval suites in two tiers: structural (well-formed, uniquely
identified) and behavioural (a case may name a `check` the runner executes). It reports coverage
explicitly, so a suite that is mostly unfalsifiable prose says so:

```
21 cases, 10 executable (48% behavioural coverage)
```

`npm test` now runs typecheck → validate → unit → **stages** → **evals** → smoke.

### Two detector bugs the harness caught immediately

Both were found within minutes of the fixtures existing, and neither was reachable by the
ad-hoc analysis that produced the original measurements:

1. **Encoder keyframes read as seams.** Keyframes decode microscopically differently from the
   frames they replace, producing a perfectly periodic bump on low-motion footage.
2. **Integer-pixel rounding reads as seams.** Smooth sub-pixel motion alternates the per-frame
   delta on a fixed cycle.

Both are sub-luma-level. An absolute floor (`--min-spike-diff`, default 1.0) separates them from
real seams, which are an order of magnitude larger. `tests/stages/motion-artifacts.test.ts`
asserts the floor is load-bearing by showing the same clean clip reads as periodic without it.

## What remains open

- Of the example's media, only the seven stills the defect benchmark scores against are retained
  under `production/`; the rest of the run — including the defective takes described here — has
  been deleted, and the defects survive as committed reviewer transcripts and this record.
- `.gitignore` now carries patterns for the rejected candidates (`examples/*/eval/`,
  `examples/*/shots/cand*.mp4`, …), so the 210 MB of working media stays uncommitted by policy
  rather than by accident.
- Behavioural eval coverage is 48%.
- The semantic benchmark scores checklist competence at 5/8 strict against unprompted recall of
  8/8; the blind spots and one mis-specified case are recorded in `docs/04` §5 rather than tuned
  away (the earlier 3/8 figure is superseded there — the scorer and one case brief changed, so the
  runs are not comparable). The remaining cases are judgement-shaped and currently unfalsifiable;
  the runner reports that rather than hiding it.
