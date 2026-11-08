#!/usr/bin/env bash
# Video 38 · ¡Mil gracias! + aviso del directo de hoy (1080×1920). Sin voz: 17 s. Con voz: carpeta con 01-gracias,
# 02-envivo y 03-pregunta (.mp3); cada parte dura lo que su audio y el video se alarga si hace falta.
# Sibila (public/marca/sibila/quieta.mp4) en una ventana con cielo arriba y abajo; capas.html encima.
# Uso: armar.sh <salida.mp4> [carpeta_con_las_voces]
set -euo pipefail
SALIDA="$1"; VOCES="${2:-}"
DIR="$(cd "$(dirname "$0")" && pwd)"
RAIZ="$(cd "$DIR/../../.." && pwd)"
T="$(mktemp -d)"
if [ -n "$VOCES" ]; then
  d() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$(ls "$VOCES"/$1* | head -1)"; }
  read A B F <<<"$(python3 -c "
a=max(5.6,0.3+$(d 01)+0.6); b=max(a+5.8,a+0.3+$(d 02)+0.5); f=max(b+5.6,b+0.3+$(d 03)+1.4)
print(round(a,2),round(b,2),round(f,2))")"
else
  A=5.6; B=11.4; F=17
fi
ffmpeg -loglevel error -y -stream_loop 1 -i "$RAIZ/public/marca/sibila/quieta.mp4" -t "$F" -vf "crop=1100:1080:55:0,scale=1080:1060,pad=1080:1920:0:400:color=0x0b0716,fps=30,setsar=1" -an "$T/base.mp4"
NODE_PATH="$(npm root -g)" node "$DIR/cuadros.cjs" "$DIR/capas.html#$A,$B,$F" "$T/capas" "$F"
if [ -n "$VOCES" ]; then
  ms() { python3 -c "print(int(($1)*1000))"; }
  m1=300; m2=$(ms "$A+0.3"); m3=$(ms "$B+0.3")
  ffmpeg -loglevel error -y -i "$(ls "$VOCES"/01* | head -1)" -i "$(ls "$VOCES"/02* | head -1)" -i "$(ls "$VOCES"/03* | head -1)" -filter_complex \
    "[0]adelay=$m1|$m1[a0];[1]adelay=$m2|$m2[a1];[2]adelay=$m3|$m3[a2];[a0][a1][a2]amix=inputs=3:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=44100,apad=whole_dur=$F[a]" \
    -map "[a]" -c:a aac -b:a 160k "$T/audio.m4a"
else
  ffmpeg -loglevel error -y -f lavfi -i anullsrc=r=44100:cl=stereo -t "$F" -c:a aac -b:a 64k "$T/audio.m4a"
fi
ffmpeg -loglevel error -y -i "$T/base.mp4" -framerate 30 -i "$T/capas/%05d.png" -i "$T/audio.m4a" \
  -filter_complex "[0:v][1:v]overlay=0:0:eof_action=pass,format=yuv420p[v]" -map "[v]" -map 2:a -t "$F" \
  -c:v libx264 -crf 20 -preset veryfast -c:a copy -movflags +faststart "$SALIDA"
rm -rf "$T"
echo "listo: $SALIDA ($F s)"
