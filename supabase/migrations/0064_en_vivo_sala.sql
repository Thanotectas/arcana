-- Arcana: «Sala de Sibila» (miarcana.com/en-vivo). Lo que el escenario principal publica en en_vivo_espejo se ve
-- en la página, traducido y con la voz de Sibila en el idioma de cada persona. Cada paso (seq) se traduce y se narra
-- una sola vez por idioma, la primera vez que alguien lo pide en ese idioma; el audio va al bucket «redes».
create table if not exists public.en_vivo_sala (
  seq        bigint not null,
  idioma     text not null check (idioma in ('es', 'en', 'pt', 'fr', 'tr', 'ar', 'id', 'hi')),
  estado     text not null default 'generando' check (estado in ('generando', 'listo', 'error')),
  evento     jsonb,
  creado_en  timestamptz not null default now(),
  primary key (seq, idioma)
);
-- Solo el servidor (service_role) la usa.
alter table public.en_vivo_sala enable row level security;
revoke all on public.en_vivo_sala from anon, authenticated;
