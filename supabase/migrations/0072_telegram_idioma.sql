-- Idioma de cada suscriptor del bot de Telegram (la carta diaria le llega en ese idioma).
alter table public.suscriptores_telegram add column if not exists idioma text not null default 'es';
