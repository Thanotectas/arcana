-- Arcana: el código de oferta solo lo pone el servidor.
-- Las órdenes con código llevan créditos extra y las crea el servidor (ya
-- validado el código). Una persona autenticada no puede insertar una orden
-- con código: así nadie agota el cupo de un código con órdenes falsas.
-- (Aplicada con alter policy: misma regla de la 0021 más `codigo is null`.)
alter policy "ordenes: crear las propias" on public.ordenes with check (
    (select auth.uid()) = usuario_id
    and estado = 'pendiente'
    and transaccion_id is null
    and metodo_pago is null
    and es_prueba = false
    and codigo is null
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
