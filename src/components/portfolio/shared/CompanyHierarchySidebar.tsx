"use client";

import { useMemo } from "react";
import { 
  Building2, Landmark, Plus, Edit2, Trash2, Hash, Layers, Type, X, ChevronRight, PanelLeftClose
} from "lucide-react";
import { Company } from "@/lib/types";
import { clsx } from "clsx";

interface CompanyHierarchySidebarProps {
  empresas: Company[];
  activeCompanyId: string | null;
  onSelectCompany: (id: string | null) => void;
  isAdmin?: boolean;
  onEditCompany?: (emp: Company) => void;
  onAddSubcompany?: (parent: Company) => void;
  onDeleteCompany?: (id: string) => void;
  onCloseMobile?: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  totalWorks?: number;
  companySortBy: "hierarchy" | "alphabetical" | "recent";
  setCompanySortBy: (sort: "hierarchy" | "alphabetical" | "recent") => void;
}

type CompanyWithDepth = Company & { depth: number };

export function CompanyHierarchySidebar({
  empresas,
  activeCompanyId,
  onSelectCompany,
  isAdmin = false,
  onEditCompany,
  onAddSubcompany,
  onDeleteCompany,
  onCloseMobile,
  isOpen,
  setIsOpen,
  totalWorks = 0,
  companySortBy,
  setCompanySortBy
}: CompanyHierarchySidebarProps) {

  const orderedCompanies = useMemo(() => {
    let base = [...empresas];
    if (companySortBy === "alphabetical") {
      return base.sort((a,b) => a.name.localeCompare(b.name)).map(e => ({ ...e, depth: 0 }));
    }
    if (companySortBy === "recent") {
      return base.sort((a,b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).map(e => ({ ...e, depth: 0 }));
    }

    // Default: Hierarchy
    const parents = base.filter(e => !e.parent_id).sort((a,b) => a.name.localeCompare(b.name));
    const children = base.filter(e => e.parent_id);
    const result: CompanyWithDepth[] = [];
    
    parents.forEach(parent => {
      result.push({ ...parent, depth: 0 });
      const myChildren = children.filter(c => c.parent_id === parent.id).sort((a,b) => a.name.localeCompare(b.name));
      myChildren.forEach(child => {
        result.push({ ...child, depth: 1 });
        const grandChildren = children.filter(gc => gc.parent_id === child.id).sort((a,b) => a.name.localeCompare(b.name));
        grandChildren.forEach(gc => result.push({ ...gc, depth: 2 }));
      });
    });
    return result;
  }, [empresas, companySortBy]);

  return (
    <aside className={clsx(
      "fixed lg:sticky top-0 h-screen z-[70] bg-[var(--color-bg)] transition-all duration-500 ease-in-out border-r border-[var(--color-border)] flex flex-col",
      isOpen ? "translate-x-0 w-80 shadow-2xl" : "-translate-x-full lg:translate-x-0",
      !isOpen ? "lg:w-16 lg:px-2" : "lg:w-80",
      "lg:bg-[var(--color-bg)]/50 lg:backdrop-blur-xl"
    )}>
      <div className={clsx(
        "flex flex-col h-full transition-opacity duration-300",
        !isOpen ? "lg:opacity-0 lg:pointer-events-none" : "opacity-100"
      )}>
        <div className="p-8 pb-4 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--color-accent)]/10 rounded-xl text-[var(--color-accent)]">
                 <Building2 size={18} />
              </div>
              <h2 className="text-xl font-display font-black tracking-tight text-[var(--color-text)]">Contingut</h2>
           </div>
           <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsOpen(false)}
                className="hidden lg:block p-2 text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors"
                title="Amagar barra lateral"
              >
                 <PanelLeftClose size={20} />
              </button>
              <button 
                onClick={onCloseMobile}
                className="lg:hidden p-2 text-[var(--color-muted)] hover:text-red-500 transition-colors"
                title="Tancar"
              >
                 <X size={20} />
              </button>
           </div>
        </div>

        {isAdmin && (
           <div className="px-8 flex flex-col gap-6 relative z-10 my-4">
              <div className="grid grid-cols-1 gap-3">
                 <button 
                   onClick={() => onAddSubcompany?.({} as any)}
                   className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-white py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 hover:border-[var(--color-accent)]/50 hover:bg-[var(--color-accent)]/5 transition-all shadow-lg"
                 >
                   <Building2 size={14} className="shrink-0" /> Nou Client / Marca
                 </button>
              </div>
           </div>
        )}

         <nav className="space-y-2 flex-1 overflow-y-auto scrollbar-hide py-4">
            <div className="px-4 mb-6 space-y-4">
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-muted)] opacity-50">Vista Clients</p>
               <div className="flex gap-2">
                  {[
                     { id: 'hierarchy', icon: Layers, label: 'Jerarquia' },
                     { id: 'alphabetical', icon: Type, label: 'A-Z' },
                  ].map(opt => (
                     <button
                        key={opt.id}
                        onClick={() => setCompanySortBy(opt.id as any)}
                        className={clsx(
                           "flex-1 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest border transition-all flex items-center justify-center gap-2",
                           companySortBy === opt.id ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/20 shadow-inner" : "text-[var(--color-muted)] border-[var(--color-border)] hover:border-[var(--color-accent)]/40"
                        )}
                     >
                        <opt.icon size={12} />
                        {opt.label}
                     </button>
                  ))}
               </div>
            </div>

            <div className="px-2">
              <button 
                onClick={() => onSelectCompany(null)}
                className={clsx(
                  "w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between group mb-2 border border-transparent",
                  !activeCompanyId ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/20 shadow-inner" : "text-[var(--color-muted)]/60 hover:text-white hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-3">
                   <div className={clsx("w-6 h-6 rounded-lg flex items-center justify-center border transition-all", !activeCompanyId ? "bg-[var(--color-accent)] text-white border-transparent" : "bg-black/20 border-white/5")}>
                      <Hash size={12} />
                   </div>
                   <span>Tots els Projectes</span>
                </div>
                {totalWorks > 0 && <span className="text-[10px] opacity-40">{totalWorks}</span>}
              </button>

              <div className="space-y-1">
                 {orderedCompanies.map(emp => (
                   <div 
                      key={emp.id} 
                      className={clsx(
                         "group/side relative rounded-2xl transition-all border border-transparent",
                         activeCompanyId === emp.id ? "bg-white/5 border-white/10 shadow-lg" : "hover:bg-white/5"
                      )}
                      style={{ marginLeft: `${(emp.depth * 12)}px` }}
                   >
                     <div className="flex items-center w-full">
                        <button
                          onClick={() => onSelectCompany(activeCompanyId === emp.id ? null : emp.id)}
                          className={clsx(
                            "flex-1 text-left py-3 px-4 rounded-xl text-[11px] font-bold transition-all flex items-center gap-3 truncate",
                            activeCompanyId === emp.id ? "text-white" : "text-[var(--color-muted)]/60 group-hover/side:text-white"
                          )}
                        >
                           <div className={clsx(
                              "w-6 h-6 rounded-lg flex items-center justify-center border shrink-0 transition-all overflow-hidden",
                              activeCompanyId === emp.id ? "bg-[var(--color-accent)] text-white border-transparent" : "bg-white/5 border-white/5 opacity-40 group-hover/side:opacity-100"
                           )}>
                              {emp.logo_url ? (
                                 /* eslint-disable-next-line @next/next/no-img-element */
                                 <img src={emp.logo_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                 emp.depth === 0 ? <Landmark size={12} /> : <Building2 size={12} />
                              )}
                           </div>
                           <span className="truncate">{emp.name}</span>
                        </button>
                        
                        {isAdmin && (
                          <div className="flex items-center gap-1 px-2 opacity-0 group-hover/side:opacity-100 transition-opacity">
                             <button 
                                onClick={(e) => { e.stopPropagation(); onAddSubcompany?.(emp); }}
                                className="p-1.5 bg-white/5 border border-white/5 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)]/40 transition-all"
                                title="Afegir Sub-empresa"
                             >
                                <Plus size={10} />
                             </button>
                             <button 
                                onClick={(e) => { e.stopPropagation(); onEditCompany?.(emp); }}
                                className="p-1.5 bg-white/5 border border-white/5 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)]/40 transition-all"
                                title="Editar Client"
                             >
                                <Edit2 size={10} />
                             </button>
                             <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteCompany?.(emp.id); }}
                                className="p-1.5 bg-white/5 border border-white/5 rounded-lg text-[var(--color-muted)] hover:text-red-500 hover:border-red-500/40 transition-all"
                                title="Eliminar Client"
                             >
                                <Trash2 size={10} />
                             </button>
                          </div>
                        )}
                     </div>
                   </div>
                 ))}
              </div>
            </div>
         </nav>
      </div>
    </aside>
  );
}
