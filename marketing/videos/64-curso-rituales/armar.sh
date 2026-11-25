#!/usr/bin/env bash
# Video 64 · Curso de rituales: lista de espera. Escena de velas del video 40 + voz de Sibila (voz/<idioma>.mp3) + títulos.
# Uso: armar.sh <salida.mp4> <idioma: es | tr | ar>
set -euo pipefail
SALIDA="$1"; IDIOMA="$2"; DIR="$(cd "$(dirname "$0")" && pwd)"; T="$(mktemp -d)"
case "$IDIOMA" in   # «siete días», «¿te aviso?», cierre, final (s, medidos con faster-whisper)
 es) M="4.3,9.6,11.4,16.6";;
 tr) M="3.9,7.95,10.55,14.6";;
 ar) M="3.85,9.05,11.9,16";;
esac
F="${M##*,}"
NODE_PATH="$(npm root -g)" node "$DIR/cuadros.cjs" "$DIR/capas.html#$IDIOMA,$M" "$T/c" "$F"
KB=$(python3 -c "print(int((8.5*8*1024)/$F - 140))")
FV="[0:v]scale=1080:1920:flags=lanczos,fps=30,setsar=1[b];[b][1:v]overlay=0:0,format=yuv420p[v]"
FA="[0:a]volume=0.25[amb];[2:a]adelay=300|300,apad[voz];[amb][voz]amix=inputs=2:duration=first:normalize=0,afade=t=out:st=$(python3 -c "print($F-.7)"):d=0.7[a]"
ffmpeg -nostdin -loglevel error -y -i "$DIR/clips/escena.mp4" -framerate 30 -i "$T/c/%05d.png" -filter_complex "$FV" -map "[v]" -c:v libx264 -preset slow -b:v ${KB}k -pass 1 -passlogfile "$T/p" -an -t $F -f mp4 /dev/null
ffmpeg -nostdin -loglevel error -y -i "$DIR/clips/escena.mp4" -framerate 30 -i "$T/c/%05d.png" -i "$DIR/voz/$IDIOMA.mp3" -filter_complex "$FV;$FA" -map "[v]" -map "[a]" -c:v libx264 -preset slow -b:v ${KB}k -pass 2 -passlogfile "$T/p" -c:a aac -b:a 128k -t $F -movflags +faststart "$SALIDA"
rm -rf "$T"; echo "listo: $SALIDA ($F s, $(du -h "$SALIDA" | cut -f1))"
