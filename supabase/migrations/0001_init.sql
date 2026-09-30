-- Arcana: esquema inicial.
-- Tablas, RLS, cobro atómico de créditos, acreditación de órdenes y alta de usuarios.
-- Tipos espejo en src/types/database.ts.

-- ---------------------------------------------------------------------------
-- Utilidades
-- ---------------------------------------------------------------------------
create or replace function public.tocar_actualizado_en()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado_en := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Perfiles (1 por usuario de auth.users)
-- ---------------------------------------------------------------------------
create table public.perfiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  nombre            text,
  fecha_nacimiento  date,
  hora_nacimiento   time,
  lugar_nacimiento  text,
  latitud           double precision,
  longitud          double precision,
  zona_horaria      text,
  creditos          integer not null default 0 check (creditos >= 0),
  creado_en         timestamptz not null default now(),
  actualizado_en    timestamptz not null default now()
);

create trigger perfiles_actualizado_en
  before update on public.perfiles
  for each row execute function public.tocar_actualizado_en();

alter table public.perfiles enable row level security;

create policy "perfiles: ver el propio"
  on public.perfiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "perfiles: editar el propio"
  on public.perfiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- El usuario solo puede editar sus datos personales, nunca el saldo.
revoke insert, update, delete on public.perfiles from anon, authenticated;
grant select on public.perfiles to authenticated;
grant update (nombre, fecha_nacimiento, hora_nacimiento, lugar_nacimiento, latitud, longitud, zona_horaria)
  on public.perfiles to authenticated;

-- ---------------------------------------------------------------------------
-- Movimientos de créditos (libro mayor)
-- ---------------------------------------------------------------------------
create table public.movimientos_creditos (
  id          bigint generated always as identity primary key,
  usuario_id  uuid not null references auth.users (id) on delete cascade,
  cantidad    integer not null,
  motivo      text not null,
  referencia  text,
  creado_en   timestamptz not null default now()
);

create index movimientos_creditos_usuario_idx on public.movimientos_creditos (usuario_id, creado_en desc);

alter table public.movimientos_creditos enable row level security;

create policy "movimientos: ver los propios"
  on public.movimientos_creditos for select to authenticated
  using ((select auth.uid()) = usuario_id);

revoke insert, update, delete on public.movimientos_creditos from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Lecturas
-- ---------------------------------------------------------------------------
create table public.lecturas (
  id               uuid primary key default gen_random_uuid(),
  usuario_id       uuid not null references auth.users (id) on delete cascade,
  tipo             text not null check (tipo in ('tarot_carta', 'tarot_tres', 'tarot_celta', 'carta_astral', 'numerologia', 'compatibilidad')),
  titulo           text not null,
  entrada          jsonb not null default '{}'::jsonb,
  resultado        jsonb not null default '{}'::jsonb,
  interpretacion   text,
  creditos_usados  integer not null default 0 check (creditos_usados >= 0),
  creado_en        timestamptz not null default now()
);

create index lecturas_usuario_idx on public.lecturas (usuario_id, creado_en desc);
create index lecturas_usuario_tipo_idx on public.lecturas (usuario_id, tipo, creado_en desc);

alter table public.lecturas enable row level security;

create policy "lecturas: ver las propias"
  on public.lecturas for select to authenticated
  using ((select auth.uid()) = usuario_id);

create policy "lecturas: crear las propias"
  on public.lecturas for insert to authenticated
  with check ((select auth.uid()) = usuario_id);

create policy "lecturas: borrar las propias"
  on public.lecturas for delete to authenticated
  using ((select auth.uid()) = usuario_id);

revoke update on public.lecturas from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Órdenes de compra (Wompi)
-- ---------------------------------------------------------------------------
create table public.ordenes (
  id              uuid primary key default gen_random_uuid(),
  usuario_id      uuid not null references auth.users (id) on delete cascade,
  paquete         text not null,
  creditos        integer not null check (creditos > 0),
  monto_centavos  bigint not null check (monto_centavos > 0),
  moneda          text not null default 'COP',
  referencia      text not null unique,
  estado          text not null default 'pendiente'
                  check (estado in ('pendiente', 'aprobada', 'rechazada', 'anulada', 'error')),
  transaccion_id  text,
  metodo_pago     text,
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now()
);

create index ordenes_usuario_idx on public.ordenes (usuario_id, creado_en desc);

create trigger ordenes_actualizado_en
  before update on public.ordenes
  for each row execute function public.tocar_actualizado_en();

alter table public.ordenes enable row level security;

create policy "ordenes: ver las propias"
  on public.ordenes for select to authenticated
  using ((select auth.uid()) = usuario_id);

-- Solo órdenes pendientes y con un paquete del catálogo (src/lib/creditos.ts):
-- impide crear una orden de 40 créditos por 1 peso.
create policy "ordenes: crear las propias"
  on public.ordenes for insert to authenticated
  with check (
    (select auth.uid()) = usuario_id
    and estado = 'pendiente'
    and transaccion_id is null
    and moneda = 'COP'
    and (paquete, creditos, monto_centavos) in (
      ('inicial', 5, 990000::bigint),
      ('buscador', 15, 2490000::bigint),
      ('iniciado', 40, 5490000::bigint)
    )
  );

revoke update, delete on public.ordenes from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Horóscopos diarios (caché pública, escrita por service_role)
-- ---------------------------------------------------------------------------
create table public.horoscopos (
  id         bigint generated always as identity primary key,
  signo      text not null,
  fecha      date not null,
  contenido  text not null,
  creado_en  timestamptz not null default now(),
  unique (signo, fecha)
);

alter table public.horoscopos enable row level security;

create policy "horoscopos: lectura pública"
  on public.horoscopos for select to anon, authenticated
  using (true);

revoke insert, update, delete on public.horoscopos from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Alta de usuario: crea el perfil y regala 3 créditos
-- ---------------------------------------------------------------------------
create or replace function public.manejar_nuevo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfiles (id, nombre, creditos)
  values (new.id, nullif(trim(new.raw_user_meta_data ->> 'nombre'), ''), 3);

  insert into public.movimientos_creditos (usuario_id, cantidad, motivo)
  values (new.id, 3, 'bienvenida');

  return new;
end;
$$;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.manejar_nuevo_usuario();

-- ---------------------------------------------------------------------------
-- Cobro atómico de créditos (lo llama el usuario autenticado)
-- ---------------------------------------------------------------------------
create or replace function public.consumir_creditos(
  p_cantidad    integer,
  p_motivo      text,
  p_referencia  text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario uuid := auth.uid();
  v_filas   integer;
begin
  if v_usuario is null then
    raise exception 'No autenticado';
  end if;
  if p_cantidad is null or p_cantidad <= 0 then
    raise exception 'Cantidad no válida';
  end if;

  update public.perfiles
     set creditos = creditos - p_cantidad
   where id = v_usuario
     and creditos >= p_cantidad;
  get diagnostics v_filas = row_count;

  if v_filas = 0 then
    return false;
  end if;

  insert into public.movimientos_creditos (usuario_id, cantidad, motivo, referencia)
  values (v_usuario, -p_cantidad, p_motivo, p_referencia);

  return true;
end;
$$;

revoke execute on function public.consumir_creditos(integer, text, text) from public, anon;
grant execute on function public.consumir_creditos(integer, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Acreditación de una orden pagada (solo service_role: webhook / retorno)
-- Idempotente: si la orden ya no está pendiente, no hace nada.
-- ---------------------------------------------------------------------------
create or replace function public.acreditar_orden(
  p_referencia      text,
  p_transaccion_id  text,
  p_metodo_pago     text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_orden public.ordenes%rowtype;
begin
  update public.ordenes
     set estado = 'aprobada',
         transaccion_id = p_transaccion_id,
         metodo_pago = coalesce(p_metodo_pago, metodo_pago)
   where referencia = p_referencia
     and estado = 'pendiente'
  returning * into v_orden;

  if not found then
    return false;
  end if;

  update public.perfiles
     set creditos = creditos + v_orden.creditos
   where id = v_orden.usuario_id;

  insert into public.movimientos_creditos (usuario_id, cantidad, motivo, referencia)
  values (v_orden.usuario_id, v_orden.creditos, 'compra:' || v_orden.paquete, v_orden.referencia);

  return true;
end;
$$;

revoke execute on function public.acreditar_orden(text, text, text) from public, anon, authenticated;
grant execute on function public.acreditar_orden(text, text, text) to service_role;

revoke execute on function public.manejar_nuevo_usuario() from public, anon, authenticated;
