-- Arcana: tipo de lectura «yildizname» (Turquía: el «libro de las estrellas», nombre + nombre de la madre en ebced).
alter table public.lecturas drop constraint if exists lecturas_tipo_check;
alter table public.lecturas
  add constraint lecturas_tipo_check
  check (tipo in ('tarot_carta', 'tarot_tres', 'tarot_celta', 'carta_astral', 'numerologia', 'compatibilidad', 'quiromancia', 'iching', 'chino', 'cruce', 'suenos', 'sinastria', 'chocolate', 'velas', 'aura', 'tabaco',
                  'revolucion_solar', 'baraja_espanola', 'lenormand', 'runas', 'pendulo', 'cafe', 'huevo', 'maya', 'vidas_pasadas', 'akashicos',
                  'kundli', 'kundli_milan', 'weton', 'weton_jodoh', 'abjad', 'geomancia', 'marsella', 'iskambil', 'yildizname'));
