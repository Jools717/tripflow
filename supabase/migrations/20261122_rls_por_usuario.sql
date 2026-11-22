-- Fase 8.4 · Seguridad por usuario (RLS)
-- Cada cuenta (incluidos los invitados anónimos) solo puede leer y modificar sus propias filas.
-- Sin sesión (rol anon) no se puede leer ni escribir nada.
-- Dueño actual de los datos de Buenos Aires: AdminJools (26d4da6c-536c-4ed3-91af-62e1f11a28f8).

begin;

-- 1) expense_categories no tenía dueño: se añade y las 7 existentes pasan a AdminJools
alter table public.expense_categories add column if not exists user_id text;
update public.expense_categories set user_id = '26d4da6c-536c-4ed3-91af-62e1f11a28f8' where user_id is null;
create index if not exists idx_expense_categories_user_id on public.expense_categories (user_id);
create index if not exists idx_activities_user_id on public.activities (user_id);
create index if not exists idx_expenses_user_id on public.expenses (user_id);
create index if not exists idx_checklist_user_id on public.checklist (user_id);

-- 2) Por defecto, las filas nuevas pertenecen a quien las crea
alter table public.trips              alter column user_id set default (auth.uid())::text;
alter table public.activities         alter column user_id set default (auth.uid())::text;
alter table public.expenses           alter column user_id set default (auth.uid())::text;
alter table public.checklist          alter column user_id set default (auth.uid())::text;
alter table public.media_manager      alter column user_id set default (auth.uid())::text;
alter table public.expense_categories alter column user_id set default (auth.uid())::text;

-- 3) Quitar las políticas abiertas ("todo el mundo puede todo")
drop policy if exists "Acceso público trips" on public.trips;
drop policy if exists "Acceso público activities" on public.activities;
drop policy if exists "Acceso público expenses" on public.expenses;
drop policy if exists "Acceso público checklist" on public.checklist;
drop policy if exists "Permitir todo en media_manager" on public.media_manager;
drop policy if exists "Permitir todo en expense_categories" on public.expense_categories;
drop policy if exists "Acceso público trip_settings" on public.trip_settings;

-- 4) Políticas por dueño ((select auth.uid()) se evalúa una vez por consulta: más rápido)
create policy "Cada usuario gestiona sus viajes" on public.trips
  for all to authenticated
  using (user_id = (select auth.uid())::text) with check (user_id = (select auth.uid())::text);
create policy "Cada usuario gestiona sus actividades" on public.activities
  for all to authenticated
  using (user_id = (select auth.uid())::text) with check (user_id = (select auth.uid())::text);
create policy "Cada usuario gestiona sus gastos" on public.expenses
  for all to authenticated
  using (user_id = (select auth.uid())::text) with check (user_id = (select auth.uid())::text);
create policy "Cada usuario gestiona su checklist" on public.checklist
  for all to authenticated
  using (user_id = (select auth.uid())::text) with check (user_id = (select auth.uid())::text);
create policy "Cada usuario gestiona sus comprobantes" on public.media_manager
  for all to authenticated
  using (user_id = (select auth.uid())::text) with check (user_id = (select auth.uid())::text);
create policy "Cada usuario gestiona sus categorías" on public.expense_categories
  for all to authenticated
  using (user_id = (select auth.uid())::text) with check (user_id = (select auth.uid())::text);

-- trip_settings guarda la cotización del Dólar Blue del viaje de Buenos Aires:
-- cualquier sesión puede leerla, solo un administrador puede cambiarla
create policy "Leer configuración" on public.trip_settings
  for select to authenticated using (true);
create policy "Solo admin modifica configuración" on public.trip_settings
  for all to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

-- 5) Defensa extra: el rol anónimo (sin sesión) no tiene permisos sobre las tablas
revoke all on public.trips, public.activities, public.expenses, public.checklist,
  public.media_manager, public.expense_categories, public.trip_settings from anon;

commit;
