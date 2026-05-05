"use client";

import { X, Calendar, MapPin, Users, Phone, MessageCircle, ArrowRight, Loader2, Info, Lock, AlertCircle, Clock } from "lucide-react";
import { clsx } from "clsx";
import { renderMarkdown } from "@/lib/utils/markdown";
import { createPortal } from "react-dom";
import { useEffect, useState, useMemo } from "react";
import { Drawer } from "vaul";
import { getGoogleCalendarUrl, getAppleCalendarIcs } from "@/lib/calendar-utils";
import type { MoveActivity, MoveParticipant } from "@/lib/types";

interface MoveActivityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: MoveActivity | null;
  onJoinLeave: (id: string, isJoined: boolean) => void;
  isJoined: boolean;
  loadingAction: string | null;
  isAdmin?: boolean;
  onEdit?: (activity: MoveActivity) => void;
  userId?: string;
}

export function MoveActivityDetailModal({ 
  isOpen, 
  onClose, 
  activity, 
  onJoinLeave, 
  isJoined,
  loadingAction,
  isAdmin,
  onEdit,
  userId
}: MoveActivityDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  const isLocked = !!activity?.metadata?.isLocked && !isAdmin;
  const unlockAt = activity?.metadata?.unlockAt;

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const userParticipation = useMemo(() => {
    if (!activity || !userId) return null;
    return activity.move_activity_participants?.find((p: MoveParticipant) => p.profile_id === userId);
  }, [activity, userId]);

  const isWaitlisted = userParticipation?.status === 'waitlisted';

  if (!activity || !mounted) return null;

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

  const joinedParticipants = activity.move_activity_participants?.filter((p: MoveParticipant) => p.status === 'joined') || [];
  const waitlistedParticipants = activity.move_activity_participants?.filter((p: MoveParticipant) => p.status === 'waitlisted') || [];
  
  const participantsCount = joinedParticipants.length;
  const maxCapacity = activity.max_capacity;
  const isFull = maxCapacity ? participantsCount >= maxCapacity : false;

  const accentColor = activity.move_categories?.move_groups?.accent_color || 'var(--color-accent)';

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[7000]" />
        <Drawer.Content className="bg-[var(--color-surface)] flex flex-col rounded-t-[2.5rem] h-[92%] sm:h-auto sm:max-h-[90vh] sm:max-w-2xl fixed bottom-0 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 sm:bottom-1/2 sm:translate-y-1/2 sm:rounded-[2.5rem] z-[7001] outline-none border-t border-white/5 sm:border sm:border-white/10 shadow-2xl overflow-hidden">
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-white/20 my-4 sm:hidden" />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header Image/Pattern */}
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
              <div className="mb-10">
                <div 
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 shadow-lg"
                  style={{ backgroundColor: accentColor, color: 'white' }}
                >
                  {activity.move_categories?.name}
                </div>
                <h2 className="text-4xl sm:text-5xl font-display font-black text-[var(--color-text)] tracking-tight leading-[0.9]">
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
                        <p className="text-sm text-[var(--color-text)] font-medium capitalize">{dateStr}</p>
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
                          <p className="text-sm text-[var(--color-text)] font-medium">{activity.location || "Ubicació no especificada"}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-4 opacity-50">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--color-muted)] shrink-0">
                          <Lock size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] mb-1">Ubicació</p>
                          <p className="text-sm text-[var(--color-text)] font-medium italic">Bloquejada</p>
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
                          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] mb-1">
                            Assistents ({participantsCount}{maxCapacity ? `/${maxCapacity}` : ""})
                          </p>
                          {joinedParticipants.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {joinedParticipants.map((p: MoveParticipant) => (
                                <span key={p.id} className="text-[10px] bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-2 py-0.5 rounded-md font-bold">
                                  @{p.move_profiles?.username}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-[var(--color-muted)]">Encara no hi ha ningú apuntat.</p>
                          )}
                          
                          {waitlistedParticipants.length > 0 && (
                            <div className="mt-3">
                              <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-1">En llista d&apos;espera ({waitlistedParticipants.length})</p>
                              <div className="flex flex-wrap gap-1.5 mt-1 opacity-60">
                                {waitlistedParticipants.map((p: MoveParticipant) => (
                                  <span key={p.id} className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-md font-bold">
                                    @{p.move_profiles?.username}
                                  </span>
                                ))}
                              </div>
                            </div>
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

                {/* Waitlist Warning */}
                {isWaitlisted && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 flex items-start gap-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-amber-500 uppercase tracking-widest mb-1">Ets a la llista d&apos;espera</h4>
                      <p className="text-xs text-[var(--color-text)] opacity-70 leading-relaxed font-medium">T&apos;avisarem automàticament per email si s&apos;allibera una plaça.</p>
                    </div>
                  </div>
                )}

                {/* 3. BOTÓ WHATSAPP (si existeix) */}
                  <div className="space-y-3">
                    <a 
                      href={activity.whatsapp_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-[#25D36640] transition-all hover:scale-[1.02] active:scale-95"
                    >
                      <MessageCircle size={18} /> Entrar al Grup de WhatsApp
                    </a>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <a 
                        href={getGoogleCalendarUrl(activity)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                      >
                        <Calendar size={14} className="text-blue-400" /> Google Calendar
                      </a>
                      <a 
                        href={getAppleCalendarIcs(activity)}
                        download={`${activity.slug || 'actvity'}.ics`}
                        className="flex items-center justify-center gap-2 py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                      >
                        <Calendar size={14} className="text-orange-400" /> Apple Calendar
                      </a>
                    </div>
                  </div>
                )}

                {/* BOTONS ACCIÓ */}
                <div className="flex gap-3">
                  <button 
                    onClick={() => onJoinLeave(activity.id, isJoined)}
                    disabled={loadingAction === activity.id || (isLocked && !isJoined)}
                    className={clsx(
                      "flex-1 flex items-center justify-center gap-3 py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] transition-all hover:scale-[1.02] active:scale-95 shadow-xl",
                      isJoined 
                        ? (isWaitlisted ? "bg-amber-500 text-white shadow-amber-500/20" : "bg-white/5 text-white border border-white/10 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20")
                        : isLocked
                          ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 cursor-not-allowed"
                          : isFull
                            ? "bg-amber-500 text-white shadow-amber-500/20"
                            : "bg-[var(--color-accent)] text-white shadow-[var(--color-accent-glow)]"
                    )}
                  >
                    {loadingAction === activity.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : isJoined ? (
                      isWaitlisted ? "Surt de la llista d'espera" : "Desapuntar-se del plan"
                    ) : isLocked ? (
                      <>
                        <Lock size={14} /> Bloquejat (Proximament)
                      </>
                    ) : isFull ? (
                      "Apunta'm a la llista d'espera"
                    ) : (
                      "Unir-me al plan"
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
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
