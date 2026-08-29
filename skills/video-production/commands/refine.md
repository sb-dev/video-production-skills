---
id: refine
skill: video-production
---
# refine

## Purpose
Apply the smallest justified revision to an existing production artifact, routing the correction to the command that owns the defect and preserving everything already approved.

## Inputs
- The artifact to revise, with its lineage and its selected or approved parent.
- `evaluation_report` observations, and the `diagnose` result — owning layer, corrective action, correction scope — where `video-evaluate` is installed.
- The preserve set — the approved properties the revision must carry through unchanged — and the most specific approved upstream artifacts (visual direction, references, shot plan).

## Outputs
The smallest justified revision: a revised artifact produced by the owning command, at lifecycle `refine`, with lineage to its parent. `refine` introduces no artifact type of its own.

## Preconditions
A selected or approved parent exists and the deficiency is stated. Classify the failure before retrying. Two attempts carrying the same diagnosis is a hard stop: a third requires a changed upstream artifact or a human decision to continue.

## Procedure
1. Start from the selected or approved parent.
2. Preserve approved properties.
3. Change only the requested deficiency.
4. Retain lineage.
5. Verify that no material regression was introduced.

## Invariants
- Approved identity, composition, lighting, direction and timing outside the named deficiency remain untouched — this is the preserve set.
- Shot IDs stay stable, approvals with their `approvedBy` survive on every artifact the revision does not own, and rejected candidates stay rejected.
- Where the revision changes a decision an upstream artifact records, that artifact is updated or its reopening is recorded explicitly.
- Cost does not rise to answer a structural failure; the owning decision is revised instead.

## Forbidden behaviour
- Restarting from the brief when a more specific approved artifact can drive the revision.
- Regenerating a sequence, edit or master to correct a defect one artifact owns.
- Fixing the visible symptom by rewriting unrelated approved work — this is a failure even when the symptom disappears.
- Retrying against unchanged inputs, or repeating a generation that carries the same diagnosis.
- Advancing the revision to `approved`; approval is a human act and records `approvedBy`.

## Failure routing
A correction goes to the smallest command that owns the defect, never to a blanket regeneration:

- reference composition defect → `create-reference`;
- camera or action design defect → `plan-shots` or `create-motion-prototype`;
- execution-only shot defect → `generate-shot`;
- wrong selected take → `select-shot`;
- pacing or ordering defect → `assemble-edit`;
- audio balance or sync defect → `integrate-audio`;
- master encode defect → `render-master`;
- delivery crop or format defect → `create-delivery`;
- owning layer genuinely unclear → `video-evaluate` `diagnose`, rather than guessing upward.

## Evaluation hooks
Cases carrying `"command": "refine"` in `evals/evals.json` cover preservation and correction scope separately: a reference-frame case moving one product while character, pose and lighting are preserved and the brief is not restarted; an edit-first case where a pacing defect routes to `assemble-edit` rather than shot regeneration; and a delivery-crop case that leaves the master alone. `tools/validate-production.ts` backs the approval-provenance and plan-reconciliation assertions deterministically, through its `approval-without-approver` and `plan-delivery-mismatch` rules; no case here carries a deterministic check.
