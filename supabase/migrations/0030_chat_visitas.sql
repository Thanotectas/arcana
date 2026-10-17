-- Arcana: chat de Sibila para visitantes sin cuenta (burbuja de la página).
-- Guarda cada pregunta y su respuesta para limitar el uso por persona y por
-- día, y para revisar en /admin qué preguntan los visitantes. No guarda la IP:
-- solo una huella (hash con sal del servidor). Solo el servidor la toca.
create table if not exists public.chat_visitas (
  id          bigserial primary key,
  huella      text not null,                  -- hash de la IP (no reversible)
  idioma      text not null default 'es',
  pregunta    text not null,
  respuesta   text,
  estado      text not null default 'escribiendo' check (estado in ('escribiendo', 'lista', 'error')),
  creado_en   timestamptz not null default now()
);

create index if not exists chat_visitas_huella_fecha on public.chat_visitas (huella, creado_en desc);
create index if not exists chat_visitas_fecha on public.chat_visitas (creado_en desc);

alter table public.chat_visitas enable row level security;
