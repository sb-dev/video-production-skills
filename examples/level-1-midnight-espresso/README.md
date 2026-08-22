# Midnight Espresso

**Level 1 — 6s food/product commercial shot**

An espresso machine pours into a ceramic cup with visible steam and warm backlight.

## Prompt

```text
Use video-production to create a 6-second food/product commercial shot.

Create a cinematic macro shot of an espresso machine dispensing coffee into a ceramic cup. The result should feel rich, warm, tactile, and premium.

Requirements:
- Duration: 6 seconds
- Format: 16:9
- Tone: high-end coffee commercial
- Subject: espresso machine, flowing espresso, ceramic cup, rising steam
- Camera: slow side move or slight push-in
- Lighting: warm, moody, backlit enough to reveal steam clearly
- Focus: coffee texture, crema, ceramic surface, metallic machine details
- Environment: clean tabletop setup, visually simple, no clutter
- Motion: smooth pour, visible steam, slight natural movement in the liquid

Workflow:
- Define visual direction first
- Create a reference frame
- Produce at least two video candidates
- Select the strongest result
- Evaluate food appeal, liquid realism, steam visibility, and motion quality
- Run technical QC

What to optimise for:
- appetising texture
- believable liquid flow
- visible steam
- warm commercial lighting
- premium material detail
```

![preview](preview.gif)

## What happened

**Visual direction.** Written first, before any generation. Locked the subject list, a
low-key 3000K key with a hard backlight whose *functional* job is to separate the steam, a
single continuous lateral dolly with a slight push-in, and a bare tabletop. The key decision
was a motion contract in which the pour is already running at frame 1 and still running at
frame 180 — a stream that materialises from nothing, and a cup that fills impossibly fast,
are the two most common generative failures for this shot, and starting mid-pour avoids both.

**Reference frame.** Three candidates across two models. The two `bytedance/seedream-4.5`
candidates were handsome and had the more dramatic rim light, but both carried the same tell:
a crisp high-contrast crema spiral that reads as *drawn on top of* the surface rather than as
coffee. `google/nano-banana-pro` won on the brief's number-one target — its crema is genuine
marbled mottle with irregular bubble clusters — plus the largest steam column and the
simplest frame. Its native 2752×1536 is not exactly 16:9, so it was centre-cropped and scaled
to 2560×1440 deterministically. See `reference/selection.md`.

**Candidates.** Three at 1080p, one per motion engine, all image-to-video from the same
approved frame with the frame passed as a data URI so the file on disk is exactly what the
models received. `google/veo-3.1` was considered and deliberately skipped — it is by far the
most expensive per second and the account was under Replicate's low-credit throttle
(6 predictions/min, burst 1), so three engines beat one premium run.

**Measurement.** Naive frame-differencing is actively misleading here: steam and bubbles are
chaotic frame to frame, so it penalises a candidate *for having more steam* — exactly
backwards for this brief. Two corrections were applied. Motion was re-measured at 64×36 with
a box blur so only gross camera translation survives, and frame-to-frame **jerk** was scored
against a moving-average envelope to separate a smooth camera acceleration from a per-frame
stutter. That reordered the results.

**Selection.** `minimax/hailuo-2.3` produced the best-engineered shot by a distance — a
constant-velocity move with only 1.4% of frames showing significant jerk, roughly ten times
steadier than either rival, and a beautiful crema. It was still rejected, because it has
essentially **no visible steam** at any point in the six seconds. The brief names steam four
times; a missing subject element is a content failure, not a quality shortfall.
`bytedance/seedance-2.0` lost on both counts — weakest steam *and* worst judder, with a camera
that barely moves. `wan-video/wan-2.7-i2v` was selected: strong backlit steam throughout, the
richest crema churn, and a camera move that holds composition to the last frame. See
`shots/selection.md`.

**The trade, and the three fixes that failed.** The selected shot judders about twice as much
as the rejected hailuo candidate — 18% of frames exceed the jerk threshold, ~5 events/second.
Three deterministic corrections were attempted and all three rejected on measurement:
`vidstabtransform` recovered only 1.2 points (25.3% → 24.1%) in exchange for a crop and
resample, and two strengths of `hqdn3d` temporal denoise made it measurably *worse* (→ 34%).
Stabilisation barely moving the number is itself the diagnosis — this is temporal
inconsistency in the generated pixels, not camera-path jitter, so post cannot remove it. The
master is the shot as generated, with **no cosmetic filtering applied**.

**Preview GIF.** `preview.gif` is a delivery adaptation of the master, converted
deterministically with FFmpeg — two-pass palette (`palettegen stats_mode=diff` →
`paletteuse diff_mode=rectangle`) at 480×270, 10fps, 96 colours, Bayer dithering, infinite
loop. It runs the full 6.000s at 2.4 MB. A light `hqdn3d` pass runs before palettisation: at a
96-colour depth the master's fine sensor texture turns into blotchy dither across the large
dark background rather than reproducing as texture, so smoothing it first gives a cleaner
*and* smaller file — 2.4 MB against 3.0 MB without it, at the same resolution. Checked against
the undenoised version frame by frame to confirm the steam plume survives intact, since steam
is the reason this candidate was selected at all. The master itself is untouched.

**Evaluation and technical QC.** Both pass; corrective action **accept**. Four of five
optimisation targets are unqualified passes and the fifth, motion quality, is the one recorded
limitation. The master is frame-accurate at exactly 6.000s / 180 frames @ 30fps, 1920×1080,
bt709-tagged, decodes with zero errors, and has no cuts, freezes, or black frames. Blacks
bottom at 11 and highlights top at 245, so nothing clips at either end. A 31-point brightness
rise was flagged and investigated: the largest single-frame change is 0.75 of 255 (~1%), so it
is a smooth ramp as the camera pushes into the light, not flicker. Kept as an improvement.
See `evaluation-report.md` and `qc-report.md`.

**What was retried, and what was worked around.**

- The account sat under Replicate's low-credit throttle for the whole run. The first parallel
  submission returned three `429`s, and an initial retry loop was ineffective because its
  delay used a non-realtime FFmpeg call that returned instantly. Fixed with real pacing;
  every subsequent submission succeeded first or second attempt.
- A fourth reference candidate (`google/imagen-4-ultra`) was dropped rather than retried —
  three candidates had already resolved the composition decision, and the remaining credit was
  better spent on video.
- The selected candidate arrived at 30fps with an unrequested AAC track. Audio stripped at
  master; 30fps **preserved rather than resampled** to 24, because conversion would inject
  duplicate or interpolated frames into a shot already carrying temporal shimmer.
- `Node.js 24.12+` was unavailable (v22.16.0), so the skill-local TypeScript helpers were not
  used and the equivalent FFmpeg/ffprobe calls were run directly. ImageMagick was also absent,
  so contact sheets were built with FFmpeg's `tile` filter.

## Files

| Path | What it is |
|---|---|
| `midnight-espresso-master.mp4` | **The deliverable.** 6.000s, 1920×1080, 30fps, silent |
| `preview.gif` | Looping GIF of the master — 6.000s, 480×270, 10fps, 60 frames |
| `direction/visual-direction.md` | Visual direction, written before any generation |
| `reference/prompt.txt` | The reference-frame prompt |
| `reference/SELECTED_reference_frame.jpg` | The approved reference frame, conformed to exact 16:9 |
| `reference/selection.md` | All three reference candidates, scored, with reasons |
| `shots/video_prompt.txt` | The shot prompt |
| `shots/SELECTED_final_shot.mp4` | The selected candidate, pre-master |
| `shots/selection.md` | All three shot candidates, with measurements and reasons |
| `evaluation-report.md` | Creative evaluation against brief and direction |
| `qc-report.md` | Deterministic technical QC evidence, with commands to reproduce |
| `eval/*.png` | Contact sheets and frame-by-frame evidence (untracked) |

Rejected candidates and evidence sheets are kept on disk but not tracked, per the repo's
`.gitignore` convention — `SELECTED_*` files are the keepers.

## Models used

| Role | Model |
|---|---|
| Reference frame | `google/nano-banana-pro` *(selected)*, `bytedance/seedream-4.5` ×2 |
| Shot candidates | `wan-video/wan-2.7-i2v` *(selected)*, `minimax/hailuo-2.3`, `bytedance/seedance-2.0` |
| Mastering, QC, contact sheets | FFmpeg / ffprobe (deterministic, no inference) |
