-- Garantía de la primera lección: si el curso no convence, se devuelven los créditos pagados (menos las lecturas
-- incluidas que se abonaron al inscribirse). Una sola vez por persona y curso, en los primeros días y antes de
-- completar la segunda lección.
alter table public.escuela_inscripciones
  add column if not exists reembolsado_en timestamptz,
  add column if not exists garantia_usada boolean not null default false;

create or replace function public.reembolsar_curso(p_usuario uuid, p_curso text, p_incluidos integer, p_dias integer)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_insc public.escuela_inscripciones%rowtype;
  v_neto integer;
begin
  if p_incluidos < 0 or p_incluidos > 100 or p_dias < 1 or p_dias > 60 then
    raise exception 'Datos no válidos';
  end if;
  select * into v_insc from public.escuela_inscripciones where usuario_id = p_usuario and curso = p_curso for update;
  if not found or v_insc.reembolsado_en is not null then return 'no_inscrito'; end if;
  if v_insc.garantia_usada then return 'garantia_usada'; end if;
  if v_insc.creditos <= 0 then return 'sin_cobro'; end if;
  if v_insc.creado_en < now() - make_interval(days => p_dias) then return 'vencida'; end if;
  if exists (select 1 from public.escuela_progreso where usuario_id = p_usuario and curso = p_curso and leccion >= 2 and completada_en is not null) then
    return 'avanzado';
  end if;
  -- Se devuelve lo pagado y se retiran las lecturas incluidas (si ya se usaron, se descuentan de lo devuelto).
  v_neto := v_insc.creditos - least(p_incluidos, v_insc.creditos);
  if v_neto > 0 then
    update public.perfiles set creditos = creditos + v_neto where id = p_usuario;
    insert into public.movimientos_creditos (usuario_id, cantidad, motivo, referencia)
    values (p_usuario, v_neto, 'curso:' || p_curso || ' (garantía)', 'escuela');
  end if;
  update public.escuela_inscripciones set reembolsado_en = now(), garantia_usada = true where usuario_id = p_usuario and curso = p_curso;
  return 'ok:' || v_neto;
end;
$$;
revoke execute on function public.reembolsar_curso(uuid, text, integer, integer) from public, anon, authenticated;
grant execute on function public.reembolsar_curso(uuid, text, integer, integer) to service_role;

-- Volver a inscribirse después de usar la garantía: se cobra de nuevo (ya sin garantía) y se conserva el avance.
create or replace function public.inscribir_curso(p_usuario uuid, p_curso text, p_costo integer, p_incluidos integer)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_filas integer;
  v_ilimitado boolean;
  v_reembolsada boolean;
begin
  if p_costo < 0 or p_costo > 500 or p_incluidos < 0 or p_incluidos > 100 or p_curso !~ '^[a-z0-9-]{2,40}$' then
    raise exception 'Datos no válidos';
  end if;
  select reembolsado_en is not null into v_reembolsada from public.escuela_inscripciones where usuario_id = p_usuario and curso = p_curso for update;
  if found and not v_reembolsada then
    return 'ya_inscrito';
  end if;
  select ilimitado into v_ilimitado from public.perfiles where id = p_usuario;
  if p_costo > 0 and not coalesce(v_ilimitado, false) then
    update public.perfiles set creditos = creditos - p_costo where id = p_usuario and creditos >= p_costo;
    get diagnostics v_filas = row_count;
    if v_filas = 0 then
      return 'sin_creditos';
    end if;
    insert into public.movimientos_creditos (usuario_id, cantidad, motivo, referencia)
    values (p_usuario, -p_costo, 'curso:' || p_curso, 'escuela');
  end if;
  if v_reembolsada then
    update public.escuela_inscripciones
      set reembolsado_en = null, creado_en = now(), creditos = case when coalesce(v_ilimitado, false) then 0 else p_costo end
      where usuario_id = p_usuario and curso = p_curso;
  else
    insert into public.escuela_inscripciones (usuario_id, curso, creditos) values (p_usuario, p_curso, case when coalesce(v_ilimitado, false) then 0 else p_costo end);
  end if;
  -- Las lecturas de las entregas del curso van incluidas: se abonan al inscribirse.
  if p_incluidos > 0 then
    update public.perfiles set creditos = creditos + p_incluidos where id = p_usuario;
    insert into public.movimientos_creditos (usuario_id, cantidad, motivo, referencia)
    values (p_usuario, p_incluidos, 'curso:' || p_curso || ' (lecturas incluidas)', 'escuela');
  end if;
  return 'ok';
end;
$$;
revoke execute on function public.inscribir_curso(uuid, text, integer, integer) from public, anon, authenticated;
grant execute on function public.inscribir_curso(uuid, text, integer, integer) to service_role;
