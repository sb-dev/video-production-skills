---
id: assemble-edit
skill: video-production
---
# assemble-edit

## Purpose
Assemble selected shots into an edit timeline and carry it through to picture lock. Owns source selection, order, in/out, timing, transitions, and basic graphic and audio placement.

## Inputs
- Selected `video_shot` artifacts, one per shot ID.
- The `shot_plan` for sequence and duration intent — approved.
- Basic audio placement and title/graphic requirements where the production has them.

## Outputs
An `edit_timeline` — the authoritative editorial artifact — at the current rung of the editorial ladder.

## Preconditions
- Every source is a candidate that `select-shot` marked `selected`; no rejected candidate is present.
- Picture lock requires a human decision recording `approvedBy`.

## Procedure
1. Assembly — sources in order, in/out set, nothing else claimed.
2. Rough cut — durations and transitions resolved against the shot plan.
3. Fine cut — pacing, basic audio placement, titles and graphics where required.
4. Picture lock — a human moves the timeline to `decisionState: locked`.

## Invariants
- The timeline preserves: source selection; order; in/out; duration; transition; basic audio placement; basic title/graphic placement when required.
- Progression runs assembly → rough cut → fine cut → picture lock, and picture lock is a decision lock on the edit timeline.
- The edit timeline, not a review render, is the authoritative editorial artifact.
- Shot IDs and the lineage of every source carry through unchanged.
- A source whose pixel aspect differs from the render aspect is conformed deliberately and the conform is reported.
- Where the cut changes a decision an upstream artifact records, the owning artifact is updated or the reopening is recorded explicitly.

## Forbidden behaviour
- Including a rejected candidate, or substituting a source that `select-shot` did not select.
- Moving the timeline to `locked` on the agent's own authority.
- Padding or letterboxing a mismatched shot silently.
- Treating a review render as the video master or as the editorial record.
- Commissioning a new shot to fix a pacing or ordering problem the cut owns.
- Building a general nonlinear editing engine, or absorbing music production or mastering.

## External capabilities
`scripts/render-timeline.ts` for deterministic preview renders; `scripts/inspect-media.ts` for source duration, resolution and aspect facts.

## Failure routing
Pacing, ordering, duration and transition defects stay here. A wrong take routes to `select-shot`; an execution-only shot defect to `generate-shot`; sequence design to `create-storyboard`; audio balance or sync to `integrate-audio`; encode or master defects to `render-master`; delivery adaptation to `create-delivery`.

## Evaluation hooks
Cases in `evals/evals.json` scoped `command: assemble-edit`, class `normal`, run by `node tools/run-evals.ts --skill video-production --command assemble-edit`. `normal-conform-before-assembly` is backed by the deterministic check `editorial:warns-on-aspect-mismatch`; `normal-three-shot` asserts "use selected shot candidates in edit" but carries no `command`, so it runs only in the unfiltered suite. `boundary-rejected-candidate-in-edit` refuses a source `select-shot` rejected. Required coverage, not yet written: a `final` case at picture lock.
