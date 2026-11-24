#!/usr/bin/env bash
# Video 56 · El Arcano de Sibila #4: Yıldızname (1080×1920, menos de 10 MB).
# Tramos (segundos del video, la voz entra a los 0.3 s):
#   0–A  el calígrafo dibuja estrellas (clip A)   ·  A–B  Estambul (imagen 1)  ·  B–C  números (imagen 2)
#   C–D  madre e hija con el farol (imagen 3)     ·  D–E  Sibila abre el libro y sube la rueda (clip B completo)
#   E–F  la rueda con Leo, quieta, con un acercamiento suave (último cuadro del clip).
# Tarjetas: cambian en A, B(=número), C, D, E y G (Leyla → «¿cuál es tu estrella?»).
# Uso: armar.sh <salida.mp4> <idioma es|tr|ar> A B C D E G
set -euo pipefail
SALIDA="$1"; IDIOMA="$2"; A="$3"; B="$4"; C="$5"; D="$6"; E="$7"; G="$8"
DIR="$(cd "$(dirname "$0")" && pwd)"; T="$(mktemp -d)"
dur() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }
py() { python3 -c "print(round($1,3))"; }
VOZ="$DIR/voz/$IDIOMA.mp3"; INI=0.3
F=$(py "$INI+$(dur "$VOZ")+2.2")
V9="scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1"
CLIP="$DIR/clips/sibila-libro.mp4"; CALIGRAFO="$DIR/clips/caligrafo.mp4"
tramo() { # imagen duración salida
  local n; n=$(python3 -c "print(int(round($2*30)))")
  ffmpeg -nostdin -loglevel error -y -loop 1 -i "$1" -vf "$V9,scale=2160:3840,zoompan=z='1+0.07*on/$n':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30" -frames:v "$n" -an "$3"
}
clip() { # archivo desde hasta duración salida (casi a velocidad normal: solo se ajusta al largo de la voz)
  ffmpeg -nostdin -loglevel error -y -ss "$2" -to "$3" -i "$1" -vf "$V9,setpts=(PTS-STARTPTS)*$(py "$4/($3-$2)"),fps=30" -an -t "$4" "$5"
}
clip "$CALIGRAFO" 0 7.9 "$A" "$T/1.mp4"
tramo "$DIR/imagenes/1-estambul.jpg" "$(py "$B-$A")" "$T/2.mp4"
tramo "$DIR/imagenes/2-numeros.jpg" "$(py "$C-$B")" "$T/3.mp4"
tramo "$DIR/imagenes/3-madre-hija.jpg" "$(py "$D-$C")" "$T/4.mp4"
clip "$CLIP" 0 7.9 "$(py "$E-$D")" "$T/5.mp4"
ffmpeg -nostdin -loglevel error -y -sseof -0.1 -i "$CLIP" -frames:v 1 -update 1 "$T/fin.png"
# Cierre: la rueda de Leo arriba, un poco más pequeña, sobre el mismo cuadro difuminado; abajo queda lugar para el texto.
ffmpeg -nostdin -loglevel error -y -i "$T/fin.png" -filter_complex "[0]$V9,split[a][b];[a]boxblur=30:3,eq=brightness=-0.18[fondo];[b]$V9,scale=778:1382[frente];[fondo][frente]overlay=151:40" -frames:v 1 "$T/cierre.png"
tramo "$T/cierre.png" "$(py "$F-$E")" "$T/6.mp4"
printf "file '%s'\n" "$T"/{1,2,3,4,5,6}.mp4 > "$T/lista.txt"
ffmpeg -nostdin -loglevel error -y -f concat -safe 0 -i "$T/lista.txt" -c:v libx264 -crf 16 -pix_fmt yuv420p -r 30 "$T/base.mp4"
m=$(python3 -c "print(int($INI*1000))")
ffmpeg -nostdin -loglevel error -y -i "$VOZ" -filter_complex "[0]adelay=$m|$m,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=44100,apad=whole_dur=$F[a]" -map "[a]" -c:a aac -b:a 128k "$T/voz.m4a"
NODE_PATH="$(npm root -g)" node "$DIR/cuadros.cjs" "$DIR/capas.html#$A,$C,$D,$E,$G,$F,$IDIOMA" "$T/capas" "$F"
ffmpeg -nostdin -loglevel error -y -i "$T/base.mp4" -framerate 30 -i "$T/capas/%05d.png" -filter_complex "[0:v][1:v]overlay=0:0:eof_action=pass,format=yuv420p[v]" -map "[v]" -t "$F" -c:v libx264 -crf 14 -preset veryfast "$T/compuesto.mp4"
BR=$(python3 -c "print(int(9.2*8*1024/$F - 128))")
ffmpeg -nostdin -loglevel error -y -i "$T/compuesto.mp4" -c:v libx264 -b:v ${BR}k -preset slow -pass 1 -passlogfile "$T/p" -an -f mp4 /dev/null
ffmpeg -nostdin -loglevel error -y -i "$T/compuesto.mp4" -i "$T/voz.m4a" -map 0:v -map 1:a -c:v libx264 -b:v ${BR}k -preset slow -pass 2 -passlogfile "$T/p" -c:a copy -movflags +faststart -t "$F" "$SALIDA"
rm -rf "$T"; echo "listo: $SALIDA ($F s, $(du -h "$SALIDA" | cut -f1))"
