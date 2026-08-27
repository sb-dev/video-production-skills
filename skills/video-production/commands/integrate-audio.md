---
id: integrate-audio
skill: video-production
---
# integrate-audio

## Purpose
Integrate dialogue, speech, effects and supplied music into the video's program mix, and update the video-specific audio placement and timing the edit timeline carries.

## Inputs
- `edit_timeline` with source selection, order, in/out and existing audio placement.
- Supplied or generated audio: recorded dialogue, generated speech, music, stems, sound effects.
- Audio/dialogue requirements recorded in the approved `shot_plan`.
- Approved `visual_direction` where it governs tone.

## Outputs
`audio_mix` — the program mix for this video — plus updated audio placement and timing on the `edit_timeline`.

## Preconditions
An `edit_timeline` exists with source selection and timing. Use guide or temporary audio while picture timing is still moving; a final mix is justified only once picture timing is sufficiently stable, normally at picture lock.

## Invariants
- Picture selection, order, in/out and duration stay as the timeline records them unless a change is requested and reconciled with the owning artifact.
- A supplied music asset keeps its own internal mix and master; only its balance against dialogue and effects is set here.
- Dialogue content is preserved; timing may be placed, wording may not be rewritten.
- Progression is recorded: guide audio → rough mix → review → refined mix → final audio mix.
- Provenance records which specialist skill produced any generated speech or effect, and the execution facts it returned.

## Forbidden behaviour
- Mixing or mastering a supplied music track as a music-production task, or composing music.
- Calling an audio provider API directly instead of delegating to a specialist audio skill.
- Re-cutting picture to conceal a sync error that the mix cannot fix.
- Substituting a rejected shot candidate to make an audio problem disappear.
- Advancing the mix to `approved` on its own authority; approval is a human act and records `approvedBy`.

## External capabilities
- Existing specialist audio skills for speech, transcription and generated sound effects.
- `scripts/inspect-media.ts` to confirm stream presence, channel layout and duration against the timeline.

## Failure routing
- Audio balance, placement or sync defect → `integrate-audio`.
- Pacing or ordering the mix cannot fix → `assemble-edit`.
- Missing or ambiguous dialogue/audio requirement → `plan-shots`.
- Audio defect introduced at encode → `render-master`.
- Platform audio or caption requirement → `create-delivery`.

## Evaluation hooks
Cases in `evals/evals.json` carrying `"command": "integrate-audio"`: a defect case where an audio balance problem routes here rather than to shot regeneration, and a control case where supplied music is balanced without being re-mastered. Audio presence is checked deterministically by `video-evaluate`'s `qc` command when that skill is installed; sync is judged there rather than measured, and neither case carries a deterministic check.
