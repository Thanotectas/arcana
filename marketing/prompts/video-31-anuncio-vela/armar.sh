#!/usr/bin/env bash
# Video 31 · anuncio «¿Prendiste una vela… y no sabes leerla?» (1080×1920, ~20 s).
# Uso: armar.sh <toma_vela.mp4> <toma_mujer.mp4> <voz.mp3> <salida.mp4>
set -euo pipefail
V="$1"; M="$2"; VOZ="$3"; SALIDA="$4"
DIR="$(cd "$(dirname "$0")" && pwd)"
T="$(mktemp -d)"
F="scale=1080:1920:flags=lanczos,fps=30,setsar=1"
ffmpeg -loglevel error -y -ss 0 -t 3.9 -i "$V" -vf "$F" -an "$T/1.mp4"
# En la toma de la mujer, entre 0,8 y 2,8 s la IA le dibuja una segunda mano: se usa el inicio
# (en cámara lenta) y desde 2,8 s, cuando ya mira la pantalla.
ffmpeg -loglevel error -y -ss 0 -t 0.6 -i "$M" -vf "setpts=2*PTS,$F" -an "$T/2a.mp4"
ffmpeg -loglevel error -y -ss 2.8 -t 2.8 -i "$M" -vf "$F" -an "$T/2b.mp4"
ffmpeg -loglevel error -y -ss 2.4 -t 5.5 -i "$V" -vf "$F" -an "$T/3.mp4"
ffmpeg -loglevel error -y -ss 5.6 -t 2.33 -i "$M" -vf "$F,tpad=stop_mode=clone:stop_duration=4.4" -an "$T/4.mp4"
printf "file '%s'\n" "$T/1.mp4" "$T/2a.mp4" "$T/2b.mp4" "$T/3.mp4" "$T/4.mp4" > "$T/lista.txt"
ffmpeg -loglevel error -y -f concat -safe 0 -i "$T/lista.txt" -c:v libx264 -crf 16 -pix_fmt yuv420p "$T/base.mp4"
NODE_PATH="$(npm root -g)" node "$DIR/cuadros.cjs" "$DIR/capas.html" "$T/capas" 20.1
ffmpeg -loglevel error -y -i "$T/base.mp4" -framerate 30 -i "$T/capas/%05d.png" -i "$VOZ" \
  -filter_complex "[0:v][1:v]overlay=0:0:eof_action=pass,format=yuv420p[v];[2:a]adelay=200|200[a]" \
  -map "[v]" -map "[a]" -t 20.1 -c:v libx264 -crf 20 -preset veryfast -c:a aac -b:a 160k -movflags +faststart "$SALIDA"
rm -rf "$T"
echo "listo: $SALIDA"
