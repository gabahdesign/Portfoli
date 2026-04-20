import { Heatmap } from "@/components/portfolio/Heatmap";
import { getLocale, getTranslations } from "next-intl/server";
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Activity, Zap, MessageSquare, Lock } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { MoveCalendar } from "@/components/move/MoveCalendar";
import { MoveMap } from "@/components/move/MoveMap";

export default async function MovePage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const isAdmin = !!session;

  const { data: groups } = await supabase.from("move_groups").select("*").order("sort_order", { ascending: true });
  const { data: categories } = await supabase.from("move_categories").select("*").order("name", { ascending: true });
  const { data: activities } = await supabase.from("move_activities").select("*, move_categories(name, move_groups(accent_color))").order("start_datetime", { ascending: true });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-10 py-12 md:py-20 animate-in fade-in duration-700">
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
        groups={groups || []} 
        categories={categories || []} 
        activities={activities || []}
      />

      {/* 3. FIELD MAP */}
      <div className="mt-20">
        <div className="mb-10">
          <h2 className="text-2xl font-display font-black text-[var(--color-text)] tracking-tight">Geolocalització</h2>
          <p className="text-[var(--color-muted)] text-sm">Visualització de les activitats sobre el terreny per a una millor planificació logística.</p>
        </div>
        <MoveMap activities={activities || []} />
      </div>

      {/* 4. FOOTER HEATMAP */}
      <div className="pt-20 border-t border-[var(--color-border)]">
        <div className="mb-10">
          <h2 className="text-2xl font-display font-black text-[var(--color-text)] tracking-tight">Evolució de Rendiment</h2>
          <p className="text-[var(--color-muted)] text-sm">Resum de la teva activitat física anual.</p>
        </div>
        <Heatmap activities={activities || []} />
      </div>
    </div>
  );
}
