-- Arcana: correo «tu vaso de hoy» con una lectura de regalo (3 créditos) para quien se quedó sin créditos.
-- 1) El registro de correos admite el tipo 'regalo_vaso' (así el cron respeta los 6 días entre correos).
-- 2) Cada regalo se abre una sola vez: un movimiento 'regalo:vaso' por persona y referencia (la del correo).
alter table public.correos drop constraint if exists correos_tipo_check;
alter table public.correos
  add constraint correos_tipo_check check (tipo in ('carta_activo', 'regreso_7', 'regreso_30', 'probadores', 'regalo_vaso'));

create unique index if not exists movimientos_regalo_unico
  on public.movimientos_creditos (usuario_id, referencia)
  where motivo = 'regalo:vaso';
