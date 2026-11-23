#!/usr/bin/env bash
# Video 48 · Biblioteca de Sibila #1, la lectura del café (1080×1920, ~52 s). Cuatro imágenes de Gemini animadas con
# zoom y paneo y dos clips (voltear la taza, las figuras) al ritmo de la voz; títulos de capas.html encima.
# Uso: armar.sh <salida.mp4> [idioma s1 s2 B1 B2 B3 s4 B4 B5]
#   idioma: es (voz/sibila.mp3) o tr, ar, fr (voz/<idioma>.mp3). Los tiempos (segundos del video) salen de las pausas de la voz:
#   s1 fin del título, s2 fin de «casas de café», B1-B5 cortes de imagen (sobremesa, voltear, figuras, mapa, cierre), s4 «dibuja figuras».
set -euo pipefail
SALIDA="$1"; DIR="$(cd "$(dirname "$0")" && pwd)"; T="$(mktemp -d)"
dur() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }
IDIOMA="${2:-es}"; INI=0.3
if [ "$IDIOMA" = es ]; then VOZ="$DIR/voz/sibila.mp3"; else VOZ="$DIR/voz/$IDIOMA.mp3"; fi
S1="${3:-5.1}"; S2="${4:-13.1}"; B1="${5:-18.6}"; B2="${6:-22.0}"; B3="${7:-28.5}"; S4="${8:-30.9}"; B4="${9:-39.3}"; B5="${10:-45.7}"
F=$(python3 -c "print(round($INI+$(dur "$VOZ")+2.0,2))")
# tramo: imagen, inicio, fin, zoom inicial, zoom final, y inicial (0-1), y final (0-1)
tramo() {
  local img="$1" a="$2" b="$3" z0="$4" z1="$5" y0="$6" y1="$7" n="$8"
  local d; d=$(python3 -c "print(round($b-$a,3))"); local fr; fr=$(python3 -c "print(int(round(($b-$a)*30)))")
  ffmpeg -nostdin -loglevel error -y -loop 1 -i "$DIR/imagenes/$img" -vf \
    "scale=2160:-2:flags=lanczos,zoompan=z='$z0+($z1-$z0)*on/$fr':x='iw/2-(iw/zoom/2)':y='(ih-ih/zoom)*($y0+($y1-$y0)*on/$fr)':d=$fr:s=1080x1920:fps=30,setsar=1" \
    -frames:v "$fr" -c:v libx264 -crf 16 -pix_fmt yuv420p "$T/$n.mp4"
  echo "file '$T/$n.mp4'" >> "$T/lista.txt"
}
# clip: video de Flow/Gemini (desde, hasta) estirado al tramo de la voz (inicio, fin)
clip() {
  local v="$1" desde="$2" hasta="$3" a="$4" b="$5" n="$6"
  local d; d=$(python3 -c "print(round($b-$a,3))")
  ffmpeg -nostdin -loglevel error -y -ss "$desde" -to "$hasta" -i "$DIR/clips/$v" -vf "scale=1080:1920:flags=lanczos,setpts=(PTS-STARTPTS)*$(python3 -c "print(round($d/($hasta-$desde),4))"),fps=30,setsar=1" -an -t "$d" -c:v libx264 -crf 16 -pix_fmt yuv420p "$T/$n.mp4"
  echo "file '$T/$n.mp4'" >> "$T/lista.txt"
}
tramo 1-casa.jpg      0     "$B1" 1.00 1.18 0.55 0.45 1
tramo 3-sobremesa.jpg "$B1" "$B2" 1.05 1.15 0.40 0.32 2
clip c2.mp4 1.5 9.5 "$B2" "$B3" 3a
clip c1.mp4 2.0 10.0 "$B3" "$B4" 3b
tramo 2-mapa.jpg      "$B4" "$B5" 1.12 1.12 0.00 1.00 4
tramo 4-taza.jpg      "$B5" "$F" 1.20 1.05 0.40 0.45 5
ffmpeg -nostdin -loglevel error -y -f concat -safe 0 -i "$T/lista.txt" -c copy "$T/base.mp4"
m=$(python3 -c "print(int($INI*1000))")
ffmpeg -nostdin -loglevel error -y -i "$VOZ" -filter_complex "[0]adelay=$m|$m,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=44100,apad=whole_dur=$F[a]" -map "[a]" -c:a aac -b:a 160k "$T/voz.m4a"
NODE_PATH="$(npm root -g)" node "$DIR/cuadros.cjs" "$DIR/capas.html#$IDIOMA,$S1,$S2,$B1,$B2,$B3,$S4,$B4,$B5" "$T/capas" "$F"
ffmpeg -nostdin -loglevel error -y -i "$T/base.mp4" -framerate 30 -i "$T/capas/%05d.png" -i "$T/voz.m4a" \
  -filter_complex "[0:v][1:v]overlay=0:0:eof_action=pass,format=yuv420p[v]" -map "[v]" -map 2:a -t "$F" \
  -c:v libx264 -crf 20 -preset veryfast -c:a copy -movflags +faststart "$SALIDA"
rm -rf "$T"; echo "listo: $SALIDA ($F s)"
