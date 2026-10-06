# Agente de redes

Sibila redacta cada semana una publicación por día; la administración las
aprueba en `/admin/redes` y el cron las publica en Instagram y Facebook.
Nada sale sin aprobación. La carta del día sigue siendo automática.

## Calendario editorial (rotaciones por número de semana)

| Día | Tipo | De dónde sale el contexto |
|---|---|---|
| Lunes | `guia` | Una de las seis guías gratis (chocolate, velas, mano, luna, I Ching, tabaco). |
| Martes | `pregunta` | Una pregunta de ejemplo para Sibila (lista de ocho). Lleva La Sacerdotisa. |
| Miércoles | `producto` | Una de las catorce lecturas con su costo real (`COSTOS`). |
| Jueves | `oferta` | Fundadores mientras esté activa (cupos reales); si no, alterna prueba de 1 crédito y Círculo. |
| Viernes | `luna` | La próxima lunación real (`proximasLunaciones`) con signo, hora de Bogotá y vela sugerida. |
| Sábado | `signo` | Un signo (moneda dorada) con sus rasgos. |
| Domingo | `reflexion` | Cierre de semana e invitación a la carta del día gratis. |

`src/lib/redes/calendario.ts` arma los encargos y pide los textos a Sibila en
una sola llamada (JSON con `titulo`, `extracto` y `texto`); `generarSemana`
inserta los borradores que falten (unicidad por fecha y tipo).

## Flujo

1. **Generación**: el cron `/api/cron/instagram` llama a `asegurarBorradores`
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
4. **Imagen**: `/api/redes/publicacion?id=UUID` (1080×1350, `imagenTarjeta`),
   con carta del mazo o moneda del signo según `carta` ("rider/la-estrella" o
   "signos/libra"). Meta la descarga por URL pública; `v=` evita cachés viejas.

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
