-- Arcana: más formatos automáticos en redes.
-- - Historia diaria de la carta del día (Instagram y Facebook).
-- - Carrusel semanal "Tu signo esta semana" (los lunes); su texto, escrito
--   por Sibila, se guarda en `contenido` para dibujar las láminas.
-- - Kit diario para TikTok: un correo con los reels y los textos listos
--   (se registra con red 'correo' para enviarlo una sola vez por día).
alter table public.publicaciones_redes drop constraint if exists publicaciones_redes_red_check;
alter table public.publicaciones_redes
  add constraint publicaciones_redes_red_check check (red in ('instagram', 'facebook', 'correo'));

alter table public.publicaciones_redes drop constraint if exists publicaciones_redes_tipo_check;
alter table public.publicaciones_redes
  add constraint publicaciones_redes_tipo_check check (tipo in ('carta_dia', 'historia', 'carrusel', 'kit_tiktok'));

alter table public.publicaciones_redes add column if not exists contenido jsonb;

-- Las cifras del carrusel también se siguen en metricas_redes.
alter table public.metricas_redes drop constraint if exists metricas_redes_origen_check;
alter table public.metricas_redes
  add constraint metricas_redes_origen_check check (origen in ('carta_dia', 'programada', 'carrusel'));
