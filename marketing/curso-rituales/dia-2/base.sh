#!/usr/bin/env bash
# Base de imagen y sonido ambiente del video del día 2 (sin textos ni voz), sincronizada con la voz (voz/es.mp3).
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"; T="$(mktemp -d)"; S="$1"
V="fps=30,format=yuv420p,setsar=1"
SIL="anullsrc=r=48000:cl=stereo"
# Imagen con zoom lento: $1 imagen, $2 duración, $3 recorte "w:h:x:y" (sobre 1125×2000), $4 zoom inicial, $5 zoom final, $6 salida
kb(){ ffmpeg -nostdin -loglevel error -y -framerate 30 -loop 1 -t "$2" -i "$1" -f lavfi -t "$2" -i "$SIL" -filter_complex "[0:v]crop=$3,scale=1080*$5:-2,zoompan=z='$4+($5-$4)*on/($2*30)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30,$V[v]" -map "[v]" -map 1:a -c:a pcm_s16le -t "$2" "$6"; }
# Clip: $1 archivo, $2 inicio, $3 duración final, $4 factor de cámara lenta, $5 salida
clip(){ ffmpeg -nostdin -loglevel error -y -i "$1" -filter_complex "[0:v]trim=start=$2,setpts=(PTS-STARTPTS)*$4,scale=1080:1920:flags=lanczos,tpad=stop_mode=clone:stop_duration=3,$V[v];[0:a]atrim=start=$2,asetpts=PTS-STARTPTS,atempo=1/$4,volume=0.35,aresample=48000,apad[a]" -map "[v]" -map "[a]" -c:a pcm_s16le -t "$3" "$5"; }
clip "$DIR/clips/a-hierbas.mp4" 0 7.8 1 "$T/01.mov"
clip "$DIR/clips/c-ventana.mp4" 0 7.8 2.0 "$T/02.mov"
kb "$DIR/imagenes/1-copal.jpg" 4.1 "1125:2000:0:0" 1.0 1.08 "$T/03.mov"
kb "$DIR/imagenes/2-bakhoor.jpg" 4.4 "1125:2000:0:0" 1.0 1.08 "$T/04.mov"
kb "$DIR/imagenes/3-uzerlik.jpg" 8.5 "1125:2000:0:0" 1.0 1.15 "$T/05.mov"
clip "$DIR/clips/a-hierbas.mp4" 5.5 8.6 1.9 "$T/06.mov"
clip "$DIR/clips/b-recorrido.mp4" 0 7.4 1.9 "$T/07.mov"
kb "$DIR/imagenes/1-copal.jpg" 6.6 "800:1420:160:250" 1.0 1.12 "$T/08.mov"
kb "$DIR/imagenes/2-bakhoor.jpg" 10.4 "1125:2000:0:0" 1.12 1.0 "$T/09.mov"
printf "file '%s'\n" "$T"/0{1,2,3,4,5,6,7,8,9}.mov > "$T/l.txt"
ffmpeg -nostdin -loglevel error -y -f concat -safe 0 -i "$T/l.txt" -c:v libx264 -crf 16 -pix_fmt yuv420p -r 30 -c:a pcm_s16le "$S"
rm -rf "$T"; echo "base: $S"
