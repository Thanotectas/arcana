#!/usr/bin/env bash
# Video 47 · Sibila: empieza la temporada de Sagitario + luna llena del martes 24 (1080×1920, ~20 s).
# Escena de Gemini (10 s): 0-6 s la flecha entra en la bola; 6-10 s el arquero de estrellas en la ventana.
# Se estira al ritmo de la voz (una sola pista de Marcela) y el arquero queda quieto bajo el cierre.
# Uso: armar.sh <salida.mp4>
set -euo pipefail
SALIDA="$1"; DIR="$(cd "$(dirname "$0")" && pwd)"; T="$(mktemp -d)"
dur() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }
VOZ="$DIR/voz/sibila.mp3"; INI=0.3
# Cortes de las tarjetas según las pausas de la voz (silencedetect): «…la fe» 4.0 s, «…te ata» 9.7 s, «…luna llena» 13.1 s.
TB=4.75; TC=10.4; TZ=13.8
F=$(python3 -c "print(round($INI+$(dur "$VOZ")+2.2,2))")
V9="scale=1080:1920:flags=lanczos,fps=30,setsar=1"
L1=8.6; L2=6; L3=$(python3 -c "print(round($F-$L1-$L2,2))")
ffmpeg -nostdin -loglevel error -y -ss 0 -to 6 -i "$DIR/clips/escena.mp4" -vf "$V9,setpts=(PTS-STARTPTS)*$(python3 -c "print($L1/6)")" -an -t "$L1" "$T/1.mp4"
ffmpeg -nostdin -loglevel error -y -ss 6 -to 9.9 -i "$DIR/clips/escena.mp4" -vf "$V9,setpts=(PTS-STARTPTS)*$(python3 -c "print($L2/3.9)")" -an -t "$L2" "$T/2.mp4"
ffmpeg -nostdin -loglevel error -y -ss 9.85 -i "$DIR/clips/escena.mp4" -frames:v 1 "$T/fin.png"
ffmpeg -nostdin -loglevel error -y -loop 1 -t "$L3" -i "$T/fin.png" -vf "$V9,scale=1080*(1+0.04*t/$L3):-2:eval=frame,crop=1080:1920" -an -t "$L3" "$T/3.mp4"
printf "file '%s'\n" "$T/1.mp4" "$T/2.mp4" "$T/3.mp4" > "$T/lista.txt"
ffmpeg -nostdin -loglevel error -y -f concat -safe 0 -i "$T/lista.txt" -c:v libx264 -crf 16 -pix_fmt yuv420p -r 30 "$T/base.mp4"
m=$(python3 -c "print(int($INI*1000))")
ffmpeg -nostdin -loglevel error -y -i "$VOZ" -filter_complex \
  "[0]adelay=$m|$m,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=44100,apad=whole_dur=$F[a]" \
  -map "[a]" -c:a aac -b:a 160k "$T/voz.m4a"
NODE_PATH="$(npm root -g)" node "$DIR/cuadros.cjs" "$DIR/capas.html#$TB,$TC,$TZ,$F" "$T/capas" "$F"
ffmpeg -nostdin -loglevel error -y -i "$T/base.mp4" -framerate 30 -i "$T/capas/%05d.png" -i "$T/voz.m4a" \
  -filter_complex "[0:v][1:v]overlay=0:0:eof_action=pass,format=yuv420p[v]" -map "[v]" -map 2:a -t "$F" \
  -c:v libx264 -crf 20 -preset veryfast -c:a copy -movflags +faststart "$SALIDA"
rm -rf "$T"; echo "listo: $SALIDA ($F s)"
