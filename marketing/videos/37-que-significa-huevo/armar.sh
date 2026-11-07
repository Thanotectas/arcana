#!/usr/bin/env bash
# Video 37 · «¿Qué significa lo que salió en tu vaso?» (1080×1920, ~48 s): gancho, 8 señales con las fotos de la
# serie y cierre. Sin voz, deja el audio en silencio (se pone música en TikTok/Instagram). Con voz: una carpeta con los
# 10 audios de Sibila (voz.txt), buscados por prefijo 01- … 10-; cada parte dura lo que su audio (mínimo el de base).
# Uso: armar.sh <salida.mp4> [carpeta_con_las_voces]
set -euo pipefail
SALIDA="$1"; VOCES="${2:-}"
DIR="$(cd "$(dirname "$0")" && pwd)"
T="$(mktemp -d)"
BASE=(5 4.5 4.5 4.5 4.5 4.5 4.5 4.5 4.5 6.5)
DUR=("${BASE[@]}")
if [ -n "$VOCES" ]; then
  for i in $(seq 0 9); do
    f=$(ls "$VOCES"/$(printf %02d $((i+1)))-* | head -1)
    d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")
    DUR[$i]=$(python3 -c "print(round(max(${BASE[$i]}, $d + 0.7), 2))")
  done
fi
JSON="[$(IFS=,; echo "${DUR[*]}")]"
TOTAL=$(NODE_PATH="$(npm root -g)" node "$DIR/cuadros.cjs" "$DIR/escena.html" "$T/c" "$JSON")
if [ -n "$VOCES" ]; then
  ENTRADAS=(); FILTRO=""; INI=0
  for i in $(seq 0 9); do
    ENTRADAS+=(-i "$(ls "$VOCES"/$(printf %02d $((i+1)))-* | head -1)")
    ms=$(python3 -c "print(int(($INI + 0.25) * 1000))")
    FILTRO+="[$i]adelay=$ms|$ms[a$i];"
    INI=$(python3 -c "print($INI + ${DUR[$i]})")
  done
  FILTRO+="$(for i in $(seq 0 9); do printf "[a%d]" $i; done)amix=inputs=10:normalize=0,apad=whole_dur=$TOTAL[a]"
  ffmpeg -loglevel error -y "${ENTRADAS[@]}" -filter_complex "$FILTRO" -map "[a]" -c:a aac -b:a 160k "$T/voz.m4a"
else
  ffmpeg -loglevel error -y -f lavfi -i anullsrc=r=44100:cl=stereo -t "$TOTAL" -c:a aac -b:a 64k "$T/voz.m4a"
fi
ffmpeg -loglevel error -y -framerate 30 -i "$T/c/%05d.jpg" -i "$T/voz.m4a" -map 0:v -map 1:a -t "$TOTAL" \
  -c:v libx264 -crf 20 -preset veryfast -pix_fmt yuv420p -c:a copy -movflags +faststart "$SALIDA"
rm -rf "$T"
echo "listo: $SALIDA ($TOTAL s)"
