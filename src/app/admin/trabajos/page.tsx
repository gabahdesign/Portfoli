"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Plus, Search, Filter, LayoutGrid, List, ChevronRight, 
  Building2, Landmark, Briefcase, MapPin, Loader2, X,
  ArrowUpDown, Hash, Layers, Edit2, Trash2, Sparkles, Link as LinkIcon, Type, Clock,
  ChevronLeft, PanelLeftClose, PanelLeft, Settings
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Work, Company } from "@/lib/types";
import { AdminProjectCard } from "@/components/admin/AdminProjectCard";
import { CompanyHierarchySidebar } from "@/components/portfolio/shared/CompanyHierarchySidebar";
import { PREDEFINED_TAGS } from "@/lib/constants";
import { clsx } from "clsx";

// Extended types
type WorkWithCompany = Work & { 
  companies: { name: string; logo_url: string | null } | null;
};

export default function AdminTrabajos() {
  const [works, setWorks] = useState<WorkWithCompany[]>([]);
  const [empresas, setEmpresas] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileContentOpen, setIsMobileContentOpen] = useState(false);
  const [companySortBy, setCompanySortBy] = useState<"hierarchy" | "alphabetical" | "recent">("hierarchy");
  
  const tagList = useMemo(() => PREDEFINED_TAGS, []);
  
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [companyFormData, setCompanyFormData] = useState({
    name: "",
    slug: "",
    sector: "",
    location: "",
    website: "",
    start_date: "",
    end_date: "",
    logo_url: "",
    description: "",
    is_freelance: false,
    parent_id: null as string | null,
  });

  const supabase = createClient();
  const router = useRouter();

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    const { data: wData } = await supabase
      .from("works")
      .select("*, companies(name, logo_url)")
      .order("created_at", { ascending: false });
    
    const { data: cData } = await supabase
      .from("companies")
      .select("*")
      .order("name");

    if (wData) setWorks(wData as WorkWithCompany[]);
    if (cData) setEmpresas(cData);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchInitialData(); }, [fetchInitialData]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${title}"?`)) return;
    await supabase.from("works").delete().eq("id", id);
    fetchInitialData();
  };

  const handleDuplicate = async (work: any) => {
    if (!confirm(`¿Duplicar "${work.title}"?`)) return;
    const newWork = { ...work, id: undefined, created_at: undefined, updated_at: undefined, companies: undefined, slug: `${work.slug}-copy-${Date.now()}`, title: `${work.title} (Copia)`, status: 'draft' };
    Object.keys(newWork).forEach(key => newWork[key] === undefined && delete newWork[key]);
    await supabase.from("works").insert([newWork]);
    fetchInitialData();
  };

  const handleOpenCompanyModal = (emp?: Company) => {
    if (emp && emp.id) {
       setEditingCompany(emp);
       setCompanyFormData({
         name: emp.name || "",
         slug: emp.slug || "",
         sector: emp.sector || "",
         location: emp.location || "",
         website: emp.website || "",
         start_date: emp.start_date || "",
         end_date: emp.end_date || "",
         logo_url: emp.logo_url || "",
         description: emp.description || "",
         is_freelance: emp.is_freelance || false,
         parent_id: emp.parent_id || null,
       });
    } else {
       setEditingCompany(null);
       setCompanyFormData({
         name: "", slug: "", sector: "", location: "", website: "",
         start_date: "", end_date: "", logo_url: "", description: "",
         is_freelance: false, 
         parent_id: (emp as any)?.parent_id || null,
       });
    }
    setIsCompanyModalOpen(true);
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyFormData.name || !companyFormData.slug) return;
    setIsSavingCompany(true);
    const payload = { ...companyFormData, start_date: companyFormData.start_date || null, end_date: companyFormData.end_date || null };
    if (editingCompany) {
      await supabase.from("companies").update(payload).eq("id", editingCompany.id);
    } else {
      await supabase.from("companies").insert([payload]);
    }
    setIsSavingCompany(false);
    setIsCompanyModalOpen(false);
    fetchInitialData();
  };

  const handleDeleteCompany = async (id: string) => {
    if (!confirm("Segur que vols eliminar aquesta empresa?")) return;
    await supabase.from("companies").delete().eq("id", id);
    fetchInitialData();
  };

  const filteredWorks = useMemo(() => {
    return works.filter((wk) => {
      const matchesStatus = statusFilter === "all" || wk.status === statusFilter;
      const matchesCompany = !activeCompanyId || wk.company_id === activeCompanyId;
      const matchesTag = !activeTag || (wk.tags || []).includes(activeTag);
      const matchesSearch = !searchQuery || 
        wk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (wk.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesCompany && matchesSearch && matchesTag;
    }).sort((a, b) => {
      if (sortBy === "alphabetical") return a.title.localeCompare(b.title);
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [works, statusFilter, activeCompanyId, searchQuery, sortBy]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--color-bg)] animate-in fade-in duration-700">
      
      {/* Mobile Backdrop */}
      {isMobileContentOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[65] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileContentOpen(false)}
        />
      )}

      {/* Sidebar Section */}
      <CompanyHierarchySidebar 
        empresas={empresas}
        activeCompanyId={activeCompanyId}
        onSelectCompany={setActiveCompanyId}
        isAdmin={true}
        onEditCompany={handleOpenCompanyModal}
        onAddSubcompany={(parent) => handleOpenCompanyModal({ parent_id: parent.id } as any)}
        onDeleteCompany={handleDeleteCompany}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        totalWorks={works.length}
        companySortBy={companySortBy}
        setCompanySortBy={setCompanySortBy}
        onCloseMobile={() => setIsMobileContentOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1 w-full min-w-0 overflow-x-hidden">
        <div className="p-3 md:p-8 lg:p-12 space-y-6 md:space-y-12">
          
          {/* Header */}
          <div className="flex flex-col gap-4 md:gap-10">
             <div className="flex flex-wrap items-center justify-between gap-4">
                 <div className="flex items-center gap-3 min-w-0">
                    <button 
                      onClick={() => setIsMobileContentOpen(true)}
                      className="lg:hidden p-2.5 bg-white/5 border border-white/10 rounded-xl text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-all shrink-0"
                    >
                       <Filter size={18} />
                    </button>
                    <div className="space-y-0.5 min-w-0">
                       <h1 className="text-xl md:text-5xl font-display font-black tracking-tighter text-[var(--color-text)] truncate max-w-[calc(100vw-100px)]">
                          {activeCompanyId ? empresas.find(e => e.id === activeCompanyId)?.name : "Arxiu Global"}
                       </h1>
                       <p className="text-[8px] md:text-xs font-bold text-[var(--color-muted)] uppercase tracking-widest opacity-40">
                          {filteredWorks.length} mòduls
                       </p>
                    </div>
                 </div>

                 <div className="flex flex-wrap items-center gap-2">
                    <div className="relative group flex-1 sm:flex-none">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)] group-focus-within:text-[var(--color-accent)] transition-colors" />
                       <input 
                         type="text" 
                         placeholder="Busca..."
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-[var(--color-accent)] w-full sm:w-48 transition-all"
                       />
                    </div>
                    
                    <div className="flex items-center gap-2">
                       <select 
                          value={statusFilter} 
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="bg-[var(--color-surface)] border border-[var(--color-border)] text-white text-[10px] font-bold rounded-2xl px-3 py-2.5 outline-none focus:border-[var(--color-accent)] appearance-none cursor-pointer"
                       >
                          <option value="all">Tots</option>
                          <option value="published">Publicats</option>
                          <option value="draft">Esborranys</option>
                          <option value="archived">Arxivats</option>
                       </select>
  
                       <button 
                        onClick={() => setSortBy(sortBy === 'recent' ? 'alphabetical' : 'recent')}
                        className="p-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl text-[var(--color-muted)] hover:text-white hover:border-[var(--color-accent)] transition-all"
                       >
                         <ArrowUpDown size={16} />
                       </button>
                       <button 
                         onClick={() => router.push("/admin/trabajos/nuevo/editar")}
                         className="flex items-center gap-2 bg-[var(--color-accent)] text-white px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-[var(--color-accent-glow)]/20 hover:scale-[1.02] active:scale-95 transition-all"
                       >
                         <Plus size={16} /> <span className="hidden sm:inline">Nou Projecte</span>
                       </button>
                    </div>
                 </div>
             </div>

             {/* Tags */}
             <div className="flex flex-wrap items-center gap-2 md:gap-6">
                <button 
                   onClick={() => setActiveTag(null)}
                   className={clsx(
                      "px-4 md:px-6 py-2 md:py-3 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all border",
                      activeTag === null 
                        ? 'bg-white text-black border-white shadow-xl scale-105' 
                        : 'bg-[var(--color-surface)]/20 text-[var(--color-muted)] border-[var(--color-border)] hover:border-[var(--color-accent)]/30 hover:text-white'
                   )}
                >
                   All Tags
                </button>
                <div className="hidden md:block w-px h-6 bg-[var(--color-border)] opacity-30" />
                {tagList.map(tag => (
                   <button 
                      key={tag}
                      onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                      className={clsx(
                         "px-4 md:px-6 py-2 md:py-3 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all border flex items-center gap-1.5",
                         activeTag === tag 
                           ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-[0_0_15px_var(--color-accent-glow)] scale-105' 
                           : 'bg-[var(--color-surface)]/20 text-[var(--color-muted)] border-[var(--color-border)] hover:border-[var(--color-accent)]/30 hover:text-white'
                      )}
                   >
                      <Hash size={10} className={activeTag === tag ? "opacity-100" : "opacity-30"} />
                      {tag}
                   </button>
                ))}
             </div>
          </div>

          {/* Grid */}
          {loading ? (
             <div className="py-32 flex flex-col items-center justify-center gap-4 text-[var(--color-muted)] opacity-50">
                <Loader2 className="animate-spin" size={32} />
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Sincronitzant arxius...</p>
             </div>
          ) : filteredWorks.length === 0 ? (
             <div className="py-32 border-2 border-dashed border-[var(--color-border)] rounded-[3rem] flex flex-col items-center justify-center gap-6 text-center opacity-80">
                <div className="w-20 h-20 rounded-3xl bg-[var(--color-surface)] flex items-center justify-center shadow-inner opacity-40">
                   <LayoutGrid size={40} className="text-[var(--color-muted)]" />
                </div>
                <div>
                  <p className="text-[var(--color-muted)] font-bold text-xl">No s&apos;ha trobat cap mòdul</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] opacity-50 mt-2">Prova d&apos;ajustar els filtres</p>
                </div>
                <button onClick={() => { setSearchQuery(""); setStatusFilter("all"); setActiveCompanyId(null); }} className="text-[var(--color-accent)] font-black uppercase tracking-widest text-[10px] hover:underline">Reiniciar Filtres</button>
             </div>
          ) : (
              <div className="columns-1 sm:columns-2 lg:columns-2 xl:columns-3 2xl:columns-4 3xl:columns-5 4xl:columns-6 gap-4 md:gap-8 space-y-4 md:space-y-8">
                 {filteredWorks.map((work) => (
                    <AdminProjectCard 
                      key={work.id} 
                      work={work} 
                      onDelete={handleDelete}
                      onDuplicate={handleDuplicate}
                    />
                 ))}
              </div>
          )}
        </div>
      </main>

      {/* COMPANY MODAL */}
      {isCompanyModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsCompanyModalOpen(false)} />
          <div className="relative w-full max-w-4xl bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
             <div className="p-8 sm:p-12 border-b border-[var(--color-border)] bg-[var(--color-surface)]/50">
               <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tighter mb-2">
                       {editingCompany ? "Editar Client" : "Nou Client"}
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--color-accent)] opacity-80">Configuració d&apos;Identitat Corporativa</p>
                  </div>
                  <button onClick={() => setIsCompanyModalOpen(false)} className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl text-[var(--color-muted)] hover:text-white transition-all">
                    <X size={20} />
                  </button>
               </div>
             </div>

             <form onSubmit={handleSaveCompany} className="p-8 sm:p-12 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-16">
                   <div className="space-y-8">
                      <div className="space-y-2">
                         <label className="block text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest pl-1">Nom Comercial</label>
                         <input type="text" placeholder="Ex: Apple Inc." value={companyFormData.name} onChange={(e) => setCompanyFormData({...companyFormData, name: e.target.value})} className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[1.5rem] px-6 py-4 text-white font-bold focus:outline-none focus:border-[var(--color-accent)]" required />
                      </div>
                      <div className="space-y-2">
                         <label className="block text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest pl-1">Slug (Identificador)</label>
                         <input type="text" placeholder="ex-apple" value={companyFormData.slug} onChange={(e) => setCompanyFormData({...companyFormData, slug: e.target.value})} className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[1.5rem] px-6 py-4 text-white font-bold focus:outline-none focus:border-[var(--color-accent)]" required />
                      </div>
                      <div className="space-y-2">
                         <label className="block text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest pl-1">Sector / Especialitat</label>
                         <input type="text" placeholder="Ex: Tecnologia, Moda..." value={companyFormData.sector} onChange={(e) => setCompanyFormData({...companyFormData, sector: e.target.value})} className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[1.5rem] px-6 py-4 text-white font-bold focus:outline-none focus:border-[var(--color-accent)]" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest pl-1">Empresa Matriu (Opcional)</label>
                        <select 
                          value={companyFormData.parent_id || ""} 
                          onChange={e => setCompanyFormData({...companyFormData, parent_id: e.target.value || null})}
                          className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-white font-bold rounded-[1.5rem] px-6 py-4 focus:outline-none focus:border-[var(--color-accent)] appearance-none"
                        >
                          <option value="">Independent</option>
                          {empresas.filter(e => e.id !== editingCompany?.id).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                      </div>
                   </div>

                   <div className="space-y-8">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="block text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest pl-1">Relació Des de</label>
                           <input type="date" value={companyFormData.start_date} onChange={(e) => setCompanyFormData({...companyFormData, start_date: e.target.value})} className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[1.5rem] px-6 py-4 text-white font-bold focus:outline-none [color-scheme:dark]" />
                        </div>
                        <div className="space-y-2">
                           <label className="block text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest pl-1">Fins a</label>
                           <input type="date" value={companyFormData.end_date} onChange={(e) => setCompanyFormData({...companyFormData, end_date: e.target.value})} className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[1.5rem] px-6 py-4 text-white font-bold focus:outline-none [color-scheme:dark]" />
                        </div>
                      </div>
                      <div className="space-y-2">
                         <label className="block text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest pl-1">Logo URL</label>
                         <div className="relative">
                            <input type="text" placeholder="URL del logo..." value={companyFormData.logo_url} onChange={(e) => setCompanyFormData({...companyFormData, logo_url: e.target.value})} className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[1.5rem] px-6 py-4 pl-12 text-white font-bold focus:outline-none focus:border-[var(--color-accent)]" />
                            <Sparkles size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="block text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest pl-1">Website</label>
                         <div className="relative">
                            <input type="text" placeholder="https://" value={companyFormData.website} onChange={(e) => setCompanyFormData({...companyFormData, website: e.target.value})} className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[1.5rem] px-6 py-4 pl-12 text-white font-bold focus:outline-none focus:border-[var(--color-accent)]" />
                            <LinkIcon size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                         </div>
                      </div>
                      <div className="flex items-center gap-4 pt-4">
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={companyFormData.is_freelance} onChange={(e) => setCompanyFormData({...companyFormData, is_freelance: e.target.checked})} className="sr-only peer" />
                            <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent)]"></div>
                            <span className="ml-3 text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)]">Col·laboració (Pública)</span>
                         </label>
                      </div>
                   </div>
                </div>

                <div className="space-y-2 mt-10">
                   <label className="block text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest pl-1">Descripció</label>
                   <textarea rows={4} placeholder="Breu descripció..." value={companyFormData.description} onChange={(e) => setCompanyFormData({...companyFormData, description: e.target.value})} className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2rem] px-8 py-6 text-white font-medium focus:outline-none focus:border-[var(--color-accent)] resize-none" />
                </div>
                
                <div className="mt-12 flex justify-end gap-4">
                   <button type="button" onClick={() => setIsCompanyModalOpen(false)} className="px-8 py-4 font-black uppercase tracking-widest text-[10px] text-[var(--color-muted)] border border-[var(--color-border)] rounded-2xl hover:text-white transition-all">Cancel·lar</button>
                   <button type="submit" disabled={isSavingCompany} className="px-12 py-4 bg-[var(--color-accent)] text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-[var(--color-accent-glow)]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
                      {isSavingCompany ? <Loader2 className="animate-spin" size={16} /> : (editingCompany ? "Sincronitzar" : "Crear Nou")}
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
