-- Arcana: paquete de prueba (1 crédito, $1.900) y precio de fundadores del Círculo ($9.900).
-- Ambos entran por la política de creación de órdenes; acreditar_orden no cambia
-- (el Círculo de fundadores se registra con paquete 'circulo' y monto distinto).
-- Conserva los candados de la 0012: metodo_pago y es_prueba no los pone el usuario.
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
      ('prueba', 1, 190000::bigint),
      ('inicial', 5, 990000::bigint),
      ('buscador', 15, 2490000::bigint),
      ('iniciado', 40, 5490000::bigint),
      ('circulo', 15, 1990000::bigint),
      ('circulo', 15, 990000::bigint)
    )
  );
