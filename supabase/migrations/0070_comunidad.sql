-- Comunidad Arcana (miarcana.com/comunidad): un hilo por día alrededor de la carta del día. Cada mensaje se guarda en
-- el idioma en que se escribió y se traduce una sola vez por idioma, la primera vez que alguien lo lee en otro.
-- Todo se lee y se escribe desde el servidor (clave de servicio): RLS activo y sin políticas públicas.
create table if not exists public.comunidad_mensajes (
  id bigint generated always as identity primary key,
  fecha date not null,
  usuario_id uuid references auth.users(id) on delete cascade,
  autor text not null,
  es_sibila boolean not null default false,
  respuesta_a bigint references public.comunidad_mensajes(id) on delete cascade,
  idioma text not null,
  texto text not null check (char_length(texto) between 1 and 1200),
  estado text not null default 'publicado' check (estado in ('publicado', 'oculto', 'revision')),
  motivo text,
  creado_en timestamptz not null default now()
);
create index if not exists comunidad_mensajes_fecha on public.comunidad_mensajes (fecha, id);
create index if not exists comunidad_mensajes_usuario on public.comunidad_mensajes (usuario_id, creado_en desc);

create table if not exists public.comunidad_traducciones (
  mensaje_id bigint not null references public.comunidad_mensajes(id) on delete cascade,
  idioma text not null,
  texto text not null,
  primary key (mensaje_id, idioma)
);

create table if not exists public.comunidad_reacciones (
  mensaje_id bigint not null references public.comunidad_mensajes(id) on delete cascade,
  usuario_id uuid not null references auth.users(id) on delete cascade,
  emoji text not null check (emoji in ('✨', '🔮', '🙏')),
  creado_en timestamptz not null default now(),
  primary key (mensaje_id, usuario_id, emoji)
);

create table if not exists public.comunidad_reportes (
  mensaje_id bigint not null references public.comunidad_mensajes(id) on delete cascade,
  usuario_id uuid not null references auth.users(id) on delete cascade,
  creado_en timestamptz not null default now(),
  primary key (mensaje_id, usuario_id)
);

alter table public.comunidad_mensajes enable row level security;
alter table public.comunidad_traducciones enable row level security;
alter table public.comunidad_reacciones enable row level security;
alter table public.comunidad_reportes enable row level security;
