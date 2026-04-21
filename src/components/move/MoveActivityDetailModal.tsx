"use client";

import { X, Calendar, MapPin, Users, Phone, MessageCircle, ArrowRight, Loader2, Info, Lock } from "lucide-react";
import { clsx } from "clsx";
import { renderMarkdown } from "@/lib/utils/markdown";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

interface MoveActivityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: any;
  onJoinLeave: (id: string, isJoined: boolean) => void;
  isJoined: boolean;
  loadingAction: string | null;
  isAdmin?: boolean;
  onEdit?: (activity: any) => void;
}

export function MoveActivityDetailModal({ 
  isOpen, 
  onClose, 
  activity, 
  onJoinLeave, 
  isJoined,
  loadingAction,
  isAdmin,
  onEdit
}: MoveActivityDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  const isLocked = !!activity?.metadata?.isLocked && !isAdmin;
  const unlockAt = activity?.metadata?.unlockAt;

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    if (!unlockAt || !isLocked) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(unlockAt).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft(null);
        clearInterval(timer);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [unlockAt, isLocked]);

  if (!isOpen || !activity || !mounted) return null;

  const dateStr = new Date(activity.start_datetime).toLocaleDateString('ca-ES', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
  
  const timeStr = new Date(activity.start_datetime).toLocaleTimeString('ca-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const participantsCount = activity.move_activity_participants?.length || 0;
  const participantNicks = activity.move_activity_participants?.map((p: any) => p.move_profiles?.username).filter(Boolean) || [];

  const accentColor = activity.move_categories?.move_groups?.accent_color || 'var(--color-accent)';

  return createPortal(
    <div className="fixed inset-0 z-[7000] flex items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full h-full sm:h-auto sm:max-w-2xl bg-[var(--color-surface)] sm:border border-white/10 sm:rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col">
        
        {/* Header Image/Pattern Placeholder */}
        <div 
          className="h-32 sm:h-40 w-full relative shrink-0"
          style={{ backgroundColor: accentColor + '20' }}
        >
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--color-accent)_1px,_transparent_1px)] bg-[size:20px_20px]" />
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-3 bg-black/20 hover:bg-black/40 text-white rounded-2xl transition-all z-10 backdrop-blur-md"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 sm:px-12 pb-12 -mt-12 relative flex-1 overflow-y-auto no-scrollbar">
          {/* 1. NOM DEL PLAN */}
          <div className="mb-10">
            <div 
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 shadow-lg"
              style={{ backgroundColor: accentColor, color: 'white' }}
            >
              {activity.move_categories?.name}
            </div>
            <h2 className="text-4xl sm:text-5xl font-display font-black text-white tracking-tight leading-[0.9]">
              {activity.title}
            </h2>
          </div>

          <div className="grid gap-10">
            {/* 2. DIA, HORA, UBICACIÓ, ASISTENTS */}
            <div className="grid sm:grid-cols-2 gap-8">
               <div className="space-y-6">
                  <div className="flex items-start gap-4">
                     <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--color-muted)] shrink-0">
                        <Calendar size={18} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] mb-1">Data i Hora</p>
                        <p className="text-sm text-white font-medium capitalize">{dateStr}</p>
                        <p className="text-xs text-[var(--color-muted)] font-bold">{timeStr} h</p>
                     </div>
                  </div>

                  {!isLocked ? (
                    <div className="flex items-start gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--color-muted)] shrink-0">
                          <MapPin size={18} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] mb-1">Ubicació</p>
                          <p className="text-sm text-white font-medium">{activity.location || "Ubicació no especificada"}</p>
                       </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-4 opacity-50">
                       <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--color-muted)] shrink-0">
                          <Lock size={18} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] mb-1">Ubicació</p>
                          <p className="text-sm text-white font-medium italic">Bloquejada</p>
                       </div>
                    </div>
                  )}
               </div>

               <div className="space-y-6">
                  {!isLocked ? (
                    <div className="flex items-start gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--color-muted)] shrink-0">
                          <Users size={18} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] mb-1">Assistents ({participantsCount})</p>
                          {participantNicks.length > 0 ? (
                             <div className="flex flex-wrap gap-1.5 mt-1">
                                {participantNicks.map((nick: string, idx: number) => (
                                   <span key={idx} className="text-[10px] bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-2 py-0.5 rounded-md font-bold">
                                      @{nick}
                                   </span>
                                ))}
                             </div>
                          ) : (
                             <p className="text-xs text-[var(--color-muted)]">Encara no hi ha ningú apuntat.</p>
                          )}
                       </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-4 opacity-50">
                       <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--color-muted)] shrink-0">
                          <Lock size={18} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] mb-1">Assistents</p>
                          <p className="text-xs text-[var(--color-muted)] italic">Informació bloquejada</p>
                       </div>
                    </div>
                  )}
               </div>
            </div>

            {/* 3. BOTÓ WHATSAPP (si existeix) */}
            {activity.whatsapp_link && !isLocked && (
               <a 
                 href={activity.whatsapp_link} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex items-center justify-center gap-3 w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-[#25D36640] transition-all hover:scale-[1.02] active:scale-95"
               >
                  <MessageCircle size={18} /> Entrar al Grup de WhatsApp
               </a>
            )}

            {/* BOTONS ACCIÓ */}
            <div className="flex gap-3">
               <button 
                 onClick={() => onJoinLeave(activity.id, isJoined)}
                 disabled={loadingAction === activity.id || (isLocked && !isJoined)}
                 className={clsx(
                   "flex-1 flex items-center justify-center gap-3 py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] transition-all hover:scale-[1.02] active:scale-95 shadow-xl",
                   isJoined 
                     ? "bg-white/5 text-white border border-white/10 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20" 
                     : isLocked
                       ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 cursor-not-allowed"
                       : "bg-[var(--color-accent)] text-white shadow-[var(--color-accent-glow)]"
                 )}
               >
                 {loadingAction === activity.id ? (
                   <Loader2 size={16} className="animate-spin" />
                 ) : isJoined ? (
                   "Ja hi estic (Desapuntar-se)"
                 ) : isLocked ? (
                   <>
                     <Lock size={14} /> Bloquejat (Proximament)
                   </>
                 ) : (
                   "Vull m'apunto al plan"
                 )}
               </button>

               {isAdmin && onEdit && (
                  <button 
                    onClick={() => onEdit(activity)}
                    className="px-6 bg-white/5 border border-white/10 text-white rounded-3xl hover:bg-white/10 transition-all flex items-center justify-center"
                    title="Editar activitat"
                  >
                     <Info size={18} />
                  </button>
               )}
            </div>

            {/* 4. DESCRIPCIÓ (Renderitzada) */}
            {!isLocked ? (
              activity.description && (
                 <div className="pt-8 border-t border-white/10">
                    <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)]">
                       <Info size={12} /> Descripció del plan
                    </div>
                    <div 
                      className="prose prose-invert prose-sm max-w-none text-[var(--color-muted)] leading-relaxed font-medium"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(activity.description) }}
                    />
                 </div>
              )
            ) : (
              <div className="pt-12 border-t border-white/10 text-center">
                 <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/10 mb-6 border border-amber-500/20 text-amber-500">
                    <Lock size={32} />
                 </div>
                 <h3 className="text-2xl font-display font-black text-white tracking-tight mb-2">Plan Bloquejat</h3>
                 <p className="text-sm text-[var(--color-muted)] max-w-xs mx-auto mb-8 font-medium">L&apos;organitzador encara no ha publicat els detalls d&apos;aquest plan. Torna d&apos;aquí a una estona!</p>
                 
                 {timeLeft && (
                   <div className="bg-[var(--color-surface-2)] inline-block px-8 py-4 rounded-3xl border border-white/5 shadow-2xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-1">Es desbloqueja en:</p>
                      <p className="text-3xl font-mono font-black text-white">{timeLeft}</p>
                   </div>
                 )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
