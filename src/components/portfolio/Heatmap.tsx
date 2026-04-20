"use client";

import { useState, useEffect } from "react";

export function Heatmap() {
  const [activityData, setActivityData] = useState<{ level: number }[][]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const data = [];
    for (let w = 0; w < 52; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const rand = Math.random();
        let level = 0;
        if (rand > 0.6) level = 1;
        if (rand > 0.8) level = 2;
        if (rand > 0.9) level = 3;
        if (rand > 0.98) level = 4;
        week.push({ level });
      }
      data.push(week);
    }
    setActivityData(data);
  }, []);

  if (!mounted) return (
    <div className="w-full bg-[var(--color-surface-2)] p-6 rounded-2xl border border-[var(--color-border)] shadow-xl h-[240px] animate-pulse" />
  );

  const getLevelColor = (level: number) => {
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
           <h3 className="text-lg font-display font-bold text-[var(--color-text)] tracking-tight">Activitat de Desenvolupament</h3>
           <p className="text-xs text-[var(--color-muted)] font-mono mt-1">2.431 contribucions enguany</p>
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
                    className={`w-[11px] h-[11px] rounded-[2px] transition-all hover:scale-125 hover:z-10 cursor-crosshair ${getLevelColor(day.level)}`} 
                    title={`Nivell d'activitat ${day.level}`}
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
