-- Arcana: rendimiento de cada publicación en Instagram y Facebook (carta del
-- día y publicaciones del agente). Un cron diario consulta a Meta las cifras
-- de las publicaciones de los últimos 14 días y las actualiza aquí; las
-- muestran /admin/redes y el resumen semanal. Solo el servidor la toca.
create table if not exists public.metricas_redes (
  id             bigserial primary key,
  red            text not null check (red in ('instagram', 'facebook')),
  media_id       text not null,                  -- id de la publicación en Meta
  origen         text not null check (origen in ('carta_dia', 'programada')),
  referencia     text not null,                  -- fecha (carta del día) o id de la publicación programada
  fecha          date not null,                  -- día de publicación (Bogotá)
  tipo           text not null,                  -- rótulo legible: "Carta del día", "Una lectura · Carta astral"…
  formato        text,                           -- reel o imagen, si se sabe
  vistas         integer,
  alcance        integer,
  me_gusta       integer,
  comentarios    integer,
  guardados      integer,
  compartidos    integer,
  detalle        text,                           -- aviso si Meta no dio alguna cifra (permiso o tipo de contenido)
  actualizado_en timestamptz not null default now(),
  unique (red, media_id)
);

create index if not exists metricas_redes_fecha on public.metricas_redes (fecha desc);

alter table public.metricas_redes enable row level security;
