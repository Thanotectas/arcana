# Video «lectura de un vaso» (líneas que se dibujan)

Video vertical 1080×1920 como el del vaso de Debora: la foto en una tarjeta, la cámara se acerca a cada
detalle, los óvalos y las flechas se dibujan en dorado (violeta el detalle «¿Lo que viene?»), una caja con
la frase de cada paso y al final la invitación («¿Leo el tuyo?»).

1. Copia `ejemplo.json` junto a la foto y ajusta: `foto`, `titulo`, `duracion`, `pasos` (cada uno con
   `desde`/`hasta` en segundos, `marca` opcional — `ovalo` con centro y tamaño, o `linea` con puntos — en
   fracción de la foto, `etiqueta` y `texto`) y `audio` (mp3 con la voz de Sibila o música; opcional).
2. Prueba las marcas: `NODE_PATH=$(npm root -g) node marketing/prompts/video-lectura-vaso/generar.cjs ruta/config.json prueba`
   (saca cuadros PNG junto a la salida).
3. Video: lo mismo sin `prueba`.

Solo con fotos propias, de ejemplo (dichas como ejemplo) o con permiso escrito de la persona. Nunca se
publica la foto de alguien sin su permiso.
