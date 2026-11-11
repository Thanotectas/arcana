#!/usr/bin/env bash
# Reel 11:11 (1080×1920, 15 s, sin música): las tres láminas sobre su propio fondo desenfocado, con zoom lento y fundidos.
# Uso: reel.sh <salida.mp4>
set -euo pipefail
SALIDA="$1"; DIR="$(cd "$(dirname "$0")" && pwd)"; T="$(mktemp -d)"
i=0
for n in 1-portada 2-ritual 3-cierre; do
  ffmpeg -loglevel error -y -loop 1 -t 5.6 -i "$DIR/laminas/$n.png" -filter_complex \
    "[0]split[a][b];[a]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=30:2,eq=brightness=-0.12[f];[b]scale=1080:-1[l];[f][l]overlay=0:(H-h)/2,fps=30,scale=1080*(1+0.04*t/5.6):-2:eval=frame,crop=1080:1920,setsar=1,format=yuv420p" \
    -c:v libx264 -crf 18 "$T/$i.mp4"
  i=$((i+1))
done
ffmpeg -loglevel error -y -i "$T/0.mp4" -i "$T/1.mp4" -i "$T/2.mp4" -f lavfi -t 15.6 -i anullsrc=r=44100:cl=stereo -filter_complex \
  "[0][1]xfade=transition=fade:duration=0.6:offset=5[x];[x][2]xfade=transition=fade:duration=0.6:offset=10[v]" \
  -map "[v]" -map 3:a -shortest -c:v libx264 -crf 20 -preset veryfast -pix_fmt yuv420p -c:a aac -b:a 64k -movflags +faststart "$SALIDA"
rm -rf "$T"; echo "listo: $SALIDA"
