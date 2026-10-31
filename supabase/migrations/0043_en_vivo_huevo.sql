-- Arcana: lectura de la limpia con huevo en el directo (foto subida en /vivo).
-- en_vivo_preguntas: tipo «huevo». Sin esta migración la foto entra como
-- «chocolate» con la marca «[huevo]» al inicio del texto y se lee igual.
alter table public.en_vivo_preguntas drop constraint if exists en_vivo_preguntas_tipo_check;
alter table public.en_vivo_preguntas
  add constraint en_vivo_preguntas_tipo_check
  check (tipo in ('tarot', 'aura', 'numerologia', 'horoscopo', 'chocolate', 'mano', 'carta', 'sinastria', 'huevo'));
