-- Arcana: I Ching, bono de primera compra y contador público de lecturas.

-- 1. Nuevo tipo de lectura.
alter table public.lecturas drop constraint if exists lecturas_tipo_check;
alter table public.lecturas
  add constraint lecturas_tipo_check
  check (tipo in ('tarot_carta', 'tarot_tres', 'tarot_celta', 'carta_astral', 'numerologia', 'compatibilidad', 'quiromancia', 'iching'));

-- 2. Bono de primera compra: la primera orden aprobada de cada cuenta suma
--    2 créditos de regalo (se anuncia en la página de créditos).
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
     set creditos = creditos + v_orden.creditos + (case when v_primera then v_bono else 0 end)
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

-- 3. Contador público: lecturas escritas en los últimos 7 días (para la portada).
create or replace function public.contador_lecturas()
returns integer
language sql
security definer
set search_path = ''
as $$
  select count(*)::integer from public.lecturas where estado = 'lista' and creado_en > now() - interval '7 days';
$$;

grant execute on function public.contador_lecturas() to anon, authenticated;

-- 4. ¿Ya compró esta cuenta? (para mostrar u ocultar el bono de primera compra)
create or replace function public.ha_comprado()
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (select 1 from public.ordenes where usuario_id = auth.uid() and estado = 'aprobada');
$$;

revoke execute on function public.ha_comprado() from public, anon;
grant execute on function public.ha_comprado() to authenticated;
