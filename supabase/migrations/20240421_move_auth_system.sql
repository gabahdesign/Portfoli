-- 20240421_move_auth_system.sql
-- Registration and Participation system for Move

-- 1. PROFILES (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.move_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    surname TEXT NOT NULL,
    phone TEXT,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. ACTIVITY PARTICIPANTS
CREATE TABLE IF NOT EXISTS public.move_activity_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID REFERENCES public.move_activities(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.move_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(activity_id, profile_id)
);

-- 3. TEMP REGISTRATIONS (For 6-digit verification flow)
CREATE TABLE IF NOT EXISTS public.move_temp_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    verification_code TEXT NOT NULL,
    payload JSONB NOT NULL, -- Stores name, surname, phone, location, hashed_password
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. RLS
ALTER TABLE public.move_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.move_activity_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.move_temp_registrations ENABLE ROW LEVEL SECURITY;

-- Policies for Profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.move_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.move_profiles FOR UPDATE USING (auth.uid() = id);

-- Policies for Participants
CREATE POLICY "Participants are viewable by everyone" ON public.move_activity_participants FOR SELECT USING (true);
CREATE POLICY "Logged in users can join activities" ON public.move_activity_participants FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.move_profiles WHERE id = auth.uid())
);
CREATE POLICY "Users can leave their own activities" ON public.move_activity_participants FOR DELETE USING (
    profile_id = auth.uid()
);

-- 5. FUNCTION TO UPDATE UPDATED_AT
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.move_profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
