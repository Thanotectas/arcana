-- Arcana: más oráculos en el directo y segmentos «para todos» de Sibila.
-- en_vivo_preguntas: tipos péndulo, I Ching, runas, Lenormand, baraja española
-- y año chino; origen «sistema» (lecturas para un signo, un idioma o para
-- todos, cuando nadie pregunta). Sin esta migración los oráculos nuevos entran
-- como tarot con la marca «[tipo]» al inicio del texto y se leen igual; los
-- segmentos «para todos» no salen (Sibila dice sus frases de espera).
alter table public.en_vivo_preguntas drop constraint if exists en_vivo_preguntas_tipo_check;
alter table public.en_vivo_preguntas
  add constraint en_vivo_preguntas_tipo_check
  check (tipo in ('tarot', 'aura', 'numerologia', 'horoscopo', 'chocolate', 'mano', 'carta', 'sinastria', 'huevo',
                  'pendulo', 'iching', 'runas', 'lenormand', 'baraja', 'chino'));

alter table public.en_vivo_preguntas drop constraint if exists en_vivo_preguntas_origen_check;
alter table public.en_vivo_preguntas
  add constraint en_vivo_preguntas_origen_check
  check (origen in ('chat', 'manual', 'pagina', 'facebook', 'sistema'));
