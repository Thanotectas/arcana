-- Arcana: escenario espejo. El escenario principal (el que toma las consultas) publica aquí lo que está mostrando
-- y diciendo; el espejo (otra plataforma, otro formato) lo repite sin tocar la fila. Una sola fila (id = 1).
create table if not exists public.en_vivo_espejo (
  id             integer primary key default 1 check (id = 1),
  seq            bigint not null default 0,
  evento         jsonb,
  actualizado_en timestamptz not null default now()
);
alter table public.en_vivo_espejo enable row level security;
revoke all on public.en_vivo_espejo from anon, authenticated;
insert into public.en_vivo_espejo (id) values (1) on conflict (id) do nothing;
