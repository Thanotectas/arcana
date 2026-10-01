-- Arcana: interpretación de sueños (tipo de lectura 'suenos').
alter table public.lecturas drop constraint if exists lecturas_tipo_check;
alter table public.lecturas
  add constraint lecturas_tipo_check
  check (tipo in ('tarot_carta', 'tarot_tres', 'tarot_celta', 'carta_astral', 'numerologia', 'compatibilidad', 'quiromancia', 'iching', 'chino', 'cruce', 'suenos'));
