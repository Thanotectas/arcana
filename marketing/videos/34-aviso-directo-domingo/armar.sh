#!/usr/bin/env bash
# Video 34 · Aviso del directo del domingo (1080×1920, 17 s, sin música: se agrega en la app).
# Sibila (public/marca/sibila/quieta.mp4) en una ventana con cielo arriba y abajo; capas.html encima.
# Uso: armar.sh <salida.mp4>
set -euo pipefail
SALIDA="$1"
DIR="$(cd "$(dirname "$0")" && pwd)"
RAIZ="$(cd "$DIR/../../.." && pwd)"
T="$(mktemp -d)"
ffmpeg -loglevel error -y -t 17 -i "$RAIZ/public/marca/sibila/quieta.mp4" -vf "crop=1100:1080:55:0,scale=1080:1060,pad=1080:1920:0:400:color=0x0b0716,fps=30,setsar=1" -an "$T/base.mp4"
NODE_PATH="$(npm root -g)" node "$DIR/cuadros.cjs" "$DIR/capas.html" "$T/capas" 17
ffmpeg -loglevel error -y -i "$T/base.mp4" -framerate 30 -i "$T/capas/%05d.png" -f lavfi -i anullsrc=r=44100:cl=stereo \
  -filter_complex "[0:v][1:v]overlay=0:0:eof_action=pass,format=yuv420p[v]" -map "[v]" -map 2:a -t 17 \
  -c:v libx264 -crf 20 -preset veryfast -c:a aac -b:a 64k -movflags +faststart "$SALIDA"
rm -rf "$T"
echo "listo: $SALIDA"
