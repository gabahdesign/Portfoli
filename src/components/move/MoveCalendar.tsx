"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Search,
  LayoutGrid,
  List as ListIcon,
  Activity,
  User as UserIcon,
  LogOut,
  Users,
  Loader2,
  Map as MapViewIcon,
  Lock
} from "lucide-react";
import { clsx } from "clsx";
import { ActivityModal } from "./ActivityModal";
import { MoveAuthModal } from "./MoveAuthModal";
import { logoutMoveUser } from "@/app/actions/move_auth";
import { joinMoveActivity, leaveMoveActivity } from "@/app/actions/move_participation";
import { useRouter } from "next/navigation";
import { Toast, ToastType } from "../ui/Toast";
import { MoveMap } from "./MoveMap";
import { Heatmap } from "../portfolio/Heatmap";
import { MoveActivityDetailModal } from "./MoveActivityDetailModal";

interface MoveCalendarProps {
  isAdmin?: boolean;
  user: any;
  profile: any;
  groups: any[];
  categories: any[];
  activities: any[];
}

export function MoveCalendar({ isAdmin, profile, groups, categories, activities }: MoveCalendarProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [editActivity, setEditActivity] = useState<any>(null);
  const [initialDate, setInitialDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [selectedDetailActivity, setSelectedDetailActivity] = useState<any>(null);

  // Default to list view on mobile
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setViewMode('list');
    }
  }, []);

  const showNotification = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  const filteredActivities = useMemo(() => {
    if (!searchTerm.trim()) return activities;
    const s = searchTerm.toLowerCase();
    return activities.filter(act => 
      act.title?.toLowerCase().includes(s) || 
      act.location?.toLowerCase().includes(s) ||
      act.move_categories?.name?.toLowerCase().includes(s)
    );
  }, [activities, searchTerm]);

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

  const handleLogout = async () => {
    await logoutMoveUser();
    router.refresh();
    showNotification("Sessió tancada", "success");
  };

  const handleJoinLeave = async (activityId: string, isJoined: boolean) => {
    if (!profile) {
      setIsAuthModalOpen(true);
      return;
    }

    const activity = activities.find(a => a.id === activityId);
    if (!isAdmin && activity) {
      const isPast = new Date(activity.start_datetime) < new Date();
      if (isPast && !isJoined) {
        showNotification("No pots apuntar-te a una activitat passada", "error");
        return;
      }
      
      if (activity.metadata?.isLocked && !isJoined) {
        showNotification("Aquesta activitat està bloquejada", "error");
        return;
      }
    }

    setLoadingAction(activityId);
    try {
      if (isJoined) {
        await leaveMoveActivity(activityId);
        showNotification("T'has desapuntat", "success");
      } else {
        await joinMoveActivity(activityId);
        showNotification("T'has apuntat!", "success");
      }
      router.refresh();
    } catch (_err) {
      showNotification("S'ha produït un error", "error");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. CONTROLS HEADER */}
      <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-6 bg-[var(--color-surface)] p-4 sm:p-6 rounded-3xl border border-[var(--color-border)] shadow-xl">
        <div className="flex items-center justify-between xl:justify-start gap-4">
          <button 
            type="button"
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
            type="button"
            onClick={handleNextMonth}
            className="p-2 hover:bg-[var(--color-surface-2)] rounded-xl transition-colors border border-[var(--color-border)]"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2 bg-[var(--color-surface-2)] p-1.5 rounded-2xl border border-[var(--color-border)]">
          <button 
            type="button"
            onClick={() => setViewMode('grid')}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
              viewMode === 'grid' ? "bg-[var(--color-accent)] text-white shadow-lg" : "text-[var(--color-muted)] hover:text-white"
            )}
          >
            <LayoutGrid size={14} /> Graella
          </button>
          <button 
            type="button"
            onClick={() => setViewMode('list')}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
              viewMode === 'list' ? "bg-[var(--color-accent)] text-white shadow-lg" : "text-[var(--color-muted)] hover:text-white"
            )}
          >
            <ListIcon size={14} /> Agenda
          </button>
          <button 
            type="button"
            onClick={() => setViewMode('map')}
            className={clsx(
              "flex-1 xl:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
              viewMode === 'map' ? "bg-[var(--color-accent)] text-white shadow-lg" : "text-[var(--color-muted)] hover:text-white"
            )}
          >
            <MapViewIcon size={14} /> Mapa
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
           <div className="relative flex-1 min-w-[150px]">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" size={14} />
             <input 
               type="text" 
               placeholder="Cerca activitats..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl pl-9 pr-4 py-2.5 text-xs outline-none focus:border-[var(--color-accent)] transition-all w-full"
             />
           </div>
           
           {profile ? (
             <div className="flex items-center gap-4 bg-[var(--color-surface-2)] pl-4 pr-2 py-1.5 rounded-xl border border-[var(--color-border)] flex-1 xl:flex-none justify-between">
                <div className="flex flex-col items-end">
                   <span className="text-[9px] font-black tracking-widest text-[var(--color-accent)] uppercase">Connectat</span>
                   <span className="text-xs font-bold text-white">{profile.username}</span>
                </div>
                <button 
                  type="button"
                  onClick={handleLogout}
                  className="p-2 text-[var(--color-muted)] hover:text-red-500 transition-colors"
                  title="Tancar sessió"
                >
                  <LogOut size={16} />
                </button>
             </div>
           ) : (
             <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="flex-1 xl:flex-none flex items-center justify-center gap-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:border-[var(--color-accent)]/50 transition-all"
             >
               <UserIcon size={14} /> Entra
             </button>
           )}

           {isAdmin && (
             <button 
              onClick={() => {
                setEditActivity(null);
                setInitialDate(currentDate);
                setIsModalOpen(true);
              }}
              className="flex-1 xl:flex-none flex items-center justify-center gap-2 bg-[var(--color-accent)] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-[var(--color-accent-glow)] hover:scale-105 transition-all"
             >
               <Plus size={16} /> Nou
             </button>
           )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

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
                    {filteredActivities
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
                             e.stopPropagation();
                             setSelectedDetailActivity(act);
                          }}
                          className="px-2 py-1.5 rounded-lg border text-[9px] font-bold truncate transition-all hover:scale-[1.02]"
                          style={{ 
                            backgroundColor: (act.move_categories?.move_groups?.accent_color || '#843aea') + '15',
                            borderColor: (act.move_categories?.move_groups?.accent_color || '#843aea') + '30',
                            color: act.move_categories?.move_groups?.accent_color || '#843aea'
                          }}
                        >
                          <div className="flex items-center gap-1">
                             {act.title}
                             {act.metadata?.isLocked && <Lock size={8} className="shrink-0" />}
                          </div>
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
      ) : viewMode === 'list' ? (
        <div className="animate-in fade-in duration-500 space-y-6">
          {filteredActivities.length > 0 ? (
            <div className="space-y-8">
               {/* Organize by month/day */}
               {Object.entries(
                 filteredActivities.reduce((acc: any, act) => {
                    const date = new Date(act.start_datetime).toLocaleDateString('ca-ES', { day: 'numeric', month: 'long', year: 'numeric' });
                    if (!acc[date]) acc[date] = [];
                    acc[date].push(act);
                    return acc;
                 }, {})
               ).map(([date, dayActivities]: [string, any]) => (
                 <div key={date} className="space-y-4">
                    <div className="flex items-center gap-4">
                       <div className="h-px flex-1 bg-[var(--color-border)]" />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-muted)] whitespace-nowrap">{date}</span>
                       <div className="h-px flex-1 bg-[var(--color-border)] opacity-30" />
                    </div>
                    <div className="grid gap-4">
                       {dayActivities.map((act: any) => (
                          <div 
                            key={act.id} 
                            onClick={() => {
                               setSelectedDetailActivity(act);
                            }}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2.5rem] hover:bg-[var(--color-surface-2)] transition-all cursor-pointer group shadow-lg"
                          >
                             <div className="flex items-center gap-6">
                                <div 
                                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner"
                                  style={{ backgroundColor: (act.move_categories?.move_groups?.accent_color || '#843aea') + '20' }}
                                >
                                   <Activity className="w-6 h-6" style={{ color: act.move_categories?.move_groups?.accent_color || '#843aea' }} />
                                </div>
                                 <div>
                                   <div className="flex items-center gap-3 mb-1.5 ">
                                      <h4 className="text-xl font-display font-black text-[var(--color-text)] tracking-tight">{act.title}</h4>
                                      {act.metadata?.isLocked && (
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg text-[8px] font-black uppercase tracking-widest">
                                           <Lock size={10} /> Proximament
                                        </div>
                                      )}
                                   </div>
                                   <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-[10px] text-[var(--color-muted)] font-bold uppercase tracking-widest">
                                      <span style={{ color: act.move_categories?.move_groups?.accent_color }} className="opacity-80">
                                         {act.move_categories?.name}
                                      </span>
                                      <span>•</span>
                                      <span>{new Date(act.start_datetime).toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                                      {act.location && (
                                        <>
                                          <span>•</span>
                                          <span>{act.location}</span>
                                        </>
                                      )}
                                      
                                      {act.move_activity_participants?.length > 0 && (
                                        <div className="flex items-center gap-2 ml-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                                          <Users size={10} className="text-[var(--color-accent)]" />
                                          <span className="text-white/70 normal-case font-medium">
                                            {act.move_activity_participants.map((p: any) => p.move_profiles?.username).filter(Boolean).join(', ')}
                                          </span>
                                        </div>
                                      )}
                                   </div>
                                </div>
                             </div>

                             <div className="flex items-center gap-4">
                                {(() => {
                                  const isJoined = act.move_activity_participants?.some((p: any) => p.move_profiles?.username === profile?.username);
                                  return (
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleJoinLeave(act.id, isJoined);
                                      }}
                                      disabled={loadingAction === act.id}
                                      className={clsx(
                                        "px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all min-w-[150px] flex items-center justify-center gap-2",
                                        isJoined 
                                          ? "bg-white/5 text-white border border-white/10 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20" 
                                          : act.metadata?.isLocked 
                                            ? "bg-white/5 text-amber-500 border border-amber-500/20 cursor-not-allowed opacity-50"
                                            : "bg-[var(--color-accent)] text-white shadow-lg shadow-[var(--color-accent-glow)] hover:scale-105 active:scale-95"
                                      )}
                                    >
                                      {loadingAction === act.id ? (
                                        <Loader2 size={14} className="animate-spin" />
                                      ) : isJoined ? (
                                        "Ja hi estic"
                                      ) : act.metadata?.isLocked ? (
                                        "Bloquejat"
                                      ) : (
                                        "M'apunto"
                                      )}
                                    </button>
                                  );
                                })()}

                                {isAdmin && (
                                  <div className="p-2 bg-[var(--color-surface-2)] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                     <Plus className="rotate-45 text-[var(--color-muted)]" size={16} />
                                  </div>
                                )}
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
               ))}
            </div>
          ) : (
            <div className="bg-[var(--color-surface)] p-12 rounded-[2.5rem] border border-[var(--color-border)] text-center text-[var(--color-muted)] shadow-2xl">
              <CalendarIcon className="mx-auto mb-6 opacity-10" size={64} />
              <p className="font-medium text-lg">No hi ha activitats programades.</p>
              <p className="text-sm opacity-60 mt-2">Explora la graella per veure el calendari complet.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="animate-in fade-in duration-700">
           <div className="mb-10">
              <h2 className="text-2xl font-display font-black text-[var(--color-text)] tracking-tight">Geolocalització</h2>
              <p className="text-[var(--color-muted)] text-sm">Visualització de les activitats sobre el terreny per a una millor planificació logística.</p>
           </div>
           <MoveMap activities={activities || []} />
        </div>
      )}

      {/* 4. OPTIONAL HEATMAP (Only shown in Grid/List) */}
      {viewMode !== 'map' && (
        <div className="pt-20 border-t border-[var(--color-border)] animate-in fade-in duration-700 mt-20">
          <div className="mb-10">
            <h2 className="text-2xl font-display font-black text-[var(--color-text)] tracking-tight">Evolució de Rendiment</h2>
            <p className="text-[var(--color-muted)] text-sm">Resum de la teva activitat física anual.</p>
          </div>
          <Heatmap activities={activities || []} />
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

      <MoveAuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          router.refresh();
        }}
      />

      <MoveActivityDetailModal 
        isOpen={!!selectedDetailActivity}
        onClose={() => setSelectedDetailActivity(null)}
        activity={selectedDetailActivity}
        isAdmin={isAdmin}
        isJoined={selectedDetailActivity?.move_activity_participants?.some((p: any) => p.move_profiles?.username === profile?.username)}
        loadingAction={loadingAction}
        onJoinLeave={(id, joined) => handleJoinLeave(id, joined)}
        onEdit={(act) => {
          setSelectedDetailActivity(null);
          setEditActivity(act);
          setInitialDate(new Date(act.start_datetime));
          setIsModalOpen(true);
        }}
      />
    </div>
  );
}
