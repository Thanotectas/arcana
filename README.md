# Arcana

Aplicación web de tarot, carta astral, numerología, compatibilidad y horóscopo diario, con interpretaciones escritas por IA y un modelo de negocio de créditos prepagados (pagos con Bold, Colombia).

## Stack

- Next.js 16 (App Router, Server Actions, `proxy.ts`), React 19, Tailwind 4.
- Supabase: autenticación por correo/contraseña, Postgres con RLS, funciones SQL para cobros atómicos.
- Anthropic SDK (`claude-opus-5-5` por defecto) para las interpretaciones.
- `astronomia` (VSOP87) para efemérides reales; casas Placidus implementadas en `src/lib/astro/casas.ts`.
- Botón de pagos de Bold (firma de integridad) + webhook para acreditar créditos.

## Estructura

```
src/app/                 Rutas (App Router)
  page.tsx               Portada pública
  entrar, registro, recuperar, cuenta
  inicio                 Panel del usuario
  tarot, carta-astral, numerologia, compatibilidad   Formularios de lectura (privados)
  lecturas/[id]          Detalle de una lectura (cartas, rueda astral, texto)
  horoscopo/[signo]      Horóscopo diario público (cacheado por día)
  creditos, creditos/pagar, creditos/retorno         Compra de créditos, checkout y retorno de Bold
  api/webhooks/bold      Webhook de pagos
  api/lugares            Autocompletado de lugares (Open-Meteo)
src/lib/
  ia.ts                  Cliente de Claude y prompt base
  creditos.ts            Costos por lectura y paquetes de venta
  tarot/                 Mazo de 78 cartas y tiradas
  astro/                 Efemérides, casas, aspectos, geocodificación
  numerologia.ts, zodiaco.ts
  lecturas/acciones.ts   Server Actions: cobrar → generar → guardar (con reembolso si falla)
  pagos/                 Bold (firma de integridad, verificación del webhook)
  supabase/              Clientes server/browser/admin
supabase/migrations/     Esquema SQL (tablas, RLS, funciones)
```

## Puesta en marcha

1. **Supabase**: crea un proyecto, ejecuta `supabase/migrations/0001_init.sql` en el SQL Editor. En Authentication → Providers habilita Email. En Authentication → URL Configuration agrega `https://<tu-dominio>/auth/callback` a las Redirect URLs.
2. **Anthropic**: crea una API key en console.anthropic.com.
3. **Bold**: en el panel de Bold → Integraciones → Botón de pagos toma la llave de identidad y la llave secreta (primero las de pruebas). Registra el webhook `https://<tu-dominio>/api/webhooks/bold`.
4. Copia `.env.example` a `.env.local` y completa las variables.
5. `npm install && npm run dev`.

## Modelo de negocio

| Lectura | Créditos |
|---|---|
| Carta del día | gratis (1 por día) |
| Tirada de tres cartas | 1 |
| Cruz Celta | 3 |
| Carta astral | 5 |
| Numerología | 1 |
| Compatibilidad | 1 |

Paquetes: 5 créditos $9.900, 15 créditos $24.900, 40 créditos $54.900 (COP). Se editan en `src/lib/creditos.ts`. Cada cuenta nueva recibe 3 créditos (trigger `manejar_nuevo_usuario`).

## Seguridad

- RLS: cada usuario solo ve sus perfiles, lecturas, órdenes y movimientos.
- El cobro usa `consumir_creditos()` (SECURITY DEFINER, atómico). El usuario no puede modificar su saldo directamente.
- La acreditación de compras solo la hace `acreditar_orden()` desde el webhook (service_role) tras verificar la firma `x-bold-signature` y el monto.
- Las Server Actions verifican sesión en cada llamada.

## Despliegue

Pensado para Vercel: importa el repositorio, configura las variables de entorno de `.env.example` y despliega. Cambia `BOLD_ENV=production` y usa las llaves de producción de Bold cuando termines las pruebas.
