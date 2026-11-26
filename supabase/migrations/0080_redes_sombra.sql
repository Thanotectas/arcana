-- Prueba en paralelo de Haiku en las respuestas de redes: por cada respuesta que se envía (Sonnet), se guarda la que
-- habría escrito Haiku con la configuración nueva, sin enviarla. Sirve para comparar la calidad antes de cambiar.
create table if not exists public.redes_sombra (
  id bigserial primary key,
  id_meta text not null,
  red text not null,
  tipo text not null,
  idioma text,
  texto text not null,
  enviada text not null,
  haiku text,
  haiku_defectuosa boolean,
  haiku_ms integer,
  error text,
  creado_en timestamptz not null default now()
);
create index if not exists redes_sombra_creado on public.redes_sombra (creado_en desc);
alter table public.redes_sombra enable row level security;
