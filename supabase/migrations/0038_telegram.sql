-- Arcana: Sibila en Telegram (reemplaza la línea de WhatsApp, que Meta
-- desactivó de forma permanente el 23 oct 2026). mensajes_telegram guarda las
-- conversaciones (el update_id de Telegram evita responder dos veces si
-- reintenta el aviso); suscriptores_telegram, quién recibe la carta del día
-- cada mañana (/diaria para entrar, /parar para salir). Solo el servidor
-- toca estas tablas.
create table if not exists public.mensajes_telegram (
  id          bigserial primary key,
  chat_id     bigint not null,
  nombre      text,
  usuario     text,                            -- @usuario de Telegram, si lo tiene
  rol         text not null check (rol in ('persona', 'asistente')),
  contenido   text not null,
  update_id   bigint unique,
  tipo        text not null default 'text',    -- text, comando, humano…
  humano      boolean not null default false,  -- la persona pidió hablar con alguien
  creado_en   timestamptz not null default now()
);

create index if not exists mensajes_telegram_chat_fecha on public.mensajes_telegram (chat_id, creado_en desc);
alter table public.mensajes_telegram enable row level security;

create table if not exists public.suscriptores_telegram (
  chat_id     bigint primary key,
  nombre      text,
  activo      boolean not null default true,
  creado_en   timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

alter table public.suscriptores_telegram enable row level security;

-- La carta diaria a los suscriptores se registra una vez por día (red 'telegram').
alter table public.publicaciones_redes drop constraint if exists publicaciones_redes_red_check;
alter table public.publicaciones_redes
  add constraint publicaciones_redes_red_check check (red in ('instagram', 'facebook', 'correo', 'youtube', 'telegram'));
