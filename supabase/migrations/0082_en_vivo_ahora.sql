-- «Estoy en vivo ahora»: el presentador puede iniciar un directo en cualquier momento desde /admin/en-vivo,
-- sin depender del horario fijo (PROXIMO_DIRECTO). Mientras esté puesto, la web, la Sala y Sibila en redes
-- dicen que hay directo, y Sibila no se despide por el horario. Al apagarlo, Sibila se despide.
alter table public.en_vivo_estado add column if not exists vivo_desde timestamptz;
-- Dónde está el directo puesto a mano: «tiktok» (por defecto) o «youtube»; decide a qué botón lleva la web.
alter table public.en_vivo_estado add column if not exists vivo_en text check (vivo_en in ('tiktok', 'youtube'));
