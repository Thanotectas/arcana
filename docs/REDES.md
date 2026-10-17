# Agente de redes

Sibila redacta cada semana una publicación por día; la administración las
aprueba en `/admin/redes` y el cron las publica en Instagram y Facebook.
Nada sale sin aprobación. La carta del día sigue siendo automática.

## Calendario editorial (rotaciones por número de semana)

Cada día presenta una función de la app. Lunes, miércoles, jueves y viernes
recorren `FUNCIONES` (`src/lib/redes/calendario.ts`): las catorce lecturas de
pago (tarot, carta astral, sueños, calendario chino, mano, numerología,
sinastría, I Ching, aura, lecturas cruzadas, velas, compatibilidad, chocolate,
tabaco) y las seis guías gratis, en una lista única de veinte que se recorre
de cuatro en cuatro por semana (cinco semanas para dar la vuelta). Cada función
lleva su visual (ver abajo).

| Día | Tipo | De dónde sale el contexto |
|---|---|---|
| Lunes | `producto` o `guia` | Función de la lista (costo real de `COSTOS` o guía gratis). |
| Martes | `pregunta` | Una pregunta de ejemplo para Sibila (lista de ocho). Lleva La Sacerdotisa. |
| Miércoles | `producto` o `guia` | Función de la lista. |
| Jueves | `oferta` o función | Fundadores mientras esté activa y no haya vencido ese día (cupos reales); si no, función de la lista. |
| Viernes | `producto` o `guia` | Función de la lista. |
| Sábado | `signo` | Un signo (moneda dorada) con sus rasgos; horóscopo gratis y carta astral. |
| Domingo | `luna` | La próxima lunación real (`proximasLunaciones`) con signo, hora de Bogotá y vela sugerida. |

`encargosSemana` arma los encargos y `redactar` pide los textos a Sibila en
una sola llamada (JSON con `titulo`, `extracto` y `texto`); `generarSemana`
inserta los borradores de los días que aún no tienen ninguna publicación.
El tipo `reflexion` sigue admitido en la tabla pero ya no se programa.

## Visual de cada publicación (columna `carta`)

`src/lib/redes/visual.tsx` interpreta un texto corto y lo dibuja en el reel
(`visualParaReel`, en grande) y en la tarjeta fija (`visualParaTarjeta`):
`rider/la-estrella` (carta), `signos/leo` o `animales/dragon` (moneda),
`rueda/signos` o `rueda/animales` (las doce monedas girando despacio),
`duo/tauro+escorpio` (dos signos), `cruce/leo+dragon` (signo y animal),
`aura/violeta+dorado` (halos), `vela/verde` (vela encendida, SVG),
`hexagrama/101101` (líneas de abajo arriba), `numeros/3·7·11`, `luna`
(creciente dorada, SVG) y `glifo/✋` (símbolo grande: ✋ mano, ☕ chocolate,
♨ tabaco). Las parejas, el animal, el hexagrama y los colores cambian con la
semana (`visualDe`). Los degradados radiales se dibujan en SVG porque el motor
de imágenes los pinta planos; un estilo con valor `undefined` lo rompe.

## Flujo

1. **Generación**: la ruta `/api/cron/instagram` (la llaman los orquestadores `/api/cron/manana` y `/api/cron/tarde`; Vercel Hobby solo admite dos cron) llama a `asegurarBorradores`
   en cada corrida: crea la semana en curso si está vacía (primer arranque) y,
   de viernes a domingo, la próxima. Envía un correo a `ADMIN_CORREOS` con la
   lista y el botón "Revisar y aprobar". También se puede generar desde el panel.
2. **Aprobación** en `/admin/redes` (solo correos de `ADMIN_CORREOS`; el resto
   recibe 404). Se puede editar título, frase, pie y redes; aprobar, guardar,
   descartar, volver a borrador, publicar ahora o reintentar.
3. **Publicación**: la corrida de las 17:00 UTC (mediodía en Bogotá) publica lo
   aprobado cuya fecha ya llegó (hasta dos días de atraso) con
   `publicarVencidas`. Cada fila se reserva (`publicando`) para no duplicar; las
   redes que ya tienen id no se repiten, así un reintento solo toca la que falló.
4. **Reel**: cada publicación sale como reel de 12 s en Instagram y video en
   Facebook (`src/lib/redes/reel-publicacion.tsx`: visual sobre el cielo con
   acercamiento, cabecera con la etiqueta, título y frase de Sibila, y cierre
   con el enlace y el pie). Se guarda en el bucket `redes` como
   `reels/pub-<id>-<versión>.mp4` (la versión es la fecha de edición: al editar
   se fabrica otro) y se reutiliza. Si falla cualquier paso se publica la
   imagen fija; `REDES_REEL=0` publica solo imágenes. `resultados[red].formato`
   dice qué salió. Vista previa por publicación en el panel ("Ver el reel").
5. **Imagen de respaldo**: `/api/redes/publicacion?id=UUID` (1080×1350,
   `imagenTarjeta`) con el mismo visual. Meta la descarga por URL pública;
   `v=` evita cachés viejas.

## Tabla `publicaciones_programadas` (migración 0024)

`semana` (lunes), `fecha`, `tipo`, `redes[]`, `etiqueta`, `titulo`, `extracto`,
`texto`, `simbolos[]`, `carta`, `enlace`, `pie`, `estado` (borrador, aprobada,
publicando, publicada, descartada, error), `resultados` (id o error por red),
`detalle`, fechas. RLS activo sin políticas: solo el servidor la toca.

## Variables

- `ADMIN_CORREOS`: correos administradores separados por coma (sin la variable, solo la cuenta del dueño). Vale para todo `/admin/*`.
- Las mismas de la carta del día: `IG_USER_ID`, `IG_PAGE_TOKEN`, `FB_PAGE_ID`,
  `FB_PAGE_TOKEN` (opcional), `CRON_SECRET`, `RESEND_API_KEY` para el aviso.

## Fuera del alcance (por ahora)

- TikTok: su API de publicación exige revisión de la app; el agente no publica ahí.
- Respuestas a comentarios y mensajes: requieren más permisos de Meta.

## Carta del día en video (reel)

Desde el 10 oct 2026 la carta del día sale como **reel de 10 s** en Instagram
(`publicarReel`: contenedor `REELS`, espera de procesamiento hasta ~3 min) y como
video en la página de Facebook (`publicarVideoFacebook`, `/{page}/videos`).
`src/lib/redes/reel.tsx` dibuja cinco capas con `ImageResponse` (cielo con la
carta, cabecera con fecha y mazo, nombre y frase, invitación final y estrellas
que suben) y las anima con ffmpeg (`@ffmpeg-installer/ffmpeg`, incluido en el
paquete de `/api/cron/instagram` y `/admin/redes` por `outputFileTracingIncludes`;
~25 s por video). El MP4 se guarda en el bucket público `redes` de Supabase
(`reels/carta-dia-AAAA-MM-DD.mp4`, se crea solo) y se reutiliza en la corrida
de la tarde. Si el reel falla en cualquier paso, se publica la imagen de siempre.
`REDES_REEL=0` vuelve a la imagen fija. El texto de la publicación termina con la
invitación "Sibila te lee tres cartas sobre tu pregunta por $1.900" (precio del
paquete de prueba). Vista previa en `/admin/redes` → "Ver el reel de hoy".

## Sibila responde comentarios y mensajes (17 oct 2026)

Cuando alguien comenta una publicación de Instagram o Facebook, o escribe por
mensaje directo, Sibila responde: a los comentarios con una línea personal (si
mencionan su signo, apoyada en el horóscopo de hoy de `horoscopoDelDia`) y la
invitación a la carta del día gratis; a los mensajes como en WhatsApp, con los
hechos de Arcana (`hechos()` de `src/lib/whatsapp/sibila.ts`). Nunca hace
lecturas. Los pies de las publicaciones y de la carta del día invitan a
«comentar tu signo».

- **Webhook** `/api/webhooks/meta` (`src/app/api/webhooks/meta/route.ts`):
  verificación GET con `META_VERIFY_TOKEN` (o `WA_VERIFY_TOKEN`), firma
  `X-Hub-Signature-256` con `META_APP_SECRET` (o `WA_APP_SECRET`), respuesta
  inmediata y atención con `after`. `src/lib/redes/meta.ts` normaliza los
  avisos (`extraerInteracciones`: objeto `instagram` con `comments` y
  `messaging`; objeto `page` con `feed` item `comment` verb `add` y
  `messaging`; descarta lo propio y los ecos), responde (`/{comentario}/replies`
  en Instagram, `/{comentario}/comments` en Facebook, `/{página}/messages` para
  los directos) y suscribe la página (`/{página}/subscribed_apps` con `feed` y
  `messages`, botón "Conectar los avisos" en `/admin/redes`).
- **Sibila** (`src/lib/redes/sibila-redes.ts`, `atenderInteraccion`): guarda
  la interacción en `interacciones_redes` (migración 0027; `id_meta` único
  evita responder dos veces en los reintentos de Meta), aplica topes (200
  comentarios y 150 mensajes por día; 2 respuestas por persona y publicación),
  pide la respuesta con `generarTexto` (comentarios ≤ 260 caracteres; mensajes
  ≤ 450 con los 10 mensajes previos como contexto), marca «OMITIR» para spam o
  insultos y «PASAR_A_PERSONA» para avisar por correo a `correosAdmin()`.
  `REDES_RESPUESTAS=0` deja de responder sin quitar el webhook (queda
  registrado como omitida).
- **Configuración en Meta** (app de Arcana, la misma de WhatsApp):
  1. Productos: añadir **Webhooks**; objeto *Instagram* → suscribir `comments`
     y `messages`; objeto *Page* → `feed` y `messages`. URL
     `https://miarcana.com/api/webhooks/meta`, token de verificación =
     `META_VERIFY_TOKEN` (o el de WhatsApp).
  2. Añadir el producto **Instagram** (API con inicio de sesión de Facebook) y
     **Messenger**; en Messenger → Configuración de Instagram, generar el token
     de la página "Mi Arcana" con `instagram_basic`,
     `instagram_manage_comments`, `instagram_manage_messages`,
     `pages_manage_engagement`, `pages_messaging`, `pages_read_engagement`,
     `pages_manage_metadata`. Ese token va en `META_PAGE_TOKEN`.
  3. Como el dueño de la página es administrador de la app, el acceso estándar
     basta para la página propia (no hace falta revisión de permisos).
  4. En `/admin/redes` pulsar "Conectar los avisos de la página".
  5. Instagram: la cuenta debe ser profesional, vinculada a la página, y en
     Configuración → Mensajes → "Permitir acceso a mensajes" activado.
- Variables: `META_PAGE_TOKEN`, `META_APP_SECRET`, `META_VERIFY_TOKEN` (con
  respaldo en las de Facebook/WhatsApp), `FB_PAGE_ID`, `IG_USER_ID`,
  `REDES_RESPUESTAS`.
