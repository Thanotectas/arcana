-- Arcana: pausa para el presentador del directo. Mientras pausa_hasta esté en el futuro, el escenario no toma la
-- siguiente consulta ni dice frases de espera: queda en silencio para que hable quien acompaña a Sibila.
-- Se pone y se quita desde /admin/en-vivo.
alter table public.en_vivo_estado add column if not exists pausa_hasta timestamptz;
