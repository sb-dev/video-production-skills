---
id: define-direction
skill: video-production
---
# define-direction

## Purpose
Turn production intent into an operational `visual_direction` that downstream stages can execute against, when visual direction is materially uncertain.

## Inputs
- `brief` — persistent production intent, runtime, required outputs, restrictions.
- Approved upstream constraints and references: `character_sheet` / `character_manifest`, `scene_sheet` / `scene_manifest`, `object_sheet` / `product_manifest`, supplied style references.
- Explicit user instructions, which outrank anything inferred.
- Extension-pack direction traits when a pack is installed.

## Outputs
A concise `visual_direction` recording look, palette, lighting, camera language and styling — or a `draft_set` of alternatives plus an explicit selection when comparison is genuinely useful.

## Preconditions
A `brief` or equivalent stated intent exists. No approval gate precedes this command; it is often the first artifact. Its own output requires human approval before expensive generation downstream.

## Invariants
- Explicit user instructions and approved upstream artifacts survive unchanged into the direction.
- The direction stays at the level of visual language; it does not pre-empt sequence, staging or shot execution.
- Lifecycle, decision and production-policy states remain independent; a selected direction is not an approved one.
- A materially story-changing parameter left open by the brief — who the people are, where this takes place, which props carry meaning — is surfaced as a question, not silently chosen.
- Direction is written so a later artifact can be checked against it.

## Forbidden behaviour
- Marking the direction `approved` or `locked`, or recording an `approvedBy` value on its own authority.
- Overriding or quietly reinterpreting an explicit user constraint or an approved upstream reference.
- Inventing a prop, character identity or setting that the brief did not state and no human confirmed.
- Producing storyboard panels, reference frames or any generated motion from this command.
- Generating direction alternatives when the brief already settles the look.

## Failure routing
- Direction contradicts the brief or a stated constraint → `define-direction`.
- Direction is sound but the sequence it produced is wrong → `create-storyboard`.
- Direction is sound but a frame fails to honour it → `create-reference`.
- Style or material drift against an installed pack → diagnosed by `check-fidelity`, corrected here only when the direction itself is at fault.

## Evaluation hooks
`evals/evals.json` cases tagged `"command": "define-direction"`, run with `node tools/run-evals.ts --skill video-production --command define-direction`. One case, `draft-uncertain-direction`, covers ambiguous direction (cheap artifact first, explicit selection, no premature motion). `boundary-direction-already-settled` is the control: the brief is already specific and no direction alternatives may be generated. `tools/validate-production.ts` catches a direction marked approved with no approver recorded, through its `approval-without-approver` rule.
