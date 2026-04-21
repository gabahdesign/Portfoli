"use client";

import { useState, useEffect } from "react";

export function Heatmap({ activities }: { activities?: any[] }) {
  const [activityData, setActivityData] = useState<{ level: number, count?: number, date?: string }[][]>([]);
  const [totalActivities, setTotalActivities] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const counts: Record<string, number> = {};
    if (activities) {
      activities.forEach(a => {
         if (!a.start_datetime) return;
         const d = new Date(a.start_datetime);
         // local YYYY-MM-DD
         const dateString = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
         counts[dateString] = (counts[dateString] || 0) + 1;
      });
      setTotalActivities(activities.length);
    }

    const data = [];
    const today = new Date();
    // JS getDay(): Sun=0, Mon=1...
    // Make Mon=0, Sun=6
    const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
    
    // Go back 51 full weeks plus the days into the current week
    const currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() - (51 * 7) - dayOfWeek);

    for (let w = 0; w < 52; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}-${String(currentDate.getDate()).padStart(2,'0')}`;
        const count = counts[dateStr] || 0;
        
        let level = 0;
        if (count === 1) level = 1;
        else if (count === 2) level = 2;
        else if (count === 3) level = 3;
        else if (count >= 4) level = 4;

        if (currentDate > today) {
           week.push({ level: -1 }); // disabled/future
        } else {
           week.push({ level, count, date: dateStr });
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      data.push(week);
    }
    setActivityData(data);
  }, [activities]);

  if (!mounted) return (
    <div className="w-full bg-[var(--color-surface-2)] p-6 rounded-2xl border border-[var(--color-border)] shadow-xl h-[240px] animate-pulse" />
  );

  const getLevelColor = (level: number) => {
    if (level === -1) return "bg-transparent";
    switch(level) {
      case 0: return "bg-white/5 border border-white/5";
      case 1: return "bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/10";
      case 2: return "bg-[var(--color-accent)]/40 border border-[var(--color-accent)]/20";
      case 3: return "bg-[var(--color-accent)]/70 border border-[var(--color-accent)]/40";
      case 4: return "bg-[var(--color-accent)] border border-[var(--color-accent)] shadow-[0_0_10px_var(--color-accent)]";
      default: return "bg-white/5 border border-white/5";
    }
  };

  return (
    <div className="w-full bg-[var(--color-surface-2)] p-6 rounded-2xl border border-[var(--color-border)] shadow-xl overflow-x-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h3 className="text-lg font-display font-bold text-[var(--color-text)] tracking-tight">Activitat Física (Move)</h3>
           <p className="text-xs text-[var(--color-muted)] font-mono mt-1">{totalActivities} activitats registrades en total</p>
        </div>
      </div>
      
      <div className="min-w-[800px]">
        <div className="flex gap-1">
          {/* Y axis labels */}
          <div className="flex flex-col justify-between gap-1 text-[9px] text-[var(--color-muted)] font-medium uppercase py-1 pr-2">
            <span>Dill</span>
            <span>Dim</span>
            <span>Div</span>
          </div>
          
          {/* Grid */}
          <div className="flex gap-1 flex-1">
            {activityData.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1">
                {week.map((day, dIdx) => (
                  <div 
                    key={dIdx} 
                    className={`w-[11px] h-[11px] rounded-[2px] transition-all hover:scale-125 hover:z-10 ${day.level !== -1 ? 'cursor-crosshair' : ''} ${getLevelColor(day.level)}`} 
                    title={day.level !== -1 ? `${day.count} activitats el ${day.date}` : ''}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex justify-end items-center gap-2 text-[10px] text-[var(--color-muted)] font-medium">
          <span>Menys</span>
          <div className="flex gap-1">
            <div className="w-[11px] h-[11px] rounded-[2px] bg-white/5 border border-white/5" />
            <div className="w-[11px] h-[11px] rounded-[2px] bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/10" />
            <div className="w-[11px] h-[11px] rounded-[2px] bg-[var(--color-accent)]/40 border border-[var(--color-accent)]/20" />
            <div className="w-[11px] h-[11px] rounded-[2px] bg-[var(--color-accent)]/70 border border-[var(--color-accent)]/40" />
            <div className="w-[11px] h-[11px] rounded-[2px] bg-[var(--color-accent)] border border-[var(--color-accent)]" />
          </div>
          <span>Més</span>
        </div>
      </div>
    </div>
  );
}
