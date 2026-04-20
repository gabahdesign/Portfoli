import { Heatmap } from "@/components/portfolio/Heatmap";
import { getLocale, getTranslations } from "next-intl/server";
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Activity, Zap, MessageSquare } from "lucide-react";

export default async function MovePage({ params }: { params: Promise<{ token: string }> }) {
  const locale = await getLocale();
  const t = await getTranslations("Navigation");

  // Placeholder for Move Calendar activities
  const days = ["Dilluns", "Dimarts", "Dimecres", "Dijous", "Divendres", "Dissabte", "Diumenge"];
  
  return (
    <div className="max-w-6xl mx-auto px-6 py-16 animate-in fade-in duration-700">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 border-b border-[var(--color-border)] pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 text-[var(--color-accent)] text-[10px] font-black uppercase tracking-widest mb-4">
             <Activity size={12} /> Move Activity Tracking
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-black text-[var(--color-text)] tracking-tighter lowercase">
            move<span className="text-[var(--color-accent)]">.</span>
          </h1>
          <p className="text-[var(--color-muted)] mt-4 max-w-xl font-medium leading-relaxed">
            Gestió integrada d'activitats, entrenaments i progrés. Una eina dissenyada per a l'optimització del rendiment.
          </p>
        </div>
        
        <div className="flex gap-3">
           <button className="flex items-center gap-2 px-6 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm font-bold hover:bg-[var(--color-surface-2)] transition-all">
             <ChevronLeft size={16} />
           </button>
           <button className="flex items-center gap-2 px-6 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm font-bold hover:bg-[var(--color-surface-2)] transition-all">
             <ChevronRight size={16} />
           </button>
           <button className="flex items-center gap-2 px-8 py-3 bg-[var(--color-accent)] text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-xl shadow-[var(--color-accent-glow)] hover:scale-105 transition-all">
             <Plus size={18} /> Afegir
           </button>
        </div>
      </div>

      {/* 2. MAIN CALENDAR GRID */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-px bg-[var(--color-border)] border border-[var(--color-border)] rounded-3xl overflow-hidden shadow-2xl mb-20">
        {days.map(day => (
          <div key={day} className="bg-[var(--color-surface)] p-6 min-h-[300px] flex flex-col group hover:bg-[var(--color-surface-2)] transition-colors">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] mb-6">{day}</span>
            
            <div className="flex-1 space-y-3">
               {/* Mock Activities */}
               {day === "Dilluns" && (
                 <div className="p-3 bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 rounded-xl">
                   <div className="flex items-center gap-2 text-[var(--color-accent)] mb-1">
                     <Zap size={10} />
                     <span className="text-[9px] font-black uppercase">Entrenament</span>
                   </div>
                   <p className="text-[11px] font-bold">Resistència 45'</p>
                 </div>
               )}
               
               {day === "Dimecres" && (
                 <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                   <div className="flex items-center gap-2 text-[var(--color-muted)] mb-1">
                     <CalendarIcon size={10} />
                     <span className="text-[9px] font-black uppercase">Planificació</span>
                   </div>
                   <p className="text-[11px] font-bold">Sessió Tècnica</p>
                 </div>
               )}

               {day === "Divendres" && (
                 <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                   <div className="flex items-center gap-2 text-amber-500 mb-1">
                     <MessageSquare size={10} />
                     <span className="text-[9px] font-black uppercase">Revisió</span>
                   </div>
                   <p className="text-[11px] font-bold">Feedback Coach</p>
                 </div>
               )}
            </div>

            <button className="mt-4 p-2 rounded-lg border border-dashed border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center">
               <Plus size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* 3. FOOTER HEATMAP */}
      <div className="pt-20 border-t border-[var(--color-border)]">
        <div className="mb-10">
          <h2 className="text-2xl font-display font-black text-[var(--color-text)] tracking-tight">Activitat de Desenvolupament</h2>
          <p className="text-[var(--color-muted)] text-sm">Resum anual de contribucions i activitat registrada a Move.</p>
        </div>
        <Heatmap />
      </div>
    </div>
  );
}
