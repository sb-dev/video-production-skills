---
id: check-continuity
skill: video-evaluate
---
# check-continuity

## Purpose
Check an artifact set for continuity against its most specific approved parents and the declared scene, using deterministic checks first and semantic judgement only where the declaration cannot answer the question.

## Inputs
The artifact set under review — shots, reference frames, adjacent shots — plus continuity constraints: scene manifest, approved character and product references, wardrobe/prop state, `shot_plan`, `visual_direction`. Approved references are the standard; the scene manifest is the standard for environment.

## Outputs
Continuity findings for the applicable dimensions — character identity, product/prop identity, environment, landmarks, screen direction, axis, eyelines, wardrobe/state, lighting progression — each classed and each carrying its evidence, contributed to the `evaluation_report`.

## Preconditions
Environment continuity requires a scene manifest. If the production has none, that absence **is** the finding, and the corrective action is to declare the scene before generating further frames.

## Procedure
1. Establish the most specific approved parents and the scene manifest.
2. Run `scripts/validate-continuity.ts` against the scene manifest before any semantic pass.
3. Record its findings verbatim: `unknown-landmark`, `attachment-contradiction`, `screen-order-contradiction`, `landmark-discontinuity`, `axis-violation`.
4. Apply semantic judgement only to what the declaration cannot capture — whether the image matches what it claims, and whether look, register and lighting hold.
5. Class each finding and state the smallest corrective action it implies.

## Invariants
- Deterministic findings precede semantic judgement and are never overridden by it.
- The five script finding codes are reported under their own names, unrenamed and unmerged.
- Script exit codes are honoured: `0` clean, `1` findings, `2` usage error, `3` runtime failure. Any exit other than `0` or `1` is a tooling failure of the measurement, not a clean result.
- A narrative character profile, a visual character sheet and a voice identity stay distinct, not collapsed into one character abstraction.
- Each finding is classed: a landmark that drifted between generations is a generation defect; a landmark that was never declared is a continuity defect owned by the reference stage.
- Only the dimensions applicable to the artifact set are checked.

## Forbidden behaviour
- Judging environment continuity with no scene manifest instead of reporting its absence.
- Spending semantic judgement on what `validate-continuity.ts` already answers exactly.
- Reading any exit other than `0` or `1` as a pass, or treating a missing script dependency as a clean run.
- Recommending a sequence restart for a defect owned by one reference or one shot.
- Regenerating or refining the artifacts under review.

## External capabilities
`scripts/validate-continuity.ts` (scene-manifest spatial continuity), `scripts/preflight.ts` (dependency availability), `scripts/sample-frames.ts` (staging evidence); `references/continuity.md`.

## Failure routing
Findings pass to `diagnose` for ownership and corrective action. A never-declared landmark or an identity defect owned by the reference routes to `create-reference`; an axis or screen-direction defect owned by the plan routes to `plan-shots`; drift between generations of an otherwise correct reference routes to `generate-shot`; a defect visible only across adjacent shots in sequence routes to `assemble-edit`.

## Evaluation hooks
Eval cases with `"command": "check-continuity"`: two seeded defect cases, `boundary-undeclared-landmark` and `boundary-attachment-contradiction`, backed deterministically by `scripts/validate-continuity.ts` and its exit codes through the checks `continuity:flags-undeclared-landmark` and `continuity:flags-attachment-contradiction`. Required coverage, not yet written: a seeded case for the script's remaining finding codes — `screen-order-contradiction`, `landmark-discontinuity` and `axis-violation` — the clean control is `normal-clean-scene-no-findings`, backed by `continuity:passes-clean-scene`, so false positives are measurable. Run with `node tools/run-evals.ts --skill video-evaluate --command check-continuity`.
