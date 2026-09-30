-- Arcana: cuentas con uso ilimitado y nombre desde Google.

alter table public.perfiles
  add column ilimitado boolean not null default false;
-- El usuario no puede activarlo: la columna no está entre las que puede editar
-- (ver los grants de 0001).

-- Correos que reciben uso ilimitado al confirmar su cuenta (por Google o por
-- correo). Solo el servidor la lee y la edita.
create table public.correos_ilimitados (
  correo text primary key check (correo = lower(correo)),
  creado_en timestamptz not null default now()
);
alter table public.correos_ilimitados enable row level security;
revoke all on public.correos_ilimitados from anon, authenticated;

insert into public.correos_ilimitados (correo) values ('lualzaja@gmail.com');

-- Nombre del perfil: el del registro por correo, o el que entrega Google.
create or replace function public.manejar_nuevo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfiles (id, nombre, creditos)
  values (
    new.id,
    nullif(trim(coalesce(
      new.raw_user_meta_data ->> 'nombre',
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    )), ''),
    3
  );

  insert into public.movimientos_creditos (usuario_id, cantidad, motivo)
  values (new.id, 3, 'bienvenida');

  return new;
end;
$$;

-- Activa el uso ilimitado solo con el correo confirmado: así nadie puede
-- registrarse con un correo de la lista sin controlarlo.
create or replace function public.aplicar_ilimitado()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email_confirmed_at is not null
     and exists (select 1 from public.correos_ilimitados where correo = lower(new.email)) then
    update public.perfiles set ilimitado = true where id = new.id;
  end if;
  return new;
end;
$$;

revoke execute on function public.aplicar_ilimitado() from public, anon, authenticated;

-- Se llama "ilimitado_..." para correr después de "al_crear_usuario" (orden alfabético).
create trigger ilimitado_al_crear
  after insert on auth.users
  for each row execute function public.aplicar_ilimitado();

create trigger ilimitado_al_confirmar
  after update of email_confirmed_at on auth.users
  for each row
  when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
  execute function public.aplicar_ilimitado();

-- Cuentas ya existentes y confirmadas.
update public.perfiles p
   set ilimitado = true
  from auth.users u
 where u.id = p.id
   and u.email_confirmed_at is not null
   and lower(u.email) in (select correo from public.correos_ilimitados);

-- Cobro: las cuentas ilimitadas no descuentan, pero queda el registro.
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
