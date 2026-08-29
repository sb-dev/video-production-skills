---
id: create-reference
skill: video-production
---
# create-reference

## Purpose
Produce the approved visual target for one shot: the frame a video model will read as physical state, not as intent.

## Inputs
Approved `storyboard_frame`, `shot_plan`, approved `visual_direction`, and the most specific approved identity references available — `character_sheet` / `character_manifest`, `product_manifest`, `object_sheet`, and for any shared location the approved `scene_sheet` and `scene_manifest`.

## Outputs
`reference_frame` candidate(s) with common lineage, one explicit selection, and a record of any known generation defect accepted in the selected frame.

## Preconditions
Visual direction is approved. For a production whose shots share a location, the scene sheet and scene manifest exist and are selected before shot frames derive from them. Human approval of the selected frame, recorded with `approvedBy`, is required before it drives shot generation.

## Procedure
1. Gather the most specific approved upstream artifacts; never reinterpret the brief when they exist.
2. Generate drafts only where comparison is useful; compare them with `scripts/make-contact-sheet.ts`.
3. Select explicitly, and refine from the selected parent.
4. Verify against the shot plan's **action**, not only its composition: every subject that must move mid-motion is posed mid-motion.
5. Check the frame against the scene manifest — landmark attachments, axis order, camera side, per-shot presence.
6. Check for defects that will persist into motion — pseudo-text, illegible instrument faces, landmark contradictions — and record any accepted.
7. Put the selected frame to a human for approval.

## Invariants
- Subject identity, product fidelity, environment, composition, framing, lighting, styling and continuity with adjacent shots are preserved across refinement.
- A refinement changes only the requested deficiency and retains lineage to the selected parent.
- Approved scene-manifest facts survive every replacement of a frame; a frame replaced twice is re-checked against its neighbours.
- Shot ID stays stable.

## Forbidden behaviour
- Leaving a subject that must move standing still, feet flat and weight centred.
- Diagram compositions: matched lateral profile, symmetric placement, equal scale, an empty void of ground where the location would be occupied.
- Accepting garbled pseudo-lettering, or describing an illegible clock or sign as safer for continuity. Text is readable and consistent, or genuinely defocused/out of frame.
- Promoting whichever shot candidate was generated first to "the environment".
- Restarting from the brief when approved artifacts exist, or regenerating from scratch in place of refining.
- Calling a provider API directly, or advancing the frame to `approved` on its own authority.

## External capabilities
`scripts/make-contact-sheet.ts` for deterministic candidate comparison. Image generation is delegated to the default provider skills.

## Failure routing
A defect visible in a generated shot whose cause is present in the approved reference frame is owned **here**, not by `generate-shot` — a subject that will not move, a diagram composition, garbled signage, an illegible clock, a landmark that contradicts another approved frame. Two attempts at `generate-shot` carrying the same diagnosis is a hard stop: the diagnosis is wrong and the frame is the suspect. Never re-diagnose such a failure as a prompt failure and never spend further attempts against an unchanged frame. Style or tone constraint wrong → `define-direction`. Camera or action design wrong → `plan-shots` or `create-motion-prototype`. Sequence or staging wrong → `create-storyboard`.

## Evaluation hooks
Cases in `evals/evals.json` carrying `"command": "create-reference"`, run with `node tools/run-evals.ts --skill video-production --command create-reference`: the preservation case (`refine-reference-frame` — move the product closer while character, pose and lighting stay unchanged, no restart from brief), and a static-subject case whose expectation forbids blaming the prompt. Peer coverage lives in `video-evaluate`'s `boundary-static-subject-reference`. Structure is checked by `tools/validate-repo.ts`.
