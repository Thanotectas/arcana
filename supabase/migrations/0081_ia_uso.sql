-- Gasto de la API de Claude por función: una fila por llamada, con los tokens y el costo estimado en dólares.
create table if not exists public.ia_uso (
  id bigserial primary key,
  funcion text not null,
  modelo text not null,
  entrada integer not null default 0,
  salida integer not null default 0,
  cache_lectura integer not null default 0,
  cache_escritura integer not null default 0,
  costo_usd numeric(10,6) not null default 0,
  creado_en timestamptz not null default now()
);
create index if not exists ia_uso_creado on public.ia_uso (creado_en desc);
alter table public.ia_uso enable row level security;
