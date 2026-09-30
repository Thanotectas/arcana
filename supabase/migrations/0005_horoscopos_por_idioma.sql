-- Arcana: retira la regla de un horóscopo por signo y día.
-- Aplicar justo al publicar la rama con idiomas (antes, el código en
-- producción la necesita; después, impediría guardar horóscopos en inglés y
-- portugués el mismo día que el de español).

alter table public.horoscopos drop constraint if exists horoscopos_signo_fecha_key;
