# Arcana marketing

Todas las piezas de comunicación de Arcana (miarcana.com), acumuladas en un solo lugar. Las fuentes de las ilustraciones que ya están en la app (cartas, monedas) viven en `public/`; aquí van los originales, los videos, los textos y lo que se sube a tiendas y redes.

## Carpetas

| Carpeta | Qué hay |
|---|---|
| `logos/` | Logotipo e iconos de la marca (SVG y PNG 192/512, versión maskable para Android). |
| `videos/` | Videos finales para TikTok e Instagram (vertical 1080×1920): 01 lectura de la mano, 02 carta astral, 03 cruce calendario chino × carta astral, 04 sueños, 05 "Por qué Arcana" (comparativo, 27 s), 06 ritual de velas (27 s). |
| `textos/` | Textos de publicación de cada video (TikTok e Instagram) con hashtags. |
| `prompts/` | Prompts usados con Gemini: videos (Veo), monedas del zodíaco, Tarot Arcana (22 umbrales). Sirven para repetir el estilo. |
| `play-store/` | Ficha de Google Play: icono 512, gráfico destacado 1024×500 y seis capturas. Los textos de la ficha están en `docs/GOOGLE-PLAY.md`. |
| `imagenes/` | Hojas de contacto de monedas y cartas, ejemplo de la carta del día de Instagram, cartas rediseñadas; en `fuentes-gemini/` las cuadrículas originales generadas con Gemini. |

## Identidad rápida

- Nombre: **Arcana** · dominio **miarcana.com** · guía: **Sibila**.
- Redes: Instagram **@miarcana.oficial** · TikTok **@miarcana4** · Facebook **Mi Arcana** (facebook.com/profile.php?id=61594894293890).
- Paleta: noche `#0b0716`, violeta `#8b6cf6` / `#b7a5ff`, oro `#d9b45a` / `#f1d99a`, texto `#ece6f7`.
- Tipografías: Cormorant Garamond (títulos) e Inter (texto).
- Gancho de adquisición: "Tu primera carta del día es gratis" (3 créditos de bienvenida al registrarse).

## Cómo se hicieron los videos

Clips generados con Gemini (Veo) a partir de los prompts de `prompts/`, escalados a 1080×1920 y montados con ffmpeg: rótulos con la tipografía de la marca (HTML renderizado con Playwright), fundidos entre tramos, audio continuo y cierre con logo, dominio y redes. El detalle de cada montaje está en el chat de desarrollo (octubre de 2026).

## Pendientes

- Regenerar la cuadrícula 2 del Tarot Arcana sin títulos dentro de la imagen (ver `imagenes/fuentes-gemini/tarot-arcana-cuadricula-2-con-titulos.jpg`).
- Tarot de Marsella: completo (78 cartas); opcional rehacer el Cuatro de Copas (salió con tres copas).
- Oráculo de los Ángeles: completo (44 cartas y reverso); opcional regenerar cartas sueltas con más diversidad de ángeles (`prompts/oraculo-angeles.txt`); prompts en `prompts/tarot-marsella.txt`, hoja de contacto en `imagenes/tarot-marsella-contacto.png`.
- Clip 3 del video 03 (la protagonista leyendo en el teléfono), opcional.
