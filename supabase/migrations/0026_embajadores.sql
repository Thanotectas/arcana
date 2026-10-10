-- Arcana: programa de Embajadores. Quien se une gana el 20 % de lo que paguen
-- las personas que invitó (durante el primer año de cada una), liberado a los
-- 7 días (plazo de retracto). El saldo se canjea por créditos al instante o se
-- pide en dinero (Nequi, Daviplata, banco o PayPal); la administración paga a
-- mano y marca el retiro como pagado. Si un pago se anula, su comisión también.
--
-- Valores del programa (también en src/lib/embajadores.ts):
--   comisión 20 %, ventana de 12 meses desde el registro del invitado,
--   espera de 7 días, 1 crédito = $1.500 de saldo, retiro mínimo $20.000,
--   ventas en dólares convertidas a $4.000 por dólar.

create table if not exists public.embajadores (
  usuario_id     uuid primary key references auth.users (id) on delete cascade,
  desde          timestamptz not null default now(),
  estado         text not null default 'activo' check (estado in ('activo', 'suspendido')),
  metodo_pago    text check (metodo_pago in ('nequi', 'daviplata', 'banco', 'paypal')),
  datos_pago     text check (char_length(datos_pago) <= 160),
  titular        text check (char_length(titular) <= 120),
  actualizado_en timestamptz not null default now()
);

create table if not exists public.comisiones (
  id                   bigint generated always as identity primary key,
  embajador_id         uuid not null references auth.users (id) on delete cascade,
  invitado_id          uuid not null references auth.users (id) on delete cascade,
  orden_id             uuid not null unique references public.ordenes (id) on delete cascade,
  monto_orden_centavos bigint not null,
  moneda               text not null,
  comision_cop         integer not null check (comision_cop >= 0),
  estado               text not null default 'vigente' check (estado in ('vigente', 'anulada')),
  libera_en            timestamptz not null,
  creado_en            timestamptz not null default now()
);
create index if not exists comisiones_embajador on public.comisiones (embajador_id, creado_en desc);

create table if not exists public.retiros_embajador (
  id           bigint generated always as identity primary key,
  embajador_id uuid not null references auth.users (id) on delete cascade,
  tipo         text not null check (tipo in ('creditos', 'dinero')),
  monto_cop    integer not null check (monto_cop > 0),
  creditos     integer,
  estado       text not null default 'solicitado' check (estado in ('solicitado', 'pagado', 'rechazado')),
  metodo_pago  text,
  datos_pago   text,
  titular      text,
  nota         text,
  creado_en    timestamptz not null default now(),
  resuelto_en  timestamptz
);
create index if not exists retiros_embajador_idx on public.retiros_embajador (embajador_id, creado_en desc);
create index if not exists retiros_pendientes on public.retiros_embajador (estado) where estado = 'solicitado';

alter table public.embajadores enable row level security;
alter table public.comisiones enable row level security;
alter table public.retiros_embajador enable row level security;

create policy "embajadores: ver el propio" on public.embajadores for select to authenticated using ((select auth.uid()) = usuario_id);
create policy "comisiones: ver las propias" on public.comisiones for select to authenticated using ((select auth.uid()) = embajador_id);
create policy "retiros: ver los propios" on public.retiros_embajador for select to authenticated using ((select auth.uid()) = embajador_id);
-- Las escrituras van solo por las funciones de abajo (security definer).

-- ---------------------------------------------------------------------------
-- Comisión automática al aprobarse una orden; anulación si la orden se anula.
-- ---------------------------------------------------------------------------
create or replace function public.registrar_comision_orden()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_embajador uuid;
  v_registro  timestamptz;
  v_desde     timestamptz;
  v_cop       integer;
begin
  if new.estado = 'aprobada' and (tg_op = 'INSERT' or old.estado is distinct from 'aprobada') and not coalesce(new.es_prueba, false) then
    select p.invitado_por, p.creado_en into v_embajador, v_registro from public.perfiles p where p.id = new.usuario_id;
    if v_embajador is null or v_embajador = new.usuario_id then return new; end if;
    select e.desde into v_desde from public.embajadores e where e.usuario_id = v_embajador and e.estado = 'activo';
    if v_desde is null or new.creado_en < v_desde then return new; end if;
    if v_registro < now() - interval '12 months' then return new; end if;
    v_cop := round(
      case when upper(new.moneda) = 'USD' then new.monto_centavos / 100.0 * 4000 else new.monto_centavos / 100.0 end * 0.20
    );
    insert into public.comisiones (embajador_id, invitado_id, orden_id, monto_orden_centavos, moneda, comision_cop, libera_en)
    values (v_embajador, new.usuario_id, new.id, new.monto_centavos, upper(new.moneda), v_cop, now() + interval '7 days')
    on conflict (orden_id) do nothing;
  elsif tg_op = 'UPDATE' and old.estado = 'aprobada' and new.estado in ('anulada', 'rechazada', 'error') then
    update public.comisiones set estado = 'anulada' where orden_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists ordenes_comision on public.ordenes;
create trigger ordenes_comision
  after insert or update of estado on public.ordenes
  for each row execute function public.registrar_comision_orden();

-- ---------------------------------------------------------------------------
-- Funciones para la persona (autenticada)
-- ---------------------------------------------------------------------------
create or replace function public.unirme_embajadores()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then return false; end if;
  insert into public.embajadores (usuario_id) values (auth.uid()) on conflict (usuario_id) do nothing;
  return true;
end;
$$;

create or replace function public.guardar_pago_embajador(p_metodo text, p_datos text, p_titular text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_metodo not in ('nequi', 'daviplata', 'banco', 'paypal') then return false; end if;
  update public.embajadores
     set metodo_pago = p_metodo, datos_pago = left(trim(p_datos), 160), titular = left(trim(p_titular), 120), actualizado_en = now()
   where usuario_id = auth.uid();
  return found;
end;
$$;

-- Saldo: comisiones vigentes ya liberadas menos lo canjeado o pedido (los retiros rechazados no cuentan).
create or replace function public.resumen_embajador()
returns table (
  es_embajador boolean, desde timestamptz, invitados integer, invitados_pagaron integer,
  ganado_total integer, pendiente integer, disponible integer, canjeado integer, retirado integer, en_proceso integer
)
language sql
security definer
set search_path = ''
as $$
  with c as (
    select
      coalesce(sum(comision_cop) filter (where estado = 'vigente'), 0) as total,
      coalesce(sum(comision_cop) filter (where estado = 'vigente' and libera_en > now()), 0) as pendiente,
      coalesce(sum(comision_cop) filter (where estado = 'vigente' and libera_en <= now()), 0) as liberado
    from public.comisiones where embajador_id = auth.uid()
  ), r as (
    select
      coalesce(sum(monto_cop) filter (where estado <> 'rechazado'), 0) as usado,
      coalesce(sum(monto_cop) filter (where tipo = 'creditos'), 0) as canjeado,
      coalesce(sum(monto_cop) filter (where tipo = 'dinero' and estado = 'pagado'), 0) as retirado,
      coalesce(sum(monto_cop) filter (where tipo = 'dinero' and estado = 'solicitado'), 0) as en_proceso
    from public.retiros_embajador where embajador_id = auth.uid()
  )
  select
    exists (select 1 from public.embajadores e where e.usuario_id = auth.uid() and e.estado = 'activo'),
    (select e.desde from public.embajadores e where e.usuario_id = auth.uid()),
    (select count(*)::integer from public.perfiles p where p.invitado_por = auth.uid()),
    (select count(distinct o.usuario_id)::integer from public.ordenes o join public.perfiles p on p.id = o.usuario_id
      where p.invitado_por = auth.uid() and o.estado = 'aprobada' and not coalesce(o.es_prueba, false)),
    c.total::integer, c.pendiente::integer, greatest(c.liberado - r.usado, 0)::integer,
    r.canjeado::integer, r.retirado::integer, r.en_proceso::integer
  from c, r;
$$;

-- Últimas comisiones con el nombre de pila del invitado (sin datos privados).
create or replace function public.comisiones_recientes()
returns table (fecha timestamptz, nombre text, comision_cop integer, estado text)
language sql
security definer
set search_path = ''
as $$
  select c.creado_en,
         coalesce(nullif(split_part(trim(p.nombre), ' ', 1), ''), 'Alguien'),
         c.comision_cop,
         case when c.estado = 'anulada' then 'anulada' when c.libera_en > now() then 'en_espera' else 'disponible' end
    from public.comisiones c left join public.perfiles p on p.id = c.invitado_id
   where c.embajador_id = auth.uid()
   order by c.creado_en desc
   limit 20;
$$;

create or replace function public.saldo_embajador_bloqueado(p_usuario uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare v_liberado integer; v_usado integer;
begin
  -- Bloquea la fila del embajador: dos canjes simultáneos no pueden gastar el mismo saldo.
  perform 1 from public.embajadores where usuario_id = p_usuario and estado = 'activo' for update;
  if not found then return -1; end if;
  select coalesce(sum(comision_cop), 0) into v_liberado from public.comisiones where embajador_id = p_usuario and estado = 'vigente' and libera_en <= now();
  select coalesce(sum(monto_cop), 0) into v_usado from public.retiros_embajador where embajador_id = p_usuario and estado <> 'rechazado';
  return greatest(v_liberado - v_usado, 0);
end;
$$;
revoke execute on function public.saldo_embajador_bloqueado(uuid) from public, anon, authenticated;

-- Canje por créditos: cada $1.500 de saldo es 1 crédito. Devuelve los créditos sumados (0 si no alcanza).
create or replace function public.canjear_saldo_creditos(p_monto_cop integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare v_usuario uuid := auth.uid(); v_saldo integer; v_creditos integer; v_monto integer; v_retiro bigint;
begin
  if v_usuario is null or p_monto_cop is null or p_monto_cop < 1500 then return 0; end if;
  v_saldo := public.saldo_embajador_bloqueado(v_usuario);
  if v_saldo < p_monto_cop then return 0; end if;
  v_creditos := p_monto_cop / 1500;
  v_monto := v_creditos * 1500;
  insert into public.retiros_embajador (embajador_id, tipo, monto_cop, creditos, estado, resuelto_en)
  values (v_usuario, 'creditos', v_monto, v_creditos, 'pagado', now()) returning id into v_retiro;
  update public.perfiles set creditos = creditos + v_creditos where id = v_usuario;
  insert into public.movimientos_creditos (usuario_id, cantidad, motivo, referencia)
  values (v_usuario, v_creditos, 'embajador:canje', v_retiro::text);
  return v_creditos;
end;
$$;

-- Solicitud de retiro en dinero (mínimo $20.000, con los datos de pago guardados). Devuelve el id o null.
create or replace function public.solicitar_retiro_embajador(p_monto_cop integer)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare v_usuario uuid := auth.uid(); v_saldo integer; v_e public.embajadores; v_retiro bigint;
begin
  if v_usuario is null or p_monto_cop is null or p_monto_cop < 20000 then return null; end if;
  v_saldo := public.saldo_embajador_bloqueado(v_usuario);
  if v_saldo < p_monto_cop then return null; end if;
  select * into v_e from public.embajadores where usuario_id = v_usuario;
  if v_e.metodo_pago is null or coalesce(v_e.datos_pago, '') = '' or coalesce(v_e.titular, '') = '' then return null; end if;
  insert into public.retiros_embajador (embajador_id, tipo, monto_cop, metodo_pago, datos_pago, titular)
  values (v_usuario, 'dinero', p_monto_cop, v_e.metodo_pago, v_e.datos_pago, v_e.titular)
  returning id into v_retiro;
  return v_retiro;
end;
$$;

revoke execute on function public.unirme_embajadores() from public, anon;
revoke execute on function public.guardar_pago_embajador(text, text, text) from public, anon;
revoke execute on function public.resumen_embajador() from public, anon;
revoke execute on function public.comisiones_recientes() from public, anon;
revoke execute on function public.canjear_saldo_creditos(integer) from public, anon;
revoke execute on function public.solicitar_retiro_embajador(integer) from public, anon;
grant execute on function public.unirme_embajadores() to authenticated;
grant execute on function public.guardar_pago_embajador(text, text, text) to authenticated;
grant execute on function public.resumen_embajador() to authenticated;
grant execute on function public.comisiones_recientes() to authenticated;
grant execute on function public.canjear_saldo_creditos(integer) to authenticated;
grant execute on function public.solicitar_retiro_embajador(integer) to authenticated;
