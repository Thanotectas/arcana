-- Embudo de compra: quién ve los paquetes, quién ve la invitación al quedarse sin créditos y quién toca «comprar».
create table if not exists public.eventos_compra (
  id bigint generated always as identity primary key,
  usuario_id uuid references public.perfiles(id) on delete set null,
  evento text not null check (evento in ('vio_paquetes', 'vio_invitacion', 'toco_comprar')),
  paquete text,
  via text,
  pais text,
  idioma text,
  creado_en timestamptz not null default now()
);
create index if not exists eventos_compra_creado_en on public.eventos_compra (creado_en);
alter table public.eventos_compra enable row level security;
