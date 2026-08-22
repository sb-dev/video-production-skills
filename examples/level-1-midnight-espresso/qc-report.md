# Technical QC — `midnight-espresso-master.mp4`

**Verdict: PASS.** Valid for delivery.

All checks run with FFmpeg/ffprobe. `Node.js 24.12+` was unavailable (v22.16.0
installed) so the skill-local TypeScript helpers were not used; the equivalent
FFmpeg/ffprobe invocations were run directly. ImageMagick was also unavailable,
so contact sheets were built with FFmpeg's `tile` filter instead.

## Container and stream

| Property | Value | Check |
|---|---|---|
| Duration | **6.000000 s** | ✅ exact spec |
| Frames | 180 @ 30 fps CFR | ✅ 180/30 = 6.000 |
| Resolution | 1920×1080 | ✅ |
| Aspect | 1.7778 (= 16/9 exactly) | ✅ |
| Codec | H.264 High@4.0 | ✅ |
| Pixel format | yuv420p | ✅ widest compatibility |
| Colour | bt709 primaries / transfer / matrix | ✅ tagged, not just assumed |
| Audio streams | none | ✅ silent master as specified |
| Bitrate | 9.46 Mb/s | ✅ above the 8.8 Mb/s source, no added generational loss |
| `faststart` | yes | ✅ streams without full download |

The source candidate arrived with an unrequested AAC track. It was stripped at
master (`-an`); stream inventory confirms a single video stream.

## Integrity

| Check | Result |
|---|---|
| Full decode of all 180 frames | ✅ clean, no errors or warnings |
| Scene changes (threshold 0.25) | ✅ 0 — single continuous take, no cuts |
| Freeze segments (>0.3 s) | ✅ 0 — no duplicated or stalled frames |
| Black / blank frames | ✅ 0 |

## Levels

| Measurement | Value | Check |
|---|---|---|
| YMIN across shot | 11 – 16 | ✅ no crushed blacks (never ≤1) |
| YMAX across shot | 238 – 245 | ✅ no clipped highlights (never ≥254) |
| YAVG across shot | 62.2 – 93.3 | ⚠️ see below |
| Chroma U | 59 – 139 | ✅ |
| Chroma V | 120 – 178 | ✅ warm bias, no cool cast anywhere |

Shadow and highlight headroom are intact at both ends: nothing is clipped and
nothing is crushed, so the master will survive a downstream grade.

### ⚠️ Exposure drift — investigated, not a defect

Frame average rises 62.2 → 93.3, a swing of 31 (~50%). That magnitude would
normally indicate flicker, so it was checked frame by frame:

```
t=0.0s  62.49     t=3.0s  76.59
t=0.5s  63.69     t=3.5s  80.04
t=1.0s  66.13     t=4.0s  84.43
t=1.5s  68.59     t=4.5s  90.17
t=2.0s  71.00     t=5.0s  92.75
t=2.5s  74.07     t=5.5s  90.38
```

A clean monotonic ramp that eases off at the end. **Largest single-frame change
is 0.75 of 255 (~1%)** — flicker would show large alternating jumps. This is the
camera pushing toward the cup while a warm practical grows in the upper left.
Recorded as an accepted creative deviation in `evaluation-report.md`, not a
technical fault.

## Known limitation (not a QC failure)

The selected shot carries per-frame temporal shimmer: 18% of frames show a
frame-to-frame jerk above half the mean camera motion. This is generative
temporal inconsistency, not a container, encode, or transport defect, so it does
not affect the PASS verdict. Three deterministic corrections were attempted and
all were rejected on measurement — see `shots/selection.md` for the numbers.

## Reproducing these checks

```bash
# container, streams, timing
ffprobe -v error -show_entries format=duration,size,bit_rate \
  -show_entries stream=codec_type,codec_name,width,height,r_frame_rate,nb_frames,pix_fmt,color_space \
  -of default=noprint_wrappers=1 midnight-espresso-master.mp4

# decode integrity
ffmpeg -v error -i midnight-espresso-master.mp4 -f null -

# cuts, freezes, black frames
ffmpeg -v error -i midnight-espresso-master.mp4 -vf "select='gt(scene,0.25)',metadata=print" -f null -
ffmpeg -v error -i midnight-espresso-master.mp4 -vf freezedetect=n=0.002:d=0.3 -f null -
ffmpeg -v error -i midnight-espresso-master.mp4 -vf blackdetect=d=0.05:pic_th=0.98 -f null -

# levels
ffprobe -v error -f lavfi -i "movie=midnight-espresso-master.mp4,scale=640:360,signalstats" \
  -show_entries frame_tags -of json

# camera motion with content turbulence suppressed
ffprobe -v error -f lavfi \
  -i "movie=midnight-espresso-master.mp4,scale=64:36:flags=area,boxblur=2:1,tblend=all_mode=difference,signalstats" \
  -show_entries frame_tags=lavfi.signalstats.YAVG -of csv=p=0
```
