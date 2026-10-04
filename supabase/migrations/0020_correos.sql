-- Arcana: correos de Sibila (carta del día y regreso) y preferencia de la persona.

-- 1. Preferencia: la persona puede apagar los correos desde Mi cuenta o con el
--    enlace de baja de cada correo.
alter table public.perfiles
  add column if not exists recibe_correos boolean not null default true;
grant update (recibe_correos) on public.perfiles to authenticated;

-- 2. Registro de envíos: evita repetir, limita la frecuencia y guarda el id del
--    proveedor. Solo el servidor (service_role) lo lee y escribe.
create table if not exists public.correos (
  id            bigint generated always as identity primary key,
  usuario_id    uuid not null references public.perfiles (id) on delete cascade,
  tipo          text not null check (tipo in ('carta_activo', 'regreso_7', 'regreso_30')),
  asunto        text not null,
  estado        text not null default 'enviado' check (estado in ('enviado', 'error')),
  id_proveedor  text,
  detalle       text,
  creado_en     timestamptz not null default now()
);
create index if not exists correos_usuario_idx on public.correos (usuario_id, creado_en desc);
alter table public.correos enable row level security;
revoke all on public.correos from anon, authenticated;
