"use client";

import { Edit2, Trash2, Copy, Lock, Star, Eye, ExternalLink } from "lucide-react";
import { clsx } from "clsx";
import { useRouter } from "next/navigation";

interface AdminProjectCardProps {
  work: any;
  onDelete: (id: string, title: string) => void;
  onDuplicate: (work: any) => void;
}

export function AdminProjectCard({ work, onDelete, onDuplicate }: AdminProjectCardProps) {
  const router = useRouter();

  return (
    <div className="group relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2rem] overflow-hidden hover:border-[var(--color-accent)]/50 transition-all duration-500 shadow-sm hover:shadow-2xl hover:-translate-y-1 mb-8 break-inside-avoid">
      {/* Media Preview (Hidden if no cover_url) */}
      {work.cover_url && (
        <div 
          className="aspect-video bg-black/20 relative overflow-hidden cursor-pointer"
          onClick={() => router.push(`/admin/trabajos/${work.id}/editar`)}
        >
          {work.cover_url.match(/\.(mp4|webm|mov)$/i) ? (
            <video src={work.cover_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" muted loop autoPlay />
          ) : (
            <img src={work.cover_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700" alt={work.title} />
          )}

          {/* Status Badges Overlay */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className={clsx(
              "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border backdrop-blur-md",
              work.status === 'published' 
                ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                : work.status === 'archived' 
                ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' 
                : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
            )}>
              {work.status}
            </span>
            {work.featured && (
              <span className="p-1 px-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full animate-pulse">
                <Star size={10} fill="currentColor" />
              </span>
            )}
            {work.protected && (
              <span className="p-1 px-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full">
                <Lock size={10} />
              </span>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-[var(--color-text)] font-display tracking-tight group-hover:text-[var(--color-accent)] transition-colors line-clamp-1">{work.title}</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] mt-1 flex items-center gap-2">
            {work.companies?.logo_url && (
              <span className="w-4 h-4 rounded-full overflow-hidden bg-white/5 border border-white/10 shrink-0">
                <img src={work.companies.logo_url} alt="" className="w-full h-full object-cover" />
              </span>
            )}
            <span className="truncate">{work.companies?.name || "Sin asociar"}</span>
            {work.work_date && (
              <>
                <span className="w-1 h-1 rounded-full bg-[var(--color-border)] opacity-30" />
                <span className="opacity-40">
                  {work.work_date.endsWith('-01-01') ? work.work_date.split('-')[0] : new Date(work.work_date).toLocaleDateString('ca-ES', { month: 'short', year: 'numeric' })}
                </span>
              </>
            )}
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
          <div className="flex gap-1">
             <button 
               onClick={() => router.push(`/admin/trabajos/${work.id}/editar`)}
               className="p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-muted)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-all active:scale-90"
               title="Editar"
             >
               <Edit2 size={16} />
             </button>
             <button 
               onClick={() => onDuplicate(work)}
               className="p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-muted)] hover:text-blue-500 hover:border-blue-500/50 transition-all active:scale-90"
               title="Duplicar"
             >
               <Copy size={16} />
             </button>
             <button 
               onClick={() => onDelete(work.id, work.title)}
               className="p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-muted)] hover:text-red-500 hover:border-red-500/50 transition-all active:scale-90"
               title="Eliminar"
             >
               <Trash2 size={16} />
             </button>
          </div>

          <button 
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)]/5 hover:bg-[var(--color-accent)] hover:text-white border border-[var(--color-accent)]/20 rounded-xl transition-all group/btn"
            onClick={() => window.open(`/v/preview/trabajo/${work.slug}`, '_blank')}
          >
            <span className="text-[10px] font-black uppercase tracking-widest">Preview</span>
            <ExternalLink size={12} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Hover decoration */}
      <div className="absolute inset-0 border-2 border-[var(--color-accent)] rounded-[2rem] opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity" />
    </div>
  );
}
