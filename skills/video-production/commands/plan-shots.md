---
id: plan-shots
skill: video-production
---
# plan-shots

## Purpose
Define exactly what must be produced for each shot, and no more, so reference-frame and shot generation have unambiguous, checkable requirements.

## Inputs
- Approved `storyboard` (its `storyboard_frame` children) and approved `visual_direction`.
- Approved `character_sheet` / `character_manifest`, `scene_sheet` / `scene_manifest`, `object_sheet` / `product_manifest`.
- `brief` constraints on runtime, required outputs and technical delivery.

## Outputs
A `shot_plan` recording, per shot, only the fields the production needs: shot ID; purpose; duration target where relevant; framing; subject; action; camera behaviour; required references; continuity constraints; audio/dialogue requirements; technical constraints.

## Preconditions
The storyboard is approved by a human. The shot plan itself requires human approval before expensive generation begins.

## Invariants
- Shot IDs are stable and reused by every downstream artifact, candidate and lineage record.
- Duration, framing dimensions and frame rate are recorded as machine-checkable values so plan and master can be reconciled automatically.
- Continuity constraints — screen direction, axis and camera side, landmark presence, wardrobe and state, lighting progression — are carried from the scene and character manifests rather than restated from memory.
- Every planned shot traces to an approved storyboard frame or to a recorded, explicit reopening.
- Camera behaviour and action are stated precisely enough that a wrong movement is a plan defect, not a matter of interpretation.

## Forbidden behaviour
- Inventing a comprehensive or universal shot-list schema the production does not need.
- Editing the plan to agree with an already-generated output instead of updating the owning artifact or recording a reopening.
- Leaving camera movement, framing or duration as prose that cannot be reconciled against the delivered master.
- Generating reference frames, motion prototypes or video shots.
- Approving the plan, or renumbering shot IDs once downstream work references them.

## External capabilities
None. Reconciliation of a delivered master against the plan is performed by `tools/validate-production.ts`.

## Failure routing
- Ambiguous or wrong camera movement, action design, framing or duration → `plan-shots`.
- Sequence or beat is wrong rather than the shot spec → `create-storyboard`.
- Plan is sound but composition of the frame is wrong → `create-reference`.
- Plan is sound but only the execution failed → `generate-shot`.
- Timing relationships between shots remain uncertain → `create-animatic`.


## Evaluation hooks
`evals/evals.json` cases tagged `"command": "plan-shots"`, run with `node tools/run-evals.ts --skill video-production --command plan-shots`. Cover: the failure-boundary case where a visually strong shot has wrong camera movement caused by an ambiguous plan — expected routing is the shot plan, corrective action revise-shot-plan, correction scope the affected shot only, never repeated regeneration. Required coverage, not yet written: a control case where the plan is unambiguous and the defect belongs to `generate-shot`. `tools/validate-production.ts` reports `plan-delivery-mismatch` when an approved plan's render size or planned duration no longer describes the delivered master.
