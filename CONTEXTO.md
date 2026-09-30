# Contexto del proyecto Arcana

Resumen para retomar el trabajo desde cualquier entorno (otra sesión de Claude, otro computador u otra persona). Actualizado: 30 de septiembre de 2026.

## Qué es

App web de tarot, carta astral, numerología, compatibilidad y horóscopo, con lecturas escritas por IA (Claude) y créditos prepagados. Mercado inicial: Colombia, en español. Meta: 1 millón de USD al año; la estrategia completa está en un documento aparte (Arcana — Estrategia hacia 1M USD).

## Dónde vive cada cosa

| Pieza | Dónde | Identificador |
| --- | --- | --- |
| Código | GitHub `Thanotectas/arcana`, rama `main` | Colaborador: CPNT2026 |
| Publicación | Vercel, cuenta thanotectas ("campana-edil's projects"), proyecto `arcana` | Cada push a `main` se publica solo |
| Dominio | `miarcana.com` (comprado en Vercel); `www` redirige | Respaldo: `arcana-nu-two.vercel.app` |
| Base de datos y usuarios | Supabase, organización "Thanotectas's Org", proyecto `arcana` | Ref `wclgoyvcowauadfnfewe`, región São Paulo |
| IA | Anthropic API, modelo `claude-opus-5-5` (cambiable con `ARCANA_IA_MODEL`) | Clave en Vercel |
| Pagos | Bold (botón de pagos con firma de integridad) | Webhook: `https://miarcana.com/api/webhooks/bold` |
| Entrar con Google | Google Cloud, proyecto `arcana-510218`, cliente OAuth "Arcana web" | Activado en Supabase → Authentication → Providers |

El proyecto de Supabase "medirecordatorios" está pausado a propósito (el plan gratis permite 2 proyectos activos). Se reactiva desde el panel de Supabase.

## Variables de entorno (en Vercel; nunca en el repositorio)

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_BOLD_API_KEY`, `BOLD_SECRET_KEY`, `BOLD_ENV` (`production` con llaves reales; `test` solo con llaves de prueba), `NEXT_PUBLIC_SITE_URL` (`https://miarcana.com`). Plantilla en `.env.example`.

## Cómo funciona por dentro

- **Next.js 16** (App Router, Server Actions, `proxy.ts`). Esta versión cambia respecto a versiones anteriores: leer `node_modules/next/dist/docs/` antes de escribir código (ver `AGENTS.md`).
- **Lecturas en vivo:** la acción de cada lectura cobra y crea la lectura en estado `pendiente` (`src/lib/lecturas/acciones.ts`). La página de la lectura llama a `POST /api/lecturas/[id]/generar`, que transmite el texto de Claude mientras se escribe, lo guarda al terminar y reembolsa si falla. Los prompts están en `src/lib/lecturas/prompts.ts`.
- **Tarot:** la persona elige posiciones del abanico de 78 cartas; el servidor baraja y decide qué carta hay en cada posición (`cartasDesdeAbanico` en `src/lib/tarot/tiradas.ts`).
- **Carta astral:** efemérides reales con `astronomia` y casas Placidus (`src/lib/astro/`). La rueda interactiva está en `src/components/RuedaAstral.tsx`; los textos que usa el navegador, en `src/lib/astro/textos.ts`.
- **Créditos:** `consumir_creditos()` en Postgres cobra de forma atómica. Solo el servidor crea lecturas. Precios y paquetes en `src/lib/creditos.ts`; la política de inserción de órdenes en la migración 0001 repite los paquetes y hay que cambiar ambos a la vez.
- **Uso ilimitado:** columna `perfiles.ilimitado`; se activa sola para los correos de la tabla `correos_ilimitados` cuando el correo está confirmado. Hoy: `lualzaja@gmail.com` (cuenta creada con Google, activa).
- **Pagos Bold:** `src/lib/pagos/bold.ts` (firma de integridad y verificación de `x-bold-signature`), `src/app/creditos/pagar` (checkout) y `src/app/api/webhooks/bold` (acredita con `acreditar_orden()`, idempotente).

## Base de datos

Migraciones en `supabase/migrations/`, todas aplicadas en producción:

1. `0001_init.sql`: tablas, RLS, cobro y acreditación.
2. `0002_lecturas_en_vivo.sql`: estado de la lectura, reclamar y reembolsar.
3. `0003_google_e_ilimitados.sql`: nombre desde Google y cuentas ilimitadas.

Una migración nueva va como archivo `0004_...sql` y se aplica en Supabase (SQL Editor, CLI o el conector de Supabase). Antes de aplicarla conviene probarla en un Postgres local.

## Pendiente

- [ ] Llaves de Bold en Vercel (`NEXT_PUBLIC_BOLD_API_KEY`, `BOLD_SECRET_KEY`) y registrar el webhook en el panel de Bold.
- [ ] Primera compra de prueba de punta a punta.
- [ ] Rotar el secreto del cliente OAuth de Google (quedó visible en una conversación) y actualizarlo en Supabase.
- [ ] Saldo en la cuenta de Anthropic (estaba en plan de evaluación, sin saldo).
- [ ] Correo propio: ImprovMX para recibir en Gmail y Resend como SMTP de Supabase para los correos de registro.
- [ ] Hacer interactivas las pantallas de numerología y compatibilidad (hoy son formularios; la lectura ya se escribe en vivo).
- [ ] Siguientes pasos de la estrategia: tarjetas para compartir, páginas SEO, memoria de lecturas, idiomas (portugués e inglés).

## Cómo trabajar

- Idioma del producto, del código y de los commits: español.
- Antes de subir: `npx tsc --noEmit`, `npm run lint` y `npx next build`.
- Subir a `main` publica en producción; para cambios grandes, usar una rama y revisar la vista previa que crea Vercel.
