-- trip_id ya no tiene valor por defecto ('trip-ba-2026'): cada fila debe indicar su viaje.
-- Antes, un ítem de checklist guardado sin trip_id quedaba asociado al viaje de Buenos Aires.
begin;
alter table public.activities    alter column trip_id drop default;
alter table public.expenses      alter column trip_id drop default;
alter table public.checklist     alter column trip_id drop default;
alter table public.media_manager alter column trip_id drop default;
commit;
