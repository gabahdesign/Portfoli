import { Activity, Lock } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { MoveCalendar } from "@/components/move/MoveCalendar";

export default async function MovePage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const isAdmin = !!session;

  const { data: groups } = await supabase.from("move_groups").select("*").order("sort_order", { ascending: true });
  const { data: categories } = await supabase.from("move_categories").select("*").order("name", { ascending: true });
  
  // Fetch basic activity data first to be resilient to missing participation tables
  const { data: activitiesData } = await supabase
    .from("move_activities")
    .select(`
      *, 
      move_categories(name, move_groups(accent_color))
    `)
    .order("start_datetime", { ascending: true });

  // If there are activities, try to fetch participants separately
  let activities = activitiesData || [];
  if (activities.length > 0) {
    const { data: participants } = await supabase
      .from("move_activity_participants")
      .select(`
        activity_id,
        move_profiles(username)
      `);
    
    // Merge participants into activities if available
    if (participants) {
      activities = activities.map(act => ({
        ...act,
        move_activity_participants: participants.filter(p => p.activity_id === act.id)
      }));
    }
  }
    
  // Get move profile if logged in
  let moveProfile = null;
  if (session) {
    const { data: profile } = await supabase
      .from("move_profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle();
    moveProfile = profile;
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-10 py-12 md:py-20 animate-in fade-in duration-700" id="move-page-top">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 border-b border-[var(--color-border)] pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 text-[var(--color-accent)] text-[10px] font-black uppercase tracking-widest mb-6">
             <Activity size={12} className="animate-pulse" /> Move Activity Hub
          </div>
          <h1 className="font-display text-6xl md:text-8xl font-black text-[var(--color-text)] tracking-tighter lowercase leading-[0.8]">
            move<span className="text-[var(--color-accent)]">.</span>
          </h1>
          <p className="text-[var(--color-muted)] mt-4 max-w-xl font-medium leading-relaxed">
            Gestió integrada d&apos;activitats, entrenaments i progrés. Una eina dissenyada per a l&apos;optimització del rendiment.
          </p>
        </div>
        
        <div className="flex gap-3">
            {!isAdmin && (
              <Link 
                href="/admin" 
                className="flex items-center gap-2 px-8 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-accent)] rounded-xl text-sm font-bold transition-all shadow-lg"
              >
                <Lock size={16} /> Admin Access
              </Link>
            )}
        </div>
      </div>

      <MoveCalendar 
        isAdmin={isAdmin}
        user={session?.user || null}
        profile={moveProfile}
        groups={groups || []} 
        categories={categories || []} 
        activities={activities || []}
      />
    </div>
  );
}
