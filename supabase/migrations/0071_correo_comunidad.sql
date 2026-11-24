-- Correo único de invitación a la Comunidad Arcana.
alter table public.correos drop constraint if exists correos_tipo_check;
alter table public.correos add constraint correos_tipo_check check (tipo = any (array['carta_activo', 'regreso_7', 'regreso_30', 'probadores', 'regalo_vaso', 'comunidad']));
