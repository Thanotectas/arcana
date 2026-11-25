-- La voz de Sibila en la escuela: la carta de cierre siempre narrada; los comentarios, solo si la persona pulsa «Escuchar».
alter table public.escuela_progreso add column if not exists comentario_audio text;
alter table public.escuela_inscripciones add column if not exists carta_audio text;
