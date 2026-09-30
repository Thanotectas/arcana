-- Arcana: marcar órdenes de prueba para dejarlas fuera de las métricas de ventas.
alter table public.ordenes
  add column if not exists es_prueba boolean not null default false;

comment on column public.ordenes.es_prueba is
  'Orden de prueba (pago real hecho para probar el flujo). Se excluye de las métricas de ventas.';
