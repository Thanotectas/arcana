# Sibila en Telegram

Reemplaza la línea de WhatsApp, que Meta desactivó de forma permanente (ver `docs/WHATSAPP.md`).

## Qué hace

- Responde dudas sobre Arcana con los mismos hechos que usaba en WhatsApp (`hechos()` de
  `src/lib/whatsapp/sibila.ts`): qué es, precios, cómo entrar y pagar. No hace lecturas.
- Comandos (sin IA): `/start` bienvenida, `/carta` carta del día (imagen + texto), `/diaria` la recibe
  cada mañana, `/parar` deja de recibirla, `/persona` avisa por correo a la administración.
- Si Sibila detecta que piden una persona, también avisa por correo (`«PASAR_A_PERSONA»`).
- Tope de 40 mensajes por persona al día. Los enlaces van con `/tg` (origen «telegram» en el resumen).
- Carta diaria: `/api/cron/telegram` en el orquestador de la mañana, una vez por día
  (`publicaciones_redes`, red `telegram`). Quien bloquea al bot queda dado de baja solo.

## Código

- `src/lib/telegram/api.ts` (Bot API, secreto del webhook derivado del token),
  `src/lib/telegram/sibila.ts` (agente y carta diaria), `src/lib/telegram/acciones.ts` (conectar y responder).
- Webhook `POST /api/webhooks/telegram` (verifica `X-Telegram-Bot-Api-Secret-Token`, responde 200 y atiende con `after`).
- Panel `/admin/telegram`: estado del bot y del webhook, suscriptores, botón «Conectar el bot» (registra el
  webhook, los comandos y la descripción) y conversaciones con caja para responder a mano (Telegram no
  tiene ventana de 24 horas).
- Migración `0038_telegram.sql`: `mensajes_telegram`, `suscriptores_telegram` y red `telegram` en
  `publicaciones_redes`.

## Puesta en marcha

1. En Telegram, abrir **@BotFather** → `/newbot` → nombre «Sibila · Arcana» → usuario terminado en `bot`
   (quedó **@MiArcanaBot**, https://t.me/MiArcanaBot). Copiar el token.
2. En Vercel: `TELEGRAM_BOT_TOKEN` = el token (marcar **Sensitive**) y `NEXT_PUBLIC_TELEGRAM_BOT` = el
   usuario sin @. Volver a desplegar.
3. Aplicar la migración 0038 en Supabase.
4. En `/admin/telegram`, pulsar **Conectar el bot**. Probar escribiendo `/start` al bot.
5. Opcional en @BotFather: `/setuserpic` con la imagen de Sibila (`public/marca/sibila/base.jpg` o el retrato).

Con `NEXT_PUBLIC_TELEGRAM_BOT` el pie de la web muestra «Telegram» y el chat de la página lo ofrece
para hablar con una persona. `TELEGRAM_DIARIA=0` apaga la carta diaria.
