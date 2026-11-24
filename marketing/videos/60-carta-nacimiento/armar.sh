#!/usr/bin/env bash
# Video 60 · Tu carta del tarot de nacimiento (1080×1920, 16 s, SIN VOZ: la música se agrega en Instagram o TikTok al
# publicar, con un audio en tendencia). Todo es escena.html: el abanico de los 22 arcanos, la cuenta de ejemplo
# (13/02/1974 → El Ermitaño) y la pregunta final para comentar la fecha.
# Uso: armar.sh <salida.mp4> <idioma: es | ar | tr>
set -euo pipefail
SALIDA="$1"; IDIOMA="$2"; DIR="$(cd "$(dirname "$0")" && pwd)"; T="$(mktemp -d)"; F=16
NODE_PATH="$(npm root -g)" node "$DIR/cuadros.cjs" "$DIR/escena.html#$IDIOMA" "$T/c" "$F"
# Pista de audio en silencio (algunas apps rechazan videos sin audio); el tope de 9,3 MB deja margen bajo los 10 MB.
KB=$(python3 -c "print(int((9.3*8*1024)/$F - 64))")
ffmpeg -nostdin -loglevel error -y -framerate 30 -i "$T/c/%05d.jpg" -c:v libx264 -preset slow -b:v ${KB}k -pass 1 -passlogfile "$T/p" -pix_fmt yuv420p -an -f mp4 /dev/null
ffmpeg -nostdin -loglevel error -y -framerate 30 -i "$T/c/%05d.jpg" -f lavfi -i anullsrc=r=44100:cl=stereo -c:v libx264 -preset slow -b:v ${KB}k -pass 2 -passlogfile "$T/p" -pix_fmt yuv420p -c:a aac -b:a 64k -t "$F" -movflags +faststart "$SALIDA"
rm -rf "$T"; echo "listo: $SALIDA ($F s, $(du -h "$SALIDA" | cut -f1))"
