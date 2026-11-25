#!/usr/bin/env bash
# Video de la lección del día 1 (curso «7 días para cerrar el año»): base (base.sh) + títulos (capas.html) + voz de Sibila.
# Uso: armar.sh <salida.mp4>
set -euo pipefail
SALIDA="$1"; DIR="$(cd "$(dirname "$0")" && pwd)"; T="$(mktemp -d)"; F=67.6
"$DIR/base.sh" "$T/base.mov" >/dev/null
NODE_PATH="$(npm root -g)" node "$DIR/cuadros.cjs" "$DIR/capas.html" "$T/c" "$F"
KB=$(python3 -c "print(int((9.0*8*1024)/$F - 140))")
FV="[0:v][1:v]overlay=0:0,format=yuv420p[v]"
FA="[0:a]volume=0.8[amb];[2:a]adelay=200|200,apad[voz];[amb][voz]amix=inputs=2:duration=first:normalize=0,afade=t=in:d=0.4,afade=t=out:st=$(python3 -c "print($F-.8)"):d=0.8[a]"
ffmpeg -nostdin -loglevel error -y -i "$T/base.mov" -framerate 30 -i "$T/c/%05d.png" -filter_complex "$FV" -map "[v]" -c:v libx264 -preset slow -b:v ${KB}k -pass 1 -passlogfile "$T/p" -an -t $F -f mp4 /dev/null
ffmpeg -nostdin -loglevel error -y -i "$T/base.mov" -framerate 30 -i "$T/c/%05d.png" -i "$DIR/voz/es.mp3" -filter_complex "$FV;$FA" -map "[v]" -map "[a]" -c:v libx264 -preset slow -b:v ${KB}k -pass 2 -passlogfile "$T/p" -c:a aac -b:a 128k -t $F -movflags +faststart "$SALIDA"
rm -rf "$T"; echo "listo: $SALIDA ($F s, $(du -h "$SALIDA" | cut -f1))"
