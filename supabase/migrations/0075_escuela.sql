-- La Escuela de Sibila: cursos con lecciones diarias. El contenido de cada curso vive en el código
-- (src/lib/escuela/cursos); aquí, quién se inscribió y su avance.
create table if not exists public.escuela_inscripciones (
  usuario_id uuid not null references auth.users(id) on delete cascade,
  curso text not null,
  creditos integer not null default 0,
  carta text,
  creado_en timestamptz not null default now(),
  primary key (usuario_id, curso)
);

create table if not exists public.escuela_progreso (
  usuario_id uuid not null references auth.users(id) on delete cascade,
  curso text not null,
  leccion integer not null,
  respuestas jsonb not null default '{}'::jsonb,
  comentario text,
  intentos integer not null default 1,
  completada_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  primary key (usuario_id, curso, leccion)
);

alter table public.escuela_inscripciones enable row level security;
alter table public.escuela_progreso enable row level security;

-- Inscripción con cobro, en una sola transacción. Solo la llama el servidor (service_role), que decide el precio.
-- Devuelve: 'ok', 'ya_inscrito' o 'sin_creditos'.
create or replace function public.inscribir_curso(p_usuario uuid, p_curso text, p_costo integer, p_incluidos integer)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_filas integer;
  v_ilimitado boolean;
begin
  if p_costo < 0 or p_costo > 500 or p_incluidos < 0 or p_incluidos > 100 or p_curso !~ '^[a-z0-9-]{2,40}$' then
    raise exception 'Datos no válidos';
  end if;
  if exists (select 1 from public.escuela_inscripciones where usuario_id = p_usuario and curso = p_curso) then
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
  insert into public.escuela_inscripciones (usuario_id, curso, creditos) values (p_usuario, p_curso, case when coalesce(v_ilimitado, false) then 0 else p_costo end);
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
