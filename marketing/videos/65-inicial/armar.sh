#!/usr/bin/env bash
# Video 65 · La primera letra de quien ocupa tu mente · un clip de Sibila en cámara lenta + títulos + voz de Sibila.
# Uso: armar.sh <idioma: es | en | pt | fr | tr | ar>  → 65-inicial-<idioma>.mp4
set -euo pipefail
IDIOMA="$1"; DIR="$(cd "$(dirname "$0")" && pwd)"; T="$(mktemp -d)"; SALIDA="$DIR/65-inicial-$IDIOMA.mp4"
# Momentos de la voz (faster-whisper): fuego aire agua tierra «cómo te ama» «escribe la letra» duración
case "$IDIOMA" in
 es) M="9.82 10.78 11.46 12.18 13.28 18.62 21.44";;
 ar) M="8.34 9.68 10.52 11.42 12.40 17.68 20.48";;
 tr) M="7.50 8.26 8.94 9.64 10.58 16.50 18.80";;
 en) M="8.96 9.90 10.56 11.32 12.26 16.68 19.68";;
 pt) M="9.22 10.22 10.74 11.46 12.48 17.82 20.32";;
 fr) M="8.74 9.40 10.00 10.74 11.68 16.26 18.40";;
esac
read -r F CAPAS <<< "$(python3 -c "
v=[float(x)+0.2 for x in '$M'.split()]  # la voz entra 0,2 s después
F=round(v[6]+1.6,2)
print(F, ','.join(f'{x:.2f}' for x in v[:6]+[F]))")"
FACTOR=$(python3 -c "print(round($F/10.0,4))")
# Base: el clip de 10 s estirado a la duración del video, con cuadros intermedios para que la cámara lenta sea suave.
ffmpeg -nostdin -loglevel error -y -i "$DIR/clips/sibila.mp4" -filter_complex "[0:v]setpts=$FACTOR*PTS,minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:vsbmc=1,scale=1080:1920:flags=lanczos,format=yuv420p[v];[0:a]atempo=0.5,atempo=$(python3 -c "print(round(2/$FACTOR,4))"),volume=0.3[a]" -map "[v]" -map "[a]" -t $F -c:v libx264 -crf 14 -preset fast -c:a pcm_s16le "$T/base.mov"
NODE_PATH="$(npm root -g)" node "$DIR/cuadros.cjs" "$DIR/capas.html#$IDIOMA,$CAPAS" "$T/c" "$F"
KB=$(python3 -c "print(int((8.8*8*1024)/$F - 140))")
FA="[0:a]volume=1[amb];[2:a]adelay=200|200,apad[voz];[amb][voz]amix=inputs=2:duration=first:normalize=0,afade=t=out:st=$(python3 -c "print($F-.6)"):d=0.6[a]"
ffmpeg -nostdin -loglevel error -y -i "$T/base.mov" -framerate 30 -i "$T/c/%05d.png" -filter_complex "[0:v][1:v]overlay=0:0,format=yuv420p[v]" -map "[v]" -c:v libx264 -preset slow -b:v ${KB}k -pass 1 -passlogfile "$T/p" -an -t $F -f mp4 /dev/null
ffmpeg -nostdin -loglevel error -y -i "$T/base.mov" -framerate 30 -i "$T/c/%05d.png" -i "$DIR/voz/$IDIOMA.mp3" -filter_complex "[0:v][1:v]overlay=0:0,format=yuv420p[v];$FA" -map "[v]" -map "[a]" -c:v libx264 -preset slow -b:v ${KB}k -pass 2 -passlogfile "$T/p" -c:a aac -b:a 128k -t $F -movflags +faststart "$SALIDA"
rm -rf "$T"; echo "listo: $SALIDA ($F s, $(du -h "$SALIDA" | cut -f1))"
