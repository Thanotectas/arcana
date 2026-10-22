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

- TikTok: se envía desde /admin/redes (sección TikTok, ver abajo); el agente no publica solo ahí.
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

### Id de la página (17 oct 2026)

Con la nueva experiencia de páginas de Facebook, el número de la barra del
navegador (`profile.php?id=61594894293890`) es el del **perfil**, no el de la
página: la API responde "Object … does not exist" o "nonexisting field
(subscribed_apps)". Por eso la publicación automática en Facebook fallaba.
`src/lib/redes/pagina.ts` (`resolverPagina`) deduce la página del token: si es
de página, `/me` es la página; si es de usuario, toma de `/me/accounts` la de
Arcana (por `FB_PAGE_ID`, por el Instagram vinculado `IG_USER_ID`, por el nombre
o la única) con su propio token. Lo usan `facebook.ts` (publicar) y `meta.ts`
(responder, suscribir). `FB_PAGE_ID` queda opcional; el diagnóstico de
`/admin/redes` muestra el id real y avisa si la variable no coincide.

## Rendimiento de las publicaciones (17 oct 2026)

`src/lib/redes/metricas.ts` toma lo publicado en los últimos 14 días (carta
del día: `publicaciones_redes.referencia`; agente: `resultados[red].id` de
`publicaciones_programadas`), pregunta a Meta sus cifras y las guarda en
`metricas_redes` (migración 0028, única por red + media_id):
- Instagram (`IG_PAGE_TOKEN`): `like_count` y `comments_count`; con
  `instagram_manage_insights`, `/insights?metric=views,reach,saved,shares`
  (si `views` no aplica, `reach,saved,shares`). Sin el permiso queda la nota
  en `detalle`.
- Facebook (token de página de `resolverPagina`): reacciones, comentarios y
  `shares` (los videos no tienen shares).
El cron `/api/cron/metricas` lo corre el orquestador de la tarde; en
`/admin/redes` está la tabla, el ranking por tipo ("Qué funciona mejor":
promedio de interacciones = me gusta + comentarios + guardados + compartidos)
y el botón "Actualizar cifras ahora". El resumen semanal añade el bloque
"Rendimiento en redes" (vistas, interacciones, mejor publicación, promedio por
tipo) y cuántas respuestas dio Sibila en redes.

## Historia diaria, carrusel semanal y kit de TikTok (17 oct 2026)

`src/lib/redes/automaticas.ts` (sin aprobación; contenido acotado), cada una
registrada en `publicaciones_redes` (migración 0029: `red` admite `correo`,
`tipo` admite `historia`, `carrusel` y `kit_tiktok`, columna `contenido`) con
`publicarUnaVez` de `src/lib/redes/reservas.ts` para no repetirse:
- **Historia** de la carta del día (cron `/api/cron/historia`, orquestador de
  la mañana): imagen 9:16 de `/api/redes/historia-dia?fecha=` (formato
  historia de `imagenTarjeta`); Instagram `media_type=STORIES`
  (`publicarHistoria`), Facebook `photos` sin publicar + `photo_stories`
  (`publicarHistoriaFacebook`). `REDES_HISTORIA=0` la apaga.
- **Carrusel «Tu signo esta semana»** (cron `/api/cron/carrusel`, solo los
  lunes): Sibila escribe un mensaje por signo, el título y el pie
  (`redactarCarrusel`, JSON); se guardan en `contenido` y las ocho láminas
  (portada, seis con dos signos, cierre) se dibujan en
  `/api/redes/carrusel?semana=&n=0..7` (`src/lib/redes/carrusel.tsx`).
  Instagram: hijos `is_carousel_item` + contenedor `CAROUSEL`
  (`publicarCarrusel`); Facebook: fotos sin publicar + `feed` con
  `attached_media` (`publicarVariasFotosFacebook`). La semana es la actual de
  lunes a jueves y la siguiente de viernes a domingo (lanzado a mano).
  `REDES_CARRUSEL=0` lo apaga. Sus cifras entran en `metricas_redes`
  (origen `carrusel`).
- **Kit de TikTok** (cron `/api/cron/kit-tiktok`, orquestador de la mañana,
  con los videos de **ayer**, ya generados): correo a `correosAdmin()` con el
  enlace de descarga de cada reel (carta del día y agente) y el texto listo
  para pegar (`src/lib/redes/kit-tiktok.ts`). `REDES_KIT_TIKTOK=0` lo apaga.
- En `/admin/redes`, sección "Automáticas": botones para lanzar cada una a
  mano (no repiten lo que ya salió) y el registro de los últimos 7 días por
  tipo.

## TikTok desde el panel (19 oct 2026)

App «Arcana» en developers.tiktok.com (cuenta de desarrollador de la marca), con
**Login Kit** (Redirect URI `https://miarcana.com/api/tiktok/callback`) y
**Content Posting API** (Direct Post activado). Scopes: `user.info.basic`,
`video.upload`, `video.publish`. El dominio se verificó por prefijo de URL con el
archivo `public/tiktokt534bcLoFgkrcOMyG3mac6DJy05JnFhz.txt` (no borrarlo).

- Variables en Vercel: `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`. Mientras la
  app no esté aprobada se usan las del **Sandbox**, con @miarcana4 como usuario
  de prueba; al aprobarse, se cambian por las de Production y se vuelve a conectar.
- Conexión: botón «Conectar TikTok» → `/api/tiktok/conectar` (estado en cookie)
  → TikTok → `/api/tiktok/callback`, que guarda la cuenta en `tiktok_cuenta`
  (migración 0031). El token dura 24 h y se renueva solo; el permiso, un año.
- Envío (`src/lib/redes/tiktok.ts`): el video se descarga del bucket `redes` y
  se sube como archivo (FILE_UPLOAD, un solo trozo, hasta 64 MB). «Enviar a mis
  borradores» usa la bandeja (video.upload); «Publicar en TikTok» publica directo
  (video.publish). Cada envío queda en `publicaciones_tiktok`; «Actualizar
  estado» consulta `/post/publish/status/fetch/`.
- Formulario (`PublicarTiktok`), según las pautas de TikTok para la auditoría:
  muestra la cuenta de destino, consulta `creator_info` al abrirlo y al
  publicar, la privacidad se elige cada vez (sin valor por defecto), comentarios,
  dúo y stitch vienen apagados y respetan lo que la cuenta tenga desactivado,
  divulgación de contenido comercial («Tu marca» / «Contenido de marca», que no
  puede ser privado) y la declaración de uso de música.
- «Publicar en TikTok» y sus opciones solo aparecen si la cuenta conectada tiene el permiso
  `video.publish`; si la app se aprueba solo con borradores, queda «Enviar a mis borradores».
- **19 oct 2026: app enviada a revisión (Production) solo con `user.info.basic` y `video.upload`**
  (Direct Post apagado), con el video de demostración del flujo de borradores. Al aprobarse:
  cambiar en Vercel las claves del Sandbox por las de Production y volver a «Conectar TikTok».
- Sin auditoría, TikTok deja lo directo en privado (Solo yo). Para pedirla hay
  que grabar el video de demostración del flujo completo en el Sandbox.

## Voz de Sibila en los reels (20 oct 2026)

`src/lib/redes/voz.ts`: con `ELEVENLABS_API_KEY` y `ELEVENLABS_VOICE_ID` (opcional
`ELEVENLABS_MODEL`, por defecto `eleven_multilingual_v2`; si el modelo indicado falla, se reintenta con ese), el reel de la carta del día y
los del agente salen narrados. Se piden dos audios por reel: el mensaje (la carta y su
frase, o el título y el extracto) y la invitación final; el cierre aparece cuando termina
la primera parte y el video se alarga lo necesario (máximo 25 s). La música baja y la voz
va encima. «miarcana.com» se escribe «mi arcana punto com» para que se lea bien. Si la API
falla, el reel sale sin voz (queda en el log `[voz de Sibila]`). `REDES_VOZ=0` la apaga.
Los reels ya guardados no cambian: «Volver a generarlo» en /admin/redes los rehace con voz.
Voz elegida (20 oct 2026): «Marcela – Warm & feminine narration», id `zAjVLCYNz6RBmYxLTj17`, modelo `eleven_v4`.
Gasto aproximado: 400 a 600 caracteres por día (carta del día y publicación del agente).

## Token de la página (20 oct 2026)

Instagram publica con `IG_PAGE_TOKEN` (no usa los otros). Del 18 al 20 de octubre falló con
«(#10) Requires instagram_content_publish permission» porque el token de página se generó
sin los permisos de Instagram. Al regenerarlo, en el Explorador de la API Graph (app
Thanotectas Automation, token de usuario) pedir los 12 permisos: pages_show_list,
pages_read_engagement, pages_manage_posts, pages_manage_metadata, pages_messaging,
pages_read_user_content, instagram_basic, instagram_content_publish,
instagram_manage_comments, instagram_manage_messages, instagram_manage_insights y
business_management; marcar la página Arcana y @miarcana.oficial; ampliar el token;
consultar `1337589612768238?fields=name,access_token` y poner ese token en
`IG_PAGE_TOKEN`, `META_PAGE_TOKEN` y `FB_PAGE_TOKEN`, y hacer Redeploy.

## YouTube Shorts (20 oct 2026)

Canal @miarcana («Arcana Tarot y Astrología»). Proyecto «Arcana» en Google Cloud con la
YouTube Data API v3 habilitada, pantalla de consentimiento externa **publicada** (en
«Prueba» Google corta el permiso a los 7 días) y cliente OAuth «Aplicación web» con la URI
`https://miarcana.com/api/youtube/callback`. Variables `YOUTUBE_CLIENT_ID`,
`YOUTUBE_CLIENT_SECRET`; opcional `YOUTUBE_PRIVACIDAD` (public por defecto) y
`REDES_YOUTUBE=0` para apagar el Short diario.

- Conexión: «Conectar YouTube» → `/api/youtube/conectar` → Google (scopes youtube.upload y
  youtube.readonly, acceso sin conexión) → `/api/youtube/callback`, que guarda el canal y
  el refresh token en `youtube_cuenta` (migración 0032).
- Short diario: el orquestador del mediodía llama `/api/cron/youtube` (`shortDelDia` en
  automaticas.ts), que sube el reel narrado de la carta del día una vez por día
  (`publicaciones_redes`, red `youtube`). En el panel: «Subir ya el Short de hoy».
- Subida manual (`SubirYoutube`): carta del día, reels del agente o un MP4 propio, con
  título, descripción (se agrega #Shorts) y privacidad; queda en `publicaciones_youtube`.
- Se declara contenido sintético (`status.containsSyntheticMedia`) porque la voz y las
  imágenes son generadas; si la API no reconociera el campo, se reintenta sin él.
- Sin la auditoría de Google (YouTube API Services), lo subido por API queda privado aunque
  se pida público. Cupo: unas 6 subidas por día (1.600 de 10.000 unidades cada una).

### Dos Shorts al día (20 oct 2026)

Además de la carta del día (mediodía), `/api/cron/youtube?que=publicacion` sube por la mañana la
publicación del agente de hoy (guía, luna, signo, oferta…) con su reel narrado, si ya está
aprobada; si se aprueba después, la corrida del mediodía la sube. Registro en `publicaciones_redes`
(red `youtube`, tipo `publicacion`, migración 0037). Título y descripción: `textoShortPublicacion`,
con el enlace de la publicación convertido a `https://miarcana.com/yt/...`. El nombre del reel de
una publicación ahora depende de su contenido (no de `actualizado_en`): aprobar o publicar no lo
regenera, editarla sí. Los correos de campaña llevan el botón «Suscríbete al canal de YouTube»
(`/suscribete`, que abre el canal con el aviso de suscripción).

## Sibila en vivo (20 oct 2026)

Directos de YouTube donde Sibila lee en voz alta. Piezas:

- **Escenario** `/en-vivo/escenario?clave=…` (`EscenarioEnVivo`, 1920×1080): OBS lo transmite
  como fuente de navegador. Pide a `/api/en-vivo/siguiente` la siguiente lectura mientras
  suena la actual, voltea las tres cartas (o muestra la foto, el color del aura, el número o
  el signo), reproduce la voz de Sibila con subtítulos y hace latir su símbolo con el
  volumen. Sin consultas, dice frases de invitación (`PUENTES`). Lleva el QR de /vivo.
  La clave se deriva de `CRON_SECRET` (`claveEscenario`) y se ve en /admin/en-vivo.
- **Chat de YouTube** (`sincronizarChat` en `src/lib/en-vivo.ts`): con el canal conectado,
  busca el directo activo (`liveBroadcasts?broadcastStatus=active`) y lee
  `liveChat/messages` respetando `pollingIntervalMillis`. Encola los mensajes que parecen
  consulta (signo, «?», aura, numerología u horóscopo); «taza», «chocolate» o «mano» se
  ignoran porque van con foto por /vivo.
- **Fotos** `/vivo` (`FormularioVivo` → `accionFotoEnVivo`): taza de chocolate o mano, solo
  mientras el escenario late (últimos 3 min), 2 por hora por huella de IP, se limpia con
  sharp (sin metadatos, 1024 px) al bucket `redes/en-vivo/fotos/` y se borra 10 min después
  de leída. La persona acepta que su foto y su nombre salgan en el directo.
- **Lecturas** (`siguienteLectura`): orden manual → página → chat. Tipos: tarot (3 cartas
  Rider-Waite al azar), aura (Sibila nombra el color), numerología (`calcularPerfil` con la
  fecha dd/mm/aaaa del mensaje o el número del nombre), horóscopo (`horoscopoDelDia`),
  chocolate y mano (foto al modelo). Sibila responde OMITIR a lo que no se puede leer
  (saludos, spam, salud, muerte, menores, apuestas…). Voz con `sintetizar`; sin voz, el
  escenario simula la duración. Tope diario `EN_VIVO_MAX` (80).
- **Panel** `/admin/en-vivo`: estado (YouTube, voz, escenario, directo), dirección para OBS,
  consulta manual (pasa primero), fila, últimas lecturas, vaciar la fila.
- Tablas `en_vivo_preguntas` y `en_vivo_estado` (migración 0033).
- Gasto: cada lectura son ~500 caracteres de ElevenLabs; un directo de 30 min con
  preguntas seguidas gasta 20.000–30.000. YouTube exige verificar el canal con el teléfono
  (24 h) para emitir en directo.

### Chat del directo: qué cuenta como consulta (22 oct 2026)

Tras la prueba técnica: `pareceConsulta` acepta preguntas sin «?» («como me ves en el amor»,
«como voy a terminar este mes») con `PREGUNTA_SIN_SIGNO` (cómo/qué + verbo, cuándo, voy a, me ves,
y temas: amor, trabajo, dinero, examen, este mes…); los comentarios sueltos («qué lindo», «hola a
todos») no cuentan. Los mensajes de una misma persona (por nombre visible) se juntan en una sola
consulta mientras espera turno, y si dijo su signo antes esa noche se reutiliza.

## Códigos de oferta (20 oct 2026)

`codigos_oferta` (migración 0034): créditos extra en una compra sin cambiar el precio. La
orden guarda `codigo` y ya suma los extras en `creditos`, así que `acreditar_orden` los
entrega como siempre (Bold y Lemon). Validación en `src/lib/pagos/codigos.ts` (activo, no
vencido, cupo = aprobadas + pendientes de 2 h, paquetes permitidos). Llega por
`/c/CÓDIGO` (cookie `arcana_codigo` de un día y redirección a /creditos), por `?codigo=` o
escrito en /creditos. Se administran en /admin/en-vivo. El código vigente lo dice Sibila
en las frases del directo (`frasesPuente`, con el precio de la tirada de prueba en
palabras). Semilla: `SIBILA` (+2, cupo 100, vence el 25 oct 2026 a medianoche).

## Por dónde llegan (20 oct 2026)

Las vistas no dicen qué red trae cuentas y pagos; esto sí. Migración `0036_origen.sql`
(`perfiles.origen`, `perfiles.origen_detalle`, `ordenes.origen`).

- **Cómo se mide.** El proxy (`src/proxy.ts`) guarda la cookie `arcana_origen` (30 días) la
  primera vez que alguien entra con `utm_source` o con `Referer` de una red conocida
  (`src/lib/origen/comun.ts`: YouTube, Instagram, TikTok, Facebook, WhatsApp, X, Pinterest,
  Google, Bing). Los enlaces cortos **miarcana.com/yt, /ig, /tt, /fb, /wa** (y `/yt/rituales`,
  `/yt/vivo`, etc.) la guardan aunque no haya Referer. El código de oferta (`/c/SIBILA`)
  marca `youtube · en-vivo` si la persona no traía origen. Siempre gana la primera red
  (primer contacto): quien ya tenía cuenta no cambia de origen.
- **Dónde queda.** Al crear la cuenta (registro con correo, Google o enlace de confirmación)
  `registrarOrigenPendiente` escribe `perfiles.origen` si el perfil es de ese día. Cada orden
  guarda la cookie del momento en `ordenes.origen`.
- **Dónde se ve.** Bloque «Por dónde llegan» en `/admin/resumen` y en el correo del lunes:
  cuentas nuevas y pagos de la semana por red (los pagos se atribuyen al origen del perfil).
- **Qué enlace usar en cada sitio.** Biografía de Instagram: `miarcana.com/ig`. Perfil de
  TikTok: `miarcana.com/tt`. Descripción de los Shorts: `https://miarcana.com/yt` (lo pone
  `textoShortYoutube`). Página de Facebook: `https://miarcana.com/fb`. Estados y mensajes de
  WhatsApp: `miarcana.com/wa`. El QR del escenario en vivo apunta a `/yt/vivo`. Para campañas
  puntuales sirve cualquier enlace con `?utm_source=…&utm_medium=…&utm_campaign=…`.
