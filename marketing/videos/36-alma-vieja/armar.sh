#!/usr/bin/env bash
# Video 36 · «6 señales de que eres alma vieja» (1080×1920, 40,5 s). Clips de Flow: el de 1080p (libro) y el largo
# de 30 s (libro → caja → foto → luna); voz de Sibila en 8 archivos (1-gancho … 8-cierre) puestos en fila.
# Uso: armar.sh <clip_libro_1080.mp4> <clip_largo_30s.mp4> <carpeta_con_los_8_mp3> <salida.mp4>
#      (en la carpeta, los audios se buscan por su prefijo: *1-gancho*, *2-nina*, … *8-cierre*)
set -euo pipefail
LIBRO="$1"; LARGO="$2"; VOCES="$3"; SALIDA="$4"
DIR="$(cd "$(dirname "$0")" && pwd)"
T="$(mktemp -d)"
V="scale=1080:1920:flags=lanczos,fps=30,setsar=1"
ffmpeg -loglevel error -y -i "$LIBRO" -vf "$V" -t 10 -an "$T/1.mp4"
ffmpeg -loglevel error -y -ss 11 -to 21.5 -i "$LARGO" -vf "setpts=(PTS-STARTPTS)*1.4,$V" -an "$T/2.mp4"
ffmpeg -loglevel error -y -ss 21.5 -i "$LARGO" -vf "$V,tpad=stop_mode=clone:stop_duration=10" -an "$T/3.mp4"
printf "file '%s'\n" "$T/1.mp4" "$T/2.mp4" "$T/3.mp4" > "$T/lista.txt"
ffmpeg -loglevel error -y -f concat -safe 0 -i "$T/lista.txt" -c:v libx264 -crf 16 -pix_fmt yuv420p -t 40.5 "$T/base.mp4"
# Voz: cada frase en su momento (segundos), la 7 recortada a la frase de la casa (4 s).
v() { ls "$VOCES"/*"$1"* | head -1; }
ffmpeg -loglevel error -y -i "$(v 1-gancho)" -i "$(v 2-nina)" -i "$(v 3-soledad)" -i "$(v 4-nostalgia)" -i "$(v 5-intuicion)" -i "$(v 6-consejo)" -i "$(v 7-casa)" -i "$(v 8-cierre)" -filter_complex "
[0]adelay=300|300[a0];[1]adelay=5330|5330[a1];[2]adelay=9810|9810[a2];[3]adelay=13870|13870[a3];[4]adelay=18500|18500[a4];
[5]adelay=22320|22320[a5];[6]atrim=0:4.0,afade=t=out:st=3.8:d=0.2,adelay=27920|27920[a6];[7]adelay=32500|32500[a7];
[a0][a1][a2][a3][a4][a5][a6][a7]amix=inputs=8:normalize=0,apad=whole_dur=40.5[a]" -map "[a]" -c:a aac -b:a 160k "$T/voz.m4a"
NODE_PATH="$(npm root -g)" node "$DIR/cuadros.cjs" "$DIR/capas.html" "$T/capas" 40.5
ffmpeg -loglevel error -y -i "$T/base.mp4" -framerate 30 -i "$T/capas/%05d.png" -i "$T/voz.m4a" \
  -filter_complex "[0:v][1:v]overlay=0:0:eof_action=pass,format=yuv420p[v]" -map "[v]" -map 2:a -t 40.5 \
  -c:v libx264 -crf 20 -preset veryfast -c:a copy -movflags +faststart "$SALIDA"
rm -rf "$T"
echo "listo: $SALIDA"
