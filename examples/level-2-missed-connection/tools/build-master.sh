#!/usr/bin/env bash
# Deterministic master build for "Missed Connection".
#   tools/build-master.sh
#
# Inputs : production/08-edit/picturelock.mp4      (picture lock, no audio)
#          production/08-edit/audio/ambience-a.wav (generated station atmos)
# Output : production/09-master/missed-connection-master.mp4
set -euo pipefail
cd "$(dirname "$0")/.."

PIC=production/08-edit/picturelock.mp4
AMB=production/08-edit/audio/ambience-a.wav
BED=production/08-edit/audio/ambience-bed.wav
OUT=production/09-master/missed-connection-master.mp4

DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$PIC")
echo "picture lock duration: ${DUR}s"

# The generated atmos decays after ~11s, so only its strong region is usable.
# Take 0.3-11.3s and cross-fade it into itself to build a seamless bed long
# enough to cover picture, then trim to length and shape the ends.
FADE_OUT_AT=$(echo "$DUR - 1.2" | bc)
SHAPE="[0:a]atrim=0.3:11.3,asetpts=N/SR/TB[a];
       [1:a]atrim=0.3:11.3,asetpts=N/SR/TB[b];
       [a][b]acrossfade=d=2:c1=tri:c2=tri,
             atrim=0:${DUR},asetpts=N/SR/TB,
             afade=t=in:st=0:d=0.8,
             afade=t=out:st=${FADE_OUT_AT}:d=1.2,
             aresample=48000[shaped]"

# Pass 1: measure. Single-pass loudnorm undershoots on short material, so the
# measured values are fed back in to hit the target accurately.
MEASURED=$(ffmpeg -hide_banner -i "$AMB" -i "$AMB" -filter_complex \
  "${SHAPE};[shaped]loudnorm=I=-18:TP=-2.0:LRA=11:print_format=json[out]" \
  -map "[out]" -f null - 2>&1 | awk '/^{/,/^}/')

read -r M_I M_TP M_LRA M_THRESH M_OFFSET <<<"$(python3 -c "
import json,sys
d=json.loads(sys.stdin.read())
print(d['input_i'], d['input_tp'], d['input_lra'], d['input_thresh'], d['target_offset'])
" <<<"$MEASURED")"
echo "measured: I=${M_I} TP=${M_TP} LRA=${M_LRA}"

# Pass 2: apply.
ffmpeg -y -v error -i "$AMB" -i "$AMB" -filter_complex \
  "${SHAPE};[shaped]loudnorm=I=-18:TP=-2.0:LRA=11:measured_I=${M_I}:measured_TP=${M_TP}:measured_LRA=${M_LRA}:measured_thresh=${M_THRESH}:offset=${M_OFFSET}:linear=true,aresample=48000[bed]" \
  -map "[bed]" -c:a pcm_s16le "$BED"

mkdir -p "$(dirname "$OUT")"
ffmpeg -y -v error -i "$PIC" -i "$BED" \
  -map 0:v -map 1:a \
  -c:v libx264 -profile:v high -level 4.0 -crf 17 -preset slow \
  -pix_fmt yuv420p \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -bsf:v "h264_metadata=video_full_range_flag=0:colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1" \
  -c:a aac -b:a 192k -ar 48000 -ac 2 \
  -movflags +faststart -shortest "$OUT"

echo "master -> $OUT"
