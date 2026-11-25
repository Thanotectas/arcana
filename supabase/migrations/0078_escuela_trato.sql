-- Escuela: cómo quiere la persona que la nombren en su camino de iniciación (maestra, maestro o sin género).
alter table public.escuela_inscripciones add column if not exists trato text check (trato in ('a', 'o', 'e'));
