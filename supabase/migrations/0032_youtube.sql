-- Arcana: YouTube Shorts desde /admin/redes.
-- youtube_cuenta guarda el canal conectado (permiso de Google con el que se
-- renueva el acceso); publicaciones_youtube, cada video subido a mano desde el
-- panel. El Short diario de la carta del día se registra en
-- publicaciones_redes con red 'youtube' para subirlo una sola vez.
create table if not exists public.youtube_cuenta (
  id              smallint primary key default 1 check (id = 1),
  canal_id        text not null,
  nombre          text,
  usuario         text,
  avatar          text,
  refresh_token   text not null,
  access_token    text,
  expira_en       timestamptz,
  conectada_en    timestamptz not null default now(),
  actualizado_en  timestamptz not null default now()
);

alter table public.youtube_cuenta enable row level security;

create table if not exists public.publicaciones_youtube (
  id          bigserial primary key,
  video_id    text,
  titulo      text not null,
  video       text not null,
  privacidad  text not null check (privacidad in ('public', 'unlisted', 'private')),
  estado      text not null default 'subiendo' check (estado in ('subiendo', 'subido', 'error')),
  detalle     text,
  creado_en   timestamptz not null default now()
);

create index if not exists publicaciones_youtube_fecha on public.publicaciones_youtube (creado_en desc);

alter table public.publicaciones_youtube enable row level security;

alter table public.publicaciones_redes drop constraint if exists publicaciones_redes_red_check;
alter table public.publicaciones_redes
  add constraint publicaciones_redes_red_check check (red in ('instagram', 'facebook', 'correo', 'youtube'));
