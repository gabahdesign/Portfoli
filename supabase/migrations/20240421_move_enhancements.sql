-- 20240421_move_enhancements.sql
-- Enhancements for Move module: WhatsApp links and Subcategories

-- 1. ADD WHATSAPP LINK TO ACTIVITIES
ALTER TABLE public.move_activities ADD COLUMN IF NOT EXISTS whatsapp_link TEXT;

-- 2. CREATE SUBCATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.move_subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.move_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(category_id, name)
);

-- 3. ADD SUBCATEGORY TO ACTIVITIES
ALTER TABLE public.move_activities ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES public.move_subcategories(id) ON DELETE SET NULL;

-- 4. RLS for SUBCATEGORIES
ALTER TABLE public.move_subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subcategories are viewable by everyone" ON public.move_subcategories FOR SELECT USING (true);
CREATE POLICY "Admins can manage subcategories" ON public.move_subcategories FOR ALL USING (auth.role() = 'authenticated');
