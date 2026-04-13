-- Migration: Add Sub-companies and Project Visibility
-- Run this in your Supabase SQL Editor

-- 1. Add parent_id to companies for sub-company support
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.companies(id) ON DELETE SET NULL;

-- 2. Add visibility type to works
-- We'll use this to distinguish 'pràctiques' from others
ALTER TABLE public.works ADD COLUMN IF NOT EXISTS visibility_type TEXT DEFAULT 'private';
-- Options: 'private', 'public_token', 'public_always' (for pràctiques)

-- 3. Create blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT, -- Markdown or HTML
    cover_url TEXT,
    is_premium BOOLEAN DEFAULT false,
    stripe_price_id TEXT,
    published_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- RLS for Blog Posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read blog posts" ON public.blog_posts FOR SELECT USING (true);
CREATE POLICY "Admin can manage blog posts" ON public.blog_posts FOR ALL USING (auth.role() = 'authenticated');
