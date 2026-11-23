#!/usr/bin/env bash
# Video 49 · Biblioteca de Sibila #2, la limpia con huevo (1080×1920, ~53 s, < 10 MB). Dos imágenes de Gemini con zoom,
# los dos clips de Flow (la limpia, el vaso) y sus últimos cuadros congelados; títulos de capas.html encima.
# Uso: armar.sh <salida.mp4> [idioma s1 s2 B1 B2 B3 s4 B4]
#   idioma: es (voz/sibila.mp3) o pt (voz/pt.mp3). Tiempos (segundos del video) según las pausas de la voz:
#   s1 fin del título · s2 = B1 fin del altar · B2 fin de la mesa · B3 fin de la limpia · s4 «se rompe en un vaso» · B4 cierre.
set -euo pipefail
SALIDA="$1"; DIR="$(cd "$(dirname "$0")" && pwd)"; T="$(mktemp -d)"
dur() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }
IDIOMA="${2:-es}"; INI=0.3
if [ "$IDIOMA" = es ]; then VOZ="$DIR/voz/sibila.mp3"; else VOZ="$DIR/voz/$IDIOMA.mp3"; fi
S1="${3:-5.5}"; S2="${4:-13.8}"; B1="${5:-13.8}"; B2="${6:-23.6}"; B3="${7:-31.5}"; S4="${8:-34.9}"; B4="${9:-44.8}"
F=$(python3 -c "print(round($INI+$(dur "$VOZ")+2.0,2))")
tramo() {
  local img="$1" a="$2" b="$3" z0="$4" z1="$5" y0="$6" y1="$7" n="$8"
  local fr; fr=$(python3 -c "print(int(round(($b-$a)*30)))")
  ffmpeg -nostdin -loglevel error -y -loop 1 -i "$img" -vf \
    "scale=2160:-2:flags=lanczos,zoompan=z='$z0+($z1-$z0)*on/$fr':x='iw/2-(iw/zoom/2)':y='(ih-ih/zoom)*($y0+($y1-$y0)*on/$fr)':d=$fr:s=1080x1920:fps=30,setsar=1" \
    -frames:v "$fr" -c:v libx264 -crf 16 -pix_fmt yuv420p "$T/$n.mp4"
  echo "file '$T/$n.mp4'" >> "$T/lista.txt"
}
clip() {
  local v="$1" a="$2" b="$3" n="$4"; local d; d=$(python3 -c "print(round($b-$a,3))")
  local dv; dv=$(dur "$DIR/clips/$v")
  ffmpeg -nostdin -loglevel error -y -i "$DIR/clips/$v" -vf "scale=1080:1920:flags=lanczos,setpts=(PTS-STARTPTS)*$(python3 -c "print(round($d/$dv,4))"),fps=30,setsar=1" -an -t "$d" -c:v libx264 -crf 16 -pix_fmt yuv420p "$T/$n.mp4"
  echo "file '$T/$n.mp4'" >> "$T/lista.txt"
}
ffmpeg -nostdin -loglevel error -y -sseof -0.1 -i "$DIR/clips/vaso.mp4" -frames:v 1 -update 1 "$T/fin-vaso.png"
ffmpeg -nostdin -loglevel error -y -sseof -0.1 -i "$DIR/clips/limpia.mp4" -frames:v 1 -update 1 "$T/fin-limpia.png"
V2=$(python3 -c "print(round($B3+7.9,2))")
tramo "$DIR/imagenes/1-altar.jpg" 0 "$B1" 1.00 1.18 0.55 0.45 1
tramo "$DIR/imagenes/2-mesa.jpg" "$B1" "$B2" 1.05 1.18 0.45 0.55 2
clip limpia.mp4 "$B2" "$B3" 3
clip vaso.mp4 "$B3" "$V2" 4
tramo "$T/fin-vaso.png" "$V2" "$B4" 1.00 1.10 0.45 0.50 5
tramo "$T/fin-limpia.png" "$B4" "$F" 1.12 1.00 0.40 0.40 6
ffmpeg -nostdin -loglevel error -y -f concat -safe 0 -i "$T/lista.txt" -c copy "$T/base.mp4"
m=$(python3 -c "print(int($INI*1000))")
ffmpeg -nostdin -loglevel error -y -i "$VOZ" -filter_complex "[0]adelay=$m|$m,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=44100,apad=whole_dur=$F[a]" -map "[a]" -c:a aac -b:a 128k "$T/voz.m4a"
NODE_PATH="$(npm root -g)" node "$DIR/cuadros.cjs" "$DIR/capas.html#$IDIOMA,$S1,$S2,$B1,$B2,$B3,$S4,$B4,$B4" "$T/capas" "$F"
ffmpeg -nostdin -loglevel error -y -i "$T/base.mp4" -framerate 30 -i "$T/capas/%05d.png" -filter_complex "[0:v][1:v]overlay=0:0:eof_action=pass,format=yuv420p[v]" -map "[v]" -t "$F" -c:v libx264 -crf 18 -preset veryfast "$T/video.mp4"
# Menos de 10 MB: dos pasadas con la tasa justa para la duración.
vb=$(python3 -c "print(int((9.0*1000*1000*8/$F - 128000)/1000))")
ffmpeg -nostdin -loglevel error -y -i "$T/video.mp4" -c:v libx264 -preset slow -b:v ${vb}k -pass 1 -passlogfile "$T/p" -an -f mp4 /dev/null
ffmpeg -nostdin -loglevel error -y -i "$T/video.mp4" -i "$T/voz.m4a" -map 0:v -map 1:a -c:v libx264 -preset slow -b:v ${vb}k -pass 2 -passlogfile "$T/p" -c:a copy -movflags +faststart "$SALIDA"
rm -rf "$T"; echo "listo: $SALIDA ($F s)"
