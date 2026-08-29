---
id: render-master
skill: video-production
---
# render-master

## Purpose
Produce the `video_master` — the approved highest-quality source video from which delivery variants are derived — deterministically from the authoritative locked timeline.

## Inputs
- `edit_timeline` at picture lock (`decisionState: locked`), with the approver recorded.
- Approved finishing inputs — shot correction, simple compositing, visual matching, colour adjustment, graphics/titles — and the approved final `audio_mix` where the production has one.
- The selected `video_shot` sources the timeline names.

## Outputs
A `video_master` with lineage back to its parent timeline, plus the technical evidence gathered while verifying it.

## Preconditions
Produce the master only from an approved/locked edit and approved finishing inputs. A review render is not automatically a video master. Run required readiness and technical checks before treating output as final.

## Procedure
1. Confirm picture lock and the approvals on finishing and audio, including `approvedBy`.
2. Render deterministically from the authoritative timeline, using FFmpeg/ffprobe operations rather than generative inference.
3. Verify the master corresponds to that timeline: shot order, in/out, total duration, resolution, frame rate, stream layout.
4. Run readiness and technical checks, and record the evidence they produce.
5. Record lineage — parent timeline, approver of the lock, source shots — before the output is called a master.

## Invariants
- Every frame derives from a selected shot the locked timeline names; rejected candidates never enter the master.
- Timing and order match the authoritative timeline exactly; a discrepancy is reconciled with the owning artifact, never absorbed silently.
- No creative decision is made or changed while mastering; approved visual direction and approved finishing decisions carry through unaltered.
- The master is distinct from an edit preview and from any delivery variant.

## Forbidden behaviour
- Rendering a master from an unlocked, unapproved or superseded edit.
- Re-cutting, retiming or reframing during the render to fix a defect the edit owns.
- Using generative inference for transcoding, layout, scaling or titling.
- Relabelling a review render as the master without running the required checks.
- Advancing the master to `approved` on its own authority; approval is a human act and records `approvedBy`.

## External capabilities
- `scripts/render-timeline.ts` to render from the timeline.
- `scripts/inspect-media.ts` for container, stream, duration and frame-rate evidence.
- `tools/validate-production.ts` for approval and plan-reconciliation checks.
- `video-evaluate`'s `qc` command where that skill is installed.

## Failure routing
- Encode, container, stream or duration-mismatch defect → `render-master`.
- Pacing, ordering, in/out or transition defect → `assemble-edit`.
- Audio balance or sync defect → `integrate-audio`.
- Crop, aspect ratio or platform format defect → `create-delivery`.
- Defect visible in a source take → `select-shot`, or `generate-shot` when no usable candidate exists.

## Evaluation hooks
Cases carrying `"command": "render-master"` in `evals/evals.json`: one final case, `final-locked-edit`, rendering from a locked edit with lineage retained. Required coverage, not yet written: a boundary case refusing to master from an unapproved edit. `tools/validate-production.ts` backs the approval and reconciliation assertions deterministically, through its `approval-without-approver` and `plan-delivery-mismatch` rules.
