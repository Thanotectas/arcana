#!/usr/bin/env bash
# Video 58 · Geomancia, la ciencia de la arena (1080×1920). Toda la escena es escena.html (imágenes de ElevenLabs de
# fondo, el tablero de 16 líneas y el escudo calculados como en miarcana.com/geomancia) con la voz de Marcela.
# Uso: armar.sh <salida.mp4> <idioma> <c1> <c2> <c3> <hijas> <sobrinas> <testigos> <juez> <c4> <c5> <c6>
# (los tiempos, en segundos desde el inicio de la voz, salen de transcribir voz/<idioma>.mp3 con faster-whisper).
set -euo pipefail
SALIDA="$1"; IDIOMA="$2"; shift 2
DIR="$(cd "$(dirname "$0")" && pwd)"; T="$(mktemp -d)"
VOZ="$DIR/voz/$IDIOMA.mp3"; RETRASO=0.25
DV=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$VOZ")
F=$(python3 -c "print(round($DV+$RETRASO+1.4,2))")
CUES=$(python3 -c "import sys;print(','.join(str(round(float(x)+$RETRASO,2)) for x in sys.argv[1:]))" "$@")
NODE_PATH="$(npm root -g)" node "$DIR/cuadros.cjs" "$DIR/escena.html#$IDIOMA,$CUES,$F" "$T/c" "$F"
ms=$(python3 -c "print(int($RETRASO*1000))")
ffmpeg -nostdin -loglevel error -y -i "$VOZ" -af "adelay=$ms|$ms,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=44100,apad=whole_dur=$F" -c:a aac -b:a 128k "$T/voz.m4a"
# Dos pasadas para quedar por debajo de 10 MB (≈ 9,3 MB con el audio).
KB=$(python3 -c "print(int((9.3*8*1024)/$F - 128))")
ffmpeg -nostdin -loglevel error -y -framerate 30 -i "$T/c/%05d.jpg" -c:v libx264 -preset slow -b:v ${KB}k -pass 1 -passlogfile "$T/p" -pix_fmt yuv420p -an -f mp4 /dev/null
ffmpeg -nostdin -loglevel error -y -framerate 30 -i "$T/c/%05d.jpg" -i "$T/voz.m4a" -c:v libx264 -preset slow -b:v ${KB}k -pass 2 -passlogfile "$T/p" -pix_fmt yuv420p -c:a copy -t "$F" -movflags +faststart "$SALIDA"
rm -rf "$T"; echo "listo: $SALIDA ($F s, $(du -h "$SALIDA" | cut -f1))"
