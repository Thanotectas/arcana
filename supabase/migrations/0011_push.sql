-- Arcana: suscripciones web push para el aviso diario "Tu cielo hoy".
create table if not exists public.suscripciones_push (
  id          bigint generated always as identity primary key,
  usuario_id  uuid not null references public.perfiles (id) on delete cascade,
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  idioma      text not null default 'es',
  agente      text,
  creado_en   timestamptz not null default now()
);
create index if not exists suscripciones_push_usuario on public.suscripciones_push (usuario_id);
alter table public.suscripciones_push enable row level security;

create policy "push: ver las propias" on public.suscripciones_push
  for select to authenticated using ((select auth.uid()) = usuario_id);
create policy "push: crear las propias" on public.suscripciones_push
  for insert to authenticated with check ((select auth.uid()) = usuario_id);
create policy "push: borrar las propias" on public.suscripciones_push
  for delete to authenticated using ((select auth.uid()) = usuario_id);

grant select, insert, delete on public.suscripciones_push to authenticated;
