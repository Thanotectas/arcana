-- Escuela: el curso personalizado (nombre, zona horaria e intenciones), lo que la persona escribe durante el ritual
-- guiado y los audios compartidos de los pasos de cada ritual (se narran una vez para todos).
alter table public.escuela_inscripciones
  add column if not exists nombre text,
  add column if not exists zona text,
  add column if not exists intencion_cierre text,
  add column if not exists intencion_vela text;
alter table public.escuela_progreso add column if not exists notas jsonb not null default '{}'::jsonb;
-- La lección se marca hecha al terminar el test; el ritual guiado puede guardar notas antes, sin completarla.
alter table public.escuela_progreso alter column completada_en drop not null;
alter table public.escuela_progreso alter column completada_en drop default;

create table if not exists public.escuela_audios (
  clave text primary key,
  url text not null,
  creado_en timestamptz not null default now()
);
alter table public.escuela_audios enable row level security;
