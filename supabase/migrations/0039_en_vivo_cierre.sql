-- Arcana: cierre de «Sibila en vivo». cierre_en es la hora a la que Sibila se
-- despide, puesta desde /admin/en-vivo (vacía: la del próximo directo en
-- src/lib/marca/directo.ts, tres minutos antes del fin); despedida_en marca
-- que ya se despidió, para no repetirlo si el escenario se recarga.
alter table public.en_vivo_estado add column if not exists cierre_en timestamptz;
alter table public.en_vivo_estado add column if not exists despedida_en timestamptz;
