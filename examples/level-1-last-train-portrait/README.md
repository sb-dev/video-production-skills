# Last Train Portrait

**Level 1 — 6s cinematic character shot**

A woman under a station canopy at night turns toward camera as a train passes behind her.

## Prompt

```text
Use video-production to create a 6-second cinematic character shot.

Create a moody portrait shot of a woman standing under a train station canopy at night in light rain. She turns toward camera as a train passes behind her. The shot should feel intimate, cinematic, and emotionally grounded.

Requirements:
- Duration: 6 seconds
- Format: 16:9
- Tone: cinematic, urban, slightly melancholic
- Subject: one woman in a dark coat, believable human proportions and natural movement
- Camera: restrained slow push-in or gentle lateral move
- Lighting: practical station lights, soft reflections from wet surfaces, subtle contrast
- Environment: train platform at night, light rain, passing train in the background
- Motion: subtle head/body turn, natural clothing and hair movement, moving train behind
- Focus: preserve identity consistency, believable expression, and atmospheric realism

Workflow:
- Create visual direction
- Create a reference frame for the composition
- Generate at least two shot candidates
- Select the strongest shot
- Evaluate identity stability, background motion, lighting continuity, and cinematic quality
- Run technical QC

What to optimise for:
- strong portrait composition
- natural human motion
- believable rain/night atmosphere
- identity consistency
- good separation between subject and background

```

![preview](preview.gif)

## What happened

**Visual direction.** Written first, before any generation. The load-bearing decision was
not lighting or composition but **where her head starts**. Identity consistency is the
number-one target and it is decided at the reference frame, not at the video stage: start
her from behind or in hard profile and the video model has no facial structure to work
from, so it *invents* a face during the turn — the classic identity failure. Start her
facing camera and there is no turn left to perform. The direction therefore fixes her at
three-quarter *away*, with brow, cheekbone, nose line, jaw and one eye already readable,
and deliberately specifies a small 45° turn rather than a dramatic one. Everything
expensive in the shot was pushed into the environment so the performance could stay tiny.
Two elements were made continuous rather than triggered — the train is already moving at
frame 1 and the rain never starts or stops — to avoid elements materialising from nothing.

**Reference frame.** Three candidates, one prompt, three models — the only variable is the
model. `bytedance/seedream-4.5` had the richest rain and puddle atmosphere but disqualified
itself on wardrobe: the coat hangs open on a bare chest in the rain, which is both
implausible and a production risk, since a large area of exposed skin beside a soft-edged
collar is exactly what i2v models smear. `google/nano-banana-pro` carried a hard plastic
specular sheen across the forehead and cheekbone that reads as a CG sculpt.
`black-forest-labs/flux-2-pro` won because it is the only one that looks *photographed* —
real pore structure, an actual earring, individual water droplets caught on the wool, and
flyaway hairs with water beading on them. Native 1888×1072 is not exactly 16:9, so it was
centre-cropped to 1888×1062 and Lanczos-scaled to 1920×1080 deterministically. See
`reference/selection.md`.

**The counter-intuitive part of that choice.** Seedream rendered the passing train as
detailed lit windows and body panels; flux rendered it as a band of horizontal light
streaks. On a still, seedream's looks better. For video it is the worse input — hard-edged,
semantically loaded background geometry is what an i2v model morphs while it is busy
animating a face. A streak band has nothing to morph. The direction ranks background motion
*below* identity and human motion precisely so this trade resolves without argument.

**Candidates.** Five submitted at 1080p, four returned usable video, all image-to-video
from the same approved frame passed as a data URI so the file on disk is exactly what the
models received. Same prompt for every candidate.

**Selection.** `google/veo-3.1` won on the top-ranked target and it was not close.
Across twelve samples spanning the full six seconds it holds the same brow, nose bridge,
jawline, hairline, earring and coat collar as the reference frame. Every rival drifted:
`minimax/hailuo-2.3` is a visibly different, younger woman by 2.4s — and then smiles
directly into the lens from 3.6s, violating an explicit negative constraint and inverting
the brief's tone. `wan-video/wan-2.7-i2v` was the runner-up and the most tempting: a
gorgeous move, but it reads the "slow push-in" as a full push from medium close-up to
close-up, and its face slims and prettifies as the shot runs — the characteristic failure
where a model gradually replaces an observed face with its own prior. `bytedance/seedance-1-pro`
was the most revealing failure: it turns her head, reverses it, and turns again, which is
what a model does when it has motion budget and no commitment to a beat. See
`shots/selection.md`.

**The deviation that was kept.** Veo's train *decelerates* — a hard streak at 0.0s
resolving into readable carriages by ~1.8s, still moving slowly at 6.0s. The motion
contract asked for constant speed. It was accepted rather than corrected, for three
reasons: it is physically coherent (this is what a train braking into a platform looks
like), it is dramatically better than what was specified (the background resolving as she
turns gives the six seconds an arc, and it suits a shot called *Last Train Portrait*), and
correcting it would mean re-rolling the only candidate that holds identity — trading the
first-ranked target for the fourth. Ranked targets exist to make that trade unambiguous.
The measurable side effect is a slight background brightening as the lit carriages resolve;
mean luma stays inside 62.8–69.9 of 255 with no step change, so it is motivated light, not
an exposure shift.

**Evaluation and technical QC.** Both pass; corrective action **accept**. All five
optimisation targets are passes. The master is frame-accurate at exactly 6.000s / 144
frames @ 24fps, 1920×1080, BT.709-tagged, decodes with zero errors, and has no cuts,
freezes, or black frames. Every negative constraint holds — no text or signage anywhere in
frame, no smile, no speech, no direct-to-lens address, no extra hands, no warping
architecture. Two limitations are recorded rather than fixed: the push-in is at or below the
specified 3–5% creep and may read as locked-off on a small screen, and the turn completes
at ~2.0s against a contracted 1.5–3.5s window, leaving four seconds of hold. See
`evaluation-report.md` and `qc-report.md`.

**What was retried, and what was worked around.**

- `bytedance/seedance-2.0` rejected the input with `ModelError: flagged as sensitive
  (E005)` after 3.2s — a provider content filter on a clothed, non-violent night portrait.
  Diagnosed as a **capability** failure, not a prompt failure, so it was answered by
  substituting a compatible model rather than re-running the same request or softening the
  prompt to appease a filter that had not said what it objected to.
  `bytedance/seedance-1-pro` went in its place.
- `kwaivgi/kling-v2.5-turbo-pro` and `pixverse/pixverse-v5` were considered and dropped at
  schema-read: neither supports a 6-second duration (5/10 and 5/8), and stretching or
  trimming to hit the brief would have distorted the motion contract.
- The master was encoded twice. The first pass set `colorspace=bt709` but left
  `color_primaries` and `color_transfer` unknown; fixed by writing the tags into the SPS VUI
  with `-x264-params` and re-encoding **from source**, not from the tagged output.
- The runner-up arrived with an unrequested AAC track; irrelevant in the end, but `-an` is
  in the master chain regardless so the silent-master requirement cannot depend on what a
  provider happens to return.
- `Node.js 24.12+` was unavailable (v22.16.0), so the skill-local TypeScript helpers were
  not used and the equivalent FFmpeg/ffprobe calls were run directly. ImageMagick was also
  absent, so contact sheets were built with FFmpeg's `hstack`/`vstack` filters.

## Files

| Path | What it is |
|---|---|
| `last-train-portrait-master.mp4` | **The deliverable.** 6.000s, 1920×1080, 24fps, silent |
| `preview.gif` | Looping GIF of the master — 6.000s, 480×270, 10fps, 60 frames |
| `direction/visual-direction.md` | Visual direction, written before any generation |
| `reference/prompt.txt` | The reference-frame prompt |
| `reference/SELECTED_reference_frame.jpg` | The approved reference frame, conformed to exact 16:9 |
| `reference/selection.md` | All three reference candidates, scored, with reasons |
| `shots/video_prompt.txt` | The shot prompt |
| `shots/negative_prompt.txt` | The negative prompt, applied where the model supports one |
| `shots/SELECTED_final_shot.mp4` | The selected candidate, pre-master |
| `shots/selection.md` | All five shot submissions, with reasons |
| `evaluation-report.md` | Creative evaluation against brief and direction |
| `qc-report.md` | Deterministic technical QC evidence, with commands to reproduce |
| `eval/*.png` | Contact sheets and frame-by-frame evidence (untracked) |

Rejected candidates and evidence sheets are kept on disk but not tracked, per the repo's
`.gitignore` convention — `SELECTED_*` files are the keepers.

## Models used

| Role | Model |
|---|---|
| Reference frame | `black-forest-labs/flux-2-pro` *(selected)*, `google/nano-banana-pro`, `bytedance/seedream-4.5` |
| Shot candidates | `google/veo-3.1` *(selected)*, `wan-video/wan-2.7-i2v`, `minimax/hailuo-2.3`, `bytedance/seedance-1-pro`, `bytedance/seedance-2.0` *(content-filtered)* |
| Mastering, QC, contact sheets | FFmpeg / ffprobe (deterministic, no inference) |
