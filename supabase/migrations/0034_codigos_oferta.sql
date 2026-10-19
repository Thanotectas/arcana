-- Arcana: códigos de oferta (créditos extra en una compra).
-- Un código no cambia el precio: suma créditos extra a la orden, y
-- acreditar_orden (migración 0007) los entrega al aprobarse el pago como a
-- cualquier orden. Sirven para los directos («esta noche, con el código
-- SIBILA, 2 créditos más»). Se crean desde /admin/en-vivo. Solo el servidor
-- toca la tabla.
create table if not exists public.codigos_oferta (
  codigo          text primary key,                 -- en mayúsculas, sin espacios
  creditos_extra  integer not null check (creditos_extra > 0),
  paquetes        text[],                           -- null = cualquier paquete
  cupo            integer,                          -- null = sin tope
  vence_en        timestamptz,                      -- null = no vence
  activo          boolean not null default true,
  nota            text,
  creado_en       timestamptz not null default now()
);

alter table public.codigos_oferta enable row level security;

-- La orden recuerda el código que usó (para contar el cupo y para revisar).
alter table public.ordenes add column if not exists codigo text references public.codigos_oferta (codigo);
create index if not exists ordenes_codigo on public.ordenes (codigo) where codigo is not null;

-- Primer directo: domingo 25 de octubre de 2026, 8 p.m. (Bogotá). Vale hasta la medianoche.
insert into public.codigos_oferta (codigo, creditos_extra, cupo, vence_en, nota)
values ('SIBILA', 2, 100, '2026-10-26 04:59:59+00', 'Primer directo «Sibila en vivo»')
on conflict (codigo) do nothing;
