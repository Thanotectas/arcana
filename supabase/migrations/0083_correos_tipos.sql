-- Tipos de correo nuevos: el regalo de créditos (código VUELVE) y la promoción del fin de semana (Black Friday).
alter table public.correos drop constraint if exists correos_tipo_check;
alter table public.correos add constraint correos_tipo_check
  check (tipo = any (array['carta_activo', 'regreso_7', 'regreso_30', 'probadores', 'regalo_vaso', 'comunidad', 'regalo_creditos', 'promo_viernes']));
