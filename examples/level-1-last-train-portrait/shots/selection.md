# Shot selection

**Decision:** selected → approved
**Selected:** `candD_veo.mp4` (google/veo-3.1)
**Promoted to:** `SELECTED_final_shot.mp4` (bit-identical copy — no conform needed)
**Parent:** `reference/SELECTED_reference_frame.jpg`
**Shot prompt:** `shots/video_prompt.txt` (identical across all candidates)
**Negative prompt:** `shots/negative_prompt.txt` (applied where the model supports one)

## Candidates

| ID | Model | Native | Duration | Verdict |
|----|-------|--------|----------|---------|
| A `candA_seedance` | bytedance/seedance-2.0 | — | — | **failed** — provider content filter (E005) |
| B `candB_hailuo` | minimax/hailuo-2.3 | 1920×1080 @24 | 5.875s | rejected |
| C `candC_wan` | wan-video/wan-2.7-i2v | 1920×1080 @30 | 6.000s | rejected — runner-up |
| **D `candD_veo`** | google/veo-3.1 | 1920×1080 @24 | 6.000s | **selected** |
| E `candE_seedance1` | bytedance/seedance-1-pro | 1920×1088 @24 | 6.042s | rejected |

Every candidate was conditioned on the same approved reference frame and given the
same prompt. The only variable is the model.

Sheets: `eval/sheet_cand*.png` (6 frames each), `eval/dense_candD_veo.png` and
`eval/dense_candC_wan.png` (12 frames each, for the two finalists).

## Candidate A — replaced, not retried

`bytedance/seedance-2.0` returned `ModelError: The input or output was flagged as
sensitive (E005)` in 3.2s. This is a provider content-filter rejection of a clothed,
non-violent night portrait, not a prompt-quality failure — so the correct response
under the retry taxonomy is *capability failure → find compatible execution*, not
*prompt failure → revise instructions*. Re-running the identical input would only
re-trip the same filter, and softening the prompt to appease a filter that has not
said what it objected to would corrupt the shot for no known gain.

`bytedance/seedance-1-pro` was submitted in its place (candidate E) — same family,
same i2v conditioning, and the only other available model that supports an exact
6-second duration. `kwaivgi/kling-v2.5-turbo-pro` and `pixverse/pixverse-v5` were
both considered and dropped at schema-read: neither offers a 6s duration (5/10 and
5/8 respectively), and stretching or trimming to hit the brief's duration would
have distorted the motion contract.

## Scoring against the direction's ranked targets

| Target (ranked) | B hailuo | C wan | D veo | E seedance-1 |
|---|---|---|---|---|
| 1. Identity consistency | **fails — becomes a different, younger woman** | drifts — face slims and softens progressively | **holds across all 12 samples** | drifts at 1.2–2.4s |
| 2. Natural human motion | turn is far too fast, then a smile | turn overshoots to full frontal; mouth opens as if speaking | **turn is paced, shoulders lag, blink lands** | head oscillates — turns, returns, turns again |
| 3. Rain/night atmosphere | rain thins out, background brightens | strong, but the streak band blows out | **rain legible throughout, reflections intact** | good |
| 4. Subject/background separation | weakens as background resolves | strong | **strong and stable** | strong |
| 5. Portrait composition | drifts toward centre | push-in overshoots MCU → CU | **framing holds** | holds |

## Why D

**It is the only candidate whose identity survives the turn.** This was the
top-ranked target and it is not close. Across twelve samples spanning the full six
seconds, D holds the same brow, nose bridge, jawline, mouth, hairline, earring and
coat collar as the reference frame. B is disqualified outright — by 2.4s it is a
visibly different, younger, rounder-faced woman. C and E both drift more subtly in
the same direction: the face slims and prettifies as the shot runs, which is the
characteristic failure mode where a model gradually replaces an observed face with
its own prior.

**The performance is the one that was asked for.** D turns over roughly 0.6–2.0s
with the chin leading and the shoulders following late, lands a downward glance and
blink around 4.2s, and then holds a near three-quarter with the eyeline just off
the lens. It never smiles, never speaks and never addresses the lens. B smiles
directly into camera from 3.6s onward — an explicit negative constraint and a
complete tonal failure for a shot briefed as melancholic. C opens her mouth around
3.0s as though about to speak, and settles into a full-frontal stare rather than
the specified three-quarter. E is the most revealing failure: it animates a head
turn, reverses it, and turns again, which is what a model does when it has motion
budget and no commitment to a beat.

**Restraint.** The direction asked for a 3–5% creep. D delivers almost exactly that
— comparing first and last frames, the framing barely moves, and the composition
established at the reference frame is still intact at 6.0s. C interprets the same
instruction as a full push from medium close-up to close-up, which is a handsome
move but is not the shot, and which is what drags its composition and its identity
off target together.

## Accepted deviation: the train decelerates

The motion contract specifies a train passing at constant speed for the full six
seconds. D's train visibly **slows** — hard horizontal streak at 0.0s, resolving
into readable carriages by ~1.8s, then continuing to move slowly but legibly to the
end. It never stops and never reverses, so the "no element materialises or vanishes"
requirement holds.

This is accepted rather than corrected, for three reasons. It is physically
coherent — a train decelerating into a platform is exactly what the streak-to-detail
progression looks like. It is dramatically better than what was specified: the
background resolving as she turns gives the six seconds an arc it would not
otherwise have, and it suits a shot called *Last Train Portrait*. And correcting it
would mean re-rolling the only candidate that holds identity, to fix the
fourth-ranked target at the expense of the first. Ranked targets exist precisely to
make this trade unambiguous.

The one measurable side effect is that the background brightens slightly as the lit
carriages resolve. Measured mean luma across the shot stays within 62.8–69.9
(≈2.8% of range) with no step change, so this reads as motivated light rather than
an exposure shift. See `qc-report.md`.

## Known weaknesses carried forward

1. **The push-in is very subtle** — arguably below the "3–5%" floor. On a small
   screen it may read as a locked-off frame. Accepted: an under-moving camera is a
   far cheaper defect than an over-moving one, and every candidate that moved more
   also drifted more.
2. **Her eyeline passes close to the lens** at ~2.4s and ~4.8s. It stops short of a
   direct address, but it is nearer than the "just off-lens" the direction asked
   for.
3. **The turn completes early** (~2.0s versus the contracted 1.5–3.5s window),
   leaving roughly four seconds of hold. The hold is carried by the blink, the
   micro-settle and the resolving train, so it does not read as dead — but it is
   more hold than the contract planned for.
