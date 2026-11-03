-- ============================================================================
-- TRIPFLOW: MIGRACIÓN A ARQUITECTURA MULTI-VIAJE Y MULTI-USUARIO (FASE 6)
-- Esta migración es 100% segura y no destructiva:
-- Conserva las 22 actividades, 3 gastos y 10 checklists existentes de Buenos Aires.
-- ============================================================================

-- 1. CREACIÓN DE LA TABLA 'trips' (Si no existe)
CREATE TABLE IF NOT EXISTS public.trips (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'user-admin-jools',
    title TEXT NOT NULL,
    destination_city TEXT NOT NULL,
    country_code TEXT NOT NULL DEFAULT 'AR',
    flag_emoji TEXT NOT NULL DEFAULT '🇦🇷',
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    base_currency TEXT NOT NULL DEFAULT 'USD',
    local_currency TEXT NOT NULL DEFAULT 'ARS',
    exchange_rate NUMERIC NOT NULL DEFAULT 1540,
    budget_total_base NUMERIC NOT NULL DEFAULT 1000,
    is_active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. INSERTAR EL VIAJE MAESTRO DE BUENOS AIRES 2026 (Para no perderlo nunca)
INSERT INTO public.trips (
    id,
    user_id,
    title,
    destination_city,
    country_code,
    flag_emoji,
    start_date,
    end_date,
    base_currency,
    local_currency,
    exchange_rate,
    budget_total_base,
    is_active,
    notes
) VALUES (
    'trip-ba-2026',
    'user-admin-jools',
    'Buenos Aires 2026',
    'Buenos Aires',
    'AR',
    '🇦🇷',
    '2026-10-10',
    '2026-10-23',
    'USD',
    'ARS',
    1540,
    1000,
    true,
    'Viaje principal a Buenos Aires con itinerario día por día y control de gastos.'
)
ON CONFLICT (id) DO NOTHING;

-- 3. VINCULAR LAS ACTIVIDADES EXISTENTES AL VIAJE Y USUARIO
ALTER TABLE public.activities 
ADD COLUMN IF NOT EXISTS trip_id TEXT DEFAULT 'trip-ba-2026',
ADD COLUMN IF NOT EXISTS user_id TEXT DEFAULT 'user-admin-jools';

-- Asignar retroactivamente cualquier fila nula al viaje de Buenos Aires
UPDATE public.activities 
SET trip_id = 'trip-ba-2026' 
WHERE trip_id IS NULL;

UPDATE public.activities 
SET user_id = 'user-admin-jools' 
WHERE user_id IS NULL;

-- 4. VINCULAR LOS GASTOS EXISTENTES AL VIAJE Y MULTI-DIVISA
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS trip_id TEXT DEFAULT 'trip-ba-2026',
ADD COLUMN IF NOT EXISTS user_id TEXT DEFAULT 'user-admin-jools',
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'ARS',
ADD COLUMN IF NOT EXISTS amount_usd NUMERIC DEFAULT 0;

UPDATE public.expenses 
SET trip_id = 'trip-ba-2026' 
WHERE trip_id IS NULL;

UPDATE public.expenses 
SET user_id = 'user-admin-jools' 
WHERE user_id IS NULL;

-- 5. VINCULAR EL CHECKLIST AL VIAJE Y USUARIO
ALTER TABLE public.checklist 
ADD COLUMN IF NOT EXISTS trip_id TEXT DEFAULT 'trip-ba-2026',
ADD COLUMN IF NOT EXISTS user_id TEXT DEFAULT 'user-admin-jools';

UPDATE public.checklist 
SET trip_id = 'trip-ba-2026' 
WHERE trip_id IS NULL;

UPDATE public.checklist 
SET user_id = 'user-admin-jools' 
WHERE user_id IS NULL;

-- 6. ÍNDICES DE RENDIMIENTO (Búsquedas instantáneas por viaje y usuario)
CREATE INDEX IF NOT EXISTS idx_activities_trip_id ON public.activities(trip_id);
CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON public.expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_checklist_trip_id ON public.checklist(trip_id);
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON public.trips(user_id);

-- 7. HABILITAR PUBLICACIÓN REALTIME PARA LA TABLA 'trips' (De forma segura)
DO $$ 
BEGIN 
    ALTER PUBLICATION supabase_realtime ADD TABLE public.trips; 
EXCEPTION 
    WHEN duplicate_object THEN NULL;
    WHEN undefined_object THEN NULL;
END $$;

