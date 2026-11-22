-- Árabe (ar), indonesio (id) e hindi (hi): se suman a los idiomas válidos
-- en el horóscopo por idioma, el idioma del perfil y el registro de avisos push.

alter table public.horoscopos drop constraint if exists horoscopos_idioma_check;
alter table public.horoscopos
  add constraint horoscopos_idioma_check check (idioma in ('es', 'en', 'pt', 'fr', 'tr', 'ar', 'id', 'hi'));

alter table public.perfiles drop constraint if exists perfiles_idioma_check;
alter table public.perfiles
  add constraint perfiles_idioma_check check (idioma in ('es', 'en', 'pt', 'fr', 'tr', 'ar', 'id', 'hi'));

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
  if p_idioma not in ('es', 'en', 'pt', 'fr', 'tr', 'ar', 'id', 'hi') then raise exception 'Idioma no válido'; end if;
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
