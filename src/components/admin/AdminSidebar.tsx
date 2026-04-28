"use client";

import { useEffect, useState } from "react";
import { AdminNavLink } from "./AdminNavLink";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut, Menu, X, Settings, LayoutDashboard, Building2, LayoutGrid, User2, FileText, KeyRound, BookOpen, Globe } from "lucide-react";

/**
 * REGLA D'OR: Aquest menú i tota l'interfície d'administració HA D'ESTAR SEMPRE EN CATALÀ.
 * No traduir mai a altres idiomes, independentment de la configuració del portfolio.
 */
export function AdminSidebar() {
  const [draftCount, setDraftCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function loadDrafts() {
      const { count } = await supabase
        .from("works")
        .select("*", { count: "exact", head: true })
        .eq("status", "draft");
      if (count !== null) setDraftCount(count);
    }
    loadDrafts();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'works' }, () => {
        loadDrafts();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden xl:flex w-72 bg-[var(--color-surface)] border-l border-[var(--color-border)] flex-col shrink-0 sticky top-0 h-screen z-[60]">
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center px-8 border-b border-[var(--color-border)] font-display text-xl font-black tracking-tight text-[var(--color-accent)] shrink-0 justify-between">
            <div className="flex items-center gap-2">
              <span>Marc</span>
              <span className="text-[var(--color-text)] opacity-40 font-medium text-[10px] uppercase tracking-widest border border-[var(--color-border)] px-1.5 py-0.5 rounded">Admin</span>
            </div>
            <button className="xl:hidden p-2 text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors" onClick={() => setMobileOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 py-8 px-5 space-y-1.5 overflow-y-auto custom-scrollbar">
            <AdminNavLink href="/admin/dashboard" onClick={() => setMobileOpen(false)}>
              <LayoutDashboard className="w-4 h-4 mr-3" />
              Dashboard
            </AdminNavLink>
            
            <div className="pt-6 pb-2 px-4 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-muted)] opacity-50">Contingut</div>
            <AdminNavLink href="/admin/trabajos" onClick={() => setMobileOpen(false)}>
              <div className="flex justify-between items-center w-full pr-2">
                <div className="flex items-center">
                  <LayoutGrid className="w-4 h-4 mr-3" />
                  Projectes i Clients
                </div>
                {draftCount > 0 && (
                  <span className="bg-[var(--color-accent)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-[0_0_8px_var(--color-accent-glow)]">
                    {draftCount}
                  </span>
                )}
              </div>
            </AdminNavLink>
            <AdminNavLink href="/admin/blog" onClick={() => setMobileOpen(false)}>
              <BookOpen className="w-4 h-4 mr-3" />
              Blog
            </AdminNavLink>
            <AdminNavLink href="/admin/webs" onClick={() => setMobileOpen(false)}>
              <Globe className="w-4 h-4 mr-3" />
              Projectes Web
            </AdminNavLink>
            
            <div className="pt-6 pb-2 px-4 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-muted)] opacity-50">Personal</div>
            <AdminNavLink href="/admin/sobre-mi" onClick={() => setMobileOpen(false)}>
              <User2 className="w-4 h-4 mr-3" />
              Sobre mi
            </AdminNavLink>
            <AdminNavLink href="/admin/cv" onClick={() => setMobileOpen(false)}>
              <FileText className="w-4 h-4 mr-3" />
              Currículum
            </AdminNavLink>
            
            <div className="pt-6 pb-2 px-4 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-muted)] opacity-50">Configuració</div>
            <AdminNavLink href="/admin/accesos" onClick={() => setMobileOpen(false)}>
              <KeyRound className="w-4 h-4 mr-3" />
              Accessos Portfoli
            </AdminNavLink>
            <AdminNavLink href="/admin/ajustos" onClick={() => setMobileOpen(false)}>
              <Settings className="w-4 h-4 mr-3" />
              Ajustos Sistema
            </AdminNavLink>

            <div className="mt-10 pt-6 border-t border-[var(--color-border)]/50">
               <button 
                 onClick={handleLogout}
                 className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:text-white border border-red-400/20 hover:bg-red-500 transition-all active:scale-[0.98]"
               >
                 <LogOut className="w-4 h-4" /> Tancar Sessió
               </button>
            </div>
          </nav>
        </div>
      </aside>

      {/* Mobile Sticky Header */}
      <header className="xl:hidden fixed top-0 left-0 right-0 h-16 bg-[var(--color-surface)]/80 backdrop-blur-xl border-b border-[var(--color-border)] z-50 flex items-center justify-between px-6">
        <div className="font-display text-lg font-black tracking-tight text-[var(--color-accent)]">
          Marc <span className="text-[var(--color-text)] opacity-40 ml-1">Admin</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent("open-portfolio-settings"))}
            className="p-2 text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors"
          >
            <Settings className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setMobileOpen(true)}
            className="p-2 text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors relative"
          >
            <Menu className="w-6 h-6" />
            {draftCount > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-[var(--color-accent)] text-white text-[8px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full border border-[var(--color-surface)]">
                !
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Full Screen Mobile Menu */}
      {mobileOpen && (
        <div className="xl:hidden fixed inset-0 z-[100] bg-[var(--color-surface)] flex flex-col animate-in fade-in zoom-in-95 duration-200">
           <div className="flex flex-col h-full">
            <div className="h-16 flex items-center px-8 border-b border-[var(--color-border)] font-display text-xl font-black tracking-tight text-[var(--color-accent)] shrink-0 justify-between">
              <div className="flex items-center gap-2">
                <span>Marc</span>
                <span className="text-[var(--color-text)] opacity-40 font-medium text-[10px] uppercase tracking-widest border border-[var(--color-border)] px-1.5 py-0.5 rounded">Admin</span>
              </div>
              <button className="xl:hidden p-2 text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors" onClick={() => setMobileOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 py-8 px-5 space-y-1.5 overflow-y-auto custom-scrollbar">
              <AdminNavLink href="/admin/dashboard" onClick={() => setMobileOpen(false)}>
                <LayoutDashboard className="w-4 h-4 mr-3" />
                Dashboard
              </AdminNavLink>
              
              <div className="pt-6 pb-2 px-4 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-muted)] opacity-50">Contingut</div>
              <AdminNavLink href="/admin/trabajos" onClick={() => setMobileOpen(false)}>
                <div className="flex justify-between items-center w-full pr-2">
                  <div className="flex items-center">
                    <LayoutGrid className="w-4 h-4 mr-3" />
                    Projectes i Clients
                  </div>
                  {draftCount > 0 && (
                    <span className="bg-[var(--color-accent)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-[0_0_8px_var(--color-accent-glow)]">
                      {draftCount}
                    </span>
                  )}
                </div>
              </AdminNavLink>
              <AdminNavLink href="/admin/blog" onClick={() => setMobileOpen(false)}>
                <BookOpen className="w-4 h-4 mr-3" />
                Blog
              </AdminNavLink>
              <AdminNavLink href="/admin/webs" onClick={() => setMobileOpen(false)}>
                <Globe className="w-4 h-4 mr-3" />
                Projectes Web
              </AdminNavLink>
              
              <div className="pt-6 pb-2 px-4 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-muted)] opacity-50">Personal</div>
              <AdminNavLink href="/admin/sobre-mi" onClick={() => setMobileOpen(false)}>
                <User2 className="w-4 h-4 mr-3" />
                Sobre mi
              </AdminNavLink>
              <AdminNavLink href="/admin/cv" onClick={() => setMobileOpen(false)}>
                <FileText className="w-4 h-4 mr-3" />
                Currículum
              </AdminNavLink>
              
              <div className="pt-6 pb-2 px-4 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-muted)] opacity-50">Configuració</div>
              <AdminNavLink href="/admin/accesos" onClick={() => setMobileOpen(false)}>
                <KeyRound className="w-4 h-4 mr-3" />
                Accessos Portfoli
              </AdminNavLink>
              <AdminNavLink href="/admin/ajustos" onClick={() => setMobileOpen(false)}>
                <Settings className="w-4 h-4 mr-3" />
                Ajustos Sistema
              </AdminNavLink>

              <div className="mt-10 pt-6 border-t border-[var(--color-border)]/50">
                 <button 
                   onClick={handleLogout}
                   className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:text-white border border-red-400/20 hover:bg-red-500 transition-all active:scale-[0.98]"
                 >
                   <LogOut className="w-4 h-4" /> Tancar Sessió
                 </button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
