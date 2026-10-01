-- Arcana: registro de publicaciones automáticas en redes (una por red, tipo y
-- día). La clave única impide publicar dos veces si el cron se repite.
create table if not exists public.publicaciones_redes (
  id           bigint generated always as identity primary key,
  red          text not null check (red in ('instagram')),
  tipo         text not null check (tipo in ('carta_dia')),
  fecha        date not null,
  estado       text not null default 'pendiente' check (estado in ('pendiente', 'publicada', 'error')),
  referencia   text,
  detalle      text,
  creado_en    timestamptz not null default now(),
  unique (red, tipo, fecha)
);
alter table public.publicaciones_redes enable row level security;
revoke all on public.publicaciones_redes from anon, authenticated;
