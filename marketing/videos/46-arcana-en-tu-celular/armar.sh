#!/usr/bin/env bash
# Video 46 · Arcana en tu celular (1080×1920, ~18 s). Escena de Gemini (20 s): Sibila muestra el teléfono, en medio las
# pantallas reales de miarcana.com/app y del juego dentro de un teléfono, y al final las cartas que salen del teléfono.
# Se salta el tramo 12.9–15 s de la escena (aparece un segundo teléfono).
# Uso: armar.sh <salida.mp4>
set -euo pipefail
SALIDA="$1"; DIR="$(cd "$(dirname "$0")" && pwd)"; T="$(mktemp -d)"
dur() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }
V=("$DIR"/voz/0{1,2,3}-*.mp3)
read -r -a INI <<<"$(python3 -c "
d=[$(for f in "${V[@]}"; do printf '%s,' "$(dur "$f")"; done)]
t=0.3; out=[]
for x in d: out.append(round(t,2)); t+=x+0.4
print(' '.join(map(str,out)), round(t+2.4,2))")"
F=${INI[3]}
E="$DIR/clips/escena.mp4"
V9="scale=1080:1920:flags=lanczos,fps=30,setsar=1"
L1=${INI[1]}; L2=$(python3 -c "print(round(${INI[2]}-${INI[1]},3))"); L3=$(python3 -c "print(round($F-${INI[2]},3))")
# 1) Sibila toma el teléfono y lo muestra (5.0–9.5 s)
ffmpeg -nostdin -loglevel error -y -ss 5.0 -to 9.5 -i "$E" -vf "$V9,setpts=(PTS-STARTPTS)*$(python3 -c "print($L1/4.5)")" -an -t "$L1" "$T/1.mp4"
# 2) Fondo del teléfono con las pantallas: la misma escena, desenfocada y oscura
ffmpeg -nostdin -loglevel error -y -ss 9.3 -i "$E" -frames:v 1 "$T/fondo.png"
ffmpeg -nostdin -loglevel error -y -loop 1 -t "$L2" -i "$T/fondo.png" -vf "$V9,boxblur=28:2,eq=brightness=-0.18:saturation=1.2,scale=1080*(1+0.05*t/$L2):-2:eval=frame,crop=1080:1920" -an -t "$L2" "$T/2.mp4"
# 3) Toca la pantalla y salen las cartas (10.5–12.9 s) + la invitación final (15.0–20 s)
ffmpeg -nostdin -loglevel error -y -ss 10.5 -to 12.9 -i "$E" -vf "$V9,setpts=PTS-STARTPTS" -an "$T/3a.mp4"
ffmpeg -nostdin -loglevel error -y -ss 15.0 -to 20.0 -i "$E" -vf "$V9,setpts=PTS-STARTPTS" -an "$T/3b.mp4"
ffmpeg -nostdin -loglevel error -y -i "$T/3a.mp4" -i "$T/3b.mp4" -filter_complex "[0][1]xfade=transition=fade:duration=0.35:offset=2.05,setpts=PTS*$(python3 -c "print($L3/(2.4+5.0-0.35))")[v]" -map "[v]" -an -t "$L3" "$T/3.mp4"
printf "file '%s'\n" "$T/1.mp4" "$T/2.mp4" "$T/3.mp4" > "$T/lista.txt"
ffmpeg -nostdin -loglevel error -y -f concat -safe 0 -i "$T/lista.txt" -c:v libx264 -crf 16 -pix_fmt yuv420p -r 30 "$T/base.mp4"
m=(); for i in 0 1 2; do m+=("$(python3 -c "print(int(${INI[$i]}*1000))")"); done
ffmpeg -nostdin -loglevel error -y -i "${V[0]}" -i "${V[1]}" -i "${V[2]}" -filter_complex \
  "[0]adelay=${m[0]}|${m[0]}[a0];[1]adelay=${m[1]}|${m[1]}[a1];[2]adelay=${m[2]}|${m[2]}[a2];[a0][a1][a2]amix=inputs=3:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=44100,apad=whole_dur=$F[a]" \
  -map "[a]" -c:a aac -b:a 160k "$T/voz.m4a"
NODE_PATH="$(npm root -g)" node "$DIR/cuadros.cjs" "$DIR/capas.html#${INI[0]},${INI[1]},${INI[2]},$F" "$T/capas" "$F"
ffmpeg -nostdin -loglevel error -y -i "$T/base.mp4" -framerate 30 -i "$T/capas/%05d.png" -i "$T/voz.m4a" \
  -filter_complex "[0:v][1:v]overlay=0:0:eof_action=pass,format=yuv420p[v]" -map "[v]" -map 2:a -t "$F" \
  -c:v libx264 -crf 20 -preset veryfast -c:a copy -movflags +faststart "$SALIDA"
rm -rf "$T"; echo "listo: $SALIDA ($F s)"
