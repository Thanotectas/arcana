# Contexto del proyecto Arcana

Resumen para retomar el trabajo desde cualquier entorno (otra sesión de Claude, otro computador u otra persona). Actualizado: 30 de septiembre de 2026.

## Qué es

App web de tarot, carta astral, numerología, compatibilidad y horóscopo, con lecturas escritas por IA (Claude) y créditos prepagados. Mercado inicial: Colombia, en español. Meta: 1 millón de USD al año; la estrategia completa está en un documento aparte (Arcana — Estrategia hacia 1M USD).

## Dónde vive cada cosa

| Pieza | Dónde | Identificador |
| --- | --- | --- |
| Código | GitHub `Thanotectas/arcana`, rama `main` | Colaborador: CPNT2026 |
| Publicación | Vercel, cuenta thanotectas ("campana-edil's projects"), proyecto `arcana` | Cada push a `main` se publica solo |
| Dominio | `miarcana.com` (comprado en Vercel); `www` redirige | Respaldo: `arcana-nu-two.vercel.app` |
| Base de datos y usuarios | Supabase, organización "Thanotectas's Org", proyecto `arcana` | Ref `wclgoyvcowauadfnfewe`, región São Paulo |
| IA | Anthropic API en dos niveles: `claude-opus-5-5` (premium: carta astral, Cruz Celta, quiromancia, cruces) y `claude-sonnet-5-5` (estándar: carta del día, Sibila, preguntas, numerología, I Ching, chino, compatibilidad, horóscopo). `ARCANA_IA_MODEL_PREMIUM` / `ARCANA_IA_MODEL_ESTANDAR` los cambian; `ARCANA_IA_MODEL` fuerza uno para todo | Clave en Vercel |
| Pagos | Bold (botón de pagos con firma de integridad) | Webhook: `https://miarcana.com/api/webhooks/bold` |
| Entrar con Google | Google Cloud, proyecto `arcana-510218`, cliente OAuth "Arcana web" | Activado en Supabase → Authentication → Providers |

El proyecto de Supabase "medirecordatorios" está pausado a propósito (el plan gratis permite 2 proyectos activos). Se reactiva desde el panel de Supabase.

## Variables de entorno (en Vercel; nunca en el repositorio)

- Push y cron: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `CRON_SECRET` (ver sección "Cron diario y avisos push").
- Instagram automático: `IG_USER_ID` (cuenta @miarcana.oficial) e `IG_PAGE_TOKEN` (token de la página de Facebook "Mi Arcana", app de Meta "Thanotectas Automation"; no caduca, pero el acceso a datos vence hacia el 30 dic 2026 y entonces hay que renovarlo con el Explorador de la API Graph).
- CAPTCHA: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (la clave secreta de Turnstile se configura en Supabase Auth, no en Vercel).

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_BOLD_API_KEY`, `BOLD_SECRET_KEY`, `BOLD_ENV` (`production` con llaves reales; `test` solo con llaves de prueba), `NEXT_PUBLIC_SITE_URL` (`https://miarcana.com`). Plantilla en `.env.example`.

## Cómo funciona por dentro

- **Next.js 16** (App Router, Server Actions, `proxy.ts`). Esta versión cambia respecto a versiones anteriores: leer `node_modules/next/dist/docs/` antes de escribir código (ver `AGENTS.md`).
- **Lecturas en vivo:** la acción de cada lectura cobra y crea la lectura en estado `pendiente` (`src/lib/lecturas/acciones.ts`). La página de la lectura llama a `POST /api/lecturas/[id]/generar`, que transmite el texto de Claude mientras se escribe, lo guarda al terminar y reembolsa si falla. Los prompts están en `src/lib/lecturas/prompts.ts`.
- **Tarot:** la persona elige posiciones del abanico de 78 cartas; el servidor baraja y decide qué carta hay en cada posición (`cartasDesdeAbanico` en `src/lib/tarot/tiradas.ts`).
- **Carta astral:** efemérides reales con `astronomia` y casas Placidus (`src/lib/astro/`). La rueda interactiva está en `src/components/RuedaAstral.tsx`; los textos que usa el navegador, en `src/lib/astro/textos.ts`.
- **Créditos:** `consumir_creditos()` en Postgres cobra de forma atómica. Solo el servidor crea lecturas. Precios y paquetes en `src/lib/creditos.ts`; la política de inserción de órdenes en la migración 0001 repite los paquetes y hay que cambiar ambos a la vez.
- **Uso ilimitado:** columna `perfiles.ilimitado`; se activa sola para los correos de la tabla `correos_ilimitados` cuando el correo está confirmado. Hoy: `lualzaja@gmail.com` (cuenta creada con Google, activa).
- **Pagos Bold:** `src/lib/pagos/bold.ts` (firma de integridad y verificación de `x-bold-signature`), `src/app/creditos/pagar` (checkout) y `src/app/api/webhooks/bold` (acredita con `acreditar_orden()`, idempotente).

## Base de datos

Migraciones en `supabase/migrations/`, todas aplicadas en producción:

1. `0001_init.sql`: tablas, RLS, cobro y acreditación.
2. `0002_lecturas_en_vivo.sql`: estado de la lectura, reclamar y reembolsar.
3. `0003_google_e_ilimitados.sql`: nombre desde Google y cuentas ilimitadas.

Una migración nueva va como archivo `0004_...sql` y se aplica en Supabase (SQL Editor, CLI o el conector de Supabase). Antes de aplicarla conviene probarla en un Postgres local.

## Novedades de la rama `mejoras-experiencia` (30 sep 2026)

Trabajo hecho en Claude Code (sesión con Claude Fable 5.1). Antes de fusionar a `main`:

1. La migración `0004_quiromancia_e_idiomas.sql` ya está aplicada en producción (bucket privado `palmas`, tipo `quiromancia`, columna `idioma` en `horoscopos` y `perfiles`, regla nueva por signo, día e idioma).
2. Al publicar la rama (justo antes o después del despliegue) aplicar `0005_horoscopos_por_idioma.sql`, que retira la regla vieja `horoscopos_signo_fecha_key`. Hasta entonces, los horóscopos en inglés y portugués no se cachean (se generan pero no se guardan).
3. Revisar la vista previa de Vercel de la rama.

Qué trae:

- **Idiomas**: español, inglés y portugués. Cookie `idioma` (selector en el encabezado). Diccionarios en `src/lib/i18n/diccionarios/` (es.ts es la fuente; en.ts y pt.ts deben tener las mismas claves, TypeScript lo verifica). Las lecturas se escriben en el idioma elegido (`entrada.idioma`) y el horóscopo se cachea por signo, día e idioma. Los nombres de cartas, signos y planetas siguen en español en los datos; el modelo los traduce al escribir.
- **Quiromancia** (`/quiromancia`, 3 créditos): la cámara se abre dentro de la app (`CapturaPalma`, getUserMedia) con el contorno de la mano superpuesto; la foto se recorta al marco, se avisa si salió oscura y la galería queda como alternativa. La foto se reduce en el navegador (máx. 1280 px), se sube al bucket privado `palmas/<usuario>/<uuid>.jpg` y se envía a Claude con visión. La lectura termina con un anexo JSON de trazos (coordenadas 0-100) que la página dibuja sobre la foto (`PalmaInteractiva`). Límite de Server Actions subido a 5 MB en `next.config.ts`.
- **Tres mazos** (`src/lib/tarot/mazos.ts`): Rider-Waite, Marsella (mismos ids, nombres y numeración marselleses, arcanos menores por número) y Oráculo de los Ángeles (44 cartas, `oraculo-angeles.ts`, sin invertidas). El mazo va en `entrada.mazo`; el prompt recibe la tradición.
- **Numerología y compatibilidad interactivas**: cálculo en vivo en el navegador (`numerologia-detalle.ts`, ruedas de signos y medidor de afinidad); la IA solo escribe la lectura.
- **Errores con causa**: la ruta de generación envía `[[ERROR:clave|saldo|limite|rechazo|generico]]`; la interfaz explica y ofrece "Reintentar" (`accionReintentarLectura`, vuelve a cobrar y deja la lectura pendiente).
- **Interfaz**: portada con cartas flotantes, panel con fase lunar y racha, historial con búsqueda y filtros, botón de compartir, animaciones en todas las secciones.
- **docs/ESTRATEGIA-PRODUCTO.md**: valoración de precios e ideas.

## Invitaciones por WhatsApp (30 sep 2026)

- Cada perfil tiene `codigo_invitacion` (7 caracteres). Enlace `miarcana.com/r/<codigo>` → guarda la cookie `invitacion` 30 días y lleva a `/registro?inv=<codigo>`, que muestra quién invita.
- Al entrar por primera vez (registro con sesión inmediata o `/auth/callback` tras confirmar correo o Google) se llama `aplicar_invitacion(codigo)`: +2 créditos al invitado, +2 a quien invita (hasta 20 invitaciones premiadas por cuenta), solo en cuentas de menos de 7 días y sin invitación previa.
- Página `/invitar`: enlace, botón de WhatsApp (`wa.me` con mensaje prellenado), compartir nativo, conteo de invitados y créditos ganados (`resumen_invitaciones()`). Tarjeta en el panel y enlace en el encabezado.
- Migración `0006_invitaciones.sql` (aplicar en producción; sin ella la página muestra ceros y el registro no premia, pero nada falla).

## Marca e imágenes de vista previa (30 sep 2026)

- Logo: `src/components/Logo.tsx` (marca + logotipo), `src/app/icon.svg` (favicon), `src/app/apple-icon.tsx`. Archivos descargables en `public/marca/`.
- Vista previa para WhatsApp y redes: `src/app/opengraph-image.tsx` (general) y `/api/og?t=&s=` (dinámica, `src/lib/marca/og.tsx`). Fuentes en `src/app/fuentes/` (incluidas en el trazado con `outputFileTracingIncludes`).
- El registro con `?inv=CODIGO` publica metadatos personalizados ("{nombre} te invita a Arcana") con imagen dinámica: es lo que WhatsApp muestra al compartir el enlace de invitación.

## I Ching, fondo animado y persuasión (30 sep 2026)

- **I Ching** (`/iching`, 2 créditos): tres monedas × seis lanzamientos en el navegador (`RitualIChing`), el servidor valida los valores (6/7/8/9) y resuelve hexagrama presente, líneas mutantes y hexagrama resultante (`src/lib/iching/`). Datos de los 64 hexagramas en `hexagramas.ts` (orden del Rey Wen, líneas de abajo hacia arriba).
- **Cielo animado** (`CieloAnimado`): canvas a pantalla completa con glifos zodiacales y estrellas que aparecen y se desvanecen; se apaga con `prefers-reduced-motion` y se pausa con la pestaña oculta.
- **Persuasión honesta** (todo con datos reales): bono de primera compra (+2 créditos, `acreditar_orden` en 0007), ancla de precio frente a consulta presencial, equivalencias por paquete, garantía y pago seguro en `/creditos`; avisos de saldo bajo y carta del día pendiente en el panel; "¿Quieres ir más profundo?" al final de cada lectura (`SiguientePaso`); contador real de lecturas de la semana en la portada (`contador_lecturas()`, solo se muestra desde 50).
- Migración `0007_iching_y_compra.sql` (aplicar en producción).

## Conversación y tarjetas compartibles (30 sep 2026)

- **Pregúntale a Arcana** (`ConversacionLectura`, `/api/lecturas/[id]/preguntar`): sobre una lectura terminada, la persona pregunta y la respuesta se escribe en vivo con el contexto de su lectura y las preguntas anteriores. La primera pregunta de cada lectura es gratis (`PREGUNTAS_GRATIS_POR_LECTURA`), las siguientes cuestan `COSTO_PREGUNTA` (1). Tabla `preguntas_lectura` y `reembolsar_pregunta()` en la migración 0008.
- **Tarjeta para compartir** (`/api/lecturas/[id]/tarjeta`, 1080×1350): símbolos, títulos y una frase de la síntesis, con el enlace de invitación de la persona incrustado (`miarcana.com/r/CODIGO`). En el celular se comparte como archivo (Web Share); en escritorio se descarga. Fuentes en `src/app/fuentes/` (Cormorant, Inter y Noto Sans Symbols 2 para los símbolos; los glifos zodiacales no se dibujan porque el motor los trata como emoji).
## Perfil con memoria, "Tu cielo hoy" y Círculo Arcana (30 sep 2026)

- **Memoria** (`src/lib/lecturas/memoria.ts`): el perfil guarda los datos de nacimiento (se llenan solos al calcular una carta astral, o desde *Mi cuenta → Datos de nacimiento*, `accionGuardarNacimiento`). Al escribir cualquier lectura o responder una pregunta, el modelo recibe el nombre, el nacimiento y un extracto de las últimas 3 consultas para hablar con continuidad (instruido a no repetirlas). La carta astral se precarga con esos datos.
- **Tu cielo hoy** (`/hoy`, `src/lib/diario.ts`, `src/lib/astro/transitos.ts`): tránsitos reales del día sobre la carta natal (aspectos de los planetas de hoy con los planetas natales, Ascendente y Medio Cielo; orbes estrechos, ponderados por planeta lento y exactitud). Todo el mundo ve la Luna del día y los tránsitos; el **mensaje escrito** (140–200 palabras, `effort: low`) solo se genera para el Círculo y se guarda en `mensajes_diarios` (una vez por persona, día e idioma). La fecha se toma en la zona horaria de nacimiento. Se transmite con `Suspense` para no bloquear la página. Enlace en la barra (con sesión) y tarjeta destacada en el panel.
- **Círculo Arcana** (pase de 30 días, 19.900 COP, paquete `circulo` en `PAQUETE_CIRCULO`): mensaje diario, preguntas de seguimiento sin cobro (tope `CIRCULO.preguntasPorDia` = 15 por día, se cuenta en `preguntas_lectura`) y 15 créditos. No se renueva solo: cada compra suma 30 días a `perfiles.circulo_hasta` (`acreditar_orden` en 0009). Tarjeta en `/creditos#circulo` y estado en *Mi cuenta*. `circuloActivo(perfil)` en `dal.ts` (las cuentas ilimitadas cuentan como miembros).
- Migraciones pendientes de aplicar en producción: `0007_iching_y_compra.sql`, `0008_preguntas.sql`, `0009_circulo_y_memoria.sql` y `0010_ordenes_prueba.sql` (columna `ordenes.es_prueba` para dejar las compras de prueba fuera de las métricas). Sin 0009, `/hoy` y el Círculo fallan al consultar `circulo_hasta`.

## Cron diario y avisos push (30 sep 2026)

- **Cron** (`vercel.json` → `GET /api/cron/diario`, 09:00 UTC = 04:00 Bogotá): con el cliente admin toma los perfiles con datos de nacimiento, escribe "Tu cielo hoy" para los miembros del Círculo (hasta 60 por corrida, 3 en paralelo; los ya escritos vuelven de la caché) y envía el aviso push a quien lo activó. Exige `Authorization: Bearer CRON_SECRET` (Vercel lo manda solo si la variable existe). Responde con un resumen JSON (`perfiles, miembros, escritos, fallidos, enviados, caducadas`). Se puede disparar a mano desde el panel de Vercel (Cron Jobs → Run).
- **Web push** (`src/lib/push.ts` con `web-push`, tabla `suscripciones_push` en la migración 0011, ruta `/api/push/suscripcion` POST/DELETE, service worker `public/sw.js`, componente `AvisoDiario` en `/hoy` y Mi cuenta). El aviso llega a todos los que lo activaron: a los del Círculo con el título y la línea "Hoy:" de su mensaje; a los demás con la Luna y el número de tránsitos del día (gancho para el Círculo). Las suscripciones que el navegador ya no reconoce (404/410) se borran.
- **PWA**: `src/app/manifest.ts` e íconos PNG en `public/marca/icono-{192,512}.png`. En iPhone los avisos solo funcionan con Arcana añadida a la pantalla de inicio; el componente lo explica.
- El idioma de la persona se guarda en `perfiles.idioma` al cambiarlo o al activar el aviso (el cron escribe el mensaje en ese idioma).
- **Variables nuevas en Vercel**: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (mailto:), `CRON_SECRET`. Sin las VAPID, el botón de aviso no aparece y el cron solo pregenera mensajes. Se generan con `npx web-push generate-vapid-keys`.
- Migración pendiente además de las anteriores: `0011_push.sql`. Tras la auditoría: `0012_endurecimiento.sql` (aplicada el 1 oct 2026; la rama `endurecimiento` ya está fusionada en `main`). La zona horaria del perfil se valida como IANA al guardarla (`zonaHorariaValida`), porque la carta del día depende de ella.
- Siguiente paso: canal de WhatsApp diario (API de WhatsApp Business de Meta; requiere cuenta verificada y plantilla aprobada).

## Instagram automático (1 oct 2026)

- **Cron** (`vercel.json` → `GET /api/cron/instagram`, 12:00 UTC = 07:00 Bogotá) publica en @miarcana.oficial la "Carta del día de Arcana" con la API Graph de Meta (`src/lib/redes/instagram.ts`: contenedor, espera y `media_publish`; el token va en la cabecera). Exige `Authorization: Bearer CRON_SECRET`. Se dispara a mano desde Vercel (Cron Jobs → Run). Reintento automático a las 17:00 UTC (12:00 Bogotá): solo publica si la de la mañana falló o quedó colgada. El 1 oct 2026 la primera corrida falló por el límite de solicitudes de la app de Meta (código 4), que comparte con Thanotectas.
- **Carta**: `src/lib/redes/carta-dia.ts`. La misma para todos por fecha de Bogotá; recorre la rotación sin repetir. Quedan fuera de la rotación pública las cartas cuyo texto habla de salud, crisis, pérdidas o traiciones.
- **Imagen**: `/api/redes/carta-dia?fecha=AAAA-MM-DD` (pública, 1080×1350, `imagenTarjeta`); el texto sale del mazo, nunca de la URL.
- **Una por día**: tabla `publicaciones_redes` (migración `0013_publicaciones_redes.sql`, aplicada el 1 oct 2026) con clave única red + tipo + fecha; si una publicación falla queda en `error` y el siguiente intento la retoma.

## Auditoría de seguridad y endurecimiento (1 oct 2026)

Se revisó todo el código y las migraciones. Lo corregido (migración `0012_endurecimiento.sql` + código):

- **Webhook de Bold** (`src/lib/pagos/bold.ts`): ya no acepta la firma con llave vacía salvo `BOLD_ACEPTAR_FIRMA_VACIA=1` fuera del despliegue de producción de Vercel. Antes, si `BOLD_ENV` no era exactamente `production`, cualquiera podía acreditarse créditos forjando el webhook. El webhook ya solo compara el monto en pesos y no pisa órdenes ya aprobadas; el retorno exige que Bold devuelva el monto.
- **Redirección abierta** tras el login (`volver`, `siguiente`): `rutaInterna()` en `src/lib/seguridad.ts` rechaza `//`, `/\` y rutas que normalizan a otro origen.
- **Inyección de prompt**: lo que escribe la persona (pregunta, nombre, lugar, títulos en la memoria) entra al modelo delimitado con «…» y sin saltos de línea ni encabezados (`datoDeUsuario()`), y el sistema instruye a tratarlo como dato. Importa porque la síntesis acaba en tarjetas con marca.
- **Decisiones de cobro en la base, atómicas**: `crear_pregunta` (1 gratis por lectura, Círculo hasta 15/día, resto 1 crédito), `reservar_carta_dia` / `carta_dia_disponible` (tabla `cartas_dia`, día local de la persona), `reintentar_lectura`, `devolver_creditos`, `finalizar_generacion` / `finalizar_pregunta` (solo cierran desde `generando`/`pendiente`: una lectura reembolsada no revive). `acreditar_orden` y `aplicar_invitacion` bloquean la fila del perfil (bono de primera compra y tope de invitaciones sin carreras). `reclamar_generacion` espera 6 minutos (más que `maxDuration`).
- **Créditos de bienvenida solo con correo confirmado** (`bienvenida_dada`, trigger `bienvenida_al_confirmar`); las invitaciones también exigen correo confirmado. Las cuentas de Google llegan confirmadas.
- **Permisos retirados**: borrado directo de lecturas, inserción directa de suscripciones push (ahora `registrar_push`, que además pasa el navegador al nuevo dueño y limita a 10 dispositivos), `generar_codigo_invitacion` para anon, `es_prueba` y `metodo_pago` en la política de órdenes, motivos libres en `consumir_creditos`.
- **Otros**: `/api/og` solo genera la imagen de invitación a partir del código (nadie puede fabricar imágenes con la marca y su texto); `/api/lugares` exige sesión; cookie `invitacion` httpOnly; foto de la palma verificada por bytes mágicos; comparación constante del `CRON_SECRET`; referencias de orden con `crypto`; cabeceras HSTS, Permissions-Policy y CSP mínima (`frame-ancestors 'none'`); contador público de lecturas cacheado 10 minutos e índices nuevos.
- La migración 0012 se probó completa (0001→0012) en un PostgreSQL 16 local con un esquema `auth` simulado, incluidas las funciones nuevas.

Pendiente de seguridad que requiere decisión o cuenta externa:
- ~~CAPTCHA en el registro~~ Hecho: Cloudflare Turnstile en entrar, registro y recuperar (`src/components/Turnstile.tsx`, token en el campo `captcha`, verificado por Supabase Auth). Activación: (1) en Cloudflare → Turnstile crear un widget para `miarcana.com` (modo Managed); (2) la **clave del sitio** va en Vercel como `NEXT_PUBLIC_TURNSTILE_SITE_KEY` y se hace Redeploy; (3) la **clave secreta** va en Supabase → Authentication → Attack Protection → Enable Captcha protection → Turnstile. Sin la variable el widget no aparece y Supabase no debe tener el CAPTCHA activado (rechazaría todos los registros). Google OAuth no pasa por el CAPTCHA (Supabase no lo exige ahí).
- **Eliminar cuenta** (Habeas Data) con borrado de las fotos de palmas en Storage.
- `supabase/migrations/0003` contiene un correo personal en `correos_ilimitados`; ya está aplicado, pero conviene moverlo a datos privados si el repo se hace público.

## Calendario chino y lecturas cruzadas (2 oct 2026)

- **Calendario chino** (`/calendario-chino`, tipo `chino`, 2 créditos): `src/lib/chino/index.ts` calcula animal, elemento (tallo celeste) y polaridad del año chino con la tabla real de Años Nuevos 1900–2044, el animal de la hora ("animal secreto"), el triángulo de afinidad, el amigo secreto, el choque y la relación con el año en curso. `RuedaChina` ilumina el animal mientras la persona escribe la fecha. Prompt en `prompts.ts`; vista `VistaChino` en la lectura.
- **Lecturas cruzadas** (`/cruce`, tipo `cruce`, 4 créditos, premium): la persona elige dos sistemas (carta astral, numerología, calendario chino, tarot, I Ching, mano). `src/lib/cruce/index.ts` decide de dónde sale cada uno: los que dependen del nacimiento se calculan con el perfil; los rituales usan la última lectura terminada (y su síntesis). Las fuentes se guardan en `resultado.fuentes` al crear la lectura, así el prompt es reproducible. `CruceSelector` muestra qué sistemas están listos y enlaza a los que faltan.
- Migración `0014_chino_y_cruces.sql` (amplía el `check` de `lecturas.tipo`). Sin ella, crear estas lecturas falla al insertar.
- Las fuentes de la tarjeta compartible no tienen caracteres chinos: en la tarjeta el animal va en el título y el símbolo es ✦.

## Imágenes reales de las cartas y animales (2 oct 2026)

- **Rider-Waite con arte real**: `public/cartas/rider/<id>.webp` (78 cartas, 300×527, ~2,8 MB en total), convertidas desde el paquete npm `@cometpisces/tarot-kit-images` (código MIT; las imágenes son el Rider-Waite-Smith de 1909). `imagenCarta()` en `CartaVisual.tsx` devuelve la ruta solo para el mazo `rider`; `CaraCarta` muestra la ilustración dentro del marco dorado y la inversión gira la imagen. Marsella y el Oráculo de los Ángeles siguen con el dibujo de símbolos (no hay arte de dominio público equivalente para el Oráculo; para Marsella se puede añadir el Conver de 1760 cuando haya una fuente accesible).
- **Licencia**: dominio público en EE. UU. y la UE; en Colombia (80 años post mortem de Pamela Colman Smith, † 1951) el plazo vence a fines de 2031. Está anotado en `public/cartas/rider/LICENCIA.txt`; decisión del dueño del proyecto.
- **Monedas del zodíaco occidental**: `public/signos/<id>.webp` (512×512, fondo transparente), mismo estilo y proceso que los animales chinos (una cuadrícula generada por el dueño, recortada con sharp con máscara circular `dest-in`). `imagenSigno(id)` en `src/lib/zodiaco.ts`. Se ven en el índice y la página de cada signo del horóscopo, en la rueda y el medidor de compatibilidad (`CompatibilidadInteractiva`), en la vista de la lectura de compatibilidad y en la tarjeta para compartir (`monedas: true` en `imagenTarjeta` dibuja las imágenes redondas sin marco: Sol/Luna/Ascendente en carta astral, los dos signos en compatibilidad y el animal en calendario chino). La rueda de la carta astral conserva los glifos tradicionales.
- **Animales del calendario chino**: `public/animales/*.webp` (512×512, fondo transparente), monedas doradas propias generadas con IA por el dueño del proyecto a partir de una sola cuadrícula (estilo uniforme); recortadas y con el fondo convertido a alfa con sharp. Clases `.animal-oro` (apagado), `.animal-oro-vivo` (halo) y `.animal-violeta` (animal secreto). Se usan en la rueda y en la vista de la lectura.

## Sibila, la asistente (2 oct 2026)

- **La voz de Arcana se llama Sibila** (`NOMBRE_ASISTENTE` en `src/lib/asistente.ts`; el sistema base en `ia.ts` la presenta así). Firma las lecturas, responde las preguntas de seguimiento ("Pregúntale a Sibila") y vive en un chat flotante.
- **Chat flotante** (`AsistenteFlotante` → `Asistente`, montado en el layout solo con sesión): orienta sobre qué lectura conviene (con enlaces a las rutas), explica símbolos de lecturas anteriores (memoria), comenta el cielo de hoy y resuelve dudas de créditos y Círculo. No escribe lecturas completas. Respuestas de 40 a 140 palabras, `effort: low`.
- **Cobro en la base** (`crear_mensaje_asistente`, migración `0015_asistente.sql`): 3 mensajes gratis al día, Círculo hasta 30 al día, el resto 1 crédito; `finalizar_mensaje_asistente` y `reembolsar_mensaje_asistente` con guarda de estado; `mensajes_asistente_hoy()` para mostrar el saldo gratis. Tabla `mensajes_asistente` (rol persona/asistente). Ruta `/api/asistente` (GET historial, POST mensaje en streaming con las marcas `[[ERROR:…]]`).
- Probado en PostgreSQL local: reglas de cobro, cierre y reembolso.

## App para Google Play (2 oct 2026)

- **Trusted Web Activity** con Bubblewrap: `android/twa-manifest.json` (paquete `com.miarcana.app`, inicio `/inicio?app=android`, colores noche, atajos), compilada en GitHub Actions (`.github/workflows/android.yml`: JDK 17 + SDK del runner, `bubblewrap update` + `bubblewrap build`, artefactos AAB y APK). La llave de subida se restaura desde el secreto `ANDROID_KEYSTORE_BASE64`; contraseñas en `ANDROID_KEYSTORE_PASSWORD` y `ANDROID_KEY_PASSWORD`. La huella SHA-256 de esa llave está en `public/.well-known/assetlinks.json`. Primera compilación exitosa el 1 de octubre de 2026 (ejecución 36900823768, artefacto `arcana-android` con `app-release-bundle.aab` y `app-release-signed.apk`). Detalles que costaron: el secreto debe pegarse completo (3.660 caracteres), los atajos del manifiesto usan `shortName`, y Bubblewrap 1.25 exige `tools/bin/sdkmanager` y build-tools 36.1.0 en el SDK.
- **Manifiesto PWA** ampliado (`id`, categorías, orientación, ícono maskable `public/marca/icono-maskable-512.png`, atajos) y `start_url` con `?app=pwa`.
- **Sin compras dentro de la app de Play**: `?app=android` deja la cookie `plataforma`; `comprasVisibles()` (`src/lib/plataforma.ts`) oculta los enlaces a `/creditos`, la tarjeta del Círculo y los avisos de recarga, y `/creditos` muestra solo el saldo. Motivo: la política de pagos de Play. Segunda fase: Google Play Billing con la Digital Goods API.
- Guía completa de publicación, ficha de la tienda y respuestas de seguridad de datos en `docs/GOOGLE-PLAY.md`.

## Pendiente

- [ ] Llaves de Bold en Vercel (`NEXT_PUBLIC_BOLD_API_KEY`, `BOLD_SECRET_KEY`) y registrar el webhook en el panel de Bold.
- [ ] Primera compra de prueba de punta a punta.
- [ ] Rotar el secreto del cliente OAuth de Google (quedó visible en una conversación) y actualizarlo en Supabase.
- [ ] Saldo en la cuenta de Anthropic (estaba en plan de evaluación, sin saldo).
- [ ] Correo propio: ImprovMX para recibir en Gmail y Resend como SMTP de Supabase para los correos de registro.
- [ ] Hacer interactivas las pantallas de numerología y compatibilidad (hoy son formularios; la lectura ya se escribe en vivo).
- [ ] Siguientes pasos de la estrategia: páginas SEO, WhatsApp diario, programa de creadoras, lectoras humanas.

## Cómo trabajar

- Idioma del producto, del código y de los commits: español.
- Antes de subir: `npx tsc --noEmit`, `npm run lint` y `npx next build`.
- Subir a `main` publica en producción; para cambios grandes, usar una rama y revisar la vista previa que crea Vercel.
