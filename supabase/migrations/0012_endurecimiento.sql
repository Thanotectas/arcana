-- Arcana: endurecimiento tras la auditoría de seguridad (1 oct 2026).
-- Cierra carreras con efecto económico, mueve a la base las decisiones de
-- cobro que vivían en la app y quita permisos que nadie usaba.

-- ---------------------------------------------------------------------------
-- 1. Acreditación de órdenes: el bono de primera compra una sola vez aunque
--    dos órdenes se aprueben a la vez (se bloquea la fila del perfil).
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

  -- Serializa las acreditaciones de la misma persona.
  perform 1 from public.perfiles where id = v_orden.usuario_id for update;

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

create index if not exists ordenes_usuario_aprobada_idx on public.ordenes (usuario_id) where estado = 'aprobada';

-- Órdenes: el usuario no puede marcar la suya como de prueba ni fijar el método de pago.
drop policy if exists "ordenes: crear las propias" on public.ordenes;
create policy "ordenes: crear las propias"
  on public.ordenes for insert to authenticated
  with check (
    (select auth.uid()) = usuario_id
    and estado = 'pendiente'
    and transaccion_id is null
    and metodo_pago is null
    and es_prueba = false
    and moneda = 'COP'
    and (paquete, creditos, monto_centavos) in (
      ('inicial', 5, 990000::bigint),
      ('buscador', 15, 2490000::bigint),
      ('iniciado', 40, 5490000::bigint),
      ('circulo', 15, 1990000::bigint)
    )
  );

-- ---------------------------------------------------------------------------
-- 2. Generación de lecturas: ventana de reclamo mayor que el tiempo máximo de
--    la función (300 s) y cierre con guarda de estado (nunca revive una
--    lectura ya reembolsada).
-- ---------------------------------------------------------------------------
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
       or (estado = 'generando' and generando_desde < now() - interval '6 minutes')
     );
  get diagnostics v_filas = row_count;
  return v_filas > 0;
end;
$$;

create or replace function public.finalizar_generacion(p_lectura uuid, p_texto text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_filas integer;
begin
  update public.lecturas
     set interpretacion = p_texto, estado = 'lista', generando_desde = null
   where id = p_lectura and estado = 'generando';
  get diagnostics v_filas = row_count;
  return v_filas > 0;
end;
$$;
revoke execute on function public.finalizar_generacion(uuid, text) from public, anon, authenticated;
grant execute on function public.finalizar_generacion(uuid, text) to service_role;

create or replace function public.finalizar_pregunta(p_pregunta uuid, p_texto text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_filas integer;
begin
  update public.preguntas_lectura
     set respuesta = p_texto, estado = 'lista'
   where id = p_pregunta and estado = 'pendiente';
  get diagnostics v_filas = row_count;
  return v_filas > 0;
end;
$$;
revoke execute on function public.finalizar_pregunta(uuid, text) from public, anon, authenticated;
grant execute on function public.finalizar_pregunta(uuid, text) to service_role;

-- Reintento de una lectura fallida: cobro y vuelta a 'pendiente' en una sola
-- operación (dos clics simultáneos no cobran dos veces).
create or replace function public.reintentar_lectura(p_lectura uuid, p_costo integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario uuid := auth.uid();
  v_perfil public.perfiles%rowtype;
  v_cobro integer;
begin
  if v_usuario is null then raise exception 'No autenticado'; end if;
  if p_costo is null or p_costo < 0 or p_costo > 100 then raise exception 'Costo no válido'; end if;

  select * into v_perfil from public.perfiles where id = v_usuario for update;
  v_cobro := case when v_perfil.ilimitado then 0 else p_costo end;

  if not exists (select 1 from public.lecturas where id = p_lectura and usuario_id = v_usuario and estado = 'error') then
    return false;
  end if;
  if v_perfil.creditos < v_cobro then
    return false;
  end if;

  if v_cobro > 0 then
    update public.perfiles set creditos = creditos - v_cobro where id = v_usuario;
  end if;
  insert into public.movimientos_creditos (usuario_id, cantidad, motivo, referencia)
  values (v_usuario, -v_cobro, 'lectura:reintento', p_lectura::text);

  update public.lecturas
     set estado = 'pendiente', generando_desde = null, creditos_usados = v_cobro
   where id = p_lectura and usuario_id = v_usuario and estado = 'error';
  return true;
end;
$$;
revoke execute on function public.reintentar_lectura(uuid, integer) from public, anon;
grant execute on function public.reintentar_lectura(uuid, integer) to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Devoluciones desde el servidor: siempre atómicas y con asiento.
-- ---------------------------------------------------------------------------
create or replace function public.devolver_creditos(p_usuario uuid, p_cantidad integer, p_motivo text, p_referencia text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_cantidad is null or p_cantidad <= 0 then raise exception 'Cantidad no válida'; end if;
  update public.perfiles set creditos = creditos + p_cantidad where id = p_usuario;
  insert into public.movimientos_creditos (usuario_id, cantidad, motivo, referencia)
  values (p_usuario, p_cantidad, p_motivo, p_referencia);
end;
$$;
revoke execute on function public.devolver_creditos(uuid, integer, text, text) from public, anon, authenticated;
grant execute on function public.devolver_creditos(uuid, integer, text, text) to service_role;

-- Cobro: motivo acotado (el libro mayor no admite motivos inventados).
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
  if p_cantidad is null or p_cantidad <= 0 or p_cantidad > 100 then
    raise exception 'Cantidad no válida';
  end if;
  if p_motivo is null or p_motivo !~ '^(lectura|pregunta):[a-z_]+$' or length(coalesce(p_referencia, '')) > 120 then
    raise exception 'Motivo no válido';
  end if;

  if exists (select 1 from public.perfiles where id = v_usuario and ilimitado) then
    insert into public.movimientos_creditos (usuario_id, cantidad, motivo, referencia)
    values (v_usuario, 0, p_motivo || ' (ilimitado)', p_referencia);
    return true;
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

-- ---------------------------------------------------------------------------
-- 4. Carta del día gratis: una por persona y día local, reservada de forma
--    atómica. Se retira el borrado directo de lecturas (nadie lo usaba y
--    permitía "reiniciar" el contador).
-- ---------------------------------------------------------------------------
drop policy if exists "lecturas: borrar las propias" on public.lecturas;
revoke delete on public.lecturas from anon, authenticated;

create table if not exists public.cartas_dia (
  usuario_id uuid not null references public.perfiles (id) on delete cascade,
  fecha      date not null,
  primary key (usuario_id, fecha)
);
alter table public.cartas_dia enable row level security;
revoke all on public.cartas_dia from anon, authenticated;

-- Fecha civil de hoy para la persona (zona de nacimiento o Bogotá).
create or replace function public.fecha_local_hoy(p_usuario uuid)
returns date
language sql
stable
security definer
set search_path = ''
as $$
  select (now() at time zone coalesce((select zona_horaria from public.perfiles where id = p_usuario), 'America/Bogota'))::date;
$$;
revoke execute on function public.fecha_local_hoy(uuid) from public, anon, authenticated;

-- ¿Queda carta gratis hoy? (no la reserva)
create or replace function public.carta_dia_disponible()
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_usuario uuid := auth.uid();
begin
  if v_usuario is null then return false; end if;
  if exists (select 1 from public.perfiles where id = v_usuario and ilimitado) then return true; end if;
  return not exists (select 1 from public.cartas_dia where usuario_id = v_usuario and fecha = public.fecha_local_hoy(v_usuario));
end;
$$;
revoke execute on function public.carta_dia_disponible() from public, anon;
grant execute on function public.carta_dia_disponible() to authenticated;

-- Reserva la carta gratis de hoy; true si se pudo (ilimitados siempre).
create or replace function public.reservar_carta_dia()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario uuid := auth.uid();
begin
  if v_usuario is null then raise exception 'No autenticado'; end if;
  if exists (select 1 from public.perfiles where id = v_usuario and ilimitado) then return true; end if;
  insert into public.cartas_dia (usuario_id, fecha) values (v_usuario, public.fecha_local_hoy(v_usuario))
  on conflict do nothing;
  return found;
end;
$$;
revoke execute on function public.reservar_carta_dia() from public, anon;
grant execute on function public.reservar_carta_dia() to authenticated;

-- Las cartas de hoy ya sacadas (día UTC) cuentan como reservadas.
insert into public.cartas_dia (usuario_id, fecha)
select distinct usuario_id, public.fecha_local_hoy(usuario_id)
  from public.lecturas
 where tipo = 'tarot_carta' and creado_en >= date_trunc('day', now())
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- 5. Preguntas de seguimiento: la decisión de cobro (1 gratis por lectura,
--    Círculo hasta 15 al día, resto 1 crédito) y la creación son atómicas.
-- ---------------------------------------------------------------------------
create or replace function public.crear_pregunta(p_lectura uuid, p_pregunta text)
returns table (id uuid, costo integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario uuid := auth.uid();
  v_perfil public.perfiles%rowtype;
  v_hechas integer;
  v_hoy integer;
  v_costo integer := 1;                         -- COSTO_PREGUNTA
  v_id uuid;
  v_gratis_por_lectura constant integer := 1;   -- PREGUNTAS_GRATIS_POR_LECTURA
  v_circulo_por_dia   constant integer := 15;   -- CIRCULO.preguntasPorDia
begin
  if v_usuario is null then raise exception 'No autenticado'; end if;
  if p_pregunta is null or length(trim(p_pregunta)) < 3 then raise exception 'Pregunta vacía'; end if;

  select p.* into v_perfil from public.perfiles p where p.id = v_usuario for update;
  if not exists (
    select 1 from public.lecturas l
     where l.id = p_lectura and l.usuario_id = v_usuario and l.estado = 'lista' and l.interpretacion is not null
  ) then
    raise exception 'Lectura no lista';
  end if;

  select count(*) into v_hechas from public.preguntas_lectura q
   where q.lectura_id = p_lectura and q.estado <> 'error';
  select count(*) into v_hoy from public.preguntas_lectura q
   where q.usuario_id = v_usuario and q.estado <> 'error'
     and q.creado_en >= date_trunc('day', now());

  if v_perfil.ilimitado
     or v_hechas < v_gratis_por_lectura
     or (v_perfil.circulo_hasta > now() and v_hoy < v_circulo_por_dia) then
    v_costo := 0;
  end if;

  if v_costo > 0 then
    if v_perfil.creditos < v_costo then return; end if;   -- sin filas: sin créditos
    update public.perfiles p set creditos = p.creditos - v_costo where p.id = v_usuario;
    insert into public.movimientos_creditos (usuario_id, cantidad, motivo, referencia)
    values (v_usuario, -v_costo, 'pregunta:lectura', p_lectura::text);
  end if;

  insert into public.preguntas_lectura (lectura_id, usuario_id, pregunta, creditos_usados)
  values (p_lectura, v_usuario, left(trim(p_pregunta), 400), v_costo)
  returning preguntas_lectura.id into v_id;
  return query select v_id, v_costo;
end;
$$;
revoke execute on function public.crear_pregunta(uuid, text) from public, anon;
grant execute on function public.crear_pregunta(uuid, text) to authenticated;
create index if not exists preguntas_lectura_usuario_dia_idx on public.preguntas_lectura (usuario_id, creado_en);

-- ---------------------------------------------------------------------------
-- 6. Push: endpoints válidos, tope por persona y cambio de dueño del navegador.
-- ---------------------------------------------------------------------------
alter table public.suscripciones_push
  add constraint suscripciones_push_endpoint_https check (endpoint ~ '^https://' and length(endpoint) <= 2048),
  add constraint suscripciones_push_claves_len check (length(p256dh) <= 256 and length(auth) <= 64);

create or replace function public.registrar_push(p_endpoint text, p_p256dh text, p_auth text, p_idioma text, p_agente text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario uuid := auth.uid();
begin
  if v_usuario is null then raise exception 'No autenticado'; end if;
  if p_idioma not in ('es', 'en', 'pt') then raise exception 'Idioma no válido'; end if;
  -- El mismo navegador puede cambiar de dueño: la suscripción pasa a quien está dentro.
  delete from public.suscripciones_push where endpoint = p_endpoint;
  -- Tope de 10 dispositivos por persona: se descarta el más antiguo.
  delete from public.suscripciones_push
   where id in (
     select s.id from public.suscripciones_push s
      where s.usuario_id = v_usuario
      order by s.creado_en desc
      offset 9
   );
  insert into public.suscripciones_push (usuario_id, endpoint, p256dh, auth, idioma, agente)
  values (v_usuario, p_endpoint, p_p256dh, p_auth, p_idioma, left(p_agente, 200));
end;
$$;
revoke execute on function public.registrar_push(text, text, text, text, text) from public, anon;
grant execute on function public.registrar_push(text, text, text, text, text) to authenticated;
drop policy if exists "push: crear las propias" on public.suscripciones_push;
revoke insert on public.suscripciones_push from authenticated;

-- ---------------------------------------------------------------------------
-- 7. Créditos de bienvenida solo con el correo confirmado (las cuentas de
--    Google y las creadas sin confirmación ya llegan confirmadas).
-- ---------------------------------------------------------------------------
alter table public.perfiles
  add column if not exists bienvenida_dada boolean not null default false;
update public.perfiles set bienvenida_dada = true where not bienvenida_dada;  -- los existentes ya la recibieron

alter table public.perfiles
  add constraint perfiles_nombre_len check (char_length(nombre) <= 120) not valid;
update public.perfiles set nombre = left(nombre, 120) where char_length(nombre) > 120;
alter table public.perfiles validate constraint perfiles_nombre_len;

create or replace function public.manejar_nuevo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_confirmado boolean := new.email_confirmed_at is not null;
begin
  insert into public.perfiles (id, nombre, creditos, codigo_invitacion, bienvenida_dada)
  values (
    new.id,
    left(nullif(trim(coalesce(
      new.raw_user_meta_data ->> 'nombre',
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    )), ''), 120),
    case when v_confirmado then 3 else 0 end,
    substr(public.generar_codigo_invitacion(new.id), 1, 7),
    v_confirmado
  );

  if v_confirmado then
    insert into public.movimientos_creditos (usuario_id, cantidad, motivo)
    values (new.id, 3, 'bienvenida');
  end if;

  return new;
end;
$$;

create or replace function public.dar_bienvenida()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.email_confirmed_at is null and new.email_confirmed_at is not null then
    update public.perfiles
       set creditos = creditos + 3, bienvenida_dada = true
     where id = new.id and not bienvenida_dada;
    if found then
      insert into public.movimientos_creditos (usuario_id, cantidad, motivo)
      values (new.id, 3, 'bienvenida');
    end if;
  end if;
  return new;
end;
$$;
revoke execute on function public.dar_bienvenida() from public, anon, authenticated;

drop trigger if exists bienvenida_al_confirmar on auth.users;
create trigger bienvenida_al_confirmar
  after update of email_confirmed_at on auth.users
  for each row execute function public.dar_bienvenida();

-- ---------------------------------------------------------------------------
-- 8. Invitaciones: solo con correo confirmado y tope sin carrera.
-- ---------------------------------------------------------------------------
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
  if not exists (select 1 from auth.users u where u.id = v_usuario and u.email_confirmed_at is not null) then
    return false;
  end if;

  select id into v_invitador from public.perfiles where codigo_invitacion = upper(trim(p_codigo));
  if v_invitador is null or v_invitador = v_usuario then
    return false;
  end if;

  -- Serializa los premios del mismo invitador (tope exacto).
  perform 1 from public.perfiles where id = v_invitador for update;

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

revoke execute on function public.generar_codigo_invitacion(uuid) from public, anon, authenticated;
create index if not exists perfiles_invitado_por_idx on public.perfiles (invitado_por) where invitado_por is not null;

-- ---------------------------------------------------------------------------
-- 9. Rendimiento y políticas.
-- ---------------------------------------------------------------------------
create index if not exists lecturas_listas_recientes_idx on public.lecturas (creado_en) where estado = 'lista';

drop policy if exists "preguntas: ver las propias" on public.preguntas_lectura;
create policy "preguntas: ver las propias" on public.preguntas_lectura
  for select to authenticated using ((select auth.uid()) = usuario_id);

drop policy if exists "mensajes: ver los propios" on public.mensajes_diarios;
create policy "mensajes: ver los propios" on public.mensajes_diarios
  for select to authenticated using ((select auth.uid()) = usuario_id);

drop policy if exists "push: ver las propias" on public.suscripciones_push;
create policy "push: ver las propias" on public.suscripciones_push
  for select to authenticated using ((select auth.uid()) = usuario_id);
drop policy if exists "push: borrar las propias" on public.suscripciones_push;
create policy "push: borrar las propias" on public.suscripciones_push
  for delete to authenticated using ((select auth.uid()) = usuario_id);
