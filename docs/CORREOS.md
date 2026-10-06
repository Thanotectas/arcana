# Correos de Sibila (campañas) y PDF de lecturas

## Qué hace

Un cron diario (`/api/cron/correos`, que el orquestador `/api/cron/manana` llama a las 12:00 UTC = 07:00 Bogotá) escribe a las personas con cuenta según su actividad:

| Segmento | Condición | Correo | Repite |
| --- | --- | --- | --- |
| Activo | entró o hizo una lectura en los últimos 7 días | "Tu carta de hoy ya está sobre la mesa" | cada 7 días |
| Inactivo corto | 7 a 29 días sin actividad | "Una semana sin verte" | cada 30 días |
| Inactivo largo | 30 días o más | "Te extrañamos" con lo nuevo | cada 90 días |

Reglas: nunca más de un correo cada 6 días por persona; cuentas de menos de 3 días no reciben; solo correos confirmados; se respeta `perfiles.recibe_correos` (casilla en Mi cuenta y enlace de baja firmado en cada correo). Cada correo lleva la carta del día de Arcana (la misma de Instagram), un botón a `/tarot` y enlaces con `utm_campaign=<tipo>` para medir en Vercel Analytics.

Tope por corrida: `CORREOS_MAXIMO` (80). Prioridad cuando hay más candidatos que cupo: inactivos largos, inactivos cortos, activos. Los envíos quedan en la tabla `correos` (migración 0020).

## Configurar Resend (una vez)

1. Crea la cuenta en https://resend.com (plan gratuito: 3.000 correos al mes, 100 al día).
2. **Domains → Add domain**: `miarcana.com`. Resend muestra tres registros DNS: uno **TXT** de verificación/SPF, uno **MX** para rebotes y una clave **DKIM** (TXT `resend._domainkey`). Cópialos tal cual en el DNS del dominio (donde esté miarcana.com: Vercel, GoDaddy, Cloudflare…). Tarda minutos u horas en verificar.
3. **API Keys → Create**: permiso "Sending access", dominio `miarcana.com`. Copia la clave (empieza por `re_`).
4. En Vercel → Settings → Environment Variables (Production):
   - `RESEND_API_KEY` = la clave.
   - `CORREO_REMITENTE` = `Sibila de Arcana <sibila@miarcana.com>` (cualquier buzón del dominio verificado; no necesita existir para enviar).
   - `CORREO_RESPUESTA` = buzón real al que llegan las respuestas (opcional; por defecto `miarcana4@gmail.com`).
   - `CORREOS_MAXIMO` = `80` (opcional).
5. Redespliega. Sin `RESEND_API_KEY` el cron responde `sin_resend_api_key` y no envía nada.

Para probar sin esperar al cron: Vercel → Cron Jobs → `/api/cron/correos` → Run. La respuesta JSON dice cuántos candidatos había y cuántos se enviaron por tipo. Para recibir uno de prueba, entra con una cuenta de hace más de 3 días y que no haya recibido correo en 6 días: te llegará el de "activo".

Si el dominio aún no está verificado, Resend permite enviar solo a tu propio correo desde `onboarding@resend.dev`: pon `CORREO_REMITENTE="Arcana <onboarding@resend.dev>"` para la prueba.

## PDF de lecturas

Botón "Descargar PDF" en cada lectura terminada (`/api/lecturas/[id]/pdf`, solo la dueña o dueño). Hoja A4 marfil con la marca, el bloque visual de la lectura (cartas con sus posiciones, monedas de signos o animales, foto, aura, hexagrama o números), la pregunta, la interpretación de Sibila y las preguntas posteriores con sus respuestas. Generado con `@react-pdf/renderer` (`src/lib/pdf/documento.tsx`); fuentes en `src/app/fuentes`.

## Resumen semanal a la administración

Cada lunes a las 07:00 (Bogotá) el orquestador de la mañana llama a `/api/cron/resumen`, que envía a los correos
de `ADMIN_CORREOS` el estado del negocio de la semana (`src/lib/resumen/semanal.ts`),
con etiqueta `resumen_semanal` en Resend. La misma información se ve en
`/admin/resumen`, donde también se puede enviar al instante.
