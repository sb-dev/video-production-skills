---
id: qc
skill: video-evaluate
---
# qc

## Purpose
Establish the technical validity of a media artifact against its declared requirements, using deterministic evidence and nothing else.

## Inputs
- A media artifact — `video_shot`, `video_master` or `delivery_variant`.
- The stated technical requirements: duration, resolution, aspect ratio, frame rate, audio presence, codec/container and any explicit delivery requirements.

## Outputs
A `qc_report` — pass/fail per applicable requirement with the measured value beside it. Kept distinct from the `evaluation_report`.

## Preconditions
- `scripts/preflight.ts` reports FFmpeg/ffprobe available. A missing dependency is declared, not silently substituted.
- Requirements that are not stated are not invented; only applicable ones are checked.

## Procedure
1. Run `scripts/inspect-video.ts` against the artifact with the stated requirements.
2. Confirm the file is readable and the container and streams are valid.
3. Check the applicable requirements: duration, resolution, aspect ratio, frame rate, audio presence, gross sync, obvious corruption, declared delivery requirements.
4. Check for unintended letterboxing introduced by unconformed sources.
5. Record each result with its measured value, and route temporal integrity to `check-motion`.

## Invariants
- QC runs before expensive semantic evaluation; a file that fails readability stops the evaluation there.
- Every result carries the measured value, not a bare verdict.
- Only applicable requirements are reported; an unstated requirement is neither passed nor failed.
- Container validity is not picture validity — a file can pass every stream check and still carry visible generation seams.
- The `qc_report` stays separate from creative judgement.

## Forbidden behaviour
- Making creative, editorial or fidelity judgements — those belong to the sibling evaluation commands.
- Declaring a master usable on container checks alone.
- Inferring a requirement the project never declared, or relaxing one it did.
- Running semantic evaluation before basic technical validation.
- Building broadcast-grade QC beyond what real delivery requirements demand.
- Repairing, re-encoding or otherwise modifying the artifact.

## External capabilities
`scripts/inspect-video.ts`, `scripts/preflight.ts`.

## Failure routing
- Periodic seams, frozen frames, drift and usable range → `check-motion`.
- Identity, product or style drift → `check-fidelity`.
- Spatial and screen-direction contradictions → `check-continuity`.
- Owning layer, corrective action and correction scope for a confirmed technical defect → `diagnose`. An encode defect in the master routes to `render-master`; an adaptation defect such as a bad crop or wrong aspect ratio routes to `create-delivery`, never to reshooting.

## Evaluation hooks
Cases in `evals/evals.json` tagged `"command": "qc"`, run by `node tools/run-evals.ts --skill video-evaluate --command qc`. The one case, `boundary-corrupt-media`, is backed by the deterministic check `qc:rejects-unreadable-media`, which executes `scripts/inspect-video.ts` against a corrupt fixture. `normal-valid-master-passes` is the control, backed by `qc:accepts-valid-media`: a valid master that meets its stated requirements passes without creative commentary.
