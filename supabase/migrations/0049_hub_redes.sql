-- Arcana: hub de redes (miarcana.com/redes). Una sola página con todos los
-- canales para poner en la biografía de cada red, en los correos y en los
-- videos. Cada clic hacia un canal queda aquí (sin IP ni nada que identifique
-- a la persona) y cada noche se anota cuántos seguidores tiene cada red, para
-- ver en /admin/hub qué origen trae gente y qué red crece. Solo el servidor
-- escribe y lee estas tablas.
create table if not exists public.clics_redes (
  id          bigserial primary key,
  fecha       date not null,                         -- día de Bogotá
  red         text not null,                         -- id del canal del hub: instagram, tiktok, telegram, canal…
  origen      text not null default 'directo',       -- código ?ref= del enlace del hub (instagram-bio, video-qr…)
  dispositivo text not null default 'escritorio' check (dispositivo in ('movil', 'escritorio')),
  creado_en   timestamptz not null default now()
);

create index if not exists clics_redes_fecha on public.clics_redes (fecha desc);

create table if not exists public.seguidores_redes (
  id          bigserial primary key,
  fecha       date not null,                         -- día de Bogotá
  red         text not null,                         -- instagram, tiktok, youtube, facebook, telegram
  seguidores  integer,                               -- null si la red no respondió ese día
  detalle     text,                                  -- por qué no respondió (permiso, token vencido…)
  creado_en   timestamptz not null default now(),
  unique (fecha, red)
);

alter table public.clics_redes enable row level security;
alter table public.seguidores_redes enable row level security;
