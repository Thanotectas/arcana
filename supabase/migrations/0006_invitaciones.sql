-- Arcana: invitaciones. Cada perfil tiene un código; quien se registra con él
-- recibe 2 créditos extra y quien invita recibe 2 créditos cuando la persona
-- invitada entra por primera vez (hasta 20 invitaciones premiadas por perfil).

create extension if not exists pgcrypto with schema extensions;

alter table public.perfiles
  add column if not exists codigo_invitacion text unique,
  add column if not exists invitado_por uuid references public.perfiles (id) on delete set null,
  add column if not exists invitacion_premiada boolean not null default false;

-- Código corto y legible (sin 0/O ni 1/I), derivado del id.
create or replace function public.generar_codigo_invitacion(p_id uuid)
returns text
language sql
immutable
as $$
  select upper(translate(substr(encode(extensions.digest(p_id::text, 'sha256'), 'base64'), 1, 10), '0O1Il+/=', 'ABCDEFGH'))
$$;

update public.perfiles set codigo_invitacion = substr(public.generar_codigo_invitacion(id), 1, 7)
 where codigo_invitacion is null;

-- Alta de usuario: asigna el código.
create or replace function public.manejar_nuevo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfiles (id, nombre, creditos, codigo_invitacion)
  values (
    new.id,
    nullif(trim(coalesce(
      new.raw_user_meta_data ->> 'nombre',
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    )), ''),
    3,
    substr(public.generar_codigo_invitacion(new.id), 1, 7)
  );

  insert into public.movimientos_creditos (usuario_id, cantidad, motivo)
  values (new.id, 3, 'bienvenida');

  return new;
end;
$$;

-- El usuario invitado (ya autenticado) aplica el código. Se hace una sola vez,
-- solo en cuentas recientes y nunca con el propio código.
create or replace function public.aplicar_invitacion(p_codigo text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario uuid := auth.uid();
  v_invitador uuid;
  v_premiadas integer;
  v_bono_invitado constant integer := 2;
  v_bono_invitador constant integer := 2;
  v_tope constant integer := 20;
begin
  if v_usuario is null or p_codigo is null then
    return false;
  end if;

  select id into v_invitador from public.perfiles where codigo_invitacion = upper(trim(p_codigo));
  if v_invitador is null or v_invitador = v_usuario then
    return false;
  end if;

  -- Solo cuentas nuevas sin invitación previa.
  update public.perfiles
     set invitado_por = v_invitador,
         creditos = creditos + v_bono_invitado
   where id = v_usuario
     and invitado_por is null
     and creado_en > now() - interval '7 days';
  if not found then
    return false;
  end if;

  insert into public.movimientos_creditos (usuario_id, cantidad, motivo, referencia)
  values (v_usuario, v_bono_invitado, 'invitacion:bienvenida', v_invitador::text);

  -- Premio a quien invita, con tope.
  select count(*) into v_premiadas from public.perfiles where invitado_por = v_invitador and invitacion_premiada;
  if v_premiadas < v_tope then
    update public.perfiles set creditos = creditos + v_bono_invitador where id = v_invitador;
    update public.perfiles set invitacion_premiada = true where id = v_usuario;
    insert into public.movimientos_creditos (usuario_id, cantidad, motivo, referencia)
    values (v_invitador, v_bono_invitador, 'invitacion:premio', v_usuario::text);
  end if;

  return true;
end;
$$;

revoke execute on function public.aplicar_invitacion(text) from public, anon;
grant execute on function public.aplicar_invitacion(text) to authenticated;

-- Quien invita puede ver cuántas personas entraron con su código (solo el conteo,
-- a través de esta función; no ve los perfiles ajenos).
create or replace function public.resumen_invitaciones()
returns table (invitados integer, premiadas integer, creditos_ganados integer)
language sql
security definer
set search_path = ''
as $$
  select
    count(*)::integer as invitados,
    count(*) filter (where invitacion_premiada)::integer as premiadas,
    coalesce((select sum(cantidad) from public.movimientos_creditos m where m.usuario_id = auth.uid() and m.motivo = 'invitacion:premio'), 0)::integer as creditos_ganados
  from public.perfiles p
  where p.invitado_por = auth.uid();
$$;

revoke execute on function public.resumen_invitaciones() from public, anon;
grant execute on function public.resumen_invitaciones() to authenticated;

-- Nombre público de quien invita, para la página de registro.
create or replace function public.nombre_invitador(p_codigo text)
returns text
language sql
security definer
set search_path = ''
as $$
  select nombre from public.perfiles where codigo_invitacion = upper(trim(p_codigo));
$$;

grant execute on function public.nombre_invitador(text) to anon, authenticated;
