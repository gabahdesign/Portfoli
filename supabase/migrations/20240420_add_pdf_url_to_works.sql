-- Add PDF support to projects
ALTER TABLE public.works ADD COLUMN IF NOT EXISTS pdf_url TEXT;
