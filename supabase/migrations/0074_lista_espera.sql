-- Lista de espera de productos que aún no existen (el primero: el curso de rituales). Una fila por correo y curso.
create table if not exists public.lista_espera (
  id bigint generated always as identity primary key,
  curso text not null,
  correo text not null,
  usuario_id uuid references auth.users(id) on delete set null,
  idioma text not null default 'es',
  origen text,
  creado_en timestamptz not null default now(),
  unique (curso, correo)
);
alter table public.lista_espera enable row level security;
