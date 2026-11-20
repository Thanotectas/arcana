-- Arcana: crédito de bienvenida la primera vez que alguien abre Arcana instalada (app web o Google Play).
-- La llave primaria garantiza que se entregue una sola vez por cuenta. Solo escribe el servidor.
create table if not exists public.app_instalaciones (
  usuario_id  uuid primary key references public.perfiles (id) on delete cascade,
  plataforma  text not null,
  creado_en   timestamptz not null default now()
);
alter table public.app_instalaciones enable row level security;
