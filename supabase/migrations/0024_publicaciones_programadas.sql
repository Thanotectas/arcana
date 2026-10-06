-- Arcana: agente de redes. Borradores semanales escritos por Sibila que la
-- persona administradora aprueba en /admin/redes; el cron publica las
-- aprobadas en Instagram y Facebook. Solo la toca el servidor (service role):
-- RLS activo sin políticas.
create table if not exists public.publicaciones_programadas (
  id            uuid primary key default gen_random_uuid(),
  semana        text not null,                       -- lunes de la semana, AAAA-MM-DD
  fecha         date not null,                       -- día de publicación (Bogotá)
  tipo          text not null check (tipo in ('guia', 'pregunta', 'producto', 'oferta', 'luna', 'signo', 'reflexion')),
  redes         text[] not null default array['instagram', 'facebook'],
  etiqueta      text not null,                       -- rótulo pequeño de la imagen
  titulo        text not null,                       -- texto grande de la imagen
  extracto      text not null,                       -- frase entre comillas de la imagen
  texto         text not null,                       -- pie de la publicación
  simbolos      text[] not null default array['✦'],
  carta         text,                                -- "mazo/id" si la imagen lleva una carta
  enlace        text not null default 'miarcana.com',
  pie           text not null default '',
  estado        text not null default 'borrador' check (estado in ('borrador', 'aprobada', 'publicando', 'publicada', 'descartada', 'error')),
  resultados    jsonb not null default '{}'::jsonb,  -- { instagram: { id | error }, facebook: {...} }
  detalle       text,
  creado_en     timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  publicado_en  timestamptz,
  unique (fecha, tipo)
);

create index if not exists publicaciones_programadas_estado_fecha on public.publicaciones_programadas (estado, fecha);

alter table public.publicaciones_programadas enable row level security;
