# Technical QC — Mechanical Watch Hero

**Artifact:** `mechanical-watch-hero-master.mp4`
**Artifact type:** video master
**Lifecycle:** final
**Verdict:** **PASS**
**Corrective action:** accept

This report covers technical media validity only. Creative and production judgement is in
`evaluation-report.md`.

---

## Deliverable requirements

| Requirement | Source | Required | Measured | Result |
|---|---|---|---|---|
| Duration | brief | 6 seconds | 6.000000 s | pass |
| Aspect ratio | brief | 16:9 | 16:9 (DAR), SAR 1:1 | pass |
| Resolution | direction | 1080p | 1920×1080 | pass |
| Audio | direction — silent master | no audio stream | 1 stream, video only | pass |
| Continuity | direction — single take | no cuts | 0 scene changes | pass |

The source shot met **none** of the first three. See `## Mastering chain`.

## Container and stream

```
filename            mechanical-watch-hero-master.mp4
format              mov,mp4,m4a,3gp,3g2,mj2
nb_streams          1  (video only)
size                5,399,376 bytes
overall bit_rate    7,199,168 bps
start_time          0.000000
duration            6.000000
```

```
codec               h264 / High profile / level 4.0
width × height      1920 × 1080  (coded 1920 × 1080)
sample AR           1:1
display AR          16:9
pix_fmt             yuv420p
color_range         tv
color_space         bt709
color_transfer      bt709
color_primaries     bt709
r_frame_rate        24/1
avg_frame_rate      24/1
nb_frames           144
```

Frame rate is constant — `r_frame_rate` and `avg_frame_rate` agree at exactly 24/1, and
144 frames ÷ 24 fps = 6.000 s with no drift.

## Integrity checks

| Check | Method | Result |
|---|---|---|
| File readable, container valid | `ffprobe -show_format -show_streams` | pass |
| Full decode without error | `ffmpeg -v error -i … -f null -` | pass — no errors emitted |
| Declared vs decoded frame count | `-count_frames` | 144 declared, 144 decoded — match |
| Black frames | `blackdetect=d=0.05:pix_th=0.10` | none detected |
| Frozen / duplicate frames | `freezedetect=n=0.001:d=0.5` | none detected |
| Scene cuts (single-take requirement) | `select='gt(scene,0.25)'` | 0 detected |
| Progressive download | `ftyp`/`moov` atom order | `moov` before `mdat` — faststart present |
| Audio presence | stream enumeration | no audio stream, as specified |

## Lighting / exposure stability

Mean luma (`signalstats.YAVG`) sampled at 2 Hz across the full six seconds:

```
45.06  48.28  46.86  45.81  44.98  44.53
44.36  43.73  43.68  44.48  47.74  50.69
```

Range 43.52–52.92 on a 0–255 scale — a spread of 9.40, about 3.7% of range. The largest
single-frame move anywhere in the clip is **+1.71**, so there is no step discontinuity: this
is a ramp, not a cut or an exposure snap.

The shape is not flat, and it is the shot's one substantive deviation. Luma sits inside
43.7–48.3 for the first four and a half seconds, then rises monotonically from 44.48 at
4.5 s to 52.92 at 6.0 s — a **+8.4 lift concentrated in the final 1.5 seconds**, as the
highlight arrives on the dial. It is continuous and in-frame-motivated rather than an encoder
or retiming artefact, which is why this report passes it; whether it should have been
accepted creatively is argued in `evaluation-report.md § Deviations` and
`shots/selection.md`.

Dynamic range is intact throughout: YMIN reaches 1 and YMAX peaks at 251, so the master
holds true blacks and never clips white. (The reference frame it came from *does* clip, at
YMAX 255 — the video model rendered the specular slightly softer than its input.)

## Mastering chain

Unlike the other examples in this repo, the source here did **not** arrive at delivery spec.
`shots/SELECTED_final_shot.mp4` (bit-identical copy of `shots/candB.mp4`) measured:

```
1920 × 1088     not 16:9 — 1.7647
145 frames      6.041667 s at 24/1
color_primaries / transfer / space  all "unknown"
no audio stream
```

`bytedance/seedance-1-pro` returned this despite being asked for `aspect_ratio: "16:9"` and
`duration: 6`. 1088 is the mod-16 padded height; the extra frame is the model's own rounding.

Encoded once, from source:

```
ffmpeg -y -i shots/SELECTED_final_shot.mp4 \
  -frames:v 144 -an \
  -vf "crop=1920:1080:0:8,setpts=PTS-STARTPTS,setsar=1" \
  -c:v libx264 -profile:v high -level 4.0 -preset slow -crf 16 \
  -pix_fmt yuv420p -r 24 \
  -x264-params "colorprim=bt709:transfer=bt709:colormatrix=bt709" \
  -movflags +faststart mechanical-watch-hero-master.mp4
```

Three substantive operations:

1. **`crop=1920:1080:0:8` — geometry, not scale, and all 8 rows off the top.** Scaling
   1088→1080 would have squashed the frame by 0.74%, which on a macro product shot means an
   out-of-round watch case — the one artefact a luxury product hero cannot carry. So the
   surplus is cropped, and *where* it is cropped from was measured rather than assumed. The
   two edge bands are not equivalent:

   | Band (source) | YAVG across all 145 frames | YMAX |
   |---|---|---|
   | top 8 rows | 16.23 – 19.08 | 22 |
   | bottom 8 rows | 75.63 – 95.62 | 201 |

   The top band is flat near-black background gradient carrying no information. The bottom
   band is lit brushed metal — the foreground surface and the leading edge of the light
   streak. A symmetric centre crop would have shaved four rows off composed, lit foreground
   for no reason. Taking all 8 from the top costs nothing measurable.
2. **`-frames:v 144` — frame-accurate 6.000 s.** Drops the 145th frame and conforms
   6.041667 s to exactly 6.000 s. `setpts=PTS-STARTPTS` resets presentation timestamps to
   zero so the container start time is clean.
3. **BT.709 written into the SPS VUI** via `-x264-params`, since all three colour fields
   arrived unknown. Setting `colorspace` alone leaves `color_primaries` and `color_transfer`
   unset — verified by ffprobe rather than assumed.

`-an` guarantees the silent-master requirement regardless of source; the source happened to
carry no audio stream at all, so nothing was discarded.

## Companion deliverable

`preview.gif` — converted from the master by FFmpeg, deterministically. No generative
inference was used.

| Check | Requirement | Measured | Result |
|---|---|---|---|
| Duration | matches master | 6.000000 s | pass |
| Frame count | 6s @ 10fps | 60 frames | pass |
| Frame rate | — | 10/1 | pass |
| Resolution | 16:9 | 480 × 270 (1.7778) | pass |
| Looping | infinite | NETSCAPE2.0, loop count 0 | pass |
| File size | — | 2,938,318 bytes | pass |

```
ffmpeg -y -i mechanical-watch-hero-master.mp4 \
  -vf "hqdn3d=2:1.5:6:6,fps=10,scale=480:-1:flags=lanczos,split[s0][s1];\
[s0]palettegen=max_colors=96:stats_mode=diff[p];\
[s1][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" \
  -loop 0 preview.gif
```

Two-pass palette at 96 colours with Bayer dithering and Lanczos downscaling, with a light
`hqdn3d=2:1.5:6:6` pass applied **to the preview only**. This matters more here than on the
other examples: almost the entire frame is near-black gradient, which is exactly what
palettises into visible banding at 96 colours. The master itself is undenoised.

**This gif was previously 360×204** — built directly from the un-mastered 1920×1088 shot, so
`scale=480:-1` resolved to 360×204 and the file was both smaller than and a different shape
from every other example's preview. Building it from the conformed master fixes it at the
source. All four Level‑1 previews now measure 480×270 / 10 fps / 60 frames / 6.000 s.

## Notes and non-blocking observations

1. **Bit rate is 7.2 Mbps at CRF 16** — roughly 40% of the Last Train master's, on an
   identical encoder setting. Expected: this frame is mostly smooth near-black gradient with
   a single small high-detail region, so there is far less entropy to spend bits on.
2. **`color_range=tv`** is correct for the source but is inherited rather than explicitly
   asserted at encode. Not an issue for this deliverable.
3. **8 rows lost from the top** to the crop, none from the bottom. Measured rather than
   assumed — see the band table in `## Mastering chain`. Nothing in the discarded band
   exceeds luma 22 on any of the 145 source frames.
4. **No audio track by design.** Any downstream sound design would need a new master, not an
   audio mux onto this one.
5. **This master did not exist until the example was revisited.** The run originally shipped
   the raw 1920×1088 shot as its only video artifact and no QC report at all. Every
   measurement above is from the new encode; there is no prior QC pass to compare against.
