#!/usr/bin/env bash
# Base de imagen y sonido ambiente del video del día 1 (sin textos ni voz), sincronizada con la voz (voz/es.mp3).
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"; T="$(mktemp -d)"; S="$1"
V="fps=30,format=yuv420p,setsar=1"
SIL="anullsrc=r=48000:cl=stereo"
# Imagen con zoom lento: $1 imagen, $2 duración, $3 recorte "w:h:x:y" (sobre 1116×2000), $4 zoom inicial, $5 zoom final, $6 salida
kb(){ ffmpeg -nostdin -loglevel error -y -framerate 30 -loop 1 -t "$2" -i "$1" -f lavfi -t "$2" -i "$SIL" -filter_complex "[0:v]crop=$3,scale=1080*$5:-2,zoompan=z='$4+($5-$4)*on/($2*30)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30,$V[v]" -map "[v]" -map 1:a -c:a pcm_s16le -t "$2" "$6"; }
# Clip: $1 archivo, $2 inicio, $3 duración final, $4 factor de cámara lenta, $5 salida
clip(){ ffmpeg -nostdin -loglevel error -y -i "$1" -filter_complex "[0:v]trim=start=$2,setpts=(PTS-STARTPTS)*$4,scale=1080:1920:flags=lanczos,tpad=stop_mode=clone:stop_duration=3,$V[v];[0:a]atrim=start=$2,asetpts=PTS-STARTPTS,atempo=1/$4,volume=0.35,aresample=48000,apad[a]" -map "[v]" -map "[a]" -c:a pcm_s16le -t "$3" "$5"; }
clip "$DIR/clips/a-sibila.mp4" 0 10.2 1 "$T/01.mov"
kb "$DIR/imagenes/1-luna.jpg" 6.8 "1116:1300:0:700" 1.0 1.12 "$T/02.mov"
clip "$DIR/clips/b-altar.mp4" 0 7.0 1.85 "$T/03.mov"
kb "$DIR/imagenes/3-rincon.jpg" 6.0 "700:1250:300:650" 1.0 1.10 "$T/04.mov"
kb "$DIR/imagenes/3-rincon.jpg" 5.6 "1116:2000:0:0" 1.15 1.0 "$T/05.mov"
kb "$DIR/imagenes/1-luna.jpg" 5.3 "1116:1300:0:0" 1.0 1.12 "$T/06.mov"
kb "$DIR/imagenes/2-tradiciones.jpg" 7.7 "1116:1500:0:150" 1.0 1.10 "$T/07.mov"
kb "$DIR/imagenes/3-rincon.jpg" 7.4 "900:1600:200:500" 1.05 1.15 "$T/08.mov"
clip "$DIR/clips/c-intencion.mp4" 0 7.0 1.8 "$T/09.mov"
clip "$DIR/clips/a-sibila.mp4" 5.4 4.6 1 "$T/10.mov"
printf "file '%s'\n" "$T"/{01,02,03,04,05,06,07,08,09,10}.mov > "$T/l.txt"
ffmpeg -nostdin -loglevel error -y -f concat -safe 0 -i "$T/l.txt" -c:v libx264 -crf 16 -pix_fmt yuv420p -r 30 -c:a pcm_s16le "$S"
rm -rf "$T"; echo "base: $S"
