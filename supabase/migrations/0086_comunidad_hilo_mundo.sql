-- Comunidad: un segundo hilo diario, «Pregunta del mundo» (conversación sin esoterismo entre países, traducida).
alter table public.comunidad_mensajes add column if not exists hilo text not null default 'carta';
alter table public.comunidad_mensajes drop constraint if exists comunidad_mensajes_hilo_check;
alter table public.comunidad_mensajes add constraint comunidad_mensajes_hilo_check check (hilo in ('carta', 'mundo'));
create index if not exists comunidad_mensajes_fecha_hilo on public.comunidad_mensajes (fecha, hilo, id);
