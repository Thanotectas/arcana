-- Arcana: Sibila, la asistente conversacional. Mensajes por persona con
-- cobro decidido en la base: 3 gratis al día, Círculo hasta 30 al día,
-- el resto 1 crédito.
create table if not exists public.mensajes_asistente (
  id               uuid primary key default gen_random_uuid(),
  usuario_id       uuid not null references public.perfiles (id) on delete cascade,
  rol              text not null check (rol in ('persona', 'asistente')),
  contenido        text not null,
  estado           text not null default 'lista' check (estado in ('pendiente', 'lista', 'error')),
  creditos_usados  integer not null default 0 check (creditos_usados >= 0),
  creado_en        timestamptz not null default now()
);
create index if not exists mensajes_asistente_usuario_idx on public.mensajes_asistente (usuario_id, creado_en);

alter table public.mensajes_asistente enable row level security;
create policy "asistente: ver los propios" on public.mensajes_asistente
  for select to authenticated using ((select auth.uid()) = usuario_id);
revoke insert, update, delete on public.mensajes_asistente from anon, authenticated;

-- Crea el mensaje de la persona y el hueco de la respuesta, cobrando si toca.
-- Devuelve el id de la respuesta y el costo; sin filas = sin créditos.
create or replace function public.crear_mensaje_asistente(p_texto text)
returns table (id uuid, costo integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario uuid := auth.uid();
  v_perfil public.perfiles%rowtype;
  v_hoy integer;
  v_costo integer := 1;
  v_id uuid;
  v_gratis_dia constant integer := 3;
  v_circulo_dia constant integer := 30;
begin
  if v_usuario is null then raise exception 'No autenticado'; end if;
  if p_texto is null or length(trim(p_texto)) < 2 then raise exception 'Mensaje vacío'; end if;

  select p.* into v_perfil from public.perfiles p where p.id = v_usuario for update;

  select count(*) into v_hoy from public.mensajes_asistente m
   where m.usuario_id = v_usuario and m.rol = 'asistente' and m.estado <> 'error'
     and m.creado_en >= date_trunc('day', now());

  if v_perfil.ilimitado or v_hoy < v_gratis_dia
     or (v_perfil.circulo_hasta > now() and v_hoy < v_circulo_dia) then
    v_costo := 0;
  end if;

  if v_costo > 0 then
    if v_perfil.creditos < v_costo then return; end if;
    update public.perfiles p set creditos = p.creditos - v_costo where p.id = v_usuario;
    insert into public.movimientos_creditos (usuario_id, cantidad, motivo, referencia)
    values (v_usuario, -v_costo, 'pregunta:asistente', null);
  end if;

  insert into public.mensajes_asistente (usuario_id, rol, contenido) values (v_usuario, 'persona', left(trim(p_texto), 600));
  insert into public.mensajes_asistente (usuario_id, rol, contenido, estado, creditos_usados)
  values (v_usuario, 'asistente', '', 'pendiente', v_costo)
  returning mensajes_asistente.id into v_id;
  return query select v_id, v_costo;
end;
$$;
revoke execute on function public.crear_mensaje_asistente(text) from public, anon;
grant execute on function public.crear_mensaje_asistente(text) to authenticated;

create or replace function public.finalizar_mensaje_asistente(p_mensaje uuid, p_texto text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare v_filas integer;
begin
  update public.mensajes_asistente set contenido = p_texto, estado = 'lista'
   where id = p_mensaje and estado = 'pendiente';
  get diagnostics v_filas = row_count;
  return v_filas > 0;
end;
$$;
revoke execute on function public.finalizar_mensaje_asistente(uuid, text) from public, anon, authenticated;
grant execute on function public.finalizar_mensaje_asistente(uuid, text) to service_role;

create or replace function public.reembolsar_mensaje_asistente(p_mensaje uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare v public.mensajes_asistente%rowtype;
begin
  update public.mensajes_asistente set estado = 'error'
   where id = p_mensaje and estado = 'pendiente'
  returning * into v;
  if not found then return false; end if;
  if v.creditos_usados > 0 then
    update public.perfiles set creditos = creditos + v.creditos_usados where id = v.usuario_id;
    insert into public.movimientos_creditos (usuario_id, cantidad, motivo, referencia)
    values (v.usuario_id, v.creditos_usados, 'reembolso:asistente', v.id::text);
  end if;
  return true;
end;
$$;
revoke execute on function public.reembolsar_mensaje_asistente(uuid) from public, anon, authenticated;
grant execute on function public.reembolsar_mensaje_asistente(uuid) to service_role;

-- Cuántas respuestas lleva hoy (para mostrar el saldo gratis en la interfaz).
create or replace function public.mensajes_asistente_hoy()
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::integer from public.mensajes_asistente m
   where m.usuario_id = auth.uid() and m.rol = 'asistente' and m.estado <> 'error'
     and m.creado_en >= date_trunc('day', now());
$$;
revoke execute on function public.mensajes_asistente_hoy() from public, anon;
grant execute on function public.mensajes_asistente_hoy() to authenticated;
