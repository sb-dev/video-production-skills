---
id: select-shot
skill: video-production
---
# select-shot

## Purpose
Choose which video-shot candidate is used downstream for a shot ID, and record that choice so rejected candidates cannot reach the edit.

## Inputs
- `video_shot` candidates for one shot ID, with lineage and provenance.
- The `shot_plan` entry for that shot, including its continuity constraints — approved.
- Motion evidence for each candidate: a temporal pass, not stills alone.

## Outputs
One `video_shot` at `decisionState: selected`, with the selection reason recorded and the remaining candidates explicitly marked rejected.

## Preconditions
- At least one candidate exists for the shot ID.
- Each candidate under consideration has been through a temporal motion pass.

## Invariants
- Selection is yours; approval is not. `open` → `selected` means "continue developing this option", and only a human moves an artifact to `approved` or `locked`, recording `approvedBy`.
- Selection is gated on motion quality, not staging alone. Still frames and contact sheets resolve staging, framing, identity and screen direction; they cannot resolve seams, sliding, morphing or frozen frames.
- The shot ID is stable; selection changes which candidate carries it, never the ID.
- Rejected candidates stay in the lineage and out of every downstream artifact.
- Where the selected take contradicts a decision an upstream artifact already records, the owning artifact is updated or the reopening is recorded explicitly.

## Forbidden behaviour
- Selecting from a contact sheet or storyboard-style stills without motion evidence.
- Sampling frames at an interval near the artifact's period, which hides a periodic defect completely.
- Selecting a shot that stages the story well and slides its feet.
- Advancing the selected candidate to `approved` or `locked`, or treating the agent's preference as sign-off.
- Deleting, overwriting or unlinking rejected candidates.
- Silently editing the shot plan so it agrees with the selected take.

## External capabilities
`scripts/make-contact-sheet.ts` for staging comparison only; `video-evaluate`'s `check-motion` command for the motion gate when that skill is installed.

## Failure routing
No usable candidate because of an execution-only defect routes to `generate-shot`. A defect shared by every candidate is not a selection failure: composition or identity routes to `create-reference`, motion concept to `create-motion-prototype`, camera or action design to `plan-shots`. A wrong take discovered downstream routes back here, never to a fresh generation round.

## Evaluation hooks
Cases in `evals/evals.json` scoped `command: select-shot`, classes `normal` and `failure-boundary`, run by `node tools/run-evals.ts --skill video-production --command select-shot`. `normal-three-shot` asserts "gate shot selection on motion quality, not staging alone" and "use selected shot candidates in edit", but carries no `command`, so it runs only in the unfiltered suite; the motion evidence itself is produced deterministically by `video-evaluate`'s `check-motion` command.
