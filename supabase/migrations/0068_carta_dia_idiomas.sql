-- Arcana: la carta del día también en turco y árabe (un reel aparte por idioma en Instagram y Facebook).
alter table public.publicaciones_redes drop constraint if exists publicaciones_redes_tipo_check;
alter table public.publicaciones_redes
  add constraint publicaciones_redes_tipo_check
  check (tipo in ('carta_dia', 'carta_dia_tr', 'carta_dia_ar', 'historia', 'carrusel', 'kit_tiktok', 'kit_canal', 'publicacion', 'juego'));
