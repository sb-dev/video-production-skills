---
id: create-animatic
skill: video-production
---
# create-animatic

## Purpose
Test whether the sequence works in time before expensive shot production, using the cheapest temporal representation available.

## Inputs
`storyboard` (frames, approved where available), `shot_plan`, and any supplied temporary dialogue or guide audio. Optional: rough or placeholder frames.

## Outputs
`animatic` — a deterministic sequence preview — plus the timing and sequence observations it produced.

## Preconditions
Run only when sequence timing, dialogue timing, or shot relationships are genuinely uncertain. A storyboard must exist. This stage is optional and may be skipped when timing is already settled.

## Procedure
1. Take the storyboard frames and shot-plan durations as the sequence source.
2. Assemble a timeline of panels, placeholder frames and any guide audio.
3. Build the preview deterministically with `scripts/render-timeline.ts`.
4. Review for sequence problems, timing problems, and shot relationships.
5. Route the observation to its owning command; do not repair it inside the animatic.
6. Record the timing and sequence decisions the animatic settled, and put them to a human for approval.

## Invariants
- Shot IDs stay stable and addressable from storyboard through animatic.
- The approved decisions are timing and sequence decisions, never the pixels of the animatic.
- Identity, staging and composition come from the storyboard; the animatic does not restate them.
- Approved upstream decisions are carried through unchanged.

## Forbidden behaviour
- Generating final motion, or any expensive shot, to populate the animatic.
- Treating an animatic frame as a `reference_frame` or promoting it to an approved visual target.
- Building a separate animatic engine or renderer when deterministic preview construction is sufficient.
- Requiring an animatic for every production.
- Advancing its own timing decisions to `approved`; approval is a human act and records `approvedBy`.

## External capabilities
`scripts/render-timeline.ts` for the deterministic preview; `scripts/make-storyboard.ts` where panels must be composed first.

## Failure routing
Sequence or shot-order problem → `create-storyboard`. Shot duration, camera or action problem → `plan-shots`. A pacing problem that exists only in the cut of real shots → `assemble-edit`. Never route an animatic finding to `generate-shot`.

## Evaluation hooks
Cases in `evals/evals.json` carrying `"command": "create-animatic"`, run with `node tools/run-evals.ts --skill video-production --command create-animatic`: a `draft` case where timing uncertainty warrants an animatic, and a control case where it does not and must be skipped. Structure is checked by `tools/validate-repo.ts`; preview construction runs through `scripts/render-timeline.ts`, though neither case carries a deterministic check that executes it.
