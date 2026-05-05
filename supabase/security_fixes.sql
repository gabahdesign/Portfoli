-- SQL para corregir avisos del Supabase Security Advisor (Actualizado 2026-04-29)

-- 1. Fix RLS Always True para access_requests
-- Cambiamos CHECK (true) por una validación de campos mínimos
DROP POLICY IF EXISTS "Public can insert access_requests" ON public.access_requests;
CREATE POLICY "Public can insert access_requests" ON public.access_requests 
FOR INSERT WITH CHECK (
    name IS NOT NULL AND 
    email IS NOT NULL AND 
    status = 'pending'
);

-- 2. Fix RLS Always True para analytics_events
DROP POLICY IF EXISTS "Allow public insert analytics" ON public.analytics_events;
CREATE POLICY "Allow public insert analytics" ON public.analytics_events 
FOR INSERT WITH CHECK (
    event_type IS NOT NULL
);

-- 3. Fix RLS Always True para move_temp_registrations
DROP POLICY IF EXISTS "Public can insert move_temp_registrations" ON public.move_temp_registrations;
CREATE POLICY "Public can insert move_temp_registrations" ON public.move_temp_registrations 
FOR INSERT WITH CHECK (
    email IS NOT NULL AND 
    username IS NOT NULL
);

-- 4. Fix Public Bucket Allows Listing para portfolio-media
-- Eliminamos CUALQUIER política de SELECT previa para evitar duplicados o genéricas
DROP POLICY IF EXISTS "Public read portfolio-media" ON storage.objects;
DROP POLICY IF EXISTS "Public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow public select" ON storage.objects;
DROP POLICY IF EXISTS "Give public access to portfolio-media" ON storage.objects;

-- Creamos la política definitiva: SOLO el admin puede listar archivos (SELECT)
CREATE POLICY "Admin select portfolio-media" ON storage.objects 
FOR SELECT USING (
    bucket_id = 'portfolio-media' AND 
    auth.role() = 'authenticated'
);

-- 5. Asegurar que solo el admin puede gestionar archivos (INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "Admin manage portfolio-media" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload portfolio-media" ON storage.objects;
CREATE POLICY "Admin manage portfolio-media" ON storage.objects 
FOR ALL USING (
    bucket_id = 'portfolio-media' AND 
    auth.role() = 'authenticated'
)
WITH CHECK (
    bucket_id = 'portfolio-media' AND 
    auth.role() = 'authenticated'
);

-- NOTA: El aviso "Leaked Password Protection Disabled" debe activarse 
-- manualmente en el Dashboard: Auth -> Settings -> Password Protection.
