"use client";

import { useState, useMemo, useEffect, useDeferredValue } from "react";
import { FeaturedWorkCard } from "./FeaturedWorkCard";
import { Search, X, ArrowDown, LayoutGrid, List, Maximize2 } from "lucide-react";
import Link from "next/link";
import { useTracker } from "@/hooks/useTracker";

export interface FeedWork {
  slug: string; title: string; cover_url?: string | null; summary?: string | null;
  tags: string[] | null; protected: boolean; company_id: string; work_date?: string | null;
  companies?: { name: string } | null; pdf_url?: string | null;
}
const labels = {
  ca: { title: "Projectes", all: "Tots", search: "Cerca un projecte, marca o disciplina", more: "Carrega més projectes", empty: "No hi ha projectes amb aquests filtres.", reset: "Neteja els filtres", grid: "Vista de galeria", list: "Vista de llista", shown: "mostrats", present: "Presentació", results: "projectes", discipline: "Disciplina", sort: "Ordena", newest: "Més recents", oldest: "Més antics", name: "Nom A–Z" },
  es: { title: "Proyectos", all: "Todos", search: "Busca un proyecto, marca o disciplina", more: "Cargar más proyectos", empty: "No hay proyectos con estos filtros.", reset: "Limpiar filtros", grid: "Vista de galería", list: "Vista de lista", shown: "mostrados", present: "Presentación", results: "proyectos", discipline: "Disciplina", sort: "Ordenar", newest: "Más recientes", oldest: "Más antiguos", name: "Nombre A–Z" },
  en: { title: "Projects", all: "All", search: "Search a project, brand or discipline", more: "Load more projects", empty: "No projects match these filters.", reset: "Clear filters", grid: "Gallery view", list: "List view", shown: "shown", present: "Presentation", results: "projects", discipline: "Discipline", sort: "Sort", newest: "Newest", oldest: "Oldest", name: "Name A–Z" },
  fr: { title: "Projets", all: "Tous", search: "Rechercher un projet, une marque ou une discipline", more: "Voir plus de projets", empty: "Aucun projet ne correspond aux filtres.", reset: "Effacer les filtres", grid: "Vue galerie", list: "Vue liste", shown: "affichés", present: "Présentation", results: "projets", discipline: "Discipline", sort: "Trier", newest: "Plus récents", oldest: "Plus anciens", name: "Nom A–Z" },
};
const PAGE_SIZE = 9;
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function PortfolioFeed({ works, token, locale, initialCompanyId, companies }: { works: FeedWork[]; token: string; locale: string; initialCompanyId?: string; companies?: Array<{ id: string; name: string }> }) {
  const c = labels[locale as keyof typeof labels] || labels.ca;
  useTracker(token, "page_view");
  useEffect(() => {
    if (token !== "preview") fetch("/api/notify/entry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) }).catch(console.error);
  }, [token]);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [tag, setTag] = useState("");
  const [company, setCompany] = useState(initialCompanyId || "");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState("newest");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const tags = useMemo(() => [...new Set(works.flatMap(w => w.tags || []))].sort((a, b) => a.localeCompare(b, locale)), [works, locale]);
  const filtered = useMemo(() => {
    const term = normalize(deferredQuery.trim());
    return works.filter(w => (!tag || (w.tags || []).includes(tag)) && (!company || w.company_id === company) && normalize([w.title, w.summary || "", w.companies?.name || "", ...(w.tags || [])].join(" ")).includes(term))
      .sort((a, b) => sort === "name" ? a.title.localeCompare(b.title, locale) : sort === "oldest" ? (a.work_date || "").localeCompare(b.work_date || "") : (b.work_date || "").localeCompare(a.work_date || ""));
  }, [works, tag, company, deferredQuery, sort, locale]);
  const visible = filtered.slice(0, limit);
  const reset = () => { setQuery(""); setTag(""); setCompany(""); setLimit(PAGE_SIZE); };
  const activeCompany = companies?.find(item => item.id === company)?.name;
  return (
    <section className="studio-projects" id="projects" aria-labelledby="projects-title">
      <div className="project-section-heading">
        <div><h2 id="projects-title">{c.title}<sup>{works.length.toString().padStart(2, "0")}</sup></h2></div>
        {works.length > 0 && <Link className="presentation-link" href="?mode=present" scroll={false}><Maximize2 size={14} />{c.present}</Link>}
      </div>
      <div className="project-toolbar">
        <div className="project-search"><Search size={17} aria-hidden="true" /><input aria-label={c.search} placeholder={c.search} value={query} onChange={e => { setQuery(e.target.value); setLimit(PAGE_SIZE); }} />{query && <button onClick={() => { setQuery(""); setLimit(PAGE_SIZE); }} aria-label={c.reset}><X size={16} /></button>}</div>
        <label className="toolbar-select"><span className="sr-only">{c.discipline}</span><select value={tag} onChange={e => { setTag(e.target.value); setLimit(PAGE_SIZE); }}><option value="">{c.all} / {c.discipline}</option>{tags.map(item => <option key={item}>{item}</option>)}</select></label>
        <label className="toolbar-select"><span className="sr-only">{c.sort}</span><select value={sort} onChange={e => { setSort(e.target.value); setLimit(PAGE_SIZE); }}><option value="newest">{c.newest}</option><option value="oldest">{c.oldest}</option><option value="name">{c.name}</option></select></label>
        <div className="view-switch"><button onClick={() => setView("grid")} aria-label={c.grid} aria-pressed={view === "grid"}><LayoutGrid size={17} /></button><button onClick={() => setView("list")} aria-label={c.list} aria-pressed={view === "list"}><List size={18} /></button></div>
      </div>
      <div className="project-status"><p role="status" aria-live="polite">{filtered.length} {c.results}{activeCompany ? ` / ${activeCompany}` : ""}</p>{(query || tag || company) && <button onClick={reset}>{c.reset}<X size={12} /></button>}</div>
      {visible.length ? (
        <div className={view === "grid" ? "studio-work-grid" : "studio-work-list"}>
          {visible.map((work, index) => <FeaturedWorkCard key={work.slug} slug={work.slug} title={work.title} coverUrl={work.cover_url || undefined} summary={work.summary || ""} tags={work.tags || []} protectedNode={work.protected} token={token} workDate={work.work_date || undefined} pdfUrl={work.pdf_url || undefined} layout={view} index={index} />)}
        </div>
      ) : <div className="studio-empty"><Search size={28} /><p>{c.empty}</p>{(query || tag || company) && <button className="studio-button" onClick={reset}>{c.reset}</button>}</div>}
      <div className="project-pagination"><span>{visible.length} / {filtered.length} {c.shown}</span>{limit < filtered.length && <button className="studio-button" onClick={() => setLimit(current => current + PAGE_SIZE)}>{c.more}<ArrowDown size={15} /></button>}</div>
    </section>
  );
}
