-- Arcana: «El Camino del Loco», segunda tanda: comodín de Sibila, reto maestro, premios por completar y ranking semanal.
-- Como en 0052, solo el servidor escribe (service_role) después de comprobar; cada persona lee lo suyo.

-- Comodín de Sibila: qué ayuda pidió ese día (una al día). null = jugó sin comodín.
alter table public.juego_partidas
  add column if not exists comodin text check (comodin in ('grupo', 'paridad', 'rango'));

-- Reto maestro: segunda carta del día, más difícil, solo para quien ya encontró la del día.
create table if not exists public.juego_maestro (
  usuario_id  uuid not null references public.perfiles (id) on delete cascade,
  fecha       date not null,
  carta       text not null,
  intentos    text[] not null,
  gano        boolean not null,
  creado_en   timestamptz not null default now(),
  primary key (usuario_id, fecha)
);
create index if not exists juego_maestro_fecha on public.juego_maestro (fecha);
alter table public.juego_maestro enable row level security;
create policy "juego maestro: ver las propias" on public.juego_maestro
  for select to authenticated using ((select auth.uid()) = usuario_id);
grant select on public.juego_maestro to authenticated;

-- Premios por completar el álbum (un palo, El Camino del Loco, todo el tarot): la llave evita pagarlo dos veces.
create table if not exists public.juego_premios (
  usuario_id  uuid not null references public.perfiles (id) on delete cascade,
  premio      text not null,
  creditos    integer not null,
  creado_en   timestamptz not null default now(),
  primary key (usuario_id, premio)
);
alter table public.juego_premios enable row level security;
create policy "juego premios: ver los propios" on public.juego_premios
  for select to authenticated using ((select auth.uid()) = usuario_id);
grant select on public.juego_premios to authenticated;

-- Ranking semanal: solo aparece quien elige un apodo (nunca el nombre real ni el correo).
create table if not exists public.juego_jugadores (
  usuario_id     uuid primary key references public.perfiles (id) on delete cascade,
  apodo          text not null check (char_length(apodo) between 3 and 20),
  creado_en      timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);
create unique index if not exists juego_jugadores_apodo on public.juego_jugadores (lower(apodo));
alter table public.juego_jugadores enable row level security;
create policy "juego jugadores: ver el propio" on public.juego_jugadores
  for select to authenticated using ((select auth.uid()) = usuario_id);
grant select on public.juego_jugadores to authenticated;
