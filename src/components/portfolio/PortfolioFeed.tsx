"use client";

import { useState, useMemo, useEffect } from "react";
import { FeaturedWorkCard } from "./FeaturedWorkCard";
import { Search, X, Hash } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTracker } from "@/hooks/useTracker";
import { PREDEFINED_TAGS } from "@/lib/constants";

interface Work {
  slug: string;
  title: string;
  cover_url?: string;
  summary: string;
  tags: string[];
  protected: boolean;
  company_id: string;
  work_date?: string;
  companies?: { name: string };
  pdf_url?: string;
}

interface PortfolioFeedProps {
  works: Work[];
  token: string;
  locale: string;
  initialCompanyId?: string;
  companies?: Array<{ id: string; name: string }>;
}

export function PortfolioFeed({ works, token, locale, initialCompanyId, companies }: PortfolioFeedProps) {
  const t = useTranslations("Index");
  
  // Track this page view
  useTracker(token, "page_view");

  // Notify entry (first time)
  useEffect(() => {
    if (token !== 'preview') {
      fetch('/api/notify/entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      }).catch(console.error);
    }
  }, [token]);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(initialCompanyId || null);

  const activeCompanyName = useMemo(() => {
    if (!activeCompanyId || !companies) return null;
    return companies.find(c => c.id === activeCompanyId)?.name || null;
  }, [activeCompanyId, companies]);

  // Use Predefined Tags for the primary filter row
  const tagsToDisplay = PREDEFINED_TAGS;

  const filteredWorks = useMemo(() => {
    return works.filter(w => {
      // 1. Basic matching
      const matchesSearch = 
        w.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        w.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (w.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesTag = !activeTag || (w.tags || []).includes(activeTag);
      const matchesCompany = !activeCompanyId || w.company_id === activeCompanyId;
      
      return matchesSearch && matchesTag && matchesCompany;
    });
  }, [works, searchQuery, activeTag, activeCompanyId]);

  const clearFilters = () => {
    setSearchQuery("");
    setActiveTag(null);
    setActiveCompanyId(null);
  };

  return (
    <div className="space-y-12">
      {/* Search Bar Section */}
      <div className="relative max-w-6xl mx-auto -mt-10 mb-16 z-30 space-y-8">
        <div className="relative group max-w-4xl mx-auto">
          <div className="absolute inset-0 bg-black/20 blur-2xl rounded-full opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
          <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full p-2 flex items-center shadow-2xl backdrop-blur-3xl transition-all group-focus-within:border-[var(--color-accent)]/50 group-focus-within:ring-4 group-focus-within:ring-[var(--color-accent)]/5">
            <div className="pl-6 text-[var(--color-muted)]">
              <Search className="w-5 h-5" />
            </div>
            <input 
              type="text" 
              placeholder={locale === 'ca' ? 'Projectes, marques, tecnologies...' : 'Projects, brands, tech...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-sm text-[var(--color-text)] font-medium placeholder:text-[var(--color-muted)]/50 placeholder:font-normal"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="p-2 text-[var(--color-muted)] hover:text-white transition-colors mr-2 hover:bg-white/5 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="hidden sm:block border-l border-[var(--color-border)] h-8 mx-2" />
            <div className="hidden sm:flex items-center px-6 text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] opacity-50 whitespace-nowrap">
              {filteredWorks.length} Results
            </div>
          </div>
        </div>

        {/* Tag Filters Row */}
        <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-700 delay-300">
           <div className="w-full overflow-x-auto pb-4 px-4 scrollbar-hide">
              <div className="flex items-center justify-center min-w-max gap-3">
                 <button
                   onClick={() => setActiveTag(null)}
                   className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all border flex items-center gap-2 ${
                     activeTag === null 
                       ? 'bg-white text-black border-white shadow-xl scale-105' 
                       : 'bg-[var(--color-bg)]/40 text-[var(--color-muted)] border-[var(--color-border)] hover:border-[var(--color-accent)]/30 hover:text-white'
                   }`}
                 >
                   All Projects
                 </button>
                 <div className="w-px h-6 bg-[var(--color-border)] mx-2" />
                 {tagsToDisplay.map(tag => (
                   <button
                     key={tag}
                     onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                     className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all border flex items-center gap-2 ${
                       activeTag === tag 
                         ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-[0_0_20px_var(--color-accent-glow)] scale-105' 
                         : 'bg-[var(--color-surface)]/20 text-[var(--color-muted)] border-[var(--color-border)] hover:border-[var(--color-accent)]/30 hover:text-white'
                     }`}
                   >
                     <Hash size={12} className={activeTag === tag ? "opacity-100" : "opacity-30"} />
                     {tag}
                   </button>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Active Filters / Company Info */}
      {activeCompanyId && (
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4 bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/20 rounded-2xl p-8 animate-in slide-in-from-top-4 duration-500">
           <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-accent)] opacity-60">Filtrant per empresa:</span>
              <h3 className="text-xl font-black text-[var(--color-text)]">{activeCompanyName}</h3>
           </div>
           <button 
             onClick={() => setActiveCompanyId(null)}
             className="text-xs font-bold text-[var(--color-muted)] hover:text-white flex items-center gap-2 bg-[var(--color-surface)] px-4 py-2 rounded-full border border-[var(--color-border)] hover:border-[var(--color-accent)]/50 transition-all"
           >
             <X className="w-3 h-3" /> {locale === 'ca' ? 'Veure tots els projectes' : 'View all projects'}
           </button>
        </div>
      )}

      {/* Grid Section */}
      <div>
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-[var(--color-muted)] flex items-center gap-4">
            <span className="w-8 h-px bg-[var(--color-border)]" />
            {t("featured_works")}
          </h2>
        </div>

        {filteredWorks.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 3xl:columns-6 gap-8 space-y-8">
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
                  pdfUrl={work.pdf_url}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center flex flex-col items-center gap-4">
            <p className="text-[var(--color-muted)] text-sm italic">No s&apos;ha trobat cap projecte que coincideixi amb la cerca.</p>
            <button 
              onClick={clearFilters}
              className="text-xs font-bold text-[var(--color-accent)] hover:underline"
            >
              Reiniciar filtres
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
