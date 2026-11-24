# Auditoría de TikTok (Content Posting API: publicación directa)

Hoy la app de TikTok de Arcana está sin auditar. Eso tiene dos consecuencias:

- **«Publicar en TikTok» (directo):** TikTok solo deja publicar en **privado**.
- **«Enviar a mis borradores»:** el video llega a la bandeja de la app y hay que terminar de publicarlo allí a mano.

Al aprobarse la auditoría, el botón **«Publicar en TikTok»** de /admin/redes deja el video **publicado** con la privacidad que elijas, sin pasar por la app.

**Lo que la auditoría no cambia:** las pautas de TikTok exigen que una persona revise cada video y elija la privacidad. Por eso, incluso aprobados, los videos no salen solos con el cron: cada uno lleva **un clic** en el panel. Lo automático (cron de la mañana) sigue mandando a borradores.

## 1. Antes de enviar

Revisa cada punto en developers.tiktok.com → tu app:

| Punto | Estado en Arcana |
|---|---|
| Productos: **Login Kit** y **Content Posting API** con «Direct Post» activado | Revisar en la app |
| Scopes: `user.info.basic`, `user.info.stats`, `video.upload`, `video.publish` | Ya los pide el código (`SCOPES_TIKTOK`) |
| Redirect URI: `https://miarcana.com/api/tiktok/callback` | Ya registrada |
| Política de privacidad pública: `https://miarcana.com/privacidad` | Actualizada el 24-11-2026 con la sección de TikTok y YouTube |
| Términos: `https://miarcana.com/terminos` | Existe |
| Ícono de la app y nombre «Arcana» | Revisar |

## 2. Pautas de publicación directa y dónde se cumplen

Todas están en `src/components/admin/PublicarTiktok.tsx`.

1. **Cuenta de destino:** se muestran el avatar y el nombre de la cuenta antes de publicar, desde `creator_info`.
2. **Privacidad:** la lista sale de `privacy_level_options`, **sin valor por defecto**. El botón queda apagado hasta que eliges una.
3. **Comentarios, dúo y stitch:** apagados por defecto. Si la cuenta los tiene desactivados en TikTok, se muestran bloqueados.
4. **Divulgación de contenido comercial:** apagada por defecto. Tiene las opciones «Tu marca» y «Contenido de marca», con sus etiquetas. El contenido de marca no puede ser privado. Las declaraciones enlazan a la Política de contenido de marca y a la Confirmación de uso de música.
5. **Duración máxima:** si el video supera `max_video_post_duration_sec`, no se deja publicar. Se agregó el 24-11-2026.
6. **Vista previa:** el video se muestra antes de publicar y el texto se puede editar.
7. **Después de publicar:** el panel avisa que TikTok tarda unos minutos en procesar el video y consulta el estado.
8. **Sin marcas de agua** ni texto promocional agregado por la app al video.

## 3. Video de demostración (lo grabas tú)

TikTok pide una grabación de pantalla del flujo completo en el dominio real. Debe ser MP4 o MOV, de menos de 50 MB y de 1 a 3 minutos. **Tienes que grabarla tú**: hace falta tu sesión de administración y entrar a TikTok.

Para que el revisor la entienda, conviene poner el navegador en inglés o subtitular los pasos. El panel está en español, así que explica cada paso en la descripción en inglés (sección 4).

Pasos a grabar:

1. Abre `https://miarcana.com/admin/redes`, sección **TikTok**. Si ya está conectada, toca **Desconectar** primero, para que se vea el inicio de sesión.
2. Toca **Conectar TikTok**: se ve la pantalla de autorización de TikTok con los permisos. Acepta y vuelve al panel («TikTok quedó conectado»).
3. Elige un video corto (la carta del día) y toca **Preparar para TikTok**.
4. Muestra el formulario:
   - el avatar y el nombre de la cuenta;
   - la vista previa del video;
   - el texto editable;
   - la lista de privacidad **vacía** que obliga a elegir: elige «Solo yo» (SELF_ONLY), porque sin auditar es lo único permitido;
   - los interruptores de comentarios, dúo y stitch;
   - abre «Divulgar contenido comercial» para mostrar las dos opciones y vuelve a cerrarlo;
   - la línea de la Confirmación de uso de música.
5. Toca **Publicar en TikTok**: aparece el aviso de que TikTok está procesando.
6. Toca **Actualizar estado** hasta que diga publicado. Después abre la app o la web de TikTok y muestra el video en el perfil, como privado.

## 4. Textos para el formulario (en inglés)

**App description**
> Arcana (miarcana.com) is a tarot, astrology and numerology website. The app is used only by Arcana's own team to publish the brand's short videos (daily tarot card, horoscope and educational clips about esoteric traditions) to Arcana's own TikTok account. No end users connect their TikTok accounts.

**How does your app use Login Kit?**
> The Arcana admin logs in with TikTok once from our internal admin panel (miarcana.com/admin/redes) to connect the brand account. We read basic profile info (avatar, display name) to show which account the video will be posted to, and the follower count for our internal dashboard.

**How does your app use the Content Posting API (Direct Post)?**
> From the admin panel, the admin selects a video produced by Arcana, sees a preview, edits the caption, and must manually choose the privacy level (no default) from the options returned by creator_info. Comment, Duet and Stitch toggles are off by default and disabled when the creator has disabled them. Commercial content disclosure is available, with the "Your brand" and "Branded content" options and the required declarations (Branded Content Policy and Music Usage Confirmation). Videos longer than max_video_post_duration_sec are blocked. After posting, the admin is told that processing may take a few minutes and can check the publish status. Every post requires an explicit click by the admin; nothing is posted automatically.

**Scopes justification**
- `user.info.basic`: show the avatar and name of the account the video goes to.
- `user.info.stats`: follower count in our internal dashboard.
- `video.upload`: send videos to the creator's inbox as drafts.
- `video.publish`: direct posting after the admin's manual review, following the Content Sharing Guidelines.

## 5. Después

- La revisión suele tardar **de unos días a algunas semanas**. Si la rechazan, TikTok dice qué pauta falta: tráeme el mensaje y lo ajustamos.
- Mientras tanto, los videos siguen llegando a **borradores**. Revisa la bandeja de TikTok, porque hay varios esperando.
