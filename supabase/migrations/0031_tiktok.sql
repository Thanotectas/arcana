-- Arcana: conexión con TikTok (Login Kit + Content Posting API).
-- tiktok_cuenta guarda la única cuenta conectada (@miarcana4) con sus
-- permisos; publicaciones_tiktok, cada video enviado desde /admin/redes y su
-- estado en TikTok. Solo el servidor las toca (sin políticas de RLS).
create table if not exists public.tiktok_cuenta (
  id                 smallint primary key default 1 check (id = 1),
  open_id            text not null,
  nombre             text,
  usuario            text,
  avatar             text,
  access_token       text not null,
  refresh_token      text not null,
  expira_en          timestamptz not null,
  refresh_expira_en  timestamptz,
  scopes             text,
  conectada_en       timestamptz not null default now(),
  actualizado_en     timestamptz not null default now()
);

alter table public.tiktok_cuenta enable row level security;

create table if not exists public.publicaciones_tiktok (
  id              bigserial primary key,
  publish_id      text unique,
  modo            text not null check (modo in ('borrador', 'directo')),
  titulo          text,
  video           text not null,
  privacidad      text,
  estado          text not null default 'enviando' check (estado in ('enviando', 'procesando', 'en_borradores', 'publicada', 'error')),
  post_id         text,
  detalle         text,
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now()
);

create index if not exists publicaciones_tiktok_fecha on public.publicaciones_tiktok (creado_en desc);

alter table public.publicaciones_tiktok enable row level security;
