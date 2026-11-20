-- Arcana: «El Camino del Loco», el juego diario de la carta escondida.
-- Una fila por persona y día (hora de Bogotá). Solo el servidor escribe (service_role),
-- después de comprobar la partida; cada persona puede leer las suyas.
create table if not exists public.juego_partidas (
  usuario_id  uuid not null references public.perfiles (id) on delete cascade,
  fecha       date not null,
  numero      integer not null,
  carta       text not null,
  intentos    text[] not null,
  gano        boolean not null,
  -- El día que completa una racha de 7 (14, 21…) recibe el crédito: se marca una sola vez.
  premiada    boolean not null default false,
  creado_en   timestamptz not null default now(),
  primary key (usuario_id, fecha)
);
create index if not exists juego_partidas_fecha on public.juego_partidas (fecha);

alter table public.juego_partidas enable row level security;
create policy "juego: ver las propias" on public.juego_partidas
  for select to authenticated using ((select auth.uid()) = usuario_id);
grant select on public.juego_partidas to authenticated;
