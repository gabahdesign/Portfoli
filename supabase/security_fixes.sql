-- SQL para corregir avisos del Supabase Security Advisor

-- 1. Fix Search Path Mutable para funciones
ALTER FUNCTION public.handle_updated_at() SET search_path = public;

-- 2. RLS Disabled in Public (Habilitar RLS en access_requests)
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;
-- Permitir acceso total al admin autenticado
DO $$ BEGIN
    CREATE POLICY "Admin full access on access_requests" ON public.access_requests FOR ALL USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
-- Permitir que el público envíe solicitudes (INSERT)
DO $$ BEGIN
    CREATE POLICY "Public can insert access_requests" ON public.access_requests FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. RLS Enabled No Policy (Añadir política a move_temp_registrations)
DO $$ BEGIN
    CREATE POLICY "Admin full access on move_temp_registrations" ON public.move_temp_registrations FOR ALL USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    CREATE POLICY "Public can insert move_temp_registrations" ON public.move_temp_registrations FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4. RLS Policy Always True (Hacer más específica la de analytics)
-- Primero borramos la genérica si existe
DROP POLICY IF EXISTS "Insert analytics freely" ON public.analytics_events;
-- Creamos una específica solo para INSERT
DO $$ BEGIN
    CREATE POLICY "Allow public insert analytics" ON public.analytics_events FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    CREATE POLICY "Admin can view analytics" ON public.analytics_events FOR SELECT USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- NOTA: Para el aviso "Public Bucket Allows Listing" en storage.portfolio-media, 
-- debes ir a la UI de Supabase -> Storage -> Buckets -> portfolio-media -> Edit Bucket 
-- y asegurar que "Public" esté marcado, pero en las Políticas de RLS de Storage, 
-- la política de SELECT debe ser restrictiva o simplemente asegurar que no permites LISTAR (solo descargar por URL).
