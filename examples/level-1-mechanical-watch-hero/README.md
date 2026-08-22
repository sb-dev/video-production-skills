# Mechanical Watch Hero

**Level 1 — 6s luxury product hero shot**

A slow push-in on a black mechanical watch with a moving highlight across the dial.

## Prompt

```text
Use video-production to create a 6-second luxury product hero shot.

Create a cinematic macro video of a black mechanical wristwatch resting on a brushed metal surface. The shot should feel premium, controlled, and elegant.

Requirements:
- Duration: 6 seconds
- Format: 16:9
- Tone: luxury commercial
- Subject: one black mechanical watch with a detailed dial, polished case, and visible texture on the strap
- Camera: slow, precise push-in with a subtle lateral move
- Lighting: dark studio environment with a narrow moving highlight sweeping across the watch face and case
- Focus: preserve crisp dial details, indices, hands, reflections, and premium material feel
- Background: minimal, dark, unobtrusive
- Motion: no chaotic movement; everything should feel controlled and intentional

Workflow:
- Establish concise visual direction first
- Create a reference frame before final video generation
- Generate at least two shot candidates
- Select the strongest candidate
- Run evaluation and technical QC

What to optimise for:
- premium product fidelity
- reflection control
- readable dial details
- smooth camera motion
- elegant lighting transition
```

![preview](preview.gif)

## What happened

**Visual direction.** Written first, before any generation. The decision that carried the
most weight was not lighting or lens but **what is written on the dial** — specifically, that
nothing is. Text is the worst thing you can hand an image-to-video model: it has no idea what
the letters say, so it re-invents them every frame, and a wordmark that is merely illegible on
a still becomes visibly crawling over six seconds. On a macro push-in it grows while it
crawls. So the reference prompt ends with an unusually blunt instruction — "no logo, no
wordmark, no text, no numerals, no lettering of any kind anywhere on the dial, bezel, crown,
or strap." Everything else in the direction is about restraint: one narrow highlight as the
only motion driver, a near-black background with nothing in it, and a camera move small enough
that the watch never has to survive being moved *past*.

**Reference frame.** Eight attempts, six images. `black-forest-labs/flux-1.1-pro-ultra` ran
four seeds and `bytedance/seedream-4` two; both `google/imagen-4-ultra` attempts failed
without producing anything — a provider-side 404 on the Vertex endpoint and a bare 429.

All four flux candidates put invented brand text on the dial. That is a failure against an
explicit, load-bearing constraint, and it removed the entire flux set from contention before
any question of taste. Of the two that remained, `ref_seedream_a` puts the watch on a **steel
bracelet** — the direction asks for a strap with visible texture, precisely because a textured
strap is what sells material fidelity in macro — and drives a beam of light across the frame
that blows out where it lands. `ref_seedream_b` won: centred, already at macro scale, black
alligator-grain leather with individual stitches resolved, and a genuinely deep dial (mean
luma 37/255, minimum 0). At 2560×1440 it is exactly 16:9, so it needed no conform step and
`SELECTED_reference_frame.jpg` is a byte-identical copy. See `reference/selection.md`.

**The counter-intuitive part of that choice.** The best-*looking* still in the set was
rejected. `ref_202` is a chronograph with real sub-dials, well lit, strap coiled behind the
case — and it is the only candidate that satisfies the prompt's "and a fine sub-dial" clause,
which the winner does not. Sub-dials are three extra hard-edged, semantically loaded circles
for a video model to keep coherent, on top of the brand text it already carries. A plain dial
is a worse photograph and a much better i2v input.

**Candidates.** Two, both `bytedance/seedance-1-pro`, both image-to-video from the same
approved frame passed as a data URI, same prompt, same settings. **The only variable was the
seed.** This is thinner than the later examples in this repo, which put four or five different
models against the same reference frame — it establishes that seed 22 beat seed 11, and
nothing about whether this was the right model for a macro product push-in. Worth reading as
an early example of the workflow rather than as a model recommendation.

**Selection.** Seed 22, on the target the whole brief rests on: **it moves the camera, and
seed 11 rotates the watch.** The brief asked for "a slow, precise push-in with a subtle
lateral move," which is a camera instruction; seed 11 read the lateral component as a
turntable and swung the case from three-quarter to near-frontal while sliding it toward frame
right, which is a different and much cheaper genre of product video. Seed 22 holds the
orientation and simply grows the subject. It also holds its blacks about twice as well — both
candidates lift the dial toward the end, but seed 11 lifts by +19.8/255 and ends on a flat
mid-grey, against +8.0 for seed 22. See `shots/selection.md`.

**Mastering.** Unlike the other examples here, the source did not arrive at delivery spec:
`seedance-1-pro` returned **1920×1088 at 6.041667 s** with all three colour fields unknown,
despite being asked for 16:9 and 6 seconds. 1088 is the mod-16 padded height. Conforming it
was deterministic FFmpeg work — crop rather than scale, because squashing 1088→1080 by 0.74%
puts an out-of-round case on a macro watch shot, which is the one artefact a luxury product
hero cannot carry. Which edge to crop from was measured rather than assumed: the top 8 rows
are flat near-black (peak luma 22) and the bottom 8 are lit brushed metal (peak luma 201), so
all 8 came off the top and the composed foreground survives intact. Then 145 frames trimmed to
144 for a frame-accurate 6.000 s, and BT.709 written into the SPS VUI.

**Evaluation and technical QC.** QC passes. The master is frame-accurate at exactly 6.000 s /
144 frames @ 24 fps, 1920×1080, BT.709-tagged, decodes with zero errors, no cuts, no freezes,
no black frames, and never clips white. Creative evaluation is **accept with two recorded
defects**, which is the honest verdict rather than a clean one. Four of the five optimisation
targets are strong — the camera move especially. The fifth, "elegant lighting transition," is
partial, and it takes a negative constraint down with it. See `evaluation-report.md` and
`qc-report.md`.

**What the reference frame cost later.** Both defects trace to the same place, and both were
predicted at reference selection rather than discovered at the end:

- The unbranded-dial instruction leaked slightly — `ref_seedream_b` carries faint, illegible
  micro-text at 4–5 o'clock, far smaller than the flux wordmarks, which is why it was
  accepted. It is invisible at the reference's dial brightness. Over the last 1.5 seconds the
  dial lifts by +8.4/255 and the camera gets closer, and it becomes plainly readable *as
  lettering*. The shot prompt said "No text, no logos, no watermark, no subtitles appear at
  any point in the shot." A constraint satisfied at frame 1 and violated at frame 144 was not
  satisfied.
- The reference's seconds hand is a thin dark line that all but vanishes into the black dial —
  an ambiguous element. Hand a video model an ambiguous element and it will resolve it, and
  which way it resolves is not controllable from the reference. It renders as a distinct
  polished hand by 6.0 s.

The general lesson the example carries: **the reference stage is where a product shot is won
or lost, and a defect approved there does not stay the size it was when you approved it.**

**Preview GIF.** Two-pass palette conversion from the master — 480×270, 10 fps, 60 frames, 96
colours, Bayer dithering, infinite loop. A light `hqdn3d` denoise is applied to the preview
only; it matters more here than on the other examples because almost the whole frame is
near-black gradient, which is exactly what bands at 96 colours. The master is undenoised.

**What was retried, and what failed.**

- `google/imagen-4-ultra` never returned an image. The first attempt failed in 0.25 s with a
  provider-side `404 Not Found` against the Vertex endpoint — a broken model route, not a
  rejected request — and the second came back a bare `429`. Both are infrastructure failures
  with nothing to fix in the prompt, so the run continued on the two models that were
  answering rather than burning attempts on a model that was down.
- The four `flux-1.1-pro-ultra` seeds were not retried after the text problem showed up. All
  four exhibited it, which makes it a model behaviour on this prompt rather than a seed
  unlucky draw — reseeding the same model would have been the same request expecting a
  different answer.
- `flux-1.1-pro-ultra` also returns **2752×1536**, which is 1.7917 and not 16:9, despite
  `aspect_ratio: "16:9"` being requested. Had a flux candidate won, a conform crop would have
  been needed before the video stage. `seedream-4` returns exact 16:9.
- No negative prompt was used, because `seedance-1-pro` exposes no negative-prompt field. The
  negative constraints were inlined into the positive prompt instead — strictly weaker than a
  real negative conditioning channel, and one of those inlined constraints is the one the shot
  goes on to break.
- Shot generation timings were never captured. The run saved *submission* snapshots (both with
  `status: "starting"`) and no completed prediction records, so the cost of the video stage is
  unrecorded. A gap in the run's own evidence, not a lost measurement.

## Files

| Path | What it is |
|---|---|
| `mechanical-watch-hero-master.mp4` | **The deliverable.** 6.000s, 1920×1080, 24fps, silent |
| `preview.gif` | Looping GIF of the master — 6.000s, 480×270, 10fps, 60 frames |
| `direction/visual-direction.md` | Visual direction, written before any generation |
| `reference/prompt.txt` | The reference-frame prompt |
| `reference/SELECTED_reference_frame.jpg` | The approved reference frame, native exact 16:9 |
| `reference/selection.md` | All eight reference attempts, scored, with reasons |
| `reference/pred_*.json` | Prediction records for every reference attempt, including the two failures |
| `shots/video_prompt.txt` | The shot prompt (no negative prompt — the model supports none) |
| `shots/SELECTED_final_shot.mp4` | The selected candidate, pre-master — 1920×1088, 6.042s |
| `shots/selection.md` | Both shot submissions, with reasons |
| `shots/submit_cand*.json` | Submission snapshots for both candidates |
| `evaluation-report.md` | Creative evaluation against brief and direction |
| `qc-report.md` | Deterministic technical QC evidence, with commands to reproduce |
| `eval/*.png` | Contact sheets and frame-by-frame evidence (untracked) |

Rejected candidates and evidence sheets are kept on disk but not tracked, per the repo's
`.gitignore` convention — `SELECTED_*` files are the keepers.

This example predates the `skills-lock.json` and vendored `.claude/skills/` convention the
later examples ship, and so does not carry them.

## Models used

| Role | Model |
|---|---|
| Reference frame | `bytedance/seedream-4` *(selected)*, `black-forest-labs/flux-1.1-pro-ultra`, `google/imagen-4-ultra` *(provider 404 / 429 — no output)* |
| Shot candidates | `bytedance/seedance-1-pro` *(selected, seed 22; both candidates were this model)* |
| Mastering, QC, contact sheets | FFmpeg / ffprobe (deterministic, no inference) |
