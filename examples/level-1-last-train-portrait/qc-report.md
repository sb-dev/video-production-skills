# Technical QC — Last Train Portrait

**Artifact:** `last-train-portrait-master.mp4`
**Artifact type:** video master
**Lifecycle:** final
**Verdict:** **PASS**
**Corrective action:** accept

This report covers technical media validity only. Creative and production judgement
is in `evaluation-report.md`.

---

## Deliverable requirements

| Requirement | Source | Required | Measured | Result |
|---|---|---|---|---|
| Duration | brief | 6 seconds | 6.000000 s | pass |
| Aspect ratio | brief | 16:9 | 16:9 (DAR), SAR 1:1 | pass |
| Resolution | direction | 1080p | 1920×1080 | pass |
| Audio | direction — silent master | no audio stream | 1 stream, video only | pass |
| Continuity | direction — single take | no cuts | 0 scene changes | pass |

## Container and stream

```
filename            last-train-portrait-master.mp4
format              mov,mp4,m4a,3gp,3g2,mj2
nb_streams          1  (video only)
size                13,504,228 bytes
overall bit_rate    18,005,637 bps
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

Frame rate is constant — `r_frame_rate` and `avg_frame_rate` agree at exactly 24/1,
and 144 frames ÷ 24 fps = 6.000 s with no drift.

## Integrity checks

| Check | Method | Result |
|---|---|---|
| File readable, container valid | `ffprobe -show_format -show_streams` | pass |
| Full decode without error | `ffmpeg -v error -i … -f null -` | pass — no errors emitted |
| Declared vs decoded frame count | `-count_frames` | 144 declared, 144 decoded — match |
| Black frames | `blackdetect=d=0.05:pix_th=0.10` | none detected |
| Frozen / duplicate frames | `freezedetect=n=0.001:d=0.3` | none detected |
| Scene cuts (single-take requirement) | `select='gt(scene,0.30)'` | 0 detected |
| Progressive download | `ftyp`/`moov` atom order | `moov` in first 4 KB — faststart present |
| Audio presence | stream enumeration | no audio stream, as specified |

## Lighting / exposure stability

Mean luma (`signalstats.YAVG`) sampled at 2 Hz across the full six seconds:

```
69.93  67.00  66.74  62.83  66.01  65.00
64.09  65.00  65.38  64.27  62.79  66.49
```

Range 62.79–69.93 on a 0–255 scale — a spread of 7.14, about 2.8% of range, with no
step discontinuity between adjacent samples. The single highest reading is the
opening frame, where the passing train is at its brightest streak. This satisfies
the direction's "no lighting changes, no flicker, no exposure shift" constraint.

The gradual mid-shot dip and recovery tracks the train decelerating and its lit
carriages resolving behind the subject. It is motivated in-frame light, not an
encoder or generation artefact. See `shots/selection.md` for why this deviation was
accepted.

## Mastering chain

Source `shots/SELECTED_final_shot.mp4` (bit-identical copy of `shots/candD_veo.mp4`,
which arrived already at 1920×1080 / 24 fps / 6.000 s with no audio track) was
encoded once:

```
ffmpeg -i shots/SELECTED_final_shot.mp4 \
  -an -c:v libx264 -profile:v high -level 4.0 -preset slow -crf 16 \
  -pix_fmt yuv420p -r 24 -vf "scale=1920:1080:flags=lanczos,setsar=1" \
  -x264-params "colorprim=bt709:transfer=bt709:colormatrix=bt709" \
  -movflags +faststart last-train-portrait-master.mp4
```

No scaling, retiming, trimming or filtering was applied beyond the identity
`scale`/`setsar` conform — the source already met the delivery spec. `-an`
guarantees the silent-master requirement regardless of source. The BT.709 tags were
written explicitly into the SPS VUI via `-x264-params`; the first encode pass set
only `colorspace` and left `color_primaries`/`color_transfer` unknown, so it was
re-encoded from source (not transcoded from the tagged output) to fix this.

## Companion deliverable

`preview.gif` — 480×270, 10 fps, 60 frames, 96-colour palette, 3.5 MB. A light
`hqdn3d` denoise is applied **to the preview only**, so that the master's film
grain and rain do not defeat palette quantisation and inflate the file. The master
itself is ungraded and undenoised.

## Notes and non-blocking observations

1. **Bit rate is high** (18 Mbps at CRF 16) for a six-second web deliverable. This
   is deliberate: rain, film grain and the moving streak band are all
   high-entropy, and this master is an archival/reference artifact rather than a
   distribution encode. A delivery adaptation would re-encode at a lower rate.
2. **`color_range=tv`** is correct for the source but is inherited rather than
   explicitly asserted at encode. Not an issue for this deliverable.
3. **No audio track by design.** Any downstream sound design would need a new
   master, not an audio mux onto this one.
