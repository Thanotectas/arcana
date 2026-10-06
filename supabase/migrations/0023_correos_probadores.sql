-- Arcana: correo de agradecimiento a los probadores de Google Play.
-- Se registra en la misma tabla para que el cron diario respete el espacio
-- de 6 días entre correos y no se envíe dos veces.
alter table public.correos drop constraint if exists correos_tipo_check;
alter table public.correos
  add constraint correos_tipo_check check (tipo in ('carta_activo', 'regreso_7', 'regreso_30', 'probadores'));
