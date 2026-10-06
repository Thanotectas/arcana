# Línea de WhatsApp atendida por Sibila

Sibila responde en WhatsApp las dudas sobre Arcana (qué es, precios, cómo
entrar, cómo pagar), manda la carta del día si se la piden y avisa por correo
a la administración cuando alguien pide hablar con una persona. No hace
lecturas por WhatsApp: remite a la app con el costo y el enlace.

Código: `src/lib/whatsapp/api.ts` (Cloud API de Meta), `src/lib/whatsapp/sibila.ts`
(hechos del producto calculados desde el código, instrucciones del canal,
contexto de los últimos 16 mensajes, tope de 40 mensajes por número y día),
webhook `src/app/api/webhooks/whatsapp/route.ts`, panel `/admin/whatsapp`,
tabla `mensajes_whatsapp` (migración 0025).

## Conectar el número en Meta (una sola vez)

Antes de empezar: el número que se conecta a la API **deja de poder usarse en
la app de WhatsApp o WhatsApp Business del celular** (chats y estados). Si la
línea ya se usa en el celular, conviene dedicar otro número a Sibila, o
revisar en Meta la opción de "coexistencia" entre la app y la API.

1. En developers.facebook.com, en la misma app de Meta que usa Arcana para
   Instagram, agregar el producto **WhatsApp**.
2. En WhatsApp → Configuración de la API, "Agregar número de teléfono": el
   número de la línea, nombre para mostrar "Arcana" y categoría. Meta envía
   un código por SMS o llamada para verificarlo.
3. Copiar el **Identificador del número de teléfono** → `WA_PHONE_NUMBER_ID`.
4. Crear un token permanente: Business Settings → Usuarios → Usuarios del
   sistema → crear uno (rol administrador) → "Generar token" para la app con
   los permisos `whatsapp_business_messaging` y `whatsapp_business_management`
   → `WA_TOKEN`. (El token temporal de la pantalla de pruebas caduca en 24 h.)
5. En Configuración básica de la app, copiar el **Secreto de la app** →
   `WA_APP_SECRET` (verifica la firma de cada aviso).
6. Inventar una palabra para `WA_VERIFY_TOKEN` (por ejemplo, ocho letras y
   números al azar).
7. Poner las cuatro variables en Vercel y volver a desplegar.
8. En WhatsApp → Configuración → Webhook: URL
   `https://miarcana.com/api/webhooks/whatsapp`, token de verificación igual
   a `WA_VERIFY_TOKEN`, "Verificar y guardar", y suscribirse al campo
   **messages**.
9. Escribir al número desde otro celular: debe responder Sibila. La
   conversación aparece en `/admin/whatsapp`.

Mientras la app de Meta esté en modo desarrollo solo puede escribirse desde
los números de prueba que se agregan en esa misma pantalla (hasta cinco).
Para que cualquiera pueda escribir hay que pasar la app a modo activo (Meta
pide verificar el negocio, en Business Settings → Centro de seguridad).

## Costo

Las conversaciones que inicia el cliente (escriben ellos y Sibila responde
dentro de las 24 horas) no tienen costo en la API de Meta. Solo cuestan los
mensajes de plantilla que iniciaría Arcana, que no se usan aquí. La IA cuesta
fracciones de centavo por respuesta.

## Pasar con una persona

Cuando la persona pide hablar con alguien, tiene un problema de pago o se
molesta, Sibila lo dice, marca el mensaje y se envía un correo a
`ADMIN_CORREOS` con el hilo y un enlace para abrir el chat. La respuesta
humana se da desde el panel de Meta o desde la app de WhatsApp Business si
hay coexistencia; Sibila sigue respondiendo a los mensajes nuevos.
