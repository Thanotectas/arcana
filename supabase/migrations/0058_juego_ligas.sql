-- Arcana: «El Camino del Loco», ligas de amigos. Cada liga tiene un código corto para invitar y su propio
-- ranking semanal (con los mismos puntos del ranking general). Solo el servidor lee y escribe (service_role).
create table if not exists public.juego_ligas (
  id         uuid primary key default gen_random_uuid(),
  codigo     text not null unique check (codigo ~ '^[A-Z0-9]{6}$'),
  nombre     text not null check (char_length(nombre) between 3 and 40),
  creador    uuid not null references public.perfiles (id) on delete cascade,
  creado_en  timestamptz not null default now()
);
create index if not exists juego_ligas_creador on public.juego_ligas (creador);

create table if not exists public.juego_liga_miembros (
  liga_id     uuid not null references public.juego_ligas (id) on delete cascade,
  usuario_id  uuid not null references public.perfiles (id) on delete cascade,
  unido_en    timestamptz not null default now(),
  primary key (liga_id, usuario_id)
);
create index if not exists juego_liga_miembros_usuario on public.juego_liga_miembros (usuario_id);

alter table public.juego_ligas enable row level security;
alter table public.juego_liga_miembros enable row level security;
