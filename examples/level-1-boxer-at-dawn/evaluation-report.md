# Evaluation Report — Boxer at Dawn

| | |
|---|---|
| Artifact | `boxer-at-dawn-master.mp4` |
| Type | video master (single shot) |
| Lifecycle | final |
| Decision | approved |
| Parent | `shots/SELECTED_final_shot.mp4` (candidate D, `wan-video/wan-2.7-i2v`, prompt v3) |
| Grandparent | `reference/SELECTED_reference_frame.jpg` (`bytedance/seedream-4`, prompt v2) |
| Judged against | `direction/visual-direction.md` and the brief |
| Corrective action | **accept** |

## Brief compliance

| Requirement | Result |
|---|---|
| Duration 6 seconds | Pass — exactly 6.000s / 180 frames @ 30fps |
| Format 16:9 | Pass — 1920×1080, square pixels |
| Tone: gritty but polished sports cinematography | Pass |
| Subject: one boxer striking a heavy bag | Pass — one subject, no second person |
| Camera: slow handheld push-in / restrained forward move | Pass — see Camera behaviour |
| Lighting: low-key, directional, catching sweat and chalk | Pass — see Visual clarity |
| Environment: simple gym, no visual clutter | Pass — bare concrete, one bag, no signage |
| Motion: readable punches, bag movement, body rotation, momentum | Pass — see Motion quality |
| Focus: anatomy, believable movement, impact, atmosphere | Pass — see Physical realism |

## Visual-direction compliance

All six success criteria in `direction/visual-direction.md` are met.

1. **Punch reads as a punch** — rotation → extension → contact → bag reaction, in that order,
   on each strike. Verified frame-by-frame at 10fps across the 2.1–3.5s window.
2. **Anatomy holds through the fastest frames** — two arms, two hands, correct elbow and
   shoulder articulation, gloves keeping shape and volume on contact. No morphing,
   duplication, extra digits or extra limbs found in the dense pass.
3. **Bag has weight** — the leather visibly compresses under the glove on contact, then the
   bag swings a short weighted arc on its chain and returns. Not rubbery, not floaty.
4. **One clear directional key with sweat and chalk catching it** — held for the full shot.
   Chalk dust lifts off the wraps on contact and drifts through the beam.
5. **Camera reads as a handheld operator** — not as generative drift or warp.
6. **Composition stays clean** — subject, bag, darkness, nothing else.

Two direction items were not delivered literally and are accepted as-is:

- The direction specified two or three punches; the shot lands five. They are individually
  readable and evenly distributed rather than a blurred flurry, so the intent ("strong but
  readable") is satisfied and the higher count reads as genuine mid-round bag work.
- The direction specified a key from camera left; the approved reference frame established it
  from camera right, and the shot correctly preserves the reference. Continuity with the
  approved parent outranks the earlier direction note.

## Motion quality

Five landed strikes distributed across the full six seconds with no dead stretch — the defect
that disqualified the runner-up. Each punch is thrown from the ground up: rear foot pivots,
hips rotate, shoulder drives, arm extends last. Guard returns between strikes and the stance
resets. No slow motion, no speed ramping, no stutter or dropped-frame artefacts.

## Physical realism

Impact is legible rather than implied. The clearest evidence is at 2.3–2.5s and 3.3–3.5s,
where the bag's near face dents inward around the glove before the bag moves. Momentum
carries correctly between strikes — the bag is still swinging back when the next punch meets
it. Sweat highlights shift plausibly across the deltoids and forearms as the muscles work.

## Camera behaviour

A slow, continuous forward creep across the full six seconds with faint operator-level
unsteadiness. No pan, no lateral drift, no orbit, no crane, no zoom, no rack focus, no roll.
The subject and the bag both remain in frame from the first frame to the last — the specific
failure that disqualified the motion prototype (bag exited frame at ~4.5s) and candidate A.
The framing scale is perceptibly tighter at the end than at the start, so the push-in reads
as intentional rather than static.

## Visual clarity

Low-key and high-contrast throughout, holding the approved dawn interior. Mean luma stays
within 51.1–59.8 against a 50.1 reference frame — an 8.7-point range over six seconds, with
no brightening trend. Blacks bottom out at 3 and highlights top out at 249, so shadows and
speculars both retain headroom and nothing clips. No lens flare, no blown practical, no
exposure pumping. Background is bare dark concrete with a faint cold window glow. No text,
subtitles, captions, logos, signage or watermarks appear at any point. Subject and bag are
cleanly separated by the key light; the frame is uncluttered.

## Audio

The shot carries no audio, by design. The brief specified no audio requirement and every
requirement listed is visual. The selected candidate arrived with an AAC stream that measured
as digital silence (−90.3 dB mean, −76.3 dB peak, −70 LUFS integrated), so it carried no
content and was stripped during mastering rather than re-encoded.

## Residual notes

Neither of these was judged worth another generation pass.

- The opening frames show a small gap between the extended glove and the bag where the
  reference frame had contact — the model pulls the arm back slightly as the shot starts.
  It resolves within about 0.3s and reads as the recovery from a landed punch.
- Punch count exceeds the direction's two-to-three, as described above.
