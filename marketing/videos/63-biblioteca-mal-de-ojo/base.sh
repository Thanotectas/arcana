#!/usr/bin/env bash
# Base de imagen del video 63 (sin textos): museo → nazar (clip) → bazar → khamsa → huevo (clip) → abuela, 30 fps.
set -euo pipefail
# Uso: base.sh <salida.mp4> [duraciones de los 6 tramos] (sin duraciones: la versión sin voz, 35 s)
DIR="$(cd "$(dirname "$0")" && pwd)"; T="$(mktemp -d)"; S="$1"; shift
read -r D1 D2 D3 D4 D5 D6 <<< "${*:-6.5 6 3.5 4.5 6.5 8}"
V="fps=30,format=yuv420p,setsar=1"
# Imagen con zoom lento (Ken Burns). $1 imagen, $2 duración, $3 recorte inicial "w:h:x:y" (sobre 1116×2000), $4 zoom final
kb(){ ffmpeg -nostdin -loglevel error -y -framerate 30 -loop 1 -t "$2" -i "$1" -vf "crop=$3,scale=1080*$4:-2,zoompan=z='1+($4-1)*on/($2*30)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30,$V" -t "$2" "$5"; }
kb "$DIR/imagenes/1-museo.jpg" $D1 "1116:1984:0:8" 1.10 "$T/1.mp4"
ffmpeg -nostdin -loglevel error -y -ss 1.0 -t $D2 -i "$DIR/clips/nazar.mp4" -vf "scale=1080:1920,tpad=stop_mode=clone:stop_duration=2,$V" -t $D2 -an "$T/2.mp4"
kb "$DIR/imagenes/2-bazar.jpg" $D3 "1116:1984:0:8" 1.12 "$T/3.mp4"
kb "$DIR/imagenes/3-khamsa.jpg" $D4 "1116:1984:0:8" 1.10 "$T/4.mp4"
ffmpeg -nostdin -loglevel error -y -ss 0.3 -t $D5 -i "$DIR/clips/huevo.mp4" -vf "scale=1080:1920,tpad=stop_mode=clone:stop_duration=2,$V" -t $D5 -an "$T/5.mp4"
# La abuela: se recorta la parte de arriba, donde asoma su cara (la serie va sin caras).
kb "$DIR/imagenes/4-abuela.jpg" $D6 "858:1525:258:470" 1.06 "$T/6.mp4"
printf "file '%s'\n" "$T"/{1,2,3,4,5,6}.mp4 > "$T/l.txt"
ffmpeg -nostdin -loglevel error -y -f concat -safe 0 -i "$T/l.txt" -c:v libx264 -crf 16 -pix_fmt yuv420p -r 30 "$S"
rm -rf "$T"; echo "base: $S"
