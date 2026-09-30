-- Arcana: lecturas que se escriben en vivo.
-- La lectura se crea (ya cobrada) en estado 'pendiente'; la ruta de generación
-- la reclama, transmite el texto y la deja 'lista'. Si falla, se reembolsa.

alter table public.lecturas
  add column estado text not null default 'lista'
    check (estado in ('pendiente', 'generando', 'lista', 'error')),
  add column generando_desde timestamptz;

-- Solo el servidor (service_role) crea lecturas, después de cobrar. Si el
-- usuario pudiera insertarlas, podría pedir interpretaciones sin pagar.
drop policy "lecturas: crear las propias" on public.lecturas;
revoke insert on public.lecturas from anon, authenticated;

-- Reclama la generación de una lectura propia. Devuelve false si otra
-- petición ya la está generando (salvo que lleve más de 3 minutos colgada).
create or replace function public.reclamar_generacion(p_lectura uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_filas integer;
begin
  update public.lecturas
     set estado = 'generando',
         generando_desde = now()
   where id = p_lectura
     and usuario_id = (select auth.uid())
     and (
       estado = 'pendiente'
       or (estado = 'generando' and generando_desde < now() - interval '3 minutes')
     );
  get diagnostics v_filas = row_count;
  return v_filas > 0;
end;
$$;

revoke execute on function public.reclamar_generacion(uuid) from public, anon;
grant execute on function public.reclamar_generacion(uuid) to authenticated;

-- Marca la lectura como fallida y devuelve los créditos una sola vez.
create or replace function public.reembolsar_lectura(p_lectura uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_lectura public.lecturas%rowtype;
begin
  update public.lecturas
     set estado = 'error'
   where id = p_lectura
     and estado in ('pendiente', 'generando')
  returning * into v_lectura;

  if not found then
    return false;
  end if;

  if v_lectura.creditos_usados > 0 then
    update public.perfiles
       set creditos = creditos + v_lectura.creditos_usados
     where id = v_lectura.usuario_id;

    insert into public.movimientos_creditos (usuario_id, cantidad, motivo, referencia)
    values (v_lectura.usuario_id, v_lectura.creditos_usados, 'reembolso:' || v_lectura.tipo, v_lectura.id::text);
  end if;

  return true;
end;
$$;

revoke execute on function public.reembolsar_lectura(uuid) from public, anon, authenticated;
grant execute on function public.reembolsar_lectura(uuid) to service_role;
