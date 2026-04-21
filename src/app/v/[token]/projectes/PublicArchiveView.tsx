"use client";

import { useState, useMemo } from "react";
import { 
  Search, Filter, LayoutGrid, List, ChevronRight, 
  Building2, Landmark, Briefcase, MapPin, Loader2, X,
  ArrowUpDown, Hash, Layers, Edit2, Trash2, Sparkles, Type, Clock,
  ChevronLeft, PanelLeftClose, PanelLeft
} from "lucide-react";
import { Company, Work } from "@/lib/types";
import { CompanyHierarchySidebar } from "@/components/portfolio/shared/CompanyHierarchySidebar";
import { FeaturedWorkCard } from "@/components/portfolio/FeaturedWorkCard";
import { clsx } from "clsx";
import { useTranslations } from "next-intl";

interface PublicArchiveViewProps {
  initialWorks: any[];
  initialCompanies: Company[];
  token: string;
  locale: string;
}

export function PublicArchiveView({
  initialWorks,
  initialCompanies,
  token,
  locale
}: PublicArchiveViewProps) {
  const t = useTranslations("Navigation");
  const tIndex = useTranslations("Index");
  
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [companySortBy, setCompanySortBy] = useState<"hierarchy" | "alphabetical" | "recent">("hierarchy");

  const filteredWorks = useMemo(() => {
    return initialWorks.filter((wk) => {
      const matchesCompany = !activeCompanyId || wk.company_id === activeCompanyId;
      const matchesTag = !activeTag || (wk.tags || []).includes(activeTag);
      const matchesSearch = !searchQuery || 
        wk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (wk.tags || []).some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesCompany && matchesSearch && matchesTag;
    }).sort((a, b) => {
      if (sortBy === "alphabetical") return a.title.localeCompare(b.title);
      return new Date(b.work_date || 0).getTime() - new Date(a.work_date || 0).getTime();
    });
  }, [initialWorks, activeCompanyId, searchQuery, sortBy, activeTag]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--color-bg)] animate-in fade-in duration-700 w-full">
      {/* Sidebar - Read Only */}
      <CompanyHierarchySidebar 
        empresas={initialCompanies}
        activeCompanyId={activeCompanyId}
        onSelectCompany={setActiveCompanyId}
        isAdmin={false}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        totalWorks={initialWorks.length}
        companySortBy={companySortBy}
        setCompanySortBy={setCompanySortBy}
        onCloseMobile={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1 w-full min-w-0">
         {/* Toolbar */}
         <div className="sticky top-0 z-40 bg-[var(--color-bg)]/80 backdrop-blur-xl border-b border-[var(--color-border)] px-4 sm:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
               <div className="flex items-center gap-4">
                  {!isSidebarOpen && (
                    <button 
                      onClick={() => setIsSidebarOpen(true)}
                      className="hidden lg:flex p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-all animate-in slide-in-from-left-4"
                    >
                       <PanelLeft size={20} />
                    </button>
                  )}
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-[var(--color-text)] font-display tracking-tight uppercase truncate max-w-[200px] sm:max-w-none">
                       {t("projectes")}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
                       <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-muted)] opacity-60">
                          Arxiu Professional · {filteredWorks.length} Resultats
                       </span>
                    </div>
                  </div>
               </div>

               <div className="flex items-center gap-2 sm:gap-3">
                  <div className="relative group flex-1 sm:flex-none">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)] group-focus-within:text-[var(--color-accent)] transition-colors" />
                     <input 
                       type="text" 
                       placeholder="Cerca projectes..."
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className="w-full sm:w-64 pl-12 pr-6 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl text-xs font-bold text-white focus:outline-none focus:border-[var(--color-accent)] transition-all placeholder:text-[var(--color-muted)]/50"
                     />
                  </div>
                  
                  <div className="flex items-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-1 gap-1">
                     <button 
                       onClick={() => setSortBy("recent")}
                       className={clsx(
                         "p-2 rounded-xl transition-all",
                         sortBy === "recent" ? "bg-[var(--color-accent)] text-white shadow-lg" : "text-[var(--color-muted)] hover:text-white"
                       )}
                       title="Recents"
                     >
                        <Clock size={18} />
                     </button>
                     <button 
                       onClick={() => setSortBy("alphabetical")}
                       className={clsx(
                         "p-2 rounded-xl transition-all",
                         sortBy === "alphabetical" ? "bg-[var(--color-accent)] text-white shadow-lg" : "text-[var(--color-muted)] hover:text-white"
                       )}
                       title="A-Z"
                     >
                        <Type size={18} />
                     </button>
                  </div>
               </div>
            </div>
         </div>

         {/* Grid Content */}
         <div className="p-4 sm:p-8">
            {filteredWorks.length > 0 ? (
              <div className="columns-1 sm:columns-2 lg:columns-2 xl:columns-3 2xl:columns-4 3xl:columns-5 4xl:columns-6 gap-4 md:gap-8 space-y-4 md:space-y-8">
                 {filteredWorks.map((work) => (
                    <div key={work.slug} className="break-inside-avoid">
                       <FeaturedWorkCard 
                          slug={work.slug}
                          title={work.title}
                          coverUrl={work.cover_url}
                          summary={work.summary}
                          tags={work.tags || []}
                          protectedNode={work.protected}
                          token={token}
                          workDate={work.work_date}
                       />
                    </div>
                 ))}
              </div>
            ) : (
              <div className="py-32 text-center flex flex-col items-center gap-6 animate-in fade-in duration-1000">
                 <div className="w-20 h-20 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2rem] flex items-center justify-center text-[var(--color-muted)] opacity-20">
                    <Search size={40} />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-[var(--color-text)]">No s&apos;ha trobat res</h3>
                    <p className="text-sm text-[var(--color-muted)] mt-2">Prova amb altres filtres o paraules clau.</p>
                 </div>
                 <button 
                   onClick={() => { setActiveCompanyId(null); setActiveTag(null); setSearchQuery(""); }}
                   className="px-8 py-3 bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-black uppercase tracking-widest text-[10px] rounded-full border border-[var(--color-accent)]/20 hover:bg-[var(--color-accent)] hover:text-white transition-all shadow-xl"
                 >
                    Reiniciar filtres
                 </button>
              </div>
            )}
         </div>
      </main>
    </div>
  );
}
