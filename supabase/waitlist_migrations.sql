-- Migration to support Waitlist and Capacity in Move App

-- 1. Add max_capacity to move_activities
ALTER TABLE public.move_activities 
ADD COLUMN IF NOT EXISTS max_capacity INTEGER DEFAULT NULL;

-- 2. Add status to move_activity_participants
-- Values: 'joined' (has a spot), 'waitlisted' (waiting for a spot)
ALTER TABLE public.move_activity_participants 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'joined' 
CHECK (status IN ('joined', 'waitlisted'));

-- 3. Update existing participants to 'joined' (safety)
UPDATE public.move_activity_participants 
SET status = 'joined' 
WHERE status IS NULL;

-- 4. Enable RLS for the new column if needed (usually handled by table-level RLS)

COMMENT ON COLUMN public.move_activities.max_capacity IS 'Maximum number of participants allowed before waitlisting starts.';
COMMENT ON COLUMN public.move_activity_participants.status IS 'Whether the participant has a confirmed spot or is on the waitlist.';
