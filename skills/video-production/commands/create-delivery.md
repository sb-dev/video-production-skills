---
id: create-delivery
skill: video-production
---
# create-delivery

## Purpose
Adapt an approved `video_master` for one declared delivery target, as a deliberate adaptation that leaves the master untouched.

## Inputs
- Approved `video_master` as the source.
- Declared delivery requirements: aspect ratio, crop or reframe, resolution, frame rate, codec/container, audio requirements, captions/subtitles, platform requirements.
- Delivery constraints supplied by an installed extension pack, where one governs the production.

## Outputs
A `delivery_variant` that traces back to its source master and records the adaptation applied.

## Preconditions
An approved master exists, and the delivery requirements are stated by the user or by an installed pack. Do not infer a delivery target that nobody declared.

## Invariants
- The source master is unchanged; the variant is a derived artifact, never a replacement.
- Every variant records its source master and the adaptations applied to it.
- Subject framing survives a crop or reframe: what the approved master makes legible stays legible at the target ratio.
- One variant per declared target; each remains independently addressable.
- Approved visual direction and approved finishing decisions carry through the adaptation.

## Forbidden behaviour
- Altering, re-rendering or re-approving the master to satisfy a delivery target.
- Reshooting, regenerating or re-selecting shots because a crop is unflattering.
- Inventing delivery targets, platforms or caption requirements that were not declared.
- Building multi-platform delivery automation or a variant matrix beyond the declared targets.
- Treating a delivery variant as the master, or deriving a further variant from a variant when the master is available.

## External capabilities
- Deterministic FFmpeg/ffprobe operations for crop, scale, re-encode and container change.
- `scripts/inspect-media.ts` to verify the variant against the declared requirements.

## Failure routing
- Crop, reframe, aspect, resolution, codec or caption defect → `create-delivery`.
- Defect already present in the master → `render-master`.
- Framing that cannot survive any crop because the shot was composed wrongly → `plan-shots`.
- Audio requirement the mix does not satisfy → `integrate-audio`.

## Evaluation hooks
Cases carrying `"command": "create-delivery"` in `evals/evals.json`: a defect case where a valid master with a bad vertical crop routes here and the master is neither altered nor reshot, and a control case where a declared target is satisfied without inventing further variants. Resolution, frame rate and audio presence are checked deterministically through `video-evaluate`'s `qc` command when that skill is installed; neither case carries a deterministic check of its own.
