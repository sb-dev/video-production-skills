---
id: create-motion-prototype
skill: video-production
---
# create-motion-prototype

## Purpose
Test a shot's motion cheaply, at the lowest resolution that shows it, before an expensive take is commissioned.

## Inputs
Selected or approved `reference_frame`, `shot_plan`, and the approved `visual_direction` and continuity constraints that govern the shot.

## Outputs
`motion_prototype` for the shot, plus motion findings and the decision to proceed to `generate-shot` or to revise an owning upstream artifact.

## Preconditions
A reference frame exists for the shot. Run whenever any subject must translate, turn, or change gait, and whenever the shot depends on screen direction. "It is only walking" is not grounds to skip it.

## Procedure
1. Take the reference frame as the first-frame state and the shot plan as the intended action.
2. Commission a low-resolution prototype through the default provider skills.
3. Test action, within-shot timing, camera movement, object interaction, and motion quality.
4. Inspect the result with `scripts/inspect-media.ts`; where `video-evaluate` is installed, take motion findings from its `check-motion` command.
5. Record seams, sliding, frozen or refusing subjects, drift, and any usable range.
6. If the motion concept is wrong, revise the owning production decision and stop; if it is acceptable, carry the findings into shot production.

## Invariants
- The approved properties of the reference frame — identity, composition, framing, lighting, environment — are unchanged by prototyping.
- Shot ID and candidate lineage are retained.
- Prototype resolution is a cost decision, never a creative judgement about the shot.
- Usable-range and staging findings are carried forward to `generate-shot` rather than rediscovered there.

## Forbidden behaviour
- Polishing the prototype instead of revising the decision that owns the failure.
- Raising resolution, take length or spend to fix a motion concept that is wrong.
- Treating a prototype as a deliverable shot, or letting it reach the edit timeline.
- A third attempt against an unchanged diagnosis without a changed upstream artifact or a human decision.
- Calling a provider API directly, or maintaining a model catalogue.

## External capabilities
Provider skills for execution, delegated as in shot production. `scripts/inspect-media.ts` for deterministic inspection; `video-evaluate`'s `check-motion` command when that skill is installed.

## Failure routing
A subject that refuses to move, or a first-frame state the motion cannot continue from → `create-reference`. Wrong action, wrong camera behaviour, or an ambiguous shot design → `plan-shots`. Execution-only instability with the design intact → `generate-shot`. Sequence-level problems → `create-storyboard`; pacing that only appears in the cut → `assemble-edit`.

## Evaluation hooks
Cases in `evals/evals.json` carrying `"command": "create-motion-prototype"`, run with `node tools/run-evals.ts --skill video-production --command create-motion-prototype`: a case where translation or screen direction makes a prototype mandatory, a routing case where bad prototype motion revises the owning decision rather than the prototype, and a control case where a static shot needs none. Motion evidence is deterministic, through `video-evaluate`'s `check-motion` command when that skill is installed; structure is checked by `tools/validate-repo.ts`.
