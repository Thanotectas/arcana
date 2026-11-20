-- Arcana: «El Camino del Loco», tercera tanda: del juego a la lectura, métricas, publicación diaria en redes
-- y premio semanal del ranking. Solo el servidor lee y escribe estas tablas (service_role).

-- Mensaje corto de Sibila para cada signo con la carta del día: se escribe una vez por día y signo.
create table if not exists public.juego_mensajes (
  fecha      date not null,
  signo      text not null,
  carta      text not null,
  texto      text not null,
  creado_en  timestamptz not null default now(),
  primary key (fecha, signo)
);
alter table public.juego_mensajes enable row level security;

-- Eventos del juego para el panel /admin/juego. «visitante» es un número al azar guardado en el navegador
-- (no identifica a nadie); usuario_id solo si jugó con su cuenta.
create table if not exists public.juego_eventos (
  id          bigint generated always as identity primary key,
  fecha       date not null,
  visitante   text not null check (char_length(visitante) between 8 and 64),
  evento      text not null check (evento in ('inicio', 'fin', 'comodin', 'maestro', 'mensaje', 'oferta')),
  usuario_id  uuid references public.perfiles (id) on delete set null,
  gano        boolean,
  intentos    integer,
  creado_en   timestamptz not null default now()
);
create index if not exists juego_eventos_fecha on public.juego_eventos (fecha, evento);
create index if not exists juego_eventos_visitante on public.juego_eventos (visitante, fecha);
alter table public.juego_eventos enable row level security;

-- Ranking: último puesto avisado (para el aviso «te pasaron»); se reinicia cada lunes.
alter table public.juego_jugadores add column if not exists ultimo_puesto integer;
alter table public.juego_jugadores add column if not exists semana_puesto date;

-- La publicación diaria del juego en Facebook e Instagram se registra como las demás automáticas.
alter table public.publicaciones_redes drop constraint if exists publicaciones_redes_tipo_check;
alter table public.publicaciones_redes add constraint publicaciones_redes_tipo_check
  check (tipo in ('carta_dia', 'historia', 'carrusel', 'kit_tiktok', 'kit_canal', 'publicacion', 'juego'));

-- Código del juego: quien compra créditos después de jugar recibe 1 extra (miarcana.com/creditos?codigo=CAMINO).
insert into public.codigos_oferta (codigo, creditos_extra, nota)
values ('CAMINO', 1, 'El Camino del Loco: +1 crédito en cualquier paquete después de jugar')
on conflict (codigo) do nothing;
