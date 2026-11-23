#!/usr/bin/env bash
# Video 55 · Luna llena en Géminis, martes 24 de noviembre (1080×1920, ~24 s, menos de 10 MB).
# Clip de Gemini (10 s, solo manos): 0-5.5 s desdobla el papel; 5.5-9.9 s lo quema y las chispas suben a la luna.
# Se estira al ritmo de la voz (Marcela) para que el papel arda en «quémalo»; el último cuadro queda quieto bajo el cierre.
# Uso: armar.sh <salida.mp4> [idioma] [TB TC TZ]
#   idioma: es (voz/sibila.mp3) o en, pt, fr, tr, ar, id, hi (voz/<idioma>.mp3; títulos en capas.html).
#   TB TC TZ: segundos en que cambian las tarjetas (pausas de la voz + 0.3 s).
set -euo pipefail
SALIDA="$1"; DIR="$(cd "$(dirname "$0")" && pwd)"; T="$(mktemp -d)"
dur() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }
IDIOMA="${2:-es}"; INI=0.3
if [ "$IDIOMA" = es ]; then VOZ="$DIR/voz/sibila.mp3"; else VOZ="$DIR/voz/$IDIOMA.mp3"; fi
# Español: «…se suelta» 3.85 s, «…quémalo con cuidado» 10.4 s, «…las palabras pesan» 15.3 s.
TB="${3:-4.45}"; TC="${4:-11.0}"; TZ="${5:-15.9}"
F=$(python3 -c "print(round($INI+$(dur "$VOZ")+2.2,2))")
V9="scale=1080:1920:flags=lanczos,fps=30,setsar=1"
L1=$(python3 -c "print(round($TC-1.5,2))"); L2=$(python3 -c "print(round(($TZ+1.6)-$L1,2))"); L3=$(python3 -c "print(round($F-$L1-$L2,2))")
E="$DIR/clips/escena.mp4"
ffmpeg -nostdin -loglevel error -y -ss 0 -to 5.5 -i "$E" -vf "$V9,setpts=(PTS-STARTPTS)*$(python3 -c "print($L1/5.5)")" -an -t "$L1" "$T/1.mp4"
ffmpeg -nostdin -loglevel error -y -ss 5.5 -to 9.9 -i "$E" -vf "$V9,setpts=(PTS-STARTPTS)*$(python3 -c "print($L2/4.4)")" -an -t "$L2" "$T/2.mp4"
ffmpeg -nostdin -loglevel error -y -ss 9.9 -i "$E" -frames:v 1 "$T/fin.png"
ffmpeg -nostdin -loglevel error -y -loop 1 -t "$L3" -i "$T/fin.png" -vf "$V9,scale=1080*(1+0.04*t/$L3):-2:eval=frame,crop=1080:1920" -an -t "$L3" "$T/3.mp4"
printf "file '%s'\n" "$T/1.mp4" "$T/2.mp4" "$T/3.mp4" > "$T/lista.txt"
ffmpeg -nostdin -loglevel error -y -f concat -safe 0 -i "$T/lista.txt" -c:v libx264 -crf 16 -pix_fmt yuv420p -r 30 "$T/base.mp4"
m=$(python3 -c "print(int($INI*1000))")
ffmpeg -nostdin -loglevel error -y -i "$VOZ" -filter_complex \
  "[0]adelay=$m|$m,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=44100,apad=whole_dur=$F[a]" \
  -map "[a]" -c:a aac -b:a 128k "$T/voz.m4a"
NODE_PATH="$(npm root -g)" node "$DIR/cuadros.cjs" "$DIR/capas.html#$TB,$TC,$TZ,$F,$IDIOMA" "$T/capas" "$F"
ffmpeg -nostdin -loglevel error -y -i "$T/base.mp4" -framerate 30 -i "$T/capas/%05d.png" \
  -filter_complex "[0:v][1:v]overlay=0:0:eof_action=pass,format=yuv420p[v]" -map "[v]" -t "$F" -c:v libx264 -crf 14 -preset veryfast "$T/compuesto.mp4"
# Dos pasadas a un tamaño fijo: menos de 10 MB (9.2 MB de margen).
BR=$(python3 -c "print(int(9.2*8*1024/$F - 128))")
ffmpeg -nostdin -loglevel error -y -i "$T/compuesto.mp4" -c:v libx264 -b:v ${BR}k -preset slow -pass 1 -passlogfile "$T/p" -an -f mp4 /dev/null
ffmpeg -nostdin -loglevel error -y -i "$T/compuesto.mp4" -i "$T/voz.m4a" -map 0:v -map 1:a -c:v libx264 -b:v ${BR}k -preset slow -pass 2 -passlogfile "$T/p" -c:a copy -movflags +faststart -t "$F" "$SALIDA"
rm -rf "$T"; echo "listo: $SALIDA ($F s, $(du -h "$SALIDA" | cut -f1))"
