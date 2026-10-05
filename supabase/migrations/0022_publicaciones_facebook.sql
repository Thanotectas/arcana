-- Arcana: la carta del día también se publica en la página de Facebook.
alter table public.publicaciones_redes drop constraint if exists publicaciones_redes_red_check;
alter table public.publicaciones_redes
  add constraint publicaciones_redes_red_check check (red in ('instagram', 'facebook'));
