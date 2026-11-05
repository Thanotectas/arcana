#!/usr/bin/env bash
# Video 30 · anuncio «¿Te hiciste una limpia… y no sabes leerla?» (1080×1920, ~19 s).
# Uso: armar.sh <toma_A_20s.mp4> <toma_B_10s.mp4> <voz.mp3> <salida.mp4>
# A: huevo (0–10 s) + mujer con el celular (10–20 s). B: solo el huevo (los picos suben al final).
set -euo pipefail
A="$1"; B="$2"; VOZ="$3"; SALIDA="$4"
DIR="$(cd "$(dirname "$0")" && pwd)"
T="$(mktemp -d)"
F="scale=1080:1920:flags=lanczos,fps=30,setsar=1"
ffmpeg -loglevel error -y -ss 0 -t 4.3 -i "$A" -vf "$F" -an "$T/1.mp4"
ffmpeg -loglevel error -y -ss 10.2 -t 4.0 -i "$A" -vf "$F" -an "$T/2.mp4"
ffmpeg -loglevel error -y -ss 7.0 -t 3.0 -i "$B" -vf "setpts=1.5*PTS,$F" -an "$T/3.mp4"
ffmpeg -loglevel error -y -ss 16.5 -t 3.2 -i "$A" -vf "$F" -an "$T/4.mp4"
ffmpeg -loglevel error -y -ss 19.6 -t 0.4 -i "$A" -vf "$F,tpad=stop_mode=clone:stop_duration=3" -an "$T/5.mp4"
printf "file '%s'\n" "$T/1.mp4" "$T/2.mp4" "$T/3.mp4" "$T/4.mp4" "$T/5.mp4" > "$T/lista.txt"
ffmpeg -loglevel error -y -f concat -safe 0 -i "$T/lista.txt" -c:v libx264 -crf 16 -pix_fmt yuv420p "$T/base.mp4"
NODE_PATH="$(npm root -g)" node "$DIR/cuadros.cjs" "$DIR/capas.html" "$T/capas" 19.3
ffmpeg -loglevel error -y -i "$T/base.mp4" -framerate 30 -i "$T/capas/%05d.png" -i "$VOZ" \
  -filter_complex "[0:v][1:v]overlay=0:0:eof_action=pass,format=yuv420p[v];[2:a]adelay=200|200[a]" \
  -map "[v]" -map "[a]" -t 19.3 -c:v libx264 -crf 20 -preset veryfast -c:a aac -b:a 160k -movflags +faststart "$SALIDA"
rm -rf "$T"
echo "listo: $SALIDA"
