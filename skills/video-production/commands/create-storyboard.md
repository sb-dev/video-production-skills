---
id: create-storyboard
skill: video-production
---
# create-storyboard

## Purpose
Resolve sequence, staging and coarse pacing decisions on a cheap board before any expensive shot generation is paid for.

## Inputs
- `brief` and `visual_direction` (approved where approval was required).
- Approved `character_sheet`, `scene_sheet` / `scene_manifest`, `object_sheet` / `product_manifest` for anything the board depicts.
- Panel-form specification in `references/storyboard-and-shot-planning.md`.

## Outputs
A `storyboard`: one composed board sheet of small numbered panels, with each `storyboard_frame` independently addressable.

## Preconditions
Visual direction is settled enough to give every panel one identical style clause. Any location the board depicts has a declared scene sheet and scene manifest. Board images are generated only when the image is the artifact that resolves the decision.

## Procedure
1. Derive the beats the sequence must test from the brief and visual direction.
2. Generate panels **individually**, each carrying the approved references and the identical style clause, at low fidelity.
3. Carry more panels than the sequence will have shots, including inserts and atmosphere plates.
4. Compose the sheet deterministically with `scripts/make-storyboard.ts` — grid, numbering and keylines are not generated.
5. Present the board for human review; keep annotations beside the frame, never inside it.

## Invariants
- Every `storyboard_frame` stays independently addressable, re-orderable and individually replaceable.
- Panels inherit the approved character, wardrobe, product and environment references without reinterpretation.
- The board reads as one hand: uniform monochrome line work, one style clause across all panels.
- Storyboard semantics stay separate from executable shot-plan detail.
- Board approval is a sequence decision only; it never stands in for motion validation.

## Forbidden behaviour
- Asking an image model to lay out, number or frame the grid.
- Producing one polished panel per final shot, or rendered full-bleed illustrations in place of sketch panels.
- Drawing arrows, sight-lines, labels or legible text inside a panel frame.
- Rendering board images when the written storyboard is authoritative and governs the decision.
- Generating motion prototypes or video shots, or approving the board on its own authority.

## External capabilities
`scripts/make-storyboard.ts` composes the panel files into the board sheet (ImageMagick montage; deterministic layout, numbering and keylines).

## Failure routing
- Wrong sequence, wrong beat, wrong staging → `create-storyboard`.
- Panel contradicts the approved look or palette → `define-direction`.
- Board is right but per-shot execution detail is wrong or ambiguous → `plan-shots`.
- Panel breaks an approved identity or environment reference → diagnosed by `check-fidelity`, corrected here.

## Evaluation hooks
`evals/evals.json` cases tagged `"command": "create-storyboard"`, run with `node tools/run-evals.ts --skill video-production --command create-storyboard`. One case, `normal-storyboard-form`, covers board form (individually generated panels, deterministic composition, panel count above final shot count) and is backed by the deterministic check `storyboard:composes-numbered-board`. `boundary-written-board-authoritative` is the control: the written storyboard is authoritative and no board images may be rendered.
