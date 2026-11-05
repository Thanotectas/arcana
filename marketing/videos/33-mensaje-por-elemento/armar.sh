#!/usr/bin/env bash
# Video 33 · «Tu mensaje de noviembre según tu elemento» (1080×1920, 17 s, sin música: se agrega en TikTok o Instagram).
# Uso: armar.sh <salida.mp4>
set -euo pipefail
SALIDA="$1"
DIR="$(cd "$(dirname "$0")" && pwd)"
T="$(mktemp -d)"
NODE_PATH="$(npm root -g)" node "$DIR/cuadros.cjs" "$DIR/escena.html" "$T/c" 17
ffmpeg -loglevel error -y -framerate 30 -i "$T/c/%05d.png" -f lavfi -i anullsrc=r=44100:cl=stereo -shortest \
  -c:v libx264 -crf 20 -preset veryfast -pix_fmt yuv420p -c:a aac -b:a 64k -movflags +faststart "$SALIDA"
rm -rf "$T"
echo "listo: $SALIDA"
