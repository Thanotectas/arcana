-- Arcana: Sibila responde comentarios y mensajes directos de Instagram y
-- Facebook. Guarda cada interacción recibida (y lo que respondió) para no
-- contestar dos veces cuando Meta reintenta un aviso, dar contexto a los
-- mensajes directos, limitar el gasto diario y revisar en /admin/redes.
-- Solo el servidor la toca.
create table if not exists public.interacciones_redes (
  id            bigserial primary key,
  red           text not null check (red in ('instagram', 'facebook')),
  tipo          text not null check (tipo in ('comentario', 'mensaje')),
  id_meta       text not null unique,          -- id del comentario o del mensaje en Meta
  remitente_id  text not null,                 -- id (de alcance de la app) de quien escribe
  remitente     text,                          -- usuario o nombre, si Meta lo manda
  objeto_id     text,                          -- id de la publicación comentada (comentarios)
  texto         text not null,
  respuesta     text,                          -- lo que contestó Sibila
  estado        text not null default 'pendiente' check (estado in ('pendiente', 'respondida', 'omitida', 'error')),
  humano        boolean not null default false, -- pidió hablar con una persona
  detalle       text,
  creado_en     timestamptz not null default now()
);

create index if not exists interacciones_redes_fecha on public.interacciones_redes (creado_en desc);
create index if not exists interacciones_redes_remitente on public.interacciones_redes (red, remitente_id, creado_en desc);

alter table public.interacciones_redes enable row level security;
