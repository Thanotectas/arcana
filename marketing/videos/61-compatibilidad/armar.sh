#!/usr/bin/env bash
# Video 61 · Compatibilidad de pareja (abjad / ebced), gancho Leyla y Majnún (1080×1920, 7,5 s). Todo es escena.html
# (fondo morado sin imágenes generadas, letras doradas y casillas con el valor de cada letra). El único sonido es una
# campanita en la revelación del número (3,55 s); el audio romántico se agrega en la app al publicar.
# Uso: armar.sh <salida.mp4> <idioma: ar | tr>
set -euo pipefail
SALIDA="$1"; IDIOMA="$2"; DIR="$(cd "$(dirname "$0")" && pwd)"; T="$(mktemp -d)"; F=7.5; R=3.55
NODE_PATH="$(npm root -g)" node "$DIR/cuadros.cjs" "$DIR/escena.html#$IDIOMA" "$T/c" "$F"
# Campanita: tres armónicos con caída exponencial y un poco de eco.
ffmpeg -nostdin -loglevel error -y -f lavfi -i "aevalsrc=0.35*exp(-3.2*t)*(sin(2*PI*1318.5*t)+0.6*sin(2*PI*1975.5*t)+0.35*sin(2*PI*2637*t)):s=44100:d=2.4" \
  -af "aecho=0.7:0.5:90|180:0.3|0.2,adelay=$(python3 -c "print(int($R*1000))")|$(python3 -c "print(int($R*1000))"),apad=whole_dur=$F,aformat=channel_layouts=stereo" -t "$F" -c:a aac -b:a 128k "$T/a.m4a"
KB=$(python3 -c "print(int((9.0*8*1024)/$F - 128))")
ffmpeg -nostdin -loglevel error -y -framerate 30 -i "$T/c/%05d.jpg" -c:v libx264 -preset slow -b:v ${KB}k -maxrate $((KB*2))k -bufsize $((KB*2))k -pass 1 -passlogfile "$T/p" -pix_fmt yuv420p -an -f mp4 /dev/null
ffmpeg -nostdin -loglevel error -y -framerate 30 -i "$T/c/%05d.jpg" -i "$T/a.m4a" -c:v libx264 -preset slow -b:v ${KB}k -maxrate $((KB*2))k -bufsize $((KB*2))k -pass 2 -passlogfile "$T/p" -pix_fmt yuv420p -c:a copy -t "$F" -movflags +faststart "$SALIDA"
rm -rf "$T"; echo "listo: $SALIDA ($F s, $(du -h "$SALIDA" | cut -f1))"
