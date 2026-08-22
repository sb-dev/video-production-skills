# Shot selection

**Decision:** selected → approved
**Selected:** `candB.mp4` (bytedance/seedance-1-pro, seed 22)
**Promoted to:** `SELECTED_final_shot.mp4` (bit-identical copy — md5 `fac350aa9daaa36343df0a3b54a352f7`)
**Parent:** `reference/SELECTED_reference_frame.jpg`
**Shot prompt:** `shots/video_prompt.txt` (identical across both candidates)
**Negative prompt:** none — see below

## Candidates

| ID | Model | Seed | Native | Duration | Verdict |
|----|-------|------|--------|----------|---------|
| A `candA` | bytedance/seedance-1-pro | 11 | 1920×1088 @24 | 6.042s / 145f | rejected |
| **B `candB`** | bytedance/seedance-1-pro | 22 | 1920×1088 @24 | 6.042s / 145f | **selected** |

Both were image-to-video from the same approved reference frame, passed as a data URI
(`reference/ref_frame_datauri.txt`) so the file on disk is exactly what the model received.
Both ran `duration: 6`, `resolution: 1080p`, `aspect_ratio: "16:9"`, `fps: 24`,
`camera_fixed: false`. **The only variable is the seed.**

Sheets: `eval/sheet_candA.png` and `eval/sheet_candB.png` (7 frames each).

## A note on method

This is a two-seed comparison of one model, not a multi-model bake-off. The later examples
in this repo (Boxer at Dawn, Midnight Espresso, Last Train Portrait) submit four or five
*different* models against the same reference frame and pick between them. This run predates
that convention and is weaker for it: it establishes that seed 22 beats seed 11 on
`seedance-1-pro`, and nothing at all about whether `seedance-1-pro` was the right model for
a macro product push-in. The comparison below is real and the winner is clearly better than
the loser, but the search was narrow. Read it as an early example of the workflow, not as a
model recommendation.

**No negative prompt.** `bytedance/seedance-1-pro` exposes no negative-prompt field in its
schema, which is why there is no `shots/negative_prompt.txt` here alongside the other
examples' copies. The negative constraints were folded into the positive prompt instead —
`shots/video_prompt.txt` closes with "no shake, no jitter, no vibration, no sudden movement"
and "No text, no logos, no watermark, no subtitles appear at any point in the shot" — with
the full avoid-list living in `direction/visual-direction.md`. Inlining is strictly weaker
than a real negative conditioning channel, and one of those inlined constraints is the one
the shot goes on to break.

## Scoring against the direction's success criteria

| Criterion | A (seed 11) | B (seed 22) |
|---|---|---|
| Camera motion is a push-in, not subject motion | **fails — the watch itself rotates** | **passes — camera moves, subject holds** |
| Dial legible across the full 6s | passes | passes |
| Deep blacks held | **fails — dial washes to mid-grey** | partial — lifts late, less far |
| Highlight sweep reads as one controlled pass | weak — surface streak fades out | **passes — streak persists and travels** |
| No warping of watch geometry | moderate — case proportions shift | **passes — geometry stable** |
| Composition survives the move | **fails — subject drifts to frame right** | **passes — stays centred** |

## Why B

**A rotates the watch; B moves the camera.** This is the whole decision. The brief asked for
"a slow, precise push-in with a subtle lateral move" — a *camera* instruction. Seed 11 read
the lateral component as a turntable: across its seven samples the case swings from a
three-quarter view to near-frontal and slides toward frame right, so the product appears to
be spinning on a display stand. That is a different, cheaper genre of product video, and it
also means the dial that was composed in the reference is not the dial on screen at 6.0s.
Seed 22 holds the case at a fixed three-quarter orientation and simply grows it, with a small
drift — a real dolly-in with parallax, which is what was specified.

**B holds its blacks roughly twice as well.** Both candidates lift the dial toward the end of
the shot; this is the model's failure mode on this input, not a seed quirk, and neither
escapes it. But the magnitude differs enough to decide between them:

| | A (seed 11) | B (seed 22) |
|---|---|---|
| YAVG at 0.0s | 44.86 | 44.83 |
| YAVG at 6.0s | 64.66 | 52.78 |
| Total lift | **+19.80** | **+7.95** |

A does not just lift, it *arrives somewhere else*: by its final samples the dial is a flat
mid-grey and the deep low-key studio the direction specified is gone. B's dial is still
recognisably dark at 6.0s. Neither is clean; one is recoverable and one is not.

**The trade B loses.** A's late frames are, in isolation, better *product* frames — a
brighter dial shows the indices and the lume fill more clearly, which is what a catalogue
shot wants. The brief did not ask for a catalogue shot. It asked for "dark studio
environment," "deep blacks," and "luxury commercial" tone, and it ranked material fidelity
and controlled lighting above dial exposure. A wins a criterion that was not being optimised
for, by breaking three that were.

## Conform

None applied at this stage. `SELECTED_final_shot.mp4` is a bit-identical copy of `candB.mp4`.

Note that seedance-1-pro returned **1920×1088, 145 frames, 6.041667s** — neither 16:9 nor the
briefed 6.000s, despite `aspect_ratio: "16:9"` and `duration: 6` being requested. 1088 is the
mod-16 padded height. Conforming it is the master's job, not the shot's; see
`qc-report.md § Mastering chain`.

## Known weaknesses carried forward

1. **The dial lifts in the last ~1.5 seconds** — mean luma is flat for the first four and a
   half seconds, then rises monotonically by about +8.4/255 to the final frame. Read as
   motivated light (the highlight arriving on the dial) rather than an exposure drift,
   because there is no step change; the largest single-frame move anywhere in the clip is
   +1.7/255. Full per-frame measurements in `qc-report.md § Lighting / exposure stability`.
   Accepted. It is the shot's main creative defect and it is documented rather than hidden.
2. **The reference frame's micro-text becomes legible as the dial lifts.** The faint 4–5
   o'clock lettering flagged in `reference/selection.md § Known weaknesses` is invisible at
   0.0s and readable-as-lettering by 6.0s. The prompt explicitly forbade text appearing "at
   any point in the shot." This is inherited, not invented — but the shot is where it becomes
   visible.
3. **A seconds hand resolves out of the ambiguity.** The reference's thin, near-invisible
   sweep hand renders as a distinct polished hand once the dial brightens. Predicted in
   `reference/selection.md` as the risk of handing an i2v model an ambiguous element.
4. **The highlight sweeps the surface more than the dial.** The brief asked for "a narrow
   moving highlight sweeping across the watch face and case." What the shot delivers is a
   hard streak travelling across the brushed metal in the foreground plus a bezel rim glint,
   with the dial change arriving as a global lift rather than a narrow travelling band. It
   is elegant and it is continuous, but it is a looser reading of the instruction than a
   sweep across the face.
