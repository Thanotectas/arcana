#!/usr/bin/env bash
# Video 41 · Viernes 13: soltar y proteger (1080×1920, ~43 s, sin música). Escena de Flow de 20 s estirada al ritmo de
# las 7 voces; el final queda quieto con la ventana al amanecer. Pasos y cierre en capas.html.
# Uso: armar.sh <salida.mp4>
set -euo pipefail
SALIDA="$1"; DIR="$(cd "$(dirname "$0")" && pwd)"; T="$(mktemp -d)"
dur() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }
V=("$DIR"/voz/0{1,2,3,4,5,6,7}-*.mp3)
read -r -a INI <<<"$(python3 -c "
d=[$(for f in "${V[@]}"; do printf '%s,' "$(dur "$f")"; done)]
t=0.3; out=[]
for x in d: out.append(round(t,2)); t+=x+0.35
print(' '.join(map(str,out)), round(t+2.4,2))")"
F=${INI[7]}
V9="scale=1080:1920:flags=lanczos,fps=30,setsar=1"
# Escena: 0–3,6 sal · 3,6–10,5 vela y escribir · 10,5–15,8 el papel · 15,8–19,5 la ventana · luego cuadro quieto.
python3 - "$F" "${INI[@]}" > "$T/tramos.txt" <<'PY'
import sys
F=float(sys.argv[1]); I=[float(x) for x in sys.argv[2:9]]
for a,b,t0,t1 in [(0,3.6,0,I[2]),(3.6,10.5,I[2],I[3]),(10.5,15.8,I[3],I[4]),(15.8,19.5,I[4],I[5])]: print(a,b,round(t1-t0,3))
print("congelar",round(F-I[5],3),0)
PY
n=0
while read -r a b largo; do
  if [ "$a" = "congelar" ]; then
    ffmpeg -nostdin -loglevel error -y -ss 19.5 -i "$DIR/clips/escena.mp4" -frames:v 1 "$T/ultimo.png"
    ffmpeg -nostdin -loglevel error -y -loop 1 -t "$b" -i "$T/ultimo.png" -vf "$V9,scale=1080*(1+0.05*t/$b):-2:eval=frame,crop=1080:1920" -an -t "$b" "$T/$n.mp4"
  else
    f=$(python3 -c "print($largo/($b-$a))")
    ffmpeg -nostdin -loglevel error -y -ss "$a" -to "$b" -i "$DIR/clips/escena.mp4" -vf "$V9,setpts=(PTS-STARTPTS)*$f" -an -t "$largo" "$T/$n.mp4"
  fi
  echo "file '$T/$n.mp4'" >> "$T/lista.txt"; n=$((n+1))
done < "$T/tramos.txt"
ffmpeg -nostdin -loglevel error -y -f concat -safe 0 -i "$T/lista.txt" -c:v libx264 -crf 16 -pix_fmt yuv420p -r 30 "$T/base.mp4"
FILTRO=""; for i in 0 1 2 3 4 5 6; do ms=$(python3 -c "print(int(${INI[$i]}*1000))"); FILTRO+="[$i]adelay=$ms|$ms[a$i];"; done
FILTRO+="[a0][a1][a2][a3][a4][a5][a6]amix=inputs=7:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=44100,apad=whole_dur=$F[a]"
ENTR=(); for f in "${V[@]}"; do ENTR+=(-i "$f"); done
ffmpeg -nostdin -loglevel error -y "${ENTR[@]}" -filter_complex "$FILTRO" -map "[a]" -c:a aac -b:a 160k "$T/voz.m4a"
HASH="$(IFS=,; echo "${INI[*]}")"
NODE_PATH="$(npm root -g)" node "$DIR/cuadros.cjs" "$DIR/capas.html#$HASH" "$T/capas" "$F"
ffmpeg -nostdin -loglevel error -y -i "$T/base.mp4" -framerate 30 -i "$T/capas/%05d.png" -i "$T/voz.m4a" \
  -filter_complex "[0:v][1:v]overlay=0:0:eof_action=pass,format=yuv420p[v]" -map "[v]" -map 2:a -t "$F" \
  -c:v libx264 -crf 20 -preset veryfast -c:a copy -movflags +faststart "$SALIDA"
rm -rf "$T"; echo "listo: $SALIDA ($F s)"
