---
id: check-fidelity
skill: video-evaluate
---
# check-fidelity

## Purpose
Compare an artifact against its approved identity, product and style baselines, and report where it has drifted from them.

## Inputs
- The artifact under evaluation — `reference_frame`, `video_shot`, `edit_timeline` or `video_master`.
- Approved references and manifests: character constraints, product/prop constraints, environment and scene manifest.
- Approved `visual_direction`, and the trait list of an installed extension pack when the project declares one.

## Outputs
Fidelity findings for the `evaluation_report`: the trait that drifted, the approved baseline it drifted from, and the evidence.

## Preconditions
- At least one approved reference, manifest or visual direction exists to compare against. Without a baseline there is no fidelity judgement to make; say so and stop.
- The artifact's lineage is known well enough to identify which baseline is the most specific applicable one.

## Invariants
- Judge against the most specific approved parent available, not against the prompt used to make the artifact.
- Character, product, prop, environment, visual direction and pack traits are reported separately; do not merge them into one similarity score.
- A drift finding names both sides — the approved trait and what the artifact shows instead.
- Pack traits are evaluated only when the project declared the pack; an absent pack is not a fidelity failure.
- Explicit user instruction and approved decisions outrank an inferred style reading.

## Forbidden behaviour
- Treating prompt compliance as fidelity when an approved parent exists.
- Inventing a baseline, or amending an approved reference or manifest so the artifact matches.
- Reporting drift without naming the reference it drifted from.
- Failing an artifact for a trait no approved reference or declared pack ever fixed.
- Penalising an intentional, declared style trait as material or identity drift.
- Rewriting or regenerating the artifact — this command reports only.

## Failure routing
- Motion, seam, frozen-frame and usable-range questions → `check-motion`.
- Spatial, screen-direction, axis, eyeline and scene-manifest contradictions → `check-continuity`.
- Container, resolution, aspect-ratio and delivery-requirement questions → `qc`.
- Owning layer, corrective action and correction scope for a confirmed drift → `diagnose`. Identity drift originating in the reference stage is routed there as `revise-reference`, not as a prompt retry.

## Evaluation hooks
Cases in `evals/evals.json` tagged `"command": "check-fidelity"`, run by `node tools/run-evals.ts --skill video-evaluate --command check-fidelity`. Coverage today is one refinement case, `refine-child`, which checks a requested correction against preservation and regression. `boundary-drift-names-its-reference` is the drift case and requires the drifted-from reference to be named. Required coverage, not yet written: a pack-trait drift case, and a clean control where the artifact matches its approved references and must not be failed. No deterministic script backs this command; its cases are semantic and are reported as such rather than as executed evidence.
