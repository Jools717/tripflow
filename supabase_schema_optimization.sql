-- ============================================================================
-- TRIPFLOW: OPTIMIZACIÓN RELACIONAL Y REFUERZO DE INTEGRIDAD (FASE 6)
-- Agrega claves foráneas ON DELETE CASCADE y columnas faltantes para trazabilidad
-- ============================================================================

-- 1. AGREGAR COLUMNA 'activity_id' EN EXPENSES (Para rastrear gastos espejo del itinerario)
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS activity_id TEXT;

-- 2. VINCULAR 'media_manager' AL VIAJE Y USUARIO (Para fotos y tickets OCR)
ALTER TABLE public.media_manager 
ADD COLUMN IF NOT EXISTS trip_id TEXT DEFAULT 'trip-ba-2026',
ADD COLUMN IF NOT EXISTS user_id TEXT DEFAULT 'user-admin-jools';

-- 3. AGREGAR CLAVES FORÁNEAS (Foreign Keys) CON CASCADA
-- Asegura que si se elimina un viaje, sus datos no queden huérfanos

DO $$ 
BEGIN 
    -- FK activities -> trips
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_activities_trip') THEN
        ALTER TABLE public.activities 
        ADD CONSTRAINT fk_activities_trip 
        FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE CASCADE;
    END IF;

    -- FK expenses -> trips
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_expenses_trip') THEN
        ALTER TABLE public.expenses 
        ADD CONSTRAINT fk_expenses_trip 
        FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE CASCADE;
    END IF;

    -- FK checklist -> trips
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_checklist_trip') THEN
        ALTER TABLE public.checklist 
        ADD CONSTRAINT fk_checklist_trip 
        FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. ÍNDICE ADICIONAL PARA GASTOS ESPEJO
CREATE INDEX IF NOT EXISTS idx_expenses_activity_id ON public.expenses(activity_id);
CREATE INDEX IF NOT EXISTS idx_media_manager_trip_id ON public.media_manager(trip_id);

