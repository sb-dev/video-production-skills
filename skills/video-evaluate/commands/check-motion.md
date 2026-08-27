---
id: check-motion
skill: video-evaluate
---
# check-motion

## Purpose
Judge temporal integrity and motion quality in a `video_shot` or `motion_prototype`: whether the intended action, camera movement and timing actually occur, and where the take stops being usable.

## Inputs
- `video_shot` or `motion_prototype` media.
- `shot_plan` for intended action, camera movement and timing — the approved one where it exists.
- `visual_direction`, or installed extension-pack traits, where an intentional motion cadence is declared.

## Outputs
Motion findings for the `evaluation_report`, each classed as a generation/model defect or a creative defect, plus the recommended usable range and a keep / trim / regenerate verdict.

## Preconditions
- `scripts/preflight.ts` reports FFmpeg/ffprobe available.
- The media is readable. Readability and container validity are owned by `qc` and are established there first.

## Procedure
1. Run `scripts/detect-motion-artifacts.ts` on the media. Exit 0 is clean, exit 1 is artifacts found; any other exit is a usage or runtime failure of the measurement and is never a clean verdict.
2. Read the reported periodic seams, frozen runs and drift as evidence, quoting the seam period in frames and seconds.
3. Judge the shot as start state → motion → end state against the shot plan: intended action present, camera behaviour, physics and common sense, repeated or looping action, unexpected jumps.
4. Report the recommended usable range — the longest span carrying neither a spike nor a frozen run.
5. Return the verdict together with the evidence that produced it.

## Invariants
- Motion is judged temporally; still frames resolve staging only.
- The usable range is reported on every evaluation, passes included.
- Evenly spaced seams are a generation defect. A clip assembled from fixed-length latent chunks does not stop seaming because the prompt is reworded, so the correction is retry-execution or change-capability, never new wording.
- An intentional cadence declared by the visual direction or an installed pack — stepped stop-motion, animation on twos — is style, not a defect.
- Every finding carries the measured evidence that produced it.

## Forbidden behaviour
- Concluding a shot is usable from a contact sheet or still sample alone.
- Sampling stills at an interval near a suspected artifact period.
- Recommending a prompt rewrite as the correction for periodic seams or frozen frames.
- Treating a held frame as intentional stillness without evidence.
- Passing motion because container QC succeeded.
- Choosing or endorsing an out-point without reporting the usable range.
- Penalising a declared style cadence as a motion failure.

## External capabilities
`scripts/detect-motion-artifacts.ts`, `scripts/preflight.ts`.

## Failure routing
- Unreadable or corrupt media, container and stream defects → `qc`.
- Identity, product or style drift noticed while reviewing motion → `check-fidelity`.
- Screen direction, axis, eyeline or spatial contradiction → `check-continuity`.
- Owning layer, corrective action and correction scope for a confirmed motion defect → `diagnose`. This command detects; it does not route production work or revise artifacts.

## Evaluation hooks
Cases in `evals/evals.json` tagged `"command": "check-motion"`, run by `node tools/run-evals.ts --skill video-evaluate --command check-motion`. The defect cases are backed by the deterministic checks `motion:detects-periodic-seams` and `motion:reports-frozen-frames`; the usable-range case by `motion:reports-usable-range`; the clean control by `motion:passes-clean-motion`. All four execute `scripts/detect-motion-artifacts.ts` against fixtures.
