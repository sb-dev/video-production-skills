---
id: diagnose
skill: video-evaluate
---
# diagnose

## Purpose
Turn evaluation findings into the layer that owns the failure, the corrective action, and the scope of the correction. Detection without correct routing is not sufficient.

## Inputs
`evaluation_report` observations (and `qc_report` findings where technical), artifact lineage — parents, approved references, scene manifest, `shot_plan`, `storyboard`, `visual_direction` — and production context. Approved parents define what a correction may not disturb.

## Outputs
Per finding: owning production layer, one corrective action from `accept | refine-current | retry-execution | revise-reference | revise-shot-plan | revise-storyboard | revise-edit | change-capability | reject`, correction scope, and the smallest owning command the fix routes to.

## Preconditions
Findings must already exist and carry evidence and a class. Diagnosis does not re-detect; where a finding lacks evidence, route it back to `evaluate` rather than guessing a cause.

## Procedure
Work the causes in this order. Stopping at the first plausible one, out of order, is how a reference failure gets misdiagnosed as a prompt failure and retried fifteen times.

1. asset mismatch — is the input reference actually what the shot needs;
2. overloaded prompt — is it asking for more than one thing;
3. weak or unclear action — is the intended motion actually specified;
4. missing end state — does the shot know where it finishes;
5. incorrect camera logic — does the described camera match the framing;
6. continuity gap — does it contradict an approved parent or the scene manifest;
7. capability mismatch — is the requested behaviour beyond the model.

Then name the owning layer, choose the corrective action, and bound the correction scope to the affected artifact.

## Invariants
- The seven causes are worked in order, and the stopping point is stated.
- Finding class constrains the action: a generation defect is not fixed by rewriting the brief, a creative defect is not fixed by changing model.
- Correction scope stays as narrow as the defect: affected shot only, unless the defect is genuinely sequence-wide.
- Approved upstream decisions outside the owning layer are carried through untouched.
- A subject static because the reference frame posed it static routes to `revise-reference`, never to a prompt rewrite.
- A landmark present in a shot but absent from the scene manifest routes to `revise-reference` with the scene declared before regeneration.
- A creative artifact marked approved with no `approvedBy` recorded is rejected pending human approval.

## Forbidden behaviour
- Recommending regeneration of unrelated approved work.
- Retrying the same generation repeatedly in place of diagnosis.
- Regenerating a whole sequence for a single-shot defect.
- Altering the master or reshooting for a delivery-adaptation defect.
- Routing a pacing or ordering defect to shot regeneration.
- Emitting more than one corrective action for a single finding, or none.
- Performing the correction itself, or approving any artifact.

## Failure routing
Reference composition or identity defect → `create-reference`. Camera or action design defect → `plan-shots` or `create-motion-prototype`. Execution-only shot defect → `generate-shot`. Wrong selected take → `select-shot`. Pacing or ordering defect → `assemble-edit`. Audio balance or sync defect → `integrate-audio`. Master encode defect → `render-master`. Delivery adaptation defect → `create-delivery`. Every route is carried out by `refine` in `video-production`, never here.

## Evaluation hooks
Eval cases with `"command": "diagnose"` covering detection, evidence and routing on two failure layers: good shots with edit-caused pacing → failure layer editorial, corrective action `revise-edit`, no unrelated shot regenerated (`boundary-editorial`); a subject that never moves → the reference frame as owning artifact, corrective action `revise-reference`, never re-diagnosed as a prompt failure (`boundary-static-subject-reference`). Required coverage, not yet written: wrong camera movement from an ambiguous plan → shot plan, `revise-shot-plan`, affected shot only, and a valid master with a bad vertical crop → `create-delivery`; both routes are exercised today only from the production side, by `video-production`'s `boundary-ambiguous-camera` and `boundary-delivery-crop-defect`. Run with `node tools/run-evals.ts --skill video-evaluate --command diagnose`; `tools/run-benchmark.ts` scores detection and precision as separate axes, but does not score routing.
