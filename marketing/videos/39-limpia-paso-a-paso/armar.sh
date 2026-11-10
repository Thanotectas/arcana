#!/usr/bin/env bash
# Video 39 · «La limpia con huevo, paso a paso (y sin miedo)» (1080×1920, ~55 s, sin música: se agrega en la app).
# Escena de Flow (clip 1 en 1080p + la escena completa de 30 s en 720p) estirada al ritmo de las 8 voces de Sibila;
# la parte donde se ve el mentón va recortada por arriba. Los pasos y el cierre van en capas.html.
# Uso: armar.sh <salida.mp4>
set -euo pipefail
SALIDA="$1"
DIR="$(cd "$(dirname "$0")" && pwd)"
T="$(mktemp -d)"
dur() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }
V=("$DIR"/voz/0{1,2,3,4,5,6,7,8}-*.mp3)
# Inicio de cada voz: una pausa corta entre frases.
read -r -a INI <<<"$(python3 -c "
d=[$(for f in "${V[@]}"; do printf '%s,' "$(dur "$f")"; done)]
t=0.3; out=[]
for x in d: out.append(round(t,2)); t+=x+0.35
print(' '.join(map(str,out)), round(t+2.2,2))")"
F=${INI[8]}
# Tramos: A (clip 1, se lee el gancho y el paso 1) hasta la voz 3; B (pasar el huevo) hasta la voz 5;
# C1 (romper) hasta la voz 6; C2 (el vaso) hasta el final, con el último cuadro quieto y un zoom lento.
LA=$(python3 -c "print(${INI[2]}-0.2)"); LB=$(python3 -c "print(${INI[4]}-0.2-(${INI[2]}-0.2))"); LC1=$(python3 -c "print(${INI[5]}-${INI[4]})")
V9="scale=1080:1920:flags=lanczos,fps=30,setsar=1"
SUBE="scale=1274:2266,crop=1080:1920:97:346"   # recorte de arriba: que no se vea la cara
ffmpeg -loglevel error -y -i "$DIR/clips/clip1.mp4" -vf "$V9,$SUBE,setpts=PTS*$(python3 -c "print($LA/9.95)")" -an -t "$LA" "$T/a.mp4"
ffmpeg -loglevel error -y -ss 10 -to 20 -i "$DIR/clips/escena.mp4" -vf "$V9,$SUBE,setpts=(PTS-STARTPTS)*$(python3 -c "print($LB/10)")" -an -t "$LB" "$T/b.mp4"
ffmpeg -loglevel error -y -ss 20 -to 24 -i "$DIR/clips/escena.mp4" -vf "$V9,setpts=(PTS-STARTPTS)*$(python3 -c "print($LC1/4)")" -an -t "$LC1" "$T/c1.mp4"
LC2=$(python3 -c "print($F-${INI[5]})")
ffmpeg -loglevel error -y -ss 24 -i "$DIR/clips/escena.mp4" -vf "$V9,tpad=stop_mode=clone:stop_duration=30,scale=1080*(1+0.06*t/$LC2):-2:eval=frame,crop=1080:1920" -an -t "$LC2" "$T/c2.mp4"
printf "file '%s'\n" "$T/a.mp4" "$T/b.mp4" "$T/c1.mp4" "$T/c2.mp4" > "$T/lista.txt"
ffmpeg -loglevel error -y -f concat -safe 0 -i "$T/lista.txt" -c:v libx264 -crf 16 -pix_fmt yuv420p -r 30 "$T/base.mp4"
# Voz
FILTRO=""; for i in 0 1 2 3 4 5 6 7; do ms=$(python3 -c "print(int(${INI[$i]}*1000))"); FILTRO+="[$i]adelay=$ms|$ms[a$i];"; done
FILTRO+="[a0][a1][a2][a3][a4][a5][a6][a7]amix=inputs=8:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=44100,apad=whole_dur=$F[a]"
ENTR=(); for f in "${V[@]}"; do ENTR+=(-i "$f"); done
ffmpeg -loglevel error -y "${ENTR[@]}" -filter_complex "$FILTRO" -map "[a]" -c:a aac -b:a 160k "$T/voz.m4a"
HASH="$(IFS=,; echo "${INI[*]}")"
NODE_PATH="$(npm root -g)" node "$DIR/cuadros.cjs" "$DIR/capas.html#$HASH" "$T/capas" "$F"
ffmpeg -loglevel error -y -i "$T/base.mp4" -framerate 30 -i "$T/capas/%05d.png" -i "$T/voz.m4a" \
  -filter_complex "[0:v][1:v]overlay=0:0:eof_action=pass,format=yuv420p[v]" -map "[v]" -map 2:a -t "$F" \
  -c:v libx264 -crf 20 -preset veryfast -c:a copy -movflags +faststart "$SALIDA"
rm -rf "$T"
echo "listo: $SALIDA ($F s)"
