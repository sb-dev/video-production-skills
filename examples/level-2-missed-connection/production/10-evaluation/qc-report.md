# Technical QC Report — "Missed Connection"

- **artifact:** `production/09-master/missed-connection-master.mp4`
- **verdict:** **PASS**
- **method:** deterministic — `ffprobe` (via `inspect-media.ts`) and `ffmpeg ebur128`

## Video

| Check | Requirement | Measured | |
|---|---|---|---|
| File readable | — | yes | ✅ |
| Container | MP4, faststart | `mov,mp4,m4a`, `+faststart` | ✅ |
| Duration | 12–15 s | **12.917 s** | ✅ |
| Resolution | 1920×1080 | 1920×1080 | ✅ |
| Aspect ratio | 16:9 | SAR 1:1 / DAR 16:9 | ✅ |
| Frame rate | 24 fps CFR | 24/1 | ✅ |
| Frame count | consistent | 310 frames = 12.917 s × 24 | ✅ |
| Codec | H.264 8-bit | h264 High, yuv420p | ✅ |
| Colour tags | Rec.709 | primaries / transfer / matrix all bt709 | ✅ |
| Letterboxing | none | none — all sources conformed to 1920×1080 before assembly | ✅ |
| Corruption | none | decodes clean end to end, no errors | ✅ |

## Audio

| Check | Requirement | Measured | |
|---|---|---|---|
| Audio present | yes | AAC-LC, 48 kHz, 2 ch | ✅ |
| Duration match | ±0.1 s of video | 12.917 s video / 12.914 s audio | ✅ |
| Integrated loudness | −18 LUFS | **−18.0 LUFS** | ✅ |
| True peak | ≤ −2.0 dBTP | **−3.3 dBTP** | ✅ |
| Loudness range | sane for ambience | LRA 5.8 LU | ✅ |
| Dialogue | none | transcription returned no words | ✅ |
| Music | none | spectrogram shows no harmonic or periodic structure | ✅ |
| Clipping | none | peak well below 0 dBFS | ✅ |

## Sync

No lip sync and no sync events to check — the audio is a continuous ambient bed
deliberately built across the whole picture lock rather than per shot, so there is nothing
that can drift against picture.

## Notes

- **Conform steps applied before assembly.** `kwaivgi/kling-v3-video` outputs 1928×1072.
  Both Kling-sourced shots (SH01, SH02) were scaled to height and centre-cropped
  (`scale=-2:1080,crop=1920:1080`, CRF 16) rather than scaled-and-padded, which would have
  put 6 px black bars on those shots alone.
- **Colour tags required a bitstream filter.** `-color_primaries` / `-color_trc` alone did
  not survive into the H.264 VUI; only `colorspace` was written. Added
  `h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1`
  so all three tags are present in the elementary stream.
- **Loudness required two-pass `loudnorm`.** Single-pass undershot the target by 2.1 LU on
  material this short. Measured values are now fed back into a second pass with
  `linear=true`, landing on target.
- **Master build is reproducible**: `tools/build-master.sh` regenerates the master from the
  picture lock and the source atmos with no manual steps.
