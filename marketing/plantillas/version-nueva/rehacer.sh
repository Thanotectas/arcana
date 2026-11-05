#!/usr/bin/env bash
# Versión nueva de un video viejo para republicar: recorta el tramo útil (sin el cierre viejo), lo acelera un poco,
# le pone un gancho grande los primeros 2,5 s y un cierre nuevo de 3 s. Sale sin audio (la música va en la app).
# Uso: rehacer.sh <entrada.mp4> <inicio s> <fin s> <velocidad> "<gancho>" "<línea del cierre>" <salida.mp4>
set -euo pipefail
ENT="$1"; INI="$2"; FIN="$3"; VEL="$4"; GANCHO="$5"; LINEA="$6"; SAL="$7"
DIR="$(cd "$(dirname "$0")" && pwd)"
T="$(mktemp -d)"
NODE_PATH="$(npm root -g)" node "$DIR/foto.cjs" gancho "$GANCHO" "$T/gancho.png"
NODE_PATH="$(npm root -g)" node "$DIR/foto.cjs" fin "$LINEA" "$T/fin.png"
DUR=$(python3 -c "print(round(($FIN-$INI)/$VEL,3))")
ffmpeg -loglevel error -y -ss "$INI" -to "$FIN" -i "$ENT" -loop 1 -t 2.8 -i "$T/gancho.png" -loop 1 -t 3 -i "$T/fin.png" -f lavfi -i anullsrc=r=44100:cl=stereo -filter_complex "
[0:v]setpts=(PTS-STARTPTS)/$VEL,scale=1134:2016,crop=1080:1920,fps=30,setsar=1,format=yuv420p[b];
[1:v]format=rgba,fade=out:st=2.2:d=0.6:alpha=1[g];
[b][g]overlay=0:0:eof_action=pass,format=yuv420p[bg];
[2:v]fps=30,setsar=1,format=yuv420p[f];
[bg][f]xfade=transition=fade:duration=0.4:offset=$(python3 -c "print(round($DUR-0.4,3))")[v]" \
  -map "[v]" -map 3:a -t "$(python3 -c "print(round($DUR+2.6,3))")" -c:v libx264 -crf 20 -preset veryfast -c:a aac -b:a 64k -movflags +faststart "$SAL"
rm -rf "$T"
echo "listo: $SAL ($(python3 -c "print(round($DUR+2.6,1))") s)"
