#!/usr/bin/env bash
# Video 63 · Biblioteca de Sibila #3 · El mal de ojo, CON LA VOZ DE SIBILA (ElevenLabs, Marcela, voz/<idioma>.mp3).
# Los tramos de imagen y los títulos siguen los tiempos de la voz (medidos con faster-whisper).
# Uso: armar-voz.sh <salida.mp4> <idioma: es | pt | en | fr | tr | ar>
set -euo pipefail
SALIDA="$1"; IDIOMA="$2"; DIR="$(cd "$(dirname "$0")" && pwd)"; T="$(mktemp -d)"
# Momentos de la voz (s, medidos con faster-whisper): Grecia, Turquía, «el nazar», África, Latinoamérica, «Tres caminos», cierre, fin
case "$IDIOMA" in
 es) M="8.2 15.76 21.9 24.16 30.6 36.76 41.22 46.48";;
 tr) M="6.74 14.04 19.36 21.76 26.4 33.76 37.44 43.36";;
 ar) M="7.08 15.8 22.42 25.1 31.78 38.66 43.18 49.84";;
 en) M="7.62 15.06 20.1 23.4 29.5 36.42 41.24 45.92";;
 fr) M="7.98 14.56 19.66 22.76 28.08 34.52 38.68 43.12";;
 pt) M="7.78 15.04 20.84 23.34 29.0 35.08 39.58 45.76";;
esac
# Tramos de imagen (museo nazar bazar khamsa huevo abuela) y ventanas de los títulos, a partir de esos momentos
read -r TRAMOS CAPAS <<< "$(python3 -c "
g,t,n,a,l,r,c,e=map(float,'$M'.split())
cortes=[0,t-.3,n-.3,a-.3,l-.3,r-.3,e+.8]
tr=' '.join(f'{cortes[i+1]-cortes[i]:.2f}' for i in range(6))
v=[g-.3,g-.1,t-.4,t-.1,n-.4,n-.1,a-.4,a-.1,l-.4,l-.1,r-.4,r-.1,c-.3,c-.2]
print(tr.replace(' ','_'),','.join(f'{x:.2f}' for x in v))")"
TRAMOS="${TRAMOS//_/ }"
F=$(python3 -c "print(round(sum(map(float,'$TRAMOS'.split())),2))")
"$DIR/base.sh" "$T/base.mp4" $TRAMOS >/dev/null
NODE_PATH="$(npm root -g)" node "$DIR/cuadros.cjs" "$DIR/capas.html#$IDIOMA,v,$CAPAS" "$T/c" "$F"
KB=$(python3 -c "print(int((8.8*8*1024)/$F - 130))")
FILTRO="[0:v][1:v]overlay=0:0,format=yuv420p[v];[2:a]apad,afade=t=out:st=$(python3 -c "print($F-.6)"):d=0.6[a]"
ffmpeg -nostdin -loglevel error -y -i "$T/base.mp4" -framerate 30 -i "$T/c/%05d.png" -i "$DIR/voz/$IDIOMA.mp3" -filter_complex "[0:v][1:v]overlay=0:0,format=yuv420p[v]" -map "[v]" -c:v libx264 -preset slow -b:v ${KB}k -pass 1 -passlogfile "$T/p" -an -t $F -f mp4 /dev/null
ffmpeg -nostdin -loglevel error -y -i "$T/base.mp4" -framerate 30 -i "$T/c/%05d.png" -i "$DIR/voz/$IDIOMA.mp3" -filter_complex "$FILTRO" -map "[v]" -map "[a]" -c:v libx264 -preset slow -b:v ${KB}k -pass 2 -passlogfile "$T/p" -c:a aac -b:a 128k -t $F -movflags +faststart "$SALIDA"
rm -rf "$T"; echo "listo: $SALIDA ($F s, $(du -h "$SALIDA" | cut -f1))"
