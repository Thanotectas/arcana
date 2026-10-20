-- Arcana: por dónde llega la gente (origen de cada cuenta y de cada compra).
-- El proxy guarda en una cookie la primera red por la que alguien entra
-- (utm_source, enlaces cortos /yt /ig /tt /fb /wa o el Referer de la red) y,
-- al crear la cuenta, queda en el perfil; cada orden recuerda la cookie del
-- momento de la compra. Sirve para saber qué red trae cuentas y pagos, no
-- solo vistas. Solo el servidor escribe estas columnas.
alter table public.perfiles
  add column if not exists origen text,          -- youtube, instagram, tiktok, facebook, whatsapp, google, …
  add column if not exists origen_detalle text;  -- medio y campaña ("short · carta-dia"), si los hubo

alter table public.ordenes
  add column if not exists origen text;

create index if not exists perfiles_origen_idx on public.perfiles (origen, creado_en desc);
