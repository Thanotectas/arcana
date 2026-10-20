-- Arcana: segundo Short diario en YouTube con la publicación del agente de
-- redes. publicaciones_redes lleva el registro de "una vez por red, tipo y
-- día"; se admite el tipo 'publicacion' (red 'youtube').
alter table public.publicaciones_redes drop constraint if exists publicaciones_redes_tipo_check;
alter table public.publicaciones_redes
  add constraint publicaciones_redes_tipo_check check (tipo in ('carta_dia', 'historia', 'carrusel', 'kit_tiktok', 'publicacion'));
