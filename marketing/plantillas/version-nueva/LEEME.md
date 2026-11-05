# Versión nueva de un video viejo (para republicar)

Cuando un video salió con pocas vistas (por ejemplo, cuando la cuenta casi no tenía seguidores), no se sube el mismo
archivo otra vez: TikTok baja el alcance del contenido repetido. Se hace una versión nueva:

- recorta el tramo útil (sin el cierre viejo) y, si es largo, lo acelera un poco;
- un gancho grande los primeros 2,5 s (una pregunta), sobre fondo oscuro que tapa el título viejo;
- un cierre nuevo de 3 s: «Tu primera lectura es gratis · miarcana.com · Sibila en vivo los domingos»;
- sin audio: la música de tendencia se pone en la app.

```
./rehacer.sh <entrada.mp4> <inicio s> <fin s> <velocidad> "<gancho, con <br>>" "<línea del cierre>" <salida.mp4>
```

El original se deja en «Solo yo» (privado) en TikTok, sin borrarlo. Se sube una versión nueva por día,
intercalada con contenido nuevo.
