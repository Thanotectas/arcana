-- Arcana: 1) «La carta escondida» en el directo y 2) invitaciones a la prueba cerrada de Google Play.

-- 1) Estado del juego en el directo (una sola fila, la del escenario).
alter table public.en_vivo_estado
  add column if not exists juego_pedido_en  timestamptz,  -- se pidió desde el panel: empieza en la siguiente vuelta
  add column if not exists juego_carta      text,         -- id de la carta escondida
  add column if not exists juego_inicio     timestamptz,
  add column if not exists juego_ganador    text,         -- nombre en el chat de quien la encontró primero
  add column if not exists juego_ganador_en timestamptz,
  add column if not exists juego_fin        timestamptz;

-- 2) Invitaciones a probar la app de Android. El Gmail lo da la persona (con ese correo se agrega en Play Console).
create table if not exists public.probadores_invitaciones (
  usuario_id     uuid primary key references public.perfiles (id) on delete cascade,
  invitado_en    timestamptz not null default now(),
  acepto_en      timestamptz,
  gmail          text,
  agregado_en    timestamptz   -- marcado desde el panel cuando el Gmail ya está en la lista de Play Console
);
alter table public.probadores_invitaciones enable row level security;
create policy "probadores: ver la propia" on public.probadores_invitaciones
  for select to authenticated using ((select auth.uid()) = usuario_id);
grant select on public.probadores_invitaciones to authenticated;
