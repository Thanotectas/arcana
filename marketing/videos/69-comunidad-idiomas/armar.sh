#!/usr/bin/env bash
# Video 69 · Comunidad: habla con gente de todo el mundo sin saber su idioma (chat que se traduce) · clip de Sibila + chat + voz.
# Uso: armar.sh <ar | es> [clip.mp4]  → 69-comunidad-idiomas-<idioma>.mp4
set -euo pipefail
IDIOMA="$1"; CLIP="${2:-}"; DIR="$(cd "$(dirname "$0")" && pwd)"; T="$(mktemp -d)"; SALIDA="$DIR/69-comunidad-idiomas-$IDIOMA.mp4"
# Momentos de la voz (faster-whisper): «مجتمع/comunidad» «تقرؤك/te lee» «ترد/responde» «كل يوم/cada día» duración
case "$IDIOMA" in
 ar) M="6.98 9.80 13.32 16.24 20.96";;
 es) M="6.24 11.06 13.00 16.02 21.52";;
esac
read -r F CAPAS <<< "$(python3 -c "
v=[float(x)+0.2 for x in '$M'.split()]  # la voz entra 0,2 s después
F=round(v[4]+1.0,2)
print(F, ','.join(f'{x:.2f}' for x in v[:4]+[F]))")"
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "${CLIP:-$DIR/clips/sibila.mp4}")
FACTOR=$(python3 -c "print(round($F/$DUR,4))")
# Base: el clip de 10 s estirado a la duración del video, con cuadros intermedios para que la cámara lenta sea suave.
ffmpeg -nostdin -loglevel error -y -i "${CLIP:-$DIR/clips/sibila.mp4}" -filter_complex "[0:v]setpts=$FACTOR*PTS,minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:vsbmc=1,scale=1080:1920:flags=lanczos,format=yuv420p[v];[0:a]atempo=0.5,atempo=$(python3 -c "print(round(2/$FACTOR,4))"),volume=0.3[a]" -map "[v]" -map "[a]" -t $F -c:v libx264 -crf 14 -preset fast -c:a pcm_s16le "$T/base.mov"
NODE_PATH="$(npm root -g)" node "$DIR/cuadros.cjs" "$DIR/capas.html#$IDIOMA,$CAPAS" "$T/c" "$F"
KB=$(python3 -c "print(int((8.8*8*1024)/$F - 140))")
FA="[0:a]volume=1[amb];[2:a]adelay=200|200,apad[voz];[amb][voz]amix=inputs=2:duration=first:normalize=0,afade=t=out:st=$(python3 -c "print($F-.6)"):d=0.6[a]"
ffmpeg -nostdin -loglevel error -y -i "$T/base.mov" -framerate 30 -i "$T/c/%05d.png" -filter_complex "[0:v][1:v]overlay=0:0,format=yuv420p[v]" -map "[v]" -c:v libx264 -preset slow -b:v ${KB}k -pass 1 -passlogfile "$T/p" -an -t $F -f mp4 /dev/null
ffmpeg -nostdin -loglevel error -y -i "$T/base.mov" -framerate 30 -i "$T/c/%05d.png" -i "$DIR/voz/$IDIOMA.mp3" -filter_complex "[0:v][1:v]overlay=0:0,format=yuv420p[v];$FA" -map "[v]" -map "[a]" -c:v libx264 -preset slow -b:v ${KB}k -pass 2 -passlogfile "$T/p" -c:a aac -b:a 128k -t $F -movflags +faststart "$SALIDA"
rm -rf "$T"; echo "listo: $SALIDA ($F s, $(du -h "$SALIDA" | cut -f1))"
