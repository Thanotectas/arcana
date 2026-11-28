-- Directo de Instagram: los comentarios del vivo entran a la misma fila que el chat de YouTube y Facebook.
alter table public.en_vivo_preguntas drop constraint if exists en_vivo_preguntas_origen_check;
alter table public.en_vivo_preguntas add constraint en_vivo_preguntas_origen_check
  check (origen = any (array['chat', 'manual', 'pagina', 'facebook', 'instagram', 'sistema']));
alter table public.en_vivo_estado
  add column if not exists ig_live_id text,
  add column if not exists ig_desde timestamptz,
  add column if not exists ig_buscado_en timestamptz,
  add column if not exists ig_detalle text;
