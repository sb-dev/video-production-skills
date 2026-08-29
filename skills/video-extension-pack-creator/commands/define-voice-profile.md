---
id: define-voice-profile
skill: video-extension-pack-creator
---
# define-voice-profile

## Purpose
Define optional voice/performance guidance when spoken audio is relevant.

## Inputs
Pack requirements and available authorised/configured voice resources.

## Outputs
No voice profile, performance direction, or permitted provider references.

## Preconditions
- An approved pack definition exists and indicates whether spoken audio is relevant.
- Any provider voice reference is already authorised and configured; nothing is discovered here.

## Invariants
- Voice is optional unless intrinsic to the production.
- Never invent provider voice IDs.
- Preserve role/performance consistency when configured.
- "No voice profile" is a valid, recorded outcome rather than an omission.

## Forbidden behaviour
- Embedding credentials or private voice assets.
- Making imitation of an identifiable real person the pack's defining behaviour.
- Adding a voice profile to a pack whose production has no spoken audio.
- Implementing or calling a voice provider API; execution stays delegated.

## Failure routing
Missing or unauthorised voice resources produce `BLOCKED` and no profile, not an invented one.
A voice requirement that contradicts the pack identity routes to `define-pack`.
A performance trait that evaluation misjudges routes to `define-evaluation-profile`.

## Evaluation hooks
Test voice-enabled packs; a voice-free pack is required coverage, not yet written.
Case: `voice-no-invented-id`.
