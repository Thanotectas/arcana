-- Arcana: productos para los mercados nuevos.
-- lecturas: tipos «kundli», «kundli_milan» (India), «weton», «weton_jodoh» (Indonesia), «abjad», «geomancia»
-- (mundo árabe y África), «marsella» (Francia) e «iskambil» (Turquía).
alter table public.lecturas drop constraint if exists lecturas_tipo_check;
alter table public.lecturas
  add constraint lecturas_tipo_check
  check (tipo in ('tarot_carta', 'tarot_tres', 'tarot_celta', 'carta_astral', 'numerologia', 'compatibilidad', 'quiromancia', 'iching', 'chino', 'cruce', 'suenos', 'sinastria', 'chocolate', 'velas', 'aura', 'tabaco',
                  'revolucion_solar', 'baraja_espanola', 'lenormand', 'runas', 'pendulo', 'cafe', 'huevo', 'maya', 'vidas_pasadas', 'akashicos',
                  'kundli', 'kundli_milan', 'weton', 'weton_jodoh', 'abjad', 'geomancia', 'marsella', 'iskambil'));
