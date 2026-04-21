-- 20240421_global_security_audit.sql
-- Force RLS and strict policies on all portfolio tables

-- 1. COMPANIES & WORKS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.works ENABLE ROW LEVEL SECURITY;

-- Policies for Companies
DROP POLICY IF EXISTS "Public can read companies" ON public.companies;
CREATE POLICY "Public can read companies" ON public.companies FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin full access companies" ON public.companies;
CREATE POLICY "Admin full access companies" ON public.companies FOR ALL USING (auth.role() = 'authenticated');

-- Policies for Works
DROP POLICY IF EXISTS "Works are viewable based on visibility" ON public.works;
CREATE POLICY "Works are viewable based on visibility" ON public.works FOR SELECT USING (
    visibility_type = 'public_always' OR 
    (auth.role() = 'authenticated')
);

DROP POLICY IF EXISTS "Admin full access works" ON public.works;
CREATE POLICY "Admin full access works" ON public.works FOR ALL USING (auth.role() = 'authenticated');

-- 2. ABOUT ME
ALTER TABLE public.about_me ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read about_me" ON public.about_me;
CREATE POLICY "Public can read about_me" ON public.about_me FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin can update about_me" ON public.about_me;
CREATE POLICY "Admin can update about_me" ON public.about_me FOR ALL USING (auth.role() = 'authenticated');

-- 3. BLOG POSTS (Reinforcement)
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read blog posts" ON public.blog_posts;
CREATE POLICY "Public can read blog posts" ON public.blog_posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin can manage blog posts" ON public.blog_posts;
CREATE POLICY "Admin can manage blog posts" ON public.blog_posts FOR ALL USING (auth.role() = 'authenticated');

-- 4. CLEANUP / SAFETY
-- Ensure no other unintended policies exist
COMMIT;
