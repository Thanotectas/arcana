#!/usr/bin/env bash
# Base de imagen del video 63 (sin textos): museo → nazar (clip) → bazar → khamsa → huevo (clip) → abuela. 35 s, 30 fps.
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"; T="$(mktemp -d)"; S="$1"
V="fps=30,format=yuv420p,setsar=1"
# Imagen con zoom lento (Ken Burns). $1 imagen, $2 duración, $3 recorte inicial "w:h:x:y" (sobre 1116×2000), $4 zoom final
kb(){ ffmpeg -nostdin -loglevel error -y -framerate 30 -loop 1 -t "$2" -i "$1" -vf "crop=$3,scale=1080*$4:-2,zoompan=z='1+($4-1)*on/($2*30)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30,$V" -t "$2" "$5"; }
kb "$DIR/imagenes/1-museo.jpg" 6.5 "1116:1984:0:8" 1.10 "$T/1.mp4"
ffmpeg -nostdin -loglevel error -y -ss 1.0 -t 6 -i "$DIR/clips/nazar.mp4" -vf "scale=1080:1920,$V" -an "$T/2.mp4"
kb "$DIR/imagenes/2-bazar.jpg" 3.5 "1116:1984:0:8" 1.12 "$T/3.mp4"
kb "$DIR/imagenes/3-khamsa.jpg" 4.5 "1116:1984:0:8" 1.10 "$T/4.mp4"
ffmpeg -nostdin -loglevel error -y -ss 0.4 -t 6.5 -i "$DIR/clips/huevo.mp4" -vf "scale=1080:1920,$V" -an "$T/5.mp4"
# La abuela: se recorta la parte de arriba, donde asoma su cara (la serie va sin caras).
kb "$DIR/imagenes/4-abuela.jpg" 8 "858:1525:258:470" 1.06 "$T/6.mp4"
printf "file '%s'\n" "$T"/{1,2,3,4,5,6}.mp4 > "$T/l.txt"
ffmpeg -nostdin -loglevel error -y -f concat -safe 0 -i "$T/l.txt" -c:v libx264 -crf 16 -pix_fmt yuv420p -r 30 "$S"
rm -rf "$T"; echo "base: $S"
