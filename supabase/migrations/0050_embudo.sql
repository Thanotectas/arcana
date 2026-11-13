-- Arcana: embudo completo (visita → cuenta → uso → pago → Círculo) por origen y por país.
--
-- visitas: la primera visita de cada navegador (el navegador recuerda que ya la contó, sin
-- cookies ni identificadores). Guarda solo el origen (la misma cookie de 0036), el país que
-- da Vercel, la página de entrada y si fue desde el celular: nada que identifique a la
-- persona, ni IP. Solo el servidor escribe y lee.
--
-- perfiles.pais: país desde el que se creó la cuenta (encabezado de Vercel), para ver el
-- embudo por país. Las cuentas anteriores a esta migración quedan sin país.
create table if not exists public.visitas (
  id          bigserial primary key,
  fecha       date not null,                             -- día de Bogotá
  origen      text not null default 'desconocido',       -- youtube, instagram, meta-ads, …
  origen_detalle text,                                   -- medio y campaña ("short · carta-dia")
  pais        text,                                      -- código ISO de dos letras (CO, MX, US, …)
  ruta        text not null default '/',                 -- página de entrada, sin parámetros
  dispositivo text not null default 'escritorio' check (dispositivo in ('movil', 'escritorio')),
  plataforma  text not null default 'web' check (plataforma in ('web', 'android', 'pwa')),
  creado_en   timestamptz not null default now()
);

create index if not exists visitas_fecha on public.visitas (fecha desc);

alter table public.visitas enable row level security;

alter table public.perfiles
  add column if not exists pais text;
