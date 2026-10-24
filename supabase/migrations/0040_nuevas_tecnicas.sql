-- Arcana: ocho técnicas nuevas (revolución solar, baraja española, Lenormand,
-- runas, péndulo, café, limpia con huevo y calendario maya).
alter table public.lecturas drop constraint if exists lecturas_tipo_check;
alter table public.lecturas
  add constraint lecturas_tipo_check
  check (tipo in ('tarot_carta', 'tarot_tres', 'tarot_celta', 'carta_astral', 'numerologia', 'compatibilidad', 'quiromancia', 'iching', 'chino', 'cruce', 'suenos', 'sinastria', 'chocolate', 'velas', 'aura', 'tabaco',
                  'revolucion_solar', 'baraja_espanola', 'lenormand', 'runas', 'pendulo', 'cafe', 'huevo', 'maya'));
