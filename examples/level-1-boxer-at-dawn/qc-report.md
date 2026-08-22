# Technical QC Report — `boxer-at-dawn-master.mp4`

Result: **PASS** — all applicable checks passed, no defects found.

All evidence is deterministic (`ffprobe` / `ffmpeg` filters), gathered on the delivered master.

## Container and streams

| Check | Requirement | Measured | Result |
|---|---|---|---|
| File readable | — | opens, headers parse | pass |
| Container | MP4 | `mov,mp4,m4a,3gp,3g2,mj2` | pass |
| Stream count | 1 video, no audio | `nb_streams=1`, video only | pass |
| Video codec | H.264 | `h264`, profile High, level 4.1 | pass |
| Pixel format | 8-bit 4:2:0 | `yuv420p` | pass |
| Colour tagging | BT.709 | primaries / transfer / matrix all bt709 | pass |
| Progressive download | faststart | `+faststart` (moov ahead of mdat) | pass |
| File size | — | 8,873,764 bytes @ 11.83 Mb/s | pass |

## Duration, rate and geometry

| Check | Requirement | Measured | Result |
|---|---|---|---|
| Duration | 6 seconds | `6.000000` s (container and stream agree) | pass |
| Frame count | consistent with rate | `nb_frames=180`, `nb_read_frames=180` | pass |
| Frame rate | constant | `r_frame_rate=30/1`, `avg_frame_rate=30/1` (CFR) | pass |
| Resolution | HD | 1920 × 1080 | pass |
| Aspect ratio | 16:9 | 1920/1080 = 1.7778, square pixels | pass |

Frame count and rate agree exactly (180 ÷ 30 = 6.000), so the duration is frame-accurate
rather than a rounded container value.

## Integrity

| Check | Method | Result |
|---|---|---|
| Decode errors | full decode with `-xerror` to null | pass — zero errors, exit 0 |
| Truncation | `-count_frames` matches `nb_frames` | pass — 180 = 180 |
| Black frames | `blackdetect=d=0.1:pic_th=0.98` | pass — none detected |
| Frozen segments | `freezedetect=n=0.001:d=0.3` | pass — none detected |
| A/V sync | n/a — no audio stream | not applicable |

## Signal

| Check | Measured | Result |
|---|---|---|
| Mean luma range over duration | YAVG 51.1 – 59.8 (range 8.7) | pass — stable exposure, no drift |
| Shadow headroom | YMIN floor 3 | pass — blacks not crushed to 0 |
| Highlight headroom | YMAX ceiling 249 | pass — speculars not clipped to 255 |

## Mastering operations applied

The master was rendered from `shots/SELECTED_final_shot.mp4` (6.037s, 30fps, with an AAC
stream) by three deterministic operations. No generative inference was used.

1. Trimmed to exactly 180 frames and reset presentation timestamps, conforming the
   container's 6.037s to a frame-accurate 6.000s.
2. Stripped the audio stream. It measured as digital silence — −90.3 dB mean, −76.3 dB peak,
   −70.0 LUFS integrated — so nothing was lost.
3. Re-encoded H.264 High @ CRF 16, `preset slow`, yuv420p, 1-second GOP with scene-cut
   detection disabled, BT.709 tagged, faststart.

## Delivery adaptation — `preview.gif`

Converted from the master by FFmpeg, deterministically. No generative inference was used.

| Check | Requirement | Measured | Result |
|---|---|---|---|
| Duration | matches master | 6.000000 s | pass |
| Frame count | 6s @ 10fps | 60 frames | pass |
| Frame rate | — | 10/1 | pass |
| Resolution | 16:9 | 480 × 270 (1.7778) | pass |
| Looping | infinite | `-loop 0` | pass |
| File size | — | 2,904,785 bytes | pass |

Two-pass palette: `palettegen max_colors=96:stats_mode=diff`, then
`paletteuse dither=bayer:bayer_scale=5:diff_mode=rectangle`, with Lanczos downscaling and a
light `hqdn3d=2:1.5:6:6` pass before palettisation. The denoise is a preview-encoding measure
only — at 96 colours the master's film grain palettises into blotchy dither rather than
reading as grain. Measured against an otherwise identical non-denoised encode, it is visually
equivalent at 480px and 0.5 MB smaller. The master retains its grain unmodified.
