"use client";

import { useState, useMemo } from "react";
import { FeaturedWorkCard } from "./FeaturedWorkCard";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(initialCompanyId || null);

  const activeCompanyName = useMemo(() => {
    if (!activeCompanyId || !companies) return null;
    return companies.find(c => c.id === activeCompanyId)?.name || null;
  }, [activeCompanyId, companies]);

  // Get most used tags from all works
  const suggestedTags = useMemo(() => {
    const counts: Record<string, number> = {};
    works.forEach(w => {
      (w.tags || []).forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(entry => entry[0]);
  }, [works]);

  const filteredWorks = useMemo(() => {
    return works.filter(w => {
      // 1. Basic matching
      const matchesSearch = 
        w.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        w.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
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
      <div className="relative max-w-2xl mx-auto -mt-10 mb-16 z-30">
        <div className="relative group">
          <div className="absolute inset-0 bg-black/20 blur-2xl rounded-full opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
          <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full p-2 flex items-center shadow-2xl backdrop-blur-3xl">
            <div className="pl-6 text-[var(--color-muted)]">
              <Search className="w-5 h-5" />
            </div>
            <input 
              type="text" 
              placeholder={locale === 'ca' ? 'Busca projectes o tecnologies...' : 'Search projects or tech...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)]/50"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="p-2 text-[var(--color-muted)] hover:text-white transition-colors mr-2"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="hidden sm:block border-l border-[var(--color-border)] h-8 mx-2" />
            <div className="hidden sm:flex items-center px-6 text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] opacity-50">
              {filteredWorks.length} Results
            </div>
          </div>
        </div>

        {/* Suggested Tags */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] opacity-40">Suggested:</span>
          {suggestedTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                activeTag === tag 
                  ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-[0_0_15px_var(--color-accent-glow)]' 
                  : 'bg-[var(--color-surface)]/50 text-[var(--color-muted)] border-[var(--color-border)] hover:border-[var(--color-accent)]/30 hover:text-white'
              }`}
            >
              {tag}
            </button>
          ))}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredWorks.map((work) => (
              <FeaturedWorkCard
                key={work.slug}
                slug={work.slug}
                title={work.title}
                coverUrl={work.cover_url}
                summary={work.summary}
                tags={work.tags || []}
                protectedNode={work.protected}
                token={token}
                workDate={work.work_date}
              />
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
