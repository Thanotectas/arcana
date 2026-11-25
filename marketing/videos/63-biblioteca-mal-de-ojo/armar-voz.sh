#!/usr/bin/env bash
# Video 63 · Biblioteca de Sibila #3 · El mal de ojo, CON LA VOZ DE SIBILA (ElevenLabs, Marcela, voz/<idioma>.mp3).
# Los tramos de imagen y los títulos siguen los tiempos de la voz (medidos con faster-whisper).
# Uso: armar-voz.sh <salida.mp4> <idioma: es | tr | ar>
set -euo pipefail
SALIDA="$1"; IDIOMA="$2"; DIR="$(cd "$(dirname "$0")" && pwd)"; T="$(mktemp -d)"
case "$IDIOMA" in
 # tramos: museo nazar bazar khamsa huevo abuela | títulos: fin del título, 6 ventanas, inicio del cierre
 es) TRAMOS="16.2 6.2 2.4 6.5 6.4 10.8"; CAPAS="8.3,8.5,16.1,16.4,22.3,22.5,24.7,25,31.2,31.5,37.6,37.9,42,42.2";;
 tr) TRAMOS="14.3 5.4 2.4 4.6 7.1 9.2";  CAPAS="6.6,6.8,14.2,14.5,19.6,19.8,22,22.3,26.6,26.9,33.7,34,37.4,37.5";;
 ar) TRAMOS="16.4 6.1 2.7 6.6 7.5 10.2"; CAPAS="7.2,7.3,16.3,16.6,22.4,22.6,25.1,25.4,31.7,32,39.2,39.5,43.4,43.5";;
esac
F=$(python3 -c "print(round(sum(map(float,'$TRAMOS'.split())),2))")
"$DIR/base.sh" "$T/base.mp4" $TRAMOS >/dev/null
NODE_PATH="$(npm root -g)" node "$DIR/cuadros.cjs" "$DIR/capas.html#$IDIOMA,v,$CAPAS" "$T/c" "$F"
KB=$(python3 -c "print(int((8.8*8*1024)/$F - 130))")
FILTRO="[0:v][1:v]overlay=0:0,format=yuv420p[v];[2:a]apad,afade=t=out:st=$(python3 -c "print($F-.6)"):d=0.6[a]"
ffmpeg -nostdin -loglevel error -y -i "$T/base.mp4" -framerate 30 -i "$T/c/%05d.png" -i "$DIR/voz/$IDIOMA.mp3" -filter_complex "[0:v][1:v]overlay=0:0,format=yuv420p[v]" -map "[v]" -c:v libx264 -preset slow -b:v ${KB}k -pass 1 -passlogfile "$T/p" -an -t $F -f mp4 /dev/null
ffmpeg -nostdin -loglevel error -y -i "$T/base.mp4" -framerate 30 -i "$T/c/%05d.png" -i "$DIR/voz/$IDIOMA.mp3" -filter_complex "$FILTRO" -map "[v]" -map "[a]" -c:v libx264 -preset slow -b:v ${KB}k -pass 2 -passlogfile "$T/p" -c:a aac -b:a 128k -t $F -movflags +faststart "$SALIDA"
rm -rf "$T"; echo "listo: $SALIDA ($F s, $(du -h "$SALIDA" | cut -f1))"
