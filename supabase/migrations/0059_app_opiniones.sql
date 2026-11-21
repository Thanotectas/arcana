-- Arcana: opiniones de quienes usan la app (sobre todo los probadores de Google Play). Google pide ver que se
-- recogen comentarios y que se actúa sobre ellos con actualizaciones. Solo el servidor lee y escribe.
create table if not exists public.app_opiniones (
  id           bigint generated always as identity primary key,
  usuario_id   uuid references public.perfiles (id) on delete set null,
  plataforma   text not null check (plataforma in ('android', 'pwa', 'web')),
  calificacion integer check (calificacion between 1 and 5),
  texto        text not null check (char_length(texto) between 3 and 2000),
  pagina       text,
  atendida     boolean not null default false,
  creado_en    timestamptz not null default now()
);
create index if not exists app_opiniones_creado on public.app_opiniones (creado_en desc);
alter table public.app_opiniones enable row level security;
