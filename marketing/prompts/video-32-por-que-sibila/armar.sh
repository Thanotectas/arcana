#!/usr/bin/env bash
# Video 32 · «¿Por qué me llamo Sibila?» (1080×1920, 28,5 s): dos tomas de Gemini + voz de ElevenLabs.
# Uso: armar.sh <toma1_cumas.mp4> <toma2_sibila.mp4> <voz.mp3> <salida.mp4>
# Arranca con Sibila hablando (public/marca/sibila/hablando.mp4) en una ventana con cielo arriba y abajo.
set -euo pipefail
CUMAS="$1"; TOMA2="$2"; VOZ="$3"; SALIDA="$4"
DIR="$(cd "$(dirname "$0")" && pwd)"
RAIZ="$(cd "$DIR/../../.." && pwd)"
HABLA="$RAIZ/public/marca/sibila/hablando.mp4"
T="$(mktemp -d)"
# Ventana de Sibila: recorte 1100×1080 alrededor de ella, a 1080 de ancho, en el medio del lienzo vertical.
V="crop=1100:1080:55:0,scale=1080:1060,pad=1080:1920:0:430:color=0x0b0716,fps=30,setsar=1"
ffmpeg -loglevel error -y -ss 0 -t 2.2 -i "$HABLA" -vf "$V" -an "$T/1.mp4"
# Toma 1 (Cumas), un poco más lenta (×1.1): las hojas vuelan cuando la voz dice «el viento se las llevaba».
ffmpeg -loglevel error -y -i "$CUMAS" -vf "setpts=1.1*PTS,scale=1080:1920:flags=lanczos,fps=30,setsar=1" -t 11.0 -an "$T/2.mp4"
# Toma 2 (Sibila con las hojas): termina mirando a cámara; ese cuadro queda quieto detrás del cierre.
ffmpeg -loglevel error -y -ss 0.2 -i "$TOMA2" -vf "scale=1080:1920:flags=lanczos,fps=30,setsar=1,tpad=stop_mode=clone:stop_duration=6" -t 15.3 -an "$T/3.mp4"
printf "file '%s'\n" "$T/1.mp4" "$T/2.mp4" "$T/3.mp4" > "$T/lista.txt"
ffmpeg -loglevel error -y -f concat -safe 0 -i "$T/lista.txt" -c:v libx264 -crf 16 -pix_fmt yuv420p "$T/base.mp4"
NODE_PATH="$(npm root -g)" node "$DIR/cuadros.cjs" "$DIR/capas.html" "$T/capas" 28.5
ffmpeg -loglevel error -y -i "$T/base.mp4" -framerate 30 -i "$T/capas/%05d.png" -i "$VOZ" \
  -filter_complex "[0:v][1:v]overlay=0:0:eof_action=pass,format=yuv420p[v];[2:a]adelay=200|200[a]" \
  -map "[v]" -map "[a]" -t 28.5 -c:v libx264 -crf 20 -preset veryfast -c:a aac -b:a 160k -movflags +faststart "$SALIDA"
rm -rf "$T"
echo "listo: $SALIDA"
