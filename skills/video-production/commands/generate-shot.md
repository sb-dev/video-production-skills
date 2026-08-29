---
id: generate-shot
skill: video-production
---
# generate-shot

## Purpose
Execute one planned shot against its approved reference, producing video-shot candidates with provenance and lineage intact. Execution only: it does not decide which take is used.

## Inputs
- `reference_frame` for the shot — must be approved.
- `shot_plan` entry for the shot ID — must be approved.
- `visual_direction`, and the `motion_prototype` where one was produced — approved.
- Relevant approved character, product, scene and object references.

## Outputs
One or more `video_shot` candidates for a single shot ID, each carrying execution provenance and parent lineage.

## Preconditions
- A human has approved the visual direction, the identity/environment references and the shot plan; approval records `approvedBy`.
- An attempt ceiling and generation budget are agreed.
- Sequence and composition are stable — no expensive motion before then.

## Procedure
1. Identify the hard production requirements for the shot.
2. Use the most specific approved upstream artifacts, not the original brief.
3. Invoke the default image/video provider skills to discover, compare and execute.
4. Preserve execution facts in provenance.
5. Evaluate basic usability, including a temporal motion pass.
6. Retain candidate lineage.

## Invariants
- The shot ID is stable across every candidate and attempt.
- Approved identity, composition, environment and style properties carry through unchanged.
- Provenance records the executing provider skill, model and execution facts for every candidate.
- A user-pinned compatible model is honoured.
- Two attempts carrying the same diagnosis is a hard stop; a third requires a changed upstream artifact or a human decision.

## Forbidden behaviour
- Calling a provider API directly, implementing a provider SDK, or maintaining a model or pricing catalogue.
- Defaulting to whichever model accepted the input without comparing temporal stability on a short test.
- Using fal.ai/genmedia unless Replicate cannot satisfy a hard required capability or the user selects it.
- Marking a candidate `selected`, `approved` or `locked`.
- Discarding losing candidates, or silently editing the shot plan to agree with what was generated.
- Re-running unchanged inputs and counting it as a new attempt.

## External capabilities
Official Replicate skills for discovery, comparison, prompting and execution; `scripts/inspect-media.ts` for execution facts; `video-evaluate`'s `check-motion` command when that skill is installed.

## Failure routing
Transient provider failure retries once here. Capability or prompt failure stays here. Composition or identity defect routes to `create-reference`; motion-concept defect to `create-motion-prototype`; camera or action design to `plan-shots`; sequence to `create-storyboard`. Choosing among produced candidates is never a `generate-shot` failure — it belongs to `select-shot`.

## Evaluation hooks
Cases in `evals/evals.json` scoped `command: generate-shot`, classes `normal` and `failure-boundary`, run by `node tools/run-evals.ts --skill video-production --command generate-shot`. `boundary-retry-ceiling` covers the attempt cap; `boundary-self-approved-direction` (`governance:flags-approval-without-approver`) covers generating against unapproved direction.
