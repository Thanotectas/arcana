-- Arcana: «¿Tu práctica no está?» (miarcana.com/explorar). Lo que la gente pide que agreguemos a la biblioteca.
create table if not exists public.sugerencias_practicas (
  id         bigint generated always as identity primary key,
  texto      text not null check (char_length(texto) between 3 and 1000),
  correo     text check (correo is null or char_length(correo) <= 200),
  idioma     text not null default 'es',
  usuario_id uuid references auth.users (id) on delete set null,
  huella     text,
  revisada   boolean not null default false,
  creado_en  timestamptz not null default now()
);
create index if not exists sugerencias_practicas_creado on public.sugerencias_practicas (creado_en desc);
-- Solo el servidor (service_role) la usa.
alter table public.sugerencias_practicas enable row level security;
revoke all on public.sugerencias_practicas from anon, authenticated;
