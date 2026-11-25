#!/usr/bin/env bash
# Video 62 · Compatibilidad de pareja con Sibila (escena de Gemini/Veo de 10 s: dos llamas que se unen en un corazón)
# con las capas de capas.html: la pareja, las casillas de cada letra en las bandas de arriba y abajo, la suma, el 7
# sobre el estallido y la invitación cuando Sibila señala hacia abajo. Se conserva el audio de Gemini.
# Uso: armar.sh <salida.mp4> <idioma: ar | tr>
set -euo pipefail
SALIDA="$1"; IDIOMA="$2"; DIR="$(cd "$(dirname "$0")" && pwd)"; T="$(mktemp -d)"; F=10
NODE_PATH="$(npm root -g)" node "$DIR/cuadros.cjs" "$DIR/capas.html#$IDIOMA,1.8,4.4,5.2,7.2,$F" "$T/c" "$F"
KB=$(python3 -c "print(int((9.2*8*1024)/$F - 160))")
FILTRO="[0:v]scale=1080:1920:flags=lanczos,fps=30,setsar=1[b];[b][1:v]overlay=0:0:eof_action=pass,format=yuv420p[v]"
ffmpeg -nostdin -loglevel error -y -i "$DIR/clips/sibila.mp4" -framerate 30 -i "$T/c/%05d.png" -filter_complex "$FILTRO" -map "[v]" -c:v libx264 -preset slow -b:v ${KB}k -pass 1 -passlogfile "$T/p" -an -t $F -f mp4 /dev/null
ffmpeg -nostdin -loglevel error -y -i "$DIR/clips/sibila.mp4" -framerate 30 -i "$T/c/%05d.png" -filter_complex "$FILTRO" -map "[v]" -map 0:a -c:v libx264 -preset slow -b:v ${KB}k -pass 2 -passlogfile "$T/p" -c:a aac -b:a 128k -t $F -movflags +faststart "$SALIDA"
rm -rf "$T"; echo "listo: $SALIDA ($F s, $(du -h "$SALIDA" | cut -f1))"
