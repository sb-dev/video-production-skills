---
id: evaluate
skill: video-evaluate
---
# evaluate

## Purpose
Judge one production artifact against its production role, lifecycle state and most specific approved parents, and return evidence-backed observations rather than a generic score.

## Inputs
The artifact under review, its type and lifecycle state, and the available production context: brief, `visual_direction`, parent artifact, `storyboard`, `shot_plan`, approved references, character and product constraints, adjacent shots, stated technical requirements. Approved parents, where they exist, are the standard the artifact is judged against.

## Outputs
`evaluation_report` observations: per-criterion findings, each classed `technical | creative | continuity | generation/model`, each carrying the evidence it rests on. Technical media validity is reported as `qc_report` by `qc`, not folded in here.

## Preconditions
The artifact must be identifiable by type and lifecycle state. Run `scripts/preflight.ts` before any deterministic media pass so a missing dependency is reported rather than silently substituted.

## Procedure
1. Gather context and identify the artifact's production role.
2. Select only the criteria relevant to that role and lifecycle state — draft readiness, refinement verification, or full final evaluation.
3. Take deterministic evidence first, then extracted evidence, and reserve semantic judgement for what neither can answer.
4. Review in a fresh reviewer context given the frame pack, approved parents and criteria only.
5. Ask open-ended first — "describe any problems" — before walking the criteria list.
6. Class every finding, cite its evidence, and state the verdict the artifact's role calls for.

## Invariants
- Criteria stay matched to the artifact's role and lifecycle state.
- Every finding carries one of the four classes and the evidence behind it.
- Approved parents outrank the prompt as the standard of comparison.
- A refinement is checked for preservation and regression, not only for the requested change.
- Creative judgement and technical QC remain separately reported.

## Forbidden behaviour
- Rejecting a draft for lacking final polish when it resolves the decision it exists for.
- Reducing evaluation to prompt compliance when a more specific approved parent exists.
- Producing a single collapsed quality score, or a score where actionable diagnosis is possible.
- Running semantic evaluation before basic deterministic validation.
- Applying one universal rubric to every artifact type.
- Concluding a shot is usable from contact sheets alone.
- Rewriting or regenerating production work; evaluation observes and reports only.
- Evaluating one's own work inside the context it was produced in.

## External capabilities
`scripts/preflight.ts`, `scripts/inspect-video.ts`, `scripts/sample-frames.ts`; `references/artifact-readiness.md`.

## Failure routing
Findings are observations only; ownership and corrective action are decided by `diagnose`. Continuity findings route to `check-continuity`, motion findings to `check-motion`, identity/product/style drift to `check-fidelity`, technical media validity to `qc`.

## Evaluation hooks
Eval cases in `evals/evals.json` with `"command": "evaluate"`, covering the draft class (`draft-storyboard`) and the final class (`final-master`). `boundary-evaluate-does-not-revise` holds the line that evaluation reports and never revises. Required coverage, not yet written: a refinement case and a clean control case where no defect exists. Neither case carries a deterministic check, so `scripts/preflight.ts` and `scripts/inspect-video.ts` are exercised by the command itself and not by the eval run; cases are run by `node tools/run-evals.ts --skill video-evaluate --command evaluate`.
