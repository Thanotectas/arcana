-- Audio de Sibila para las lecturas pagas, en el idioma de la lectura:
--   «mensaje»: un mensaje de voz de ~1 minuto con lo esencial (incluido en toda lectura paga);
--   «completo»: la lectura entera leída por Sibila (se paga con créditos aparte).
-- Se genera la primera vez que la persona lo pide y queda guardado: nunca se paga dos veces.

-- Bucket privado: solo el servidor sube y lee; la página entrega URLs firmadas. Ruta: <usuario_id>/<lectura_id>-<tipo>.mp3
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('audios', 'audios', false, 52428800, array['audio/mpeg'])
on conflict (id) do nothing;

create table if not exists public.lecturas_audio (
  lectura_id  uuid not null references public.lecturas (id) on delete cascade,
  tipo        text not null check (tipo in ('mensaje', 'completo')),
  estado      text not null default 'generando' check (estado in ('generando', 'listo', 'error')),
  ruta        text,
  -- El texto del mensaje de voz (para mostrarlo junto al audio) y cuántos caracteres se narraron (costo).
  texto       text,
  caracteres  integer not null default 0,
  creditos    integer not null default 0 check (creditos >= 0),
  creado_en   timestamptz not null default now(),
  primary key (lectura_id, tipo)
);

-- Solo el servidor (service_role) la usa.
alter table public.lecturas_audio enable row level security;
