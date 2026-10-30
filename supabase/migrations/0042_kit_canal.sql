-- Arcana: kit diario del canal de WhatsApp (correo a la administración), registrado
-- en publicaciones_redes como red 'correo' y tipo 'kit_canal'.
alter table public.publicaciones_redes drop constraint if exists publicaciones_redes_tipo_check;
alter table public.publicaciones_redes
  add constraint publicaciones_redes_tipo_check
  check (tipo in ('carta_dia', 'historia', 'carrusel', 'kit_tiktok', 'kit_canal', 'publicacion'));
