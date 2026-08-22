# Shot selection

**Decision:** selected → approved → locked
**Selected:** `candC_wan.mp4` (wan-video/wan-2.7-i2v)
**Promoted to:** `SELECTED_final_shot.mp4`
**Parent:** `reference/SELECTED_reference_frame.jpg` + `shots/video_prompt.txt`

All three candidates were image-to-video from the same approved reference frame
and the same prompt, at 6s / 16:9 / 1080p. The reference frame was passed as a
data URI so the file on disk is exactly what the models received.

| ID | Model | Duration | fps | Bitrate | Audio | Verdict |
|----|-------|----------|-----|---------|-------|---------|
| A `candA_seedance` | bytedance/seedance-2.0 | 6.042s | 24 | 4.7 Mb/s | none | rejected |
| B `candB_hailuo` | minimax/hailuo-2.3 | 5.875s | 24 | 2.0 Mb/s | none | rejected |
| **C `candC_wan`** | wan-video/wan-2.7-i2v | 6.037s | 30 | 8.8 Mb/s | AAC (unrequested) | **selected** |

`google/veo-3.1` was considered and deliberately not run: it is by far the most
expensive per second and the account is under Replicate's low-credit throttle.
Three candidates across three different motion engines was the better use of
the remaining budget than one Veo run.

## Measurement method

Naive frame-difference scoring is misleading here. Steam and bubbles are
genuinely chaotic frame to frame, so a candidate is penalised *for having more
steam* — exactly backwards for this brief. Two corrections were applied:

1. **Camera isolated from content.** Motion was re-measured at 64×36 with a box
   blur, so fine turbulence averages away and only gross camera translation
   survives.
2. **Judder separated from the intended move.** A smooth camera acceleration and
   a per-frame stutter both raise variance. Frame-to-frame *jerk* against a
   9-frame moving-average envelope separates them.

`vidstabdetect` was also run, but its `.trf` output is binary in this FFmpeg
build and not worth parsing given the above was sufficient.

### Camera motion (turbulence suppressed)

| | camera speed | judder RMS | median jerk | frames with jerk >50% |
|---|---|---|---|---|
| A seedance | 0.171 (slowest) | 22.5% | 30.7% | 24.5% |
| B hailuo | 0.332 | **12.6%** | **20.2%** | **1.4%** |
| C wan | 0.471 (largest move) | 25.3% | 28.0% | 18.0% |

### Creative dimensions

| | A seedance | B hailuo | C wan |
|---|---|---|---|
| Steam visibility | very weak | **absent** | **strong, legible throughout** |
| Crema / food appeal | good | excellent | excellent |
| Liquid flow | good | excellent | very good |
| Composition held | yes | yes | yes — spouts never cropped |

## Why C

**B is the better-engineered shot and it still loses, because it does not
contain the subject.** B's camera is genuinely excellent — a constant-velocity
move with only 1.4% of frames showing significant jerk, roughly ten times
steadier than either rival — and its crema is beautiful. But B has essentially
no visible steam at any point in the six seconds. The brief names steam four
separate times: in the subject list, in the lighting requirement ("backlit
enough to reveal steam clearly"), in the motion requirement, and in the
optimise-for list. A shot missing a required subject element is a content
failure, not a quality shortfall, and no amount of viewing makes the steam
appear.

**A loses on both counts.** It has the weakest steam *and* the worst judder
(24.5% of frames above the 50% threshold), and its camera barely moves at all —
the slowest of the three, which also fails the "slow side move or slight
push-in" requirement.

**C is the shot the brief describes.** Strong backlit steam rising through the
full duration, the richest and most appetising crema churn, the most convincing
material rendering, and a camera move that actually reads as a dolly. Unlike the
frame-cropping failure mode this model can exhibit, the composition holds all
the way through — the portafilter spouts stay in frame to the last frame.

## What C gives up, and why it was not fixable

C's camera judders roughly twice as much as B's: 18% of frames show a
frame-to-frame jerk above half the mean motion, around 5 events per second. In a
slow premium macro shot that reads as a faint shimmer.

Three deterministic corrections were attempted and all three were rejected on
measurement:

| Attempt | Judder RMS | Outcome |
|---|---|---|
| baseline | 25.3% | — |
| `vidstabtransform` smoothing=20 | 24.1% | rejected — 1.2 points for a crop, zoom and resample |
| `hqdn3d=0:0:4:4` | 34.3% | rejected — made it worse |
| `hqdn3d=0:0:8:8` | 34.1% | rejected — made it worse |

Stabilisation barely moving the number is itself the diagnosis: this is not
camera-path jitter, which `vidstab` models well, but temporal inconsistency in
the generated pixels. Post cannot remove it, and the temporal denoisers traded
shimmer for ghosting. The master is therefore the shot as generated, trimmed to
spec and with the stray audio stripped — no cosmetic filtering was applied.

**If motion smoothness matters more than steam for a given use, `candB_hailuo.mp4`
is on disk and is one FFmpeg command from becoming the master.** The better fix
is a re-run of hailuo with the steam language pushed much harder in the prompt,
which would plausibly give B's camera with C's steam; that was not run here
because the budget was already committed and C satisfies the brief.
