-- Arcana: Círculo Arcana (pase mensual), mensaje personal diario y perfil con
-- datos de nacimiento para la memoria.

-- 1. Pase mensual.
alter table public.perfiles
  add column if not exists circulo_hasta timestamptz;

-- 2. Nuevo paquete 'circulo' (15 créditos + 30 días de Círculo) en la política
--    de creación de órdenes.
drop policy if exists "ordenes: crear las propias" on public.ordenes;
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
      ('iniciado', 40, 5490000::bigint),
      ('circulo', 15, 1990000::bigint)
    )
  );

-- 3. Acreditación: créditos, bono de primera compra y, si es Círculo, 30 días.
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
  v_primera boolean;
  v_bono constant integer := 2;
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

  select not exists (
    select 1 from public.ordenes o
     where o.usuario_id = v_orden.usuario_id and o.estado = 'aprobada' and o.id <> v_orden.id
  ) into v_primera;

  update public.perfiles
     set creditos = creditos + v_orden.creditos + (case when v_primera then v_bono else 0 end),
         circulo_hasta = case
           when v_orden.paquete = 'circulo' then greatest(coalesce(circulo_hasta, now()), now()) + interval '30 days'
           else circulo_hasta
         end
   where id = v_orden.usuario_id;

  insert into public.movimientos_creditos (usuario_id, cantidad, motivo, referencia)
  values (v_orden.usuario_id, v_orden.creditos, 'compra:' || v_orden.paquete, v_orden.referencia);

  if v_primera then
    insert into public.movimientos_creditos (usuario_id, cantidad, motivo, referencia)
    values (v_orden.usuario_id, v_bono, 'compra:bono-primera', v_orden.referencia);
  end if;

  return true;
end;
$$;

-- 4. Mensaje personal diario (caché por persona y día).
create table if not exists public.mensajes_diarios (
  id          bigint generated always as identity primary key,
  usuario_id  uuid not null references public.perfiles (id) on delete cascade,
  fecha       date not null,
  idioma      text not null default 'es',
  contenido   text not null,
  creado_en   timestamptz not null default now(),
  unique (usuario_id, fecha, idioma)
);
alter table public.mensajes_diarios enable row level security;
create policy "mensajes: ver los propios" on public.mensajes_diarios
  for select to authenticated using (auth.uid() = usuario_id);
revoke insert, update, delete on public.mensajes_diarios from anon, authenticated;

-- 5. El usuario puede guardar además su idioma (los datos de nacimiento ya
--    estaban permitidos en 0001; el saldo y el pase siguen protegidos).
grant update (idioma) on public.perfiles to authenticated;
