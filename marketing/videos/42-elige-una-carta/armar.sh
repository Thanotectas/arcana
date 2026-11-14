#!/usr/bin/env bash
# Video 42 · «Elige una carta» (Mercurio retoma su marcha, 14 nov 2026). 1080×1920, 38 s, sin voz ni música
# (se pone música en la app). Mazo Tarot Arcana: 1 El Viajero · 2 El Encuentro · 3 El Despertar.
# Uso: armar.sh <salida.mp4>
set -euo pipefail
SALIDA="$1"; DIR="$(cd "$(dirname "$0")" && pwd)"; T="$(mktemp -d)"
NODE_PATH="$(npm root -g)" node "$DIR/cuadros.cjs" "$DIR/escena.html" "$T/c" 38
ffmpeg -nostdin -loglevel error -y -framerate 30 -i "$T/c/%05d.jpg" -f lavfi -i anullsrc=r=44100:cl=stereo -t 38 -map 0:v -map 1:a \
  -c:v libx264 -crf 20 -preset veryfast -pix_fmt yuv420p -c:a aac -b:a 64k -movflags +faststart "$SALIDA"
rm -rf "$T"; echo "listo: $SALIDA"
