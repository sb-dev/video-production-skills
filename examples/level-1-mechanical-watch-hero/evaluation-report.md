# Evaluation — Mechanical Watch Hero

**Artifact:** `mechanical-watch-hero-master.mp4`
**Artifact type:** video master (single shot)
**Lifecycle:** final
**Parents:** `direction/visual-direction.md` → `reference/SELECTED_reference_frame.jpg` → `shots/SELECTED_final_shot.mp4`
**Verdict:** **accept, with two recorded defects**

Creative and production judgement only. Technical validity is in `qc-report.md`
(verdict: pass).

---

## Summary

The master delivers the briefed shot. A black mechanical watch rests on brushed metal in a
dark studio; the camera pushes in slowly and drifts a little sideways; a hard specular streak
travels across the surface beneath it. Nothing else happens, which is correct — the brief
asked for controlled and intentional, and the strongest thing about this master is how little
it does.

The camera move is the standout. Where the two candidates differed, they differed on exactly
this, and the selected take reads as a genuine dolly-in with parallax rather than a rotating
product on a turntable. Case geometry holds throughout, indices and hands stay sharp, and the
strap's alligator grain and stitching survive at macro scale.

Two things are wrong with it, and neither is hidden:

1. **The dial lifts out of black in the last 1.5 seconds** — measurably, +8.4/255 — so the
   shot ends lighter and flatter than the low-key studio look it was briefed for.
2. **Illegible micro-text on the dial becomes legible as that happens**, against a prompt
   that explicitly forbade text appearing at any point.

Both are examined below. The verdict is accept because the first is arguably motivated light
and the second is inherited from the approved reference frame rather than invented by the
video model — but a re-run has a specific, known fix, and it is recorded at the end.

## Brief compliance

| Brief requirement | Result |
|---|---|
| Duration 6 seconds | 6.000 s exactly |
| Format 16:9 | 1920×1080, SAR 1:1 — conformed at master, see `qc-report.md` |
| Tone: luxury commercial | met — restrained, expensive, no gimmicks |
| Subject: one black mechanical watch, detailed dial, polished case, textured strap | met — croc-grain leather with visible stitching, polished applied batons |
| Camera: slow, precise push-in with a subtle lateral move | **met — the deliverable's strongest attribute** |
| Lighting: dark studio, narrow moving highlight sweeping across face and case | partial — the highlight travels the *surface*; the dial change arrives as a global lift |
| Focus: crisp dial details, indices, hands, reflections, premium material feel | met |
| Background: minimal, dark, unobtrusive | met — near-black gradient, no props |
| Motion: nothing chaotic, controlled and intentional | met |

## Against the direction's ranked optimisation targets

### 1. Premium product fidelity — strong

The watch reads as an object, not a render. The case has real PVD-black satin with a
controlled specular rim along the bezel; the crystal sits at a plausible height with a thin
edge reflection; the lugs meet the strap with correct hardware. The strap is the quiet
achievement — individual alligator scales and stitch holes stay resolved as the camera comes
in, which is where a weak i2v result usually turns leather into a dark smear.

Geometry is stable. Across twelve samples the case stays circular, the bezel keeps its width,
and the index positions stay put. There is no warping, no breathing of the case outline, and
no drift in the crown.

The caveat is the ending. See target 5.

### 2. Reflection control — strong

The brief was worried about the failure mode where a macro watch shot turns into a glare
hazard, and it does not happen here. The crystal carries a soft, shifting sheen that moves
with the camera instead of pinning to the frame, and it never covers enough of the dial to
obscure it. The brushed-metal surface reflects the light streak as an elongated, direction-
correct highlight that tracks the brushing.

Highlights are technically controlled too: the master peaks at luma 251 and never clips.
The reference frame it came from *does* clip, at 255 — so the video stage improved on its own
input here.

### 3. Readable dial details — strong

Indices, hands and the date window at 3 o'clock stay sharp and legible from the first frame
to the last. Focus stays on the dial with no rack, no hunting, and no depth-of-field breathing
beyond the gentle amount the prompt allowed. This target survives even at the end of the shot,
when the dial's *tone* goes wrong — legibility never degrades, it increases.

### 4. Smooth camera motion — strong

No shake, no jitter, no vibration, no sudden movement. The push-in is continuous and the
lateral component is small enough to read as parallax rather than a slide. Watching the
subject grow across twelve evenly-spaced samples, the rate is even; there is no ease-in
lurch and no stall.

This is also the target that decided the selection. The rejected candidate rotated the watch
instead of moving the camera — see `shots/selection.md`.

### 5. Elegant lighting transition — partial

The weakest of the five, and the source of both recorded defects.

What was asked for: "a narrow moving highlight sweeping across the watch face and case,"
reading as "one continuous, controlled pass." What was delivered: a hard-edged streak that
travels across the brushed metal in the foreground and a rim glint that moves along the bezel
— both genuinely continuous, both elegant — plus, in the final 1.5 seconds, a **global
brightening of the dial** rather than a narrow band crossing it.

Measured, mean luma is flat between 43.7 and 48.3 for the first four and a half seconds, then
rises monotonically to 52.92 at 6.0 s. There is no step change anywhere (largest single-frame
move +1.71), so it is a ramp and not a cut or an exposure snap.

Two readings are available. Charitably, a light source arriving on the dial *is* the briefed
lighting transition, just executed as a wash instead of a sweep, and the shot ends on the
product at its most visible. Less charitably, the direction asked for "deep blacks" and "high
contrast" as standing properties of the image, not as an opening state to drift away from,
and the last second no longer looks like the low-key studio hero it started as. The second
reading is the more honest one. It is accepted rather than corrected because the alternative
was the other candidate, which does the same thing two and a half times harder while also
losing the camera move.

## Negative-constraint audit

| Constraint | Source | Result |
|---|---|---|
| No chaotic camera movement | direction | **holds** — no shake, jitter or sudden move |
| No busy background, props, hands | direction | **holds** — near-black, empty |
| No warm/gold colour cast | direction | **holds** — near-monochrome; a faint warm tint under the right lug is inherited from the reference and stays local |
| No motion blur on the dial | direction | **holds** — indices legible in every sampled frame |
| No plastic-looking case material | direction | **holds** — reads as coated metal throughout |
| No flicker or strobing | direction | **holds** — no step change in luma anywhere |
| No cuts, single continuous take | direction | **holds** — 0 scene changes |
| **No text, logos, watermark or subtitles at any point** | shot prompt | **fails** — see below |

### The text failure

`shots/video_prompt.txt` ends: "No text, no logos, no watermark, no subtitles appear at any
point in the shot." Two lines of small, illegible lettering sit on the dial at the 4–5 o'clock
position. At 0.0 s they are effectively invisible against the black dial. By 6.0 s, with the
dial lifted and the camera closer, they are plainly readable *as lettering* — you cannot read
what they say, which is worse, because meaningless text on a luxury product is the exact tell
of a generated image.

The important part of the diagnosis: **the video model did not invent this.** The micro-text
is present in `reference/SELECTED_reference_frame.jpg`, and it was flagged at reference
selection as a known weakness carried forward, with the prediction that it would become
legible if anything downstream lifted the dial. That is precisely what happened. The shot
stage did not introduce a defect; it exposed one that was approved upstream.

This is why the constraint is recorded as failed even though the deliverable is accepted. A
negative constraint that is satisfied at frame 1 and violated at frame 144 was not satisfied.

### The seconds hand

Related, and the same mechanism. The reference frame's sweep hand is a thin dark line that all
but disappears into the black dial — an ambiguous element. `reference/selection.md` recorded
that an i2v model handed an ambiguous element will resolve it, and that which way it resolves
is not controllable from the reference. By 6.0 s it renders as a distinct polished seconds
hand. Not a brief violation — the brief asked for hour, minute and seconds hands — but it
means the product changes appearance during the shot, which for a product hero is a fidelity
question rather than a cosmetic one.

## Deviations, with reasoning

1. **The dial lift.** Accepted. Argued at target 5. The correction would have meant taking
   the rejected candidate, which fails a higher-ranked target.
2. **Highlight sweeps the surface, not the face.** Accepted. It is continuous, controlled and
   attractive, and it satisfies the direction's actual success criterion ("highlight sweep
   looks intentional and smooth, not glitchy") even though it is a looser reading of the
   brief's staging.
3. **No sub-dial.** The reference prompt asked for "a fine sub-dial" and the approved frame
   has none. Traded deliberately at reference selection: sub-dials are extra hard-edged
   geometry for an i2v model to keep coherent, and dial stability outranks dial complexity.
   See `reference/selection.md § Why F`.
4. **Source geometry and duration were both off-spec.** `seedance-1-pro` returned 1920×1088
   at 6.041667 s despite being asked for 16:9 and 6 seconds. Corrected deterministically at
   master — cropped, not scaled, and cropped from the top where the discarded rows are empty.
   Full reasoning and measurements in `qc-report.md § Mastering chain`. **This was the
   example's real outstanding defect**: for a long time the un-mastered shot was the only
   video artifact here, which is also why its `preview.gif` was the wrong size.

## What the production run actually cost

| Stage | Attempts | Succeeded | Recorded predict time |
|---|---|---|---|
| Reference frames | 8 | 6 | 69.8 s across the six successes |
| Shot candidates | 2 | 2 | not recorded |

Reference generation ran end to end in about two and a half minutes of wall clock
(21:50:13 → 21:52:43). The two `imagen-4-ultra` attempts cost 0.25 s and nothing respectively
— a provider 404 and a 429, neither of which produced an image.

Shot timings are unavailable: the run saved *submission* snapshots (`shots/submit_cand*.json`,
both captured with `status: "starting"`) and never captured the completed prediction records.
That is a gap in the run's own evidence, not a measurement that was taken and lost.

## Corrective action

**Accept.** The master is delivered as-is.

For any re-run of this shot, the fix is specific and upstream — it is not a video-stage
problem:

1. **Reject any reference candidate with lettering on the dial, at any size.** The prompt
   already demands a bare dial in unusually explicit terms; the selection needs to enforce it
   at 1:1 rather than at fit-to-screen, where the 4–5 o'clock text is invisible. Both
   `seedream-4` variants would need re-rolling; all four `flux` candidates fail this outright
   and more visibly.
2. **Resolve the seconds hand in the reference** — either clearly present and polished, or
   clearly absent. Do not hand the video model a hand it has to guess about.
3. **Constrain the lighting endpoint, not just its motion.** The prompt described how the
   highlight should move but never said where the dial should end up. Adding a hold condition
   ("the dial remains deep black throughout; only the bezel and surface catch the moving
   highlight") gives the model the thing it currently has no instruction about.

None of these require a different model. The two defects both trace to what the reference
frame was approved with, which is the general lesson this example carries: **the reference
stage is where a product shot is won or lost, and a defect approved there does not stay the
size it was when you approved it.**
