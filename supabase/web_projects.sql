-- SQL for Web Projects Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.web_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    url TEXT,
    download_url TEXT,
    type TEXT DEFAULT 'ia', -- 'ia' or 'manual'
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

-- RLS
ALTER TABLE public.web_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active web projects" 
ON public.web_projects FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admin can manage web projects" 
ON public.web_projects FOR ALL 
USING (auth.role() = 'authenticated');

-- Initial Data: Impostor Game
INSERT INTO public.web_projects (title, description, url, download_url, type, "order")
VALUES (
    'Impostor Game', 
    'Un joc d''intriga i deducció social totalment creat amb intel·ligència artificial. Posa a prova la teva capacitat d''engany.',
    '/webs/impostor/index.html',
    '/webs/impostor/impostor-game.zip',
    'ia',
    1
) ON CONFLICT DO NOTHING;
