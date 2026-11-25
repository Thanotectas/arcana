-- El Arcano de Sibila: cada ficha se escribe en español y se traduce una sola vez a cada idioma (modelo estándar).
-- `version` es la huella del texto en español: si la ficha cambia, se vuelve a traducir. `ficha` vacía = en proceso.
create table if not exists public.biblioteca_traducciones (
  slug text not null,
  idioma text not null,
  version text not null,
  ficha jsonb,
  creado_en timestamptz not null default now(),
  primary key (slug, idioma)
);
alter table public.biblioteca_traducciones enable row level security;
