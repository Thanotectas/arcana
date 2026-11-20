-- Arcana: cuántas veces se instala Arcana y cuántos dispositivos la abren instalada (anónimo, como las visitas de 0050).
-- «instalada»: el navegador avisó que se instaló (Chrome y Edge; Safari en iPhone no avisa).
-- «abierta»: la primera vez que un dispositivo abre Arcana desde el ícono (sirve también para iPhone y Google Play).
-- Sin datos personales: día, sistema, plataforma, país. Solo el servidor escribe y lee.
create table if not exists public.app_eventos (
  id          bigserial primary key,
  fecha       date not null,                                                  -- día de Bogotá
  evento      text not null check (evento in ('instalada', 'abierta')),
  sistema     text not null check (sistema in ('android', 'iphone', 'computador')),
  plataforma  text not null check (plataforma in ('pwa', 'android')),          -- app web o app de Google Play
  pais        text,
  creado_en   timestamptz not null default now()
);
create index if not exists app_eventos_fecha on public.app_eventos (fecha desc);
alter table public.app_eventos enable row level security;
