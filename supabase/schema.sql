-- Portfolio Supabase Schema

-- Modificaciones previas: asegurar existencia de UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum types para el futuro
CREATE TYPE work_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE cv_section_type AS ENUM ('experiencia', 'educacion', 'habilidades', 'idiomas', 'sobre_mi');

-- 1. COMPANIES
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    logo_url TEXT,
    description TEXT,
    sector TEXT,
    location TEXT,
    start_date DATE,
    end_date DATE,
    website TEXT,
    is_freelance BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. WORKS
CREATE TABLE public.works (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    cover_url TEXT,
    summary TEXT,
    content JSONB,
    tags TEXT[],
    work_date DATE,
    status work_status DEFAULT 'draft',
    featured BOOLEAN DEFAULT false,
    protected BOOLEAN DEFAULT false,
    pin_hash TEXT,
    version_history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ABOUT ME
CREATE TABLE public.about_me (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    photo_url TEXT,
    tagline JSONB,
    bio JSONB,
    email TEXT,
    phone TEXT,
    location TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. CV SECTIONS
CREATE TABLE public.cv_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type cv_section_type NOT NULL,
    title JSONB,
    content JSONB,
    sort_order INT DEFAULT 0
);

-- 5. ACCESS TOKENS
CREATE TABLE public.access_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex'),
    label TEXT NOT NULL,
    welcome_message JSONB,
    company_ids UUID[],
    active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    notify_email BOOLEAN DEFAULT true,
    pin_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. ANALYTICS EVENTS
CREATE TABLE public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id UUID REFERENCES public.access_tokens(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    resource_id UUID,
    page_path TEXT,
    referrer TEXT,
    duration_sec INT,
    scroll_pct INT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ROW LEVEL SECURITY (RLS)
-- Activar RLS en todas las tablas
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_me ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Políticas públicas (solo lectura iterando)
CREATE POLICY "Public profiles are viewable by everyone" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Public works are viewable by everyone" ON public.works FOR SELECT USING (true);
CREATE POLICY "Public about_me viewable by everyone" ON public.about_me FOR SELECT USING (true);
CREATE POLICY "Public cv_sections viewable by everyone" ON public.cv_sections FOR SELECT USING (true);
CREATE POLICY "Tokens viewable for verification" ON public.access_tokens FOR SELECT USING (true);
-- Analytics puede insertar eventos anónimamente (pero requiere service rol / edge function idealmente)
CREATE POLICY "Insert analytics freely" ON public.analytics_events FOR INSERT WITH CHECK (true);

-- Políticas Privadas (Permiten Crear, Editar y Eliminar solo si estás logueado en /admin)
CREATE POLICY "Admin full access on companies" ON public.companies FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access on works" ON public.works FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access on about_me" ON public.about_me FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access on cv_sections" ON public.cv_sections FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access on access_tokens" ON public.access_tokens FOR ALL USING (auth.role() = 'authenticated');

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio-media', 'portfolio-media', true) ON CONFLICT DO NOTHING;

-- Storage RLS: cualquiera puede leer (fotos públicas en portfolio)
CREATE POLICY "Public read portfolio-media" ON storage.objects FOR SELECT USING (bucket_id = 'portfolio-media');

-- Storage RLS: solo admin autenticado puede subir/borrar
CREATE POLICY "Admin upload portfolio-media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'portfolio-media' AND auth.role() = 'authenticated');
CREATE POLICY "Admin delete portfolio-media" ON storage.objects FOR DELETE USING (bucket_id = 'portfolio-media' AND auth.role() = 'authenticated');
