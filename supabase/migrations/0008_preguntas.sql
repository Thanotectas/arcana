-- Arcana: preguntas de seguimiento sobre una lectura ("Pregúntale a Arcana").
-- La primera pregunta de cada lectura es gratis; las siguientes cuestan
-- 1 crédito (ver src/lib/creditos.ts). Solo el servidor crea filas.

create table if not exists public.preguntas_lectura (
  id               uuid primary key default gen_random_uuid(),
  lectura_id       uuid not null references public.lecturas (id) on delete cascade,
  usuario_id       uuid not null references public.perfiles (id) on delete cascade,
  pregunta         text not null,
  respuesta        text,
  estado           text not null default 'pendiente' check (estado in ('pendiente', 'lista', 'error')),
  creditos_usados  integer not null default 0 check (creditos_usados >= 0),
  creado_en        timestamptz not null default now()
);
create index if not exists preguntas_lectura_lectura_idx on public.preguntas_lectura (lectura_id, creado_en);

alter table public.preguntas_lectura enable row level security;
create policy "preguntas: ver las propias" on public.preguntas_lectura
  for select to authenticated using (auth.uid() = usuario_id);
revoke insert, update, delete on public.preguntas_lectura from anon, authenticated;

-- Marca la pregunta como fallida y devuelve los créditos una sola vez.
create or replace function public.reembolsar_pregunta(p_pregunta uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v public.preguntas_lectura%rowtype;
begin
  update public.preguntas_lectura
     set estado = 'error'
   where id = p_pregunta and estado = 'pendiente'
  returning * into v;
  if not found then
    return false;
  end if;
  if v.creditos_usados > 0 then
    update public.perfiles set creditos = creditos + v.creditos_usados where id = v.usuario_id;
    insert into public.movimientos_creditos (usuario_id, cantidad, motivo, referencia)
    values (v.usuario_id, v.creditos_usados, 'reembolso:pregunta', v.id::text);
  end if;
  return true;
end;
$$;

revoke execute on function public.reembolsar_pregunta(uuid) from public, anon, authenticated;
grant execute on function public.reembolsar_pregunta(uuid) to service_role;
