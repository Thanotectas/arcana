# Pagos internacionales con Lemon Squeezy

Bold solo cobra en pesos con medios colombianos. Para quien está fuera de Colombia, Arcana cobra en dólares con Lemon Squeezy, que actúa como vendedor oficial (merchant of record): acepta tarjetas y PayPal de cualquier país, calcula y declara el IVA del comprador (por ejemplo el 21 % de España) y paga a Colombia por transferencia o PayPal. Comisión aproximada: 5 % + 0,50 USD por venta.

El código ya está listo. Mientras no existan las variables de entorno, la página de créditos sigue cobrando solo con Bold.

## Precios en dólares

| Paquete | Créditos | USD |
| --- | --- | --- |
| Inicial | 5 | 2,49 |
| Buscador | 15 | 5,99 |
| Iniciado | 40 | 12,99 |
| Círculo Arcana (30 días) | 15 + pase | 4,99 |

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
   - `LEMON_VARIANTES` = `inicial:<id>,buscador:<id>,iniciado:<id>,circulo:<id>` con los Variant ID del paso 2.
6. Redespliega. Pásame las claves solo en un archivo privado, nunca por el chat.

## Cómo funciona para la persona

- Vercel dice de qué país llega la visita (`x-vercel-ip-country`). Fuera de Colombia la página de créditos muestra precios en dólares y el botón abre el checkout alojado de Lemon Squeezy; en Colombia sigue Bold. Un enlace permite cambiar en ambos sentidos (`/creditos?moneda=usd` o `?moneda=cop`).
- La orden se crea en USD con la referencia `ARC-…`; Lemon Squeezy la devuelve en `custom_data` del webhook; `acreditar_orden` suma los créditos (y los 30 días de Círculo si aplica) igual que con Bold.
- Al terminar, Lemon Squeezy redirige a `/creditos/retorno?ref=…`. Si el webhook aún no llegó, la página muestra "pendiente" y los créditos aparecen en segundos.

## Probar

En Lemon Squeezy activa **Test mode** (interruptor arriba a la izquierda), crea una API key y un webhook en modo de prueba y usa la tarjeta `4242 4242 4242 4242`. Las órdenes de prueba quedan en la tabla `ordenes` con moneda `USD`; bórralas o márcalas antes de las métricas.
