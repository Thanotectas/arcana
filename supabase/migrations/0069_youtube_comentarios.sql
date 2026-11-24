-- Sibila responde comentarios de YouTube: la red «youtube» en interacciones_redes, y en el canal conectado
-- cuándo se revisaron los comentarios por última vez (para no consultar la API en cada aviso) y los permisos dados.
alter table public.interacciones_redes drop constraint if exists interacciones_redes_red_check;
alter table public.interacciones_redes add constraint interacciones_redes_red_check check (red = any (array['instagram', 'facebook', 'youtube']));
alter table public.youtube_cuenta add column if not exists comentarios_revisados_en timestamptz;
alter table public.youtube_cuenta add column if not exists scopes text;
