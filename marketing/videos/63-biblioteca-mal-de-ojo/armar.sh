#!/usr/bin/env bash
# Video 63 · Biblioteca de Sibila #3 · El mal de ojo (versión SIN VOZ: la historia va en los títulos; la música se pone en la app).
# Base de imagen (base.sh) + títulos de capas.html. Uso: armar.sh <salida.mp4> <idioma: es | tr | ar>
set -euo pipefail
SALIDA="$1"; IDIOMA="$2"; DIR="$(cd "$(dirname "$0")" && pwd)"; T="$(mktemp -d)"; F=35
"$DIR/base.sh" "$T/base.mp4" >/dev/null
NODE_PATH="$(npm root -g)" node "$DIR/cuadros.cjs" "$DIR/capas.html#$IDIOMA" "$T/c" "$F"
KB=$(python3 -c "print(int((8.8*8*1024)/$F))")
FILTRO="[0:v][1:v]overlay=0:0,format=yuv420p[v]"
ffmpeg -nostdin -loglevel error -y -i "$T/base.mp4" -framerate 30 -i "$T/c/%05d.png" -filter_complex "$FILTRO" -map "[v]" -c:v libx264 -preset slow -b:v ${KB}k -pass 1 -passlogfile "$T/p" -an -t $F -f mp4 /dev/null
ffmpeg -nostdin -loglevel error -y -i "$T/base.mp4" -framerate 30 -i "$T/c/%05d.png" -filter_complex "$FILTRO" -map "[v]" -c:v libx264 -preset slow -b:v ${KB}k -pass 2 -passlogfile "$T/p" -an -t $F -movflags +faststart "$SALIDA"
rm -rf "$T"; echo "listo: $SALIDA ($F s, $(du -h "$SALIDA" | cut -f1))"
