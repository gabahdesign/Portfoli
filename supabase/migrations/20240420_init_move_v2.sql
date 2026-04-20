-- Move Dashboard v2 Migration

-- 1. GROUPS
CREATE TABLE IF NOT EXISTS public.move_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    icon_key TEXT NOT NULL,
    accent_color TEXT DEFAULT '#843aea',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS public.move_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES public.move_groups(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon_key TEXT,
    is_custom BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ACTIVITIES
CREATE TABLE IF NOT EXISTS public.move_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.move_categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ,
    location TEXT,
    location_coords JSONB, -- {lat, lng}
    metadata JSONB DEFAULT '{}'::jsonb, -- dynamic fields (distancia, dificultat...)
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.move_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.move_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.move_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Move groups are public" ON public.move_groups FOR SELECT USING (true);
CREATE POLICY "Move categories are public" ON public.move_categories FOR SELECT USING (true);
CREATE POLICY "Move activities are public" ON public.move_activities FOR SELECT USING (true);

-- Admin editing
CREATE POLICY "Admin full access move_groups" ON public.move_groups FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access move_categories" ON public.move_categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access move_activities" ON public.move_activities FOR ALL USING (auth.role() = 'authenticated');

-- 4. SEEDING GROUPS & CATEGORIES
DO $$
DECLARE
    g_muntanya UUID;
    g_aigua UUID;
    g_esport UUID;
    g_tradicio UUID;
    g_art UUID;
    g_social UUID;
    g_skill UUID;
    g_gastro UUID;
    g_lleure UUID;
    g_ninxol UUID;
BEGIN
    -- Insert groups and store IDs
    INSERT INTO public.move_groups (name, icon_key, accent_color, sort_order) VALUES ('Muntanya i Natura', 'Mountain', '#35ca35', 1) RETURNING id INTO g_muntanya;
    INSERT INTO public.move_groups (name, icon_key, accent_color, sort_order) VALUES ('Aigua i Aventura', 'Waves', '#48CAE4', 2) RETURNING id INTO g_aigua;
    INSERT INTO public.move_groups (name, icon_key, accent_color, sort_order) VALUES ('Esport i Benestar', 'Zap', '#FF85A1', 3) RETURNING id INTO g_esport;
    INSERT INTO public.move_groups (name, icon_key, accent_color, sort_order) VALUES ('Cultura Popular i Tradició', 'Flag', '#FF6B35', 4) RETURNING id INTO g_tradicio;
    INSERT INTO public.move_groups (name, icon_key, accent_color, sort_order) VALUES ('Art, Música i Escena', 'Music', '#B5838D', 5) RETURNING id INTO g_art;
    INSERT INTO public.move_groups (name, icon_key, accent_color, sort_order) VALUES ('Social, Política i Voluntariat', 'Users', '#c61111', 6) RETURNING id INTO g_social;
    INSERT INTO public.move_groups (name, icon_key, accent_color, sort_order) VALUES ('Skill-up i Tecnologia', 'Cpu', '#0092ac', 7) RETURNING id INTO g_skill;
    INSERT INTO public.move_groups (name, icon_key, accent_color, sort_order) VALUES ('Gastronomia i Tasts', 'Utensils', '#be8428', 8) RETURNING id INTO g_gastro;
    INSERT INTO public.move_groups (name, icon_key, accent_color, sort_order) VALUES ('Lleure i Vida Social', 'Beer', '#ffce0b', 9) RETURNING id INTO g_lleure;
    INSERT INTO public.move_groups (name, icon_key, accent_color, sort_order) VALUES ('Hàbits, Ciència i Ninxol', 'Search', '#111111', 10) RETURNING id INTO g_ninxol;

    -- Insert Categories for Group 1 (Muntanya)
    INSERT INTO public.move_categories (group_id, name) VALUES 
    (g_muntanya, 'Rutes i Senders'), (g_muntanya, 'BTT i Ciclisme'), (g_muntanya, 'Alta Muntanya'), (g_muntanya, 'Alpinisme'), 
    (g_muntanya, 'Escalada Clàssica'), (g_muntanya, 'Vies Ferrades'), (g_muntanya, 'Trail Running'), (g_muntanya, 'Banys de Bosc'), 
    (g_muntanya, 'Supervivència / Bushcraft'), (g_muntanya, 'Astronomia i Observació');

    -- Insert Categories for Group 2 (Aigua i Aventura)
    INSERT INTO public.move_categories (group_id, name) VALUES 
    (g_aigua, 'Surf'), (g_aigua, 'Caiac i Rem'), (g_aigua, 'Paddle Surf'), (g_aigua, 'Natació Aigües Obertes'), 
    (g_aigua, 'Barranquisme'), (g_aigua, 'Espeleologia'), (g_aigua, 'Parapent / Vol'), (g_aigua, 'Puenting / Salt'), 
    (g_aigua, 'Motor (4x4 / Enduro)'), (g_aigua, 'Arena i Neu');

    -- Insert Categories for Group 3 (Esport i Benestar)
    INSERT INTO public.move_categories (group_id, name) VALUES 
    (g_esport, 'Ioga'), (g_esport, 'Meditació i Mindfulness'), (g_esport, 'Pilates'), (g_esport, 'CrossFit'), 
    (g_esport, 'Fitness / Gimnàs'), (g_esport, 'Rocòdrom'), (g_esport, 'Natació Piscina'), (g_esport, 'Pàdel'), 
    (g_esport, 'Tennis'), (g_esport, 'Arts Marcials');

    -- Insert Categories for Group 4 (Tradició)
    INSERT INTO public.move_categories (group_id, name) VALUES 
    (g_tradicio, 'Cultura Popular Catalana'), (g_tradicio, 'Castellers'), (g_tradicio, 'Diables i Correfocs'), 
    (g_tradicio, 'Gegants i Capgrossos'), (g_tradicio, 'Bastoners'), (g_tradicio, 'Grallers i Tabalers'), 
    (g_tradicio, 'Falcons i Muixerangues'), (g_tradicio, 'Fires i Mercats'), (g_tradicio, 'Mercats Medievals'), 
    (g_tradicio, 'Pessebres Vivents'), (g_tradicio, 'Tradicions Temporals'), (g_tradicio, 'Festivitat Nacional');

    -- Insert Categories for Group 5 (Art)
    INSERT INTO public.move_categories (group_id, name) VALUES 
    (g_art, 'Museus i Exposicions'), (g_art, 'Cinema i Documentals'), (g_art, 'Teatre i Arts Escèniques'), 
    (g_art, 'Concerts (Live Music)'), (g_art, 'Festivals de Música'), (g_art, 'Fotografia'), (g_art, 'Disseny i Art Digital'), 
    (g_art, 'Pintura i Belles Arts'), (g_art, 'Escultura'), (g_art, 'Arquitectura');

    -- Insert Categories for Group 6 (Social)
    INSERT INTO public.move_categories (group_id, name) VALUES 
    (g_social, 'Cultura Política i Social'), (g_social, 'Debats i Taules Rodones'), (g_social, 'Idiomes (Intercanvi)'), 
    (g_social, 'Voluntariat Social'), (g_social, 'Voluntariat Animal'), (g_social, 'Voluntariat Ambiental'), 
    (g_social, 'Activisme'), (g_social, 'Psicologia'), (g_social, 'Nutrició'), (g_social, 'Solidaritat');

    -- Insert Categories for Group 7 (Skill-up)
    INSERT INTO public.move_categories (group_id, name) VALUES 
    (g_skill, 'Intel·ligència Artificial'), (g_skill, 'Podcasting'), (g_skill, 'Creació de Continguts'), 
    (g_skill, 'Programació'), (g_skill, 'Networking'), (g_skill, 'Coworking'), (g_skill, 'Masterclasses'), 
    (g_skill, 'Inversions'), (g_skill, 'Ciberseguretat'), (g_skill, 'Màrqueting');

    -- Insert Categories for Group 8 (Gastro)
    INSERT INTO public.move_categories (group_id, name) VALUES 
    (g_gastro, 'Tast de Vins'), (g_gastro, 'Tast de Cerveses'), (g_gastro, 'Tast de Formatges'), (g_gastro, 'Tast de Xocolata'), 
    (g_gastro, 'Cuina Tradicional'), (g_gastro, 'Cuina Vegana'), (g_gastro, 'Cuina Internacional'), (g_gastro, 'Cocteleria'), 
    (g_gastro, 'Brunch'), (g_gastro, 'Alta Gastronomia');

    -- Insert Categories for Group 9 (Lleure)
    INSERT INTO public.move_categories (group_id, name) VALUES 
    (g_lleure, 'Vermut i Aperitiu'), (g_lleure, 'Sopars Temàtics'), (g_lleure, 'Cafè i Conversa'), 
    (g_lleure, 'Viatges i Escapades'), (g_lleure, 'Festa'), (g_lleure, 'Karaoke'), (g_lleure, 'Jocs de Taula'), 
    (g_lleure, 'Gaming'), (g_lleure, 'Poker'), (g_lleure, 'Pícnics');

    -- Insert Categories for Group 10 (Ninxol)
    INSERT INTO public.move_categories (group_id, name) VALUES 
    (g_ninxol, 'Escacs'), (g_ninxol, 'Màgia'), (g_ninxol, 'Drons'), (g_ninxol, 'Modelisme'), 
    (g_ninxol, 'Radioaficionats'), (g_ninxol, 'Ciència'), (g_ninxol, 'Robòtica'), (g_ninxol, 'Altres');

END $$;
