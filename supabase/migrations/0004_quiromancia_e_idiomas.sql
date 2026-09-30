-- Arcana: lectura de la mano (quiromancia) e idiomas.

-- 1. Nuevo tipo de lectura.
alter table public.lecturas drop constraint if exists lecturas_tipo_check;
alter table public.lecturas
  add constraint lecturas_tipo_check
  check (tipo in ('tarot_carta', 'tarot_tres', 'tarot_celta', 'carta_astral', 'numerologia', 'compatibilidad', 'quiromancia'));

-- 2. Fotos de palmas: bucket privado. Solo el servidor (service_role) sube y
--    lee; la página entrega URLs firmadas de corta duración. Ruta:
--    <usuario_id>/<lectura_id>.jpg
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('palmas', 'palmas', false, 4194304, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- 3. Horóscopo por idioma: una fila por signo, día e idioma.
alter table public.horoscopos
  add column if not exists idioma text not null default 'es' check (idioma in ('es', 'en', 'pt'));
alter table public.horoscopos drop constraint if exists horoscopos_signo_fecha_key;
alter table public.horoscopos add constraint horoscopos_signo_fecha_idioma_key unique (signo, fecha, idioma);

-- 4. Idioma preferido del perfil (para correos y lecturas futuras).
alter table public.perfiles
  add column if not exists idioma text not null default 'es' check (idioma in ('es', 'en', 'pt'));
