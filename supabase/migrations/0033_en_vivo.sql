-- Arcana: «Sibila en vivo» (directos de YouTube).
-- en_vivo_preguntas es la cola: consultas que llegan del chat del directo
-- (mensaje_id de YouTube, para no repetirlas), de la página /vivo (fotos de
-- la taza de chocolate o de la mano) o que la administración agrega a mano,
-- con la lectura que hizo Sibila. Tipos: tarot, aura, numerología, horóscopo,
-- chocolate y mano. en_vivo_estado guarda por dónde va la lectura del chat y
-- el último latido del escenario (una sola fila). Solo el servidor las toca.
create table if not exists public.en_vivo_preguntas (
  id          bigserial primary key,
  mensaje_id  text unique,
  origen      text not null check (origen in ('chat', 'manual', 'pagina')),
  tipo        text not null default 'tarot' check (tipo in ('tarot', 'aura', 'numerologia', 'horoscopo', 'chocolate', 'mano')),
  imagen      text,                          -- foto subida en /vivo (se borra después de leída)
  huella      text,                          -- huella de la IP de quien subió la foto (límite por hora)
  autor       text not null,
  texto       text not null,
  signo       text,
  estado      text not null default 'pendiente' check (estado in ('pendiente', 'leyendo', 'leida', 'omitida')),
  lectura     text,
  cartas      jsonb,
  detalle     text,
  creado_en   timestamptz not null default now(),
  leida_en    timestamptz
);

create index if not exists en_vivo_preguntas_cola on public.en_vivo_preguntas (estado, creado_en);

alter table public.en_vivo_preguntas enable row level security;

create table if not exists public.en_vivo_estado (
  id                smallint primary key default 1 check (id = 1),
  live_chat_id      text,
  page_token        text,
  proxima_consulta  timestamptz,
  buscado_en        timestamptz,
  latido_en         timestamptz,             -- última vez que el escenario pidió lectura
  actualizado_en    timestamptz not null default now()
);

alter table public.en_vivo_estado enable row level security;
