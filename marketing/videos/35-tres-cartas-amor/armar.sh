#!/usr/bin/env bash
# Video 35 · «Tres cartas para el amor» (1080×1920, 46 s): las manos con el tarot egipcio de Alejandro, la voz de
# Sibila (ElevenLabs, Marcela) y las cartas en grande (de la foto cartas-foto.jpg). La ventana del video va de
# y=420 a y=1028. Los tiempos de cada volteo salen del video original (cartas en 26, 30 y 33 s).
# Uso: armar.sh <video_original.mp4> <voz.mp3> <salida.mp4>
set -euo pipefail
ORIG="$1"; VOZ="$2"; SALIDA="$3"
DIR="$(cd "$(dirname "$0")" && pwd)"
T="$(mktemp -d)"
V="scale=1080:608,fps=30,setsar=1"
# Reparto (5,2 s, a 1,4×) · volteo 1 · quieto · volteo 2 · quieto · volteo 3 y manos · quieto hasta el cierre.
ffmpeg -loglevel error -y -ss 18 -to 25.3 -i "$ORIG" -vf "setpts=(PTS-STARTPTS)/1.4,$V" -an "$T/1.mp4"
ffmpeg -loglevel error -y -ss 25.3 -to 27.6 -i "$ORIG" -vf "$V,tpad=stop_mode=clone:stop_duration=9.3" -an "$T/2.mp4"
ffmpeg -loglevel error -y -ss 28.6 -to 31.3 -i "$ORIG" -vf "$V,tpad=stop_mode=clone:stop_duration=8.2" -an "$T/3.mp4"
ffmpeg -loglevel error -y -ss 31.6 -to 36.2 -i "$ORIG" -vf "$V,tpad=stop_mode=clone:stop_duration=14" -an "$T/4.mp4"
printf "file '%s'\n" "$T/1.mp4" "$T/2.mp4" "$T/3.mp4" "$T/4.mp4" > "$T/lista.txt"
ffmpeg -loglevel error -y -f concat -safe 0 -i "$T/lista.txt" -vf "pad=1080:1920:0:420:color=0x0b0716" -c:v libx264 -crf 16 -pix_fmt yuv420p -t 46 "$T/base.mp4"
NODE_PATH="$(npm root -g)" node "$DIR/cuadros.cjs" "$DIR/capas.html" "$T/capas" 46
ffmpeg -loglevel error -y -i "$T/base.mp4" -framerate 30 -i "$T/capas/%05d.png" -i "$VOZ" \
  -filter_complex "[0:v][1:v]overlay=0:0:eof_action=pass,format=yuv420p[v];[2:a]adelay=200|200[a]" \
  -map "[v]" -map "[a]" -t 46 -c:v libx264 -crf 20 -preset veryfast -c:a aac -b:a 160k -movflags +faststart "$SALIDA"
rm -rf "$T"
echo "listo: $SALIDA"
