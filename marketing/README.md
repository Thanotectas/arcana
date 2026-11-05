# Arcana marketing

Todas las piezas de comunicación de Arcana (miarcana.com). **Cada pieza vive en su propia carpeta** con todo lo
que la forma: el archivo final, los textos para redes, el prompt y lo que se usó para armarla. Las ilustraciones
que ya están en la app (cartas, monedas, Sibila) viven en `public/`.

## Carpetas

| Carpeta | Qué hay |
|---|---|
| `videos/NN-tema/` | Un video por carpeta: el `.mp4` final (y la versión `-whatsapp` < 10 MB si existe), los textos para redes (`*-redes.txt`), el prompt de Gemini/Flow/Kling (`prompt-*.txt`) y el montaje (`capas.html`, `armar.sh`, `voz/`…). |
| `carruseles/tema/` | Carruseles y series de imágenes: `generar.js` (las vuelve a crear), `laminas/` (las imágenes listas para subir) y los textos para redes. |
| `directos/` | Todo lo del directo (Facebook, YouTube, TikTok LIVE): flyers, miniatura, cómo pedir lectura, OBS y permisos. |
| `redes/` | Por red: `facebook/grupo-arcana` (portada y evento del grupo), `facebook/grupos-ajenos` (tarjetas y respuestas para otros grupos), `whatsapp/canal` y `whatsapp/estados`, `tiktok/`, `telegram/`. |
| `semanas/` | Planes y tarjetas de cada semana. |
| `marca/` | Logos, retrato y escena de Sibila, imagen de «todos los productos», flyers de Embajadores y prompts de marca. |
| `mazos/` | Tarot, oráculos, runas, Lenormand, baraja y monedas: prompts, hojas de contacto y las cuadrículas originales de Gemini (`fuentes-gemini/`). |
| `plantillas/` | Herramientas para repetir formatos, como `video-lectura-vaso` (video con líneas dibujadas sobre la foto de un vaso). |
| `play-store/` | Ficha de Google Play, invitación a probadores y respuestas para el acceso a producción. |

**Regla para piezas nuevas:** una carpeta por pieza, dentro de `videos/` o `carruseles/`, con nombre `NN-tema`
(videos) o `tema` (carruseles), y adentro todo lo suyo. No volver a separar por tipo (textos aquí, prompts allá).

## Videos

| Carpeta | Archivos finales |
|---|---|
| `01-lectura-de-la-mano` | 01-lectura-de-la-mano.mp4 |
| `02-carta-astral` | 02-carta-astral.mp4 |
| `03-cruce-chino-carta-astral` | 03-cruce-chino-carta-astral.mp4 |
| `04-suenos` | 04-suenos.mp4 |
| `05-por-que-arcana` | 05-por-que-arcana.mp4 |
| `06-ritual-de-velas` | 06-ritual-de-velas.mp4 |
| `07-carta-astral` | 07-carta-astral.mp4 |
| `08-aura` | 08-aura.mp4 |
| `09-embajadores` | 09-embajadores.mp4 |
| `10-chocolate` | 10-chocolate.mp4 |
| `11-en-vivo` | (sin video final) |
| `12-sibila` | 12-sibila.mp4 |
| `13-ritual-octubre` | 13-ritual-octubre.mp4 |
| `14-atraer-trabajo` | 14-atraer-trabajo.mp4 |
| `15-sibila-habla` | 15-sibila-habla.mp4 |
| `16-sibila-ritual-abundancia` | 16-sibila-ritual-abundancia.mp4 |
| `17-sibila-lee-la-mano` | 17-sibila-lee-la-mano.mp4 |
| `18-sibila-runas` | 18-sibila-runas.mp4 |
| `19-hoy-en-vivo` | 19-hoy-en-vivo.mp4 |
| `20-sinastria` | 20-sinastria.mp4 |
| `21-luna-llena-tauro` | 21-luna-llena-tauro.mp4 |
| `22-directo-31-octubre` | 22-directo-31-octubre-whatsapp.mp4, 22-directo-31-octubre.mp4 |
| `23-numerologia` | 23-numerologia-whatsapp.mp4, 23-numerologia.mp4 |
| `24-limpia-huevo` | 24-limpia-huevo-whatsapp.mp4, 24-limpia-huevo.mp4 |
| `25-directo-1-noviembre` | 25-directo-1-noviembre-musica.mp4, 25-directo-1-noviembre-whatsapp.mp4, 25-directo-1-noviembre.mp4 |
| `25-noche-de-brujas` | 25-noche-de-brujas-whatsapp.mp4, 25-noche-de-brujas.mp4 |
| `26-una-carta-para-ti` | 26-una-carta-para-ti-whatsapp.mp4, 26-una-carta-para-ti.mp4 |
| `27-canela-dia-1` | 27-canela-dia-1.mp4 |
| `28-sinastria-como-verla` | 28-sinastria-como-verla.mp4 |
| `30-anuncio-limpia` | 30-anuncio-limpia-sibila-te-la-lee.mp4 |
| `31-anuncio-vela` | 31-anuncio-vela-sibila-te-la-lee.mp4 |
| `32-por-que-me-llamo-sibila` | 32-por-que-me-llamo-sibila.mp4 |

## Carruseles

- `carruseles/frase-signos/`
- `carruseles/nahual-maya/`
- `carruseles/numeros-repetidos/`
- `carruseles/rituales-fin-de-anio/`
- `carruseles/serie-acepto-signos/`
- `carruseles/serie-decretado-signos/`
- `carruseles/tarjeta-ritual-trabajo/`

## Cómo se entregan las piezas

En el PC de Alejandro todo vive en `C:\Users\lualz\Documents\Arcana`, con las carpetas que crea
`plantillas/organizar-pc/Ordenar Arcana.bat` (00 Por ordenar, 01 Marketing, 02 Capturas, 03 Documentos (privado),
04 Audios y voces, 05 Clips de Gemini, Flow y Kling, 06 Fotos para responder (privado), 07–09 sueltos). El script
no borra nada: mueve lo que se ponga en «00 Por ordenar» según el tipo de archivo, preguntando antes.

Las entregas van en zips `Arcana Marketing - AAAA-MM-DD Tema.zip` cuyo contenido empieza por `Arcana/01 Marketing/`
y sigue la misma ruta que en este repositorio: se extraen dentro de `Documents` y cada archivo cae en su lugar.
El chat solo deja enviar archivos de hasta 30 MB: si hace falta, se arman varios zips independientes («1 de 2»…),
cada uno con carpetas completas. Para bajar todo `marketing/` de una vez: GitHub → Code → Download ZIP y copiar
la carpeta `marketing` del zip como `01 Marketing`. Los archivos se envían desde el scratchpad de la sesión.

## Identidad rápida

- Nombre: **Arcana** · dominio **miarcana.com** · guía: **Sibila**.
- Redes: Instagram **@miarcana.oficial** · TikTok **@miarcana4** · Facebook **Mi Arcana** (facebook.com/profile.php?id=61594894293890).
- Paleta: noche `#0b0716`, violeta `#8b6cf6` / `#b7a5ff`, oro `#d9b45a` / `#f1d99a`, texto `#ece6f7`.
- Tipografías: Cormorant Garamond (títulos) e Inter (texto).
- Gancho de adquisición: "Tu primera carta del día es gratis" (3 créditos de bienvenida al registrarse).

## Cómo se hicieron los videos

Clips generados con Gemini (Veo) a partir de los prompts de cada carpeta de `videos/`, escalados a 1080×1920 y montados con ffmpeg: rótulos con la tipografía de la marca (HTML renderizado con Playwright), fundidos entre tramos, audio continuo y cierre con logo, dominio y redes. El detalle de cada montaje está en el chat de desarrollo (octubre de 2026).

## Pendientes

- Regenerar la cuadrícula 2 del Tarot Arcana sin títulos dentro de la imagen (ver `imagenes/fuentes-gemini/tarot-arcana-cuadricula-2-con-titulos.jpg`).
- Tarot de Marsella: completo (78 cartas); opcional rehacer el Cuatro de Copas (salió con tres copas).
- Oráculo de los Ángeles: completo (44 cartas y reverso); opcional regenerar cartas sueltas con más diversidad de ángeles (`prompts/oraculo-angeles.txt`); prompts en `prompts/tarot-marsella.txt`, hoja de contacto en `imagenes/tarot-marsella-contacto.png`.
- Clip 3 del video 03 (la protagonista leyendo en el teléfono), opcional.
