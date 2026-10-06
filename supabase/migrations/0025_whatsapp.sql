-- Arcana: agente de WhatsApp. Guarda cada mensaje de la línea de atención
-- (los de la persona y los de Sibila) para dar contexto a la respuesta y
-- revisar las conversaciones en /admin/whatsapp. Solo el servidor la toca.
create table if not exists public.mensajes_whatsapp (
  id          bigserial primary key,
  telefono    text not null,                   -- wa_id de Meta (número con indicativo, sin +)
  nombre      text,                            -- nombre del perfil de WhatsApp
  rol         text not null check (rol in ('persona', 'asistente')),
  contenido   text not null,
  id_meta     text unique,                     -- id del mensaje en Meta (evita duplicados en reintentos)
  tipo        text not null default 'text',    -- text, image, audio… (solo se responde a texto)
  humano      boolean not null default false,  -- la persona pidió hablar con alguien
  creado_en   timestamptz not null default now()
);

create index if not exists mensajes_whatsapp_telefono_fecha on public.mensajes_whatsapp (telefono, creado_en desc);

alter table public.mensajes_whatsapp enable row level security;
