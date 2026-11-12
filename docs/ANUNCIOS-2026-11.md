# Campaña de anuncios: piloto de noviembre de 2026

Piloto de 14 días en Meta (Instagram y Facebook) y TikTok. El objetivo son **cuentas nuevas y primeras compras**, no seguidores ni clics. Cada anuncio lleva su `utm`: el proxy lo guarda como origen de la visita y queda en cada cuenta y cada compra, así que se lee en **/admin/resumen → Por dónde llegan** («Anuncios de Meta», «Anuncios de TikTok»).

Piezas en `marketing/anuncios/2026-11/` (vista rápida: `hoja-de-contacto.jpg`): seis anuncios en 1080×1080 (feed) y 1080×1920 (historias y reels) con las cartas del Tarot Arcana y las monedas de los signos. Se regeneran con `marketing/anuncios/generar.mjs`.

## Por qué este embudo

La carta del día, la carta astral y el péndulo **piden cuenta**; lo único gratis sin registrarse son los tests. Por eso hay tres puertas:

1. **Tests** (`/que-carta-eres`, `/alma-vieja`): el clic más barato y sin fricción; el resultado invita a crear la cuenta.
2. **Carta del día** (`/registro`): la cuenta es gratis y trae 3 créditos de regalo al confirmar el correo.
3. **Carta astral** (`/registro`): la vista previa es gratis; desbloquear la lectura cuesta 5 créditos. Es la puerta que más vende.

## Antes de encender

1. **Píxel de Meta.** El código ya está (`src/lib/marca/medicion.ts`, `MedicionAnuncios`, `EventoMeta`), apagado. Crear en el portafolio **Arcana · Tarot y Astrología** un **conjunto de datos web** llamado «Arcana web» (Configuración → Orígenes de datos → Conjuntos de datos y píxeles → Agregar) y poner su identificador en `META_PIXEL_ID`. Ojo: «Thanotectas Automation» es una **app** de Meta, no un píxel; con ese número las visitas no se guardan (pasó con SinVueltas el 12 de noviembre).
   - Solo se carga en la web, nunca en la app de Google Play (su ficha de seguridad de datos dice que no se usan para publicidad), y solo si la persona acepta el aviso. Política de privacidad actualizada (sección «Medición de anuncios», es/en/pt).
   - Eventos: `PageView` (también al navegar dentro de la app), `CompleteRegistration` (cuenta nueva: `/inicio?nueva=1` desde el registro con correo o desde el callback si la cuenta tiene menos de 30 minutos) y `Purchase` (compra aprobada en `/creditos/retorno`, con valor y moneda; una sola vez por orden). Nunca lecturas, preguntas, fotos ni datos de nacimiento.
   - Probado en local el 12 de noviembre con un registrador en lugar de la librería de Meta: sin aceptar no carga nada; al aceptar, `autoConfig` apagado, `init`, `PageView`; una compra pedida antes de aceptar sale después; `PageView` al cambiar de página.
2. **Cuenta publicitaria** dentro del portafolio Arcana, con moneda COP y hora de Bogotá, conectada al conjunto «Arcana web».
3. **Página «Mi Arcana» e Instagram @miarcana.oficial** agregados al portafolio Arcana (hoy dice 0 activos comerciales).

## Meta: tres conjuntos

Campaña de **Clientes potenciales** optimizando por `CompleteRegistration` cuando el píxel tenga datos; mientras tanto, **Tráfico** con «Visitas a la página de destino». Colombia, 18 a 55 años, público Advantage+ con sugerencias de intereses: tarot, astrología, horóscopo, espiritualidad, meditación.

| Conjunto | Presupuesto diario | Destino |
|---|---|---|
| Tests | $8.000 | `/que-carta-eres` y `/alma-vieja` |
| Carta del día | $9.000 | `/registro` |
| Carta astral | $8.000 | `/registro` |

Total: **$25.000 diarios, $350.000 en 14 días.** México queda para la segunda quincena si Colombia funciona: la página ya muestra el precio en pesos mexicanos y Bold cobra en pesos colombianos con tarjetas extranjeras.

| Anuncio | Titular | Enlace |
|---|---|---|
| meta-test-1 | ¿Qué carta del tarot eres? | `https://miarcana.com/que-carta-eres?utm_source=meta-ads&utm_medium=test&utm_campaign=meta-test-1` |
| meta-test-2 | ¿Eres alma vieja? | `https://miarcana.com/alma-vieja?utm_source=meta-ads&utm_medium=test&utm_campaign=meta-test-2` |
| meta-dia-1 | Tu carta del día, leída por Sibila | `https://miarcana.com/registro?utm_source=meta-ads&utm_medium=carta-dia&utm_campaign=meta-dia-1` |
| meta-dia-2 | ¿Qué te dicen las cartas hoy? | `https://miarcana.com/registro?utm_source=meta-ads&utm_medium=carta-dia&utm_campaign=meta-dia-2` |
| meta-astral-1 | Tu Sol, tu Luna y tu Ascendente | `https://miarcana.com/registro?utm_source=meta-ads&utm_medium=astral&utm_campaign=meta-astral-1` |
| meta-astral-2 | ¿Por qué eres como eres? | `https://miarcana.com/registro?utm_source=meta-ads&utm_medium=astral&utm_campaign=meta-astral-2` |

Cada anuncio sube con sus dos imágenes (`…-1080x1080.jpg` y `…-1080x1920.jpg`). Como cuarto anuncio de cada conjunto, un video que ya existe, con el mismo destino y `utm_campaign` terminado en `-video`:

- Tests: `marketing/videos/36-alma-vieja/36-alma-vieja.mp4` (40 s).
- Carta del día: `marketing/videos/26-una-carta-para-ti/26-una-carta-para-ti.mp4` (13 s) o `35-tres-cartas-amor.mp4` (46 s).
- Carta astral: sin video propio todavía; las dos imágenes.

**Texto principal**, uno por conjunto:

- Tests: «¿Qué carta del tarot eres? Seis preguntas, un minuto y Sibila te revela tu arcano mayor: tu esencia, tu don y tu reto. Gratis y sin registrarte.»
- Carta del día: «Cada mañana, una carta y lo que significa para tu día, leída por Sibila. Crea tu cuenta gratis y recibe 3 créditos de regalo para tu primera lectura.»
- Carta astral: «Tu Sol, tu Luna y tu Ascendente con las posiciones reales del cielo del día en que naciste. Escribe tu fecha, tu hora y tu ciudad: la vista previa es gratis.»

Botón: «Más información» (tests: «Empezar»). Las lecturas son de entretenimiento y reflexión: ningún anuncio promete resultados ni anuncia hechos concretos.

## TikTok: Promocionar desde la app

Sin cuenta de anuncios: **Promocionar** sobre dos videos que ya funcionaron orgánicamente, objetivo «Visitas al sitio web», **$10.000 diarios** entre los dos ($140.000 en 14 días).

- `39-limpia-paso-a-paso` → `https://miarcana.com/registro?utm_source=tiktok-ads&utm_medium=video&utm_campaign=tt-limpia`
- `36-alma-vieja` → `https://miarcana.com/alma-vieja?utm_source=tiktok-ads&utm_medium=test&utm_campaign=tt-alma-vieja`

## Cómo se decide

Total del piloto: **$490.000 en 14 días** (Meta $350.000 + TikTok $140.000).

- **Día 7:** en cada conjunto, apagar el anuncio con el costo por cuenta nueva más alto. Referencia: más de $2.500 por cuenta es caro para un producto de este ticket.
- **Día 14:** seguir con un conjunto solo si el costo por **primera compra** queda por debajo de $9.900 (paquete Inicial); el Círculo y las compras repetidas ponen el margen. Cuentas y compras por origen: /admin/resumen; gasto: el administrador de anuncios.
- Recordar el costo de la IA: la carta astral y la Cruz Celta usan el modelo premium.

## Regenerar las piezas

```
npm i --no-save @resvg/resvg-wasm
node marketing/anuncios/generar.mjs marketing/anuncios/2026-11
```
