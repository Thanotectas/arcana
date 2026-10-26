-- Arcana: directo con carta astral y sinastría dibujadas en pantalla, y
-- comentarios del directo de Facebook en la misma fila que el chat de YouTube.
-- en_vivo_preguntas: tipos «carta» y «sinastria» y origen «facebook».
-- en_vivo_estado: el directo de Facebook encontrado y hasta qué comentario se leyó.
alter table public.en_vivo_preguntas drop constraint if exists en_vivo_preguntas_tipo_check;
alter table public.en_vivo_preguntas
  add constraint en_vivo_preguntas_tipo_check
  check (tipo in ('tarot', 'aura', 'numerologia', 'horoscopo', 'chocolate', 'mano', 'carta', 'sinastria'));

alter table public.en_vivo_preguntas drop constraint if exists en_vivo_preguntas_origen_check;
alter table public.en_vivo_preguntas
  add constraint en_vivo_preguntas_origen_check
  check (origen in ('chat', 'manual', 'pagina', 'facebook'));

alter table public.en_vivo_estado
  add column if not exists fb_live_id     text,
  add column if not exists fb_desde       timestamptz,
  add column if not exists fb_buscado_en  timestamptz,
  add column if not exists fb_detalle     text;
