"use client";

import { useState, useMemo } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Search,
  LayoutGrid,
  List as ListIcon,
  Map as MapIcon
} from "lucide-react";
import { clsx } from "clsx";
import { ActivityModal } from "./ActivityModal";

interface MoveCalendarProps {
  isAdmin?: boolean;
  groups: any[];
  categories: any[];
  activities: any[];
}

export function MoveCalendar({ isAdmin, groups, categories, activities }: MoveCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editActivity, setEditActivity] = useState<any>(null);
  const [initialDate, setInitialDate] = useState<Date>(new Date());

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    
    // Adjust firstDay to start from Monday (0: Mon, 1: Tue...)
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
    
    return { adjustedFirstDay, days };
  }, [currentDate]);

  const monthName = currentDate.toLocaleString('ca-ES', { month: 'long' });
  const year = currentDate.getFullYear();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="space-y-8">
      {/* 1. CONTROLS HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-[var(--color-surface)] p-6 rounded-3xl border border-[var(--color-border)] shadow-xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={handlePrevMonth}
            className="p-2 hover:bg-[var(--color-surface-2)] rounded-xl transition-colors border border-[var(--color-border)]"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-center min-w-[150px]">
            <h2 className="text-xl font-display font-black capitalize tracking-tight">
              {monthName} <span className="text-[var(--color-accent)] opacity-50">{year}</span>
            </h2>
          </div>
          <button 
            onClick={handleNextMonth}
            className="p-2 hover:bg-[var(--color-surface-2)] rounded-xl transition-colors border border-[var(--color-border)]"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2 bg-[var(--color-surface-2)] p-1.5 rounded-2xl border border-[var(--color-border)]">
          <button 
            onClick={() => setViewMode('grid')}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
              viewMode === 'grid' ? "bg-[var(--color-accent)] text-white shadow-lg" : "text-[var(--color-muted)] hover:text-white"
            )}
          >
            <LayoutGrid size={14} /> Graella
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
              viewMode === 'list' ? "bg-[var(--color-accent)] text-white shadow-lg" : "text-[var(--color-muted)] hover:text-white"
            )}
          >
            <ListIcon size={14} /> Agenda
          </button>
        </div>

        <div className="flex gap-3">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" size={14} />
             <input 
               type="text" 
               placeholder="Cerca activitats..." 
               className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl pl-9 pr-4 py-2.5 text-xs outline-none focus:border-[var(--color-accent)] transition-all w-48"
             />
           </div>
           {isAdmin && (
             <button 
              onClick={() => {
                setEditActivity(null);
                setInitialDate(currentDate);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 bg-[var(--color-accent)] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-[var(--color-accent-glow)] hover:scale-105 transition-all"
             >
               <Plus size={16} /> Nou
             </button>
           )}
        </div>
      </div>

      {/* 2. CALENDAR GRID */}
      {viewMode === 'grid' ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="grid grid-cols-7 gap-px bg-[var(--color-border)] border border-[var(--color-border)] rounded-3xl overflow-hidden shadow-2xl">
            {/* Day Names */}
            {["Dl", "Dt", "Dc", "Dj", "Dv", "Ds", "Dg"].map(d => (
              <div key={d} className="bg-[var(--color-surface-2)] p-4 text-center text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)]">
                {d}
              </div>
            ))}
            
            {/* Empty cells before month start */}
            {Array.from({ length: daysInMonth.adjustedFirstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-[var(--color-bg)]/50 min-h-[140px] opacity-20" />
            ))}

            {/* Actual Days */}
            {Array.from({ length: daysInMonth.days }).map((_, i) => {
              const day = i + 1;
              const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
              const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              
              return (
                <div 
                  key={day} 
                  onClick={() => {
                    if (isAdmin) {
                       setEditActivity(null);
                       setInitialDate(dayDate);
                       setIsModalOpen(true);
                    }
                  }}
                  className={clsx(
                    "bg-[var(--color-surface)] p-4 min-h-[140px] border-t border-[var(--color-border)] transition-all hover:bg-[var(--color-surface-2)] relative group cursor-pointer",
                    isToday && "bg-[var(--color-accent-subtle)]/5"
                  )}
                >
                  <span className={clsx(
                    "text-xs font-bold mb-4 block transition-colors",
                    isToday ? "text-[var(--color-accent)]" : "text-[var(--color-muted)]",
                    "group-hover:text-white"
                  )}>
                    {day}
                  </span>

                  {/* Rendering Real Activities */}
                  <div className="space-y-1.5">
                    {activities
                      .filter(act => {
                        const actDate = new Date(act.start_datetime);
                        return actDate.getDate() === day && 
                               actDate.getMonth() === currentDate.getMonth() && 
                               actDate.getFullYear() === currentDate.getFullYear();
                      })
                      .map(act => (
                        <div 
                          key={act.id} 
                          onClick={(e) => {
                             if (isAdmin) {
                               e.stopPropagation();
                               setEditActivity(act);
                               setInitialDate(new Date(act.start_datetime));
                               setIsModalOpen(true);
                             }
                          }}
                          className="px-2 py-1.5 rounded-lg border text-[9px] font-bold truncate transition-all hover:scale-[1.02]"
                          style={{ 
                            backgroundColor: (act.move_categories?.move_groups?.accent_color || '#843aea') + '15',
                            borderColor: (act.move_categories?.move_groups?.accent_color || '#843aea') + '30',
                            color: act.move_categories?.move_groups?.accent_color || '#843aea'
                          }}
                        >
                          {act.title}
                        </div>
                      ))
                    }
                  </div>

                  {isAdmin && (
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="p-1.5 bg-[var(--color-accent)] text-white rounded-lg shadow-lg">
                        <Plus size={12} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in duration-500 space-y-4">
          <div className="bg-[var(--color-surface)] p-8 rounded-3xl border border-[var(--color-border)] text-center text-[var(--color-muted)]">
            <CalendarIcon className="mx-auto mb-4 opacity-20" size={48} />
            <p className="font-medium">No hi ha activitats programades per a aquesta setmana.</p>
          </div>
        </div>
      )}

      {/* 3. MODAL */}
      <ActivityModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        groups={groups}
        categories={categories}
        editActivity={editActivity}
        initialDate={initialDate}
      />
    </div>
  );
}
