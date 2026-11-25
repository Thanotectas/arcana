# Pagos internacionales con PayPal (25 nov 2026)

Quien paga desde fuera de Colombia ve los precios en dólares en `/creditos` y paga con PayPal (con su cuenta PayPal o con tarjeta). En Colombia sigue Bold en pesos. La cuenta que recibe es la cuenta Empresas **"Mi Arcana"** (tipo Particular); los retiros a Colombia se hacen por Nequi.

## Cómo funciona

1. `accionComprarInternacional` crea la orden `pendiente` en USD (`ARC-…`) y pide a PayPal una orden (Orders v2, `intent: CAPTURE`, `custom_id` = referencia). El id de PayPal queda en `ordenes.transaccion_id`.
2. La persona aprueba en PayPal y vuelve a `/api/pagos/paypal/retorno?ref=…`, que captura y acredita con `acreditar_orden(..., 'paypal')`, y redirige a `/creditos/retorno`.
3. Respaldo: el webhook `/api/webhooks/paypal` hace lo mismo si la persona cerró la ventana antes de volver, y anula la orden en reembolsos y contracargos. No se fía del cuerpo del aviso: siempre vuelve a consultar la orden en la API (referencia, monto y moneda deben coincidir).
4. Si cancela, vuelve a `/creditos?moneda=usd&error=cancelado` y no se cobra nada.

Código: `src/lib/pagos/paypal.ts`, `src/lib/pagos/internacional.ts` (elige PayPal o Lemon), `src/app/api/pagos/paypal/retorno`, `src/app/api/webhooks/paypal`. No requiere migración (`metodo_pago` es texto libre).

## Configurar (una vez)

1. Entra a https://developer.paypal.com con la cuenta de PayPal de Mi Arcana → **Apps & Credentials**.
2. Primero en **Sandbox**: crea una app ("Arcana"), copia el **Client ID** y el **Secret**. Ponlos en Vercel (entorno **Preview**) como `PAYPAL_CLIENT_ID` y `PAYPAL_CLIENT_SECRET`, sin `PAYPAL_ENV`. Prueba una compra en la vista previa con una cuenta personal de sandbox (Sandbox → Accounts).
3. Luego en **Live**: crea la app, copia Client ID y Secret y ponlos en Vercel (entorno **Production**) con `PAYPAL_ENV=live`.
4. En la app Live → **Webhooks → Add Webhook**: URL `https://miarcana.com/api/webhooks/paypal`, eventos `CHECKOUT.ORDER.APPROVED`, `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`, `PAYMENT.CAPTURE.REFUNDED`, `PAYMENT.CAPTURE.REVERSED`.
5. Redespliega. Las claves nunca van al repositorio ni al chat.

**Modo de prueba en producción:** mientras `PAYPAL_PUBLICO` no sea `1`, PayPal solo lo ven las cuentas administradoras (`ADMIN_CORREOS`); los clientes siguen con Bold. Para probar: claves Live en Production con `PAYPAL_ENV=live`, entrar como administrador a `miarcana.com/creditos?moneda=usd`, comprar el paquete de prueba (US$0,99) y reembolsarlo desde PayPal (el webhook anula la orden). Para abrirlo a todos: `PAYPAL_PUBLICO=1` y Redeploy.

`PAYPAL_ACTIVO=0` apaga el pago en dólares sin borrar las claves. Sin claves de PayPal, todos pagan en pesos con Bold como hasta ahora.

Precios: los mismos `precioUSDCentavos` de `src/lib/creditos.ts`, ajustados por país con `precioUSDPara` (paridad). PayPal cobra cerca de 5,4 % + cargo fijo por venta internacional.

---

> **Estado (22 oct 2026): Lemon Squeezy rechazó la tienda de Arcana** (también rechazó Thanotectas en marzo). El código lo deja apagado salvo `LEMON_ACTIVO=1`, aunque las demás variables sigan en Vercel. Lo de abajo queda como referencia por si algún día se reactiva.

# Pagos internacionales con Lemon Squeezy

Bold solo cobra en pesos con medios colombianos. Para quien está fuera de Colombia, Arcana cobra en dólares con Lemon Squeezy, que actúa como vendedor oficial (merchant of record): acepta tarjetas y PayPal de cualquier país, calcula y declara el IVA del comprador (por ejemplo el 21 % de España) y paga a Colombia por transferencia o PayPal. Comisión aproximada: 5 % + 0,50 USD por venta.

El código ya está listo. Mientras no existan las variables de entorno, la página de créditos sigue cobrando solo con Bold.

## Precios en dólares

| Paquete | Créditos | USD |
| --- | --- | --- |
| Prueba | 1 | 0,99 |
| Inicial | 5 | 2,49 |
| Buscador | 15 | 5,99 |
| Iniciado | 40 | 12,99 |
| Círculo Arcana (30 días) | 15 + pase | 4,99 |
| Círculo, precio de fundadores (hasta el 31 oct 2026, 50 cupos) | 15 + pase | 2,49 |

Se definen en `src/lib/creditos.ts` (`precioUSDCentavos`). Los precios de los productos en Lemon Squeezy deben coincidir exactamente: el webhook rechaza la venta si el total no es igual al de la orden.

## Configurar (una vez)

1. Crea la cuenta en https://lemonsqueezy.com y una tienda ("Arcana"). Completa la verificación de identidad y la cuenta de pago (transferencia internacional a tu banco en Colombia o PayPal).
2. **Products → New product**, uno por paquete, tipo "Single payment", con el precio en USD de la tabla. Al guardar cada producto, abre su variante por defecto y copia el **Variant ID** (número).
3. **Settings → API → Create API key**. Copia la clave.
4. **Settings → Webhooks → Add endpoint**: URL `https://miarcana.com/api/webhooks/lemon`, un secreto inventado (una frase larga), eventos `order_created` y `order_refunded`.
5. En Vercel → Settings → Environment Variables (Production):
   - `LEMON_API_KEY` = la clave del paso 3.
   - `LEMON_STORE_ID` = el id numérico de la tienda (Settings → Stores).
   - `LEMON_WEBHOOK_SECRET` = el secreto del paso 4.
   - `LEMON_VARIANTES` = `prueba:<id>,inicial:<id>,buscador:<id>,iniciado:<id>,circulo:<id>,fundadores:<id>` con los Variant ID del paso 2 (seis productos).
6. Redespliega. Pásame las claves solo en un archivo privado, nunca por el chat.

## Cómo funciona para la persona

- Vercel dice de qué país llega la visita (`x-vercel-ip-country`). Fuera de Colombia la página de créditos muestra precios en dólares y el botón abre el checkout alojado de Lemon Squeezy; en Colombia sigue Bold. Un enlace permite cambiar en ambos sentidos (`/creditos?moneda=usd` o `?moneda=cop`).
- La orden se crea en USD con la referencia `ARC-…`; Lemon Squeezy la devuelve en `custom_data` del webhook; `acreditar_orden` suma los créditos (y los 30 días de Círculo si aplica) igual que con Bold.
- Al terminar, Lemon Squeezy redirige a `/creditos/retorno?ref=…`. Si el webhook aún no llegó, la página muestra "pendiente" y los créditos aparecen en segundos.

## Probar

En Lemon Squeezy activa **Test mode** (interruptor arriba a la izquierda), crea una API key y un webhook en modo de prueba y usa la tarjeta `4242 4242 4242 4242`. Las órdenes de prueba quedan en la tabla `ordenes` con moneda `USD`; bórralas o márcalas antes de las métricas.
