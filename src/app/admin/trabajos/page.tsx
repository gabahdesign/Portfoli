"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Plus, Search, Filter, LayoutGrid, 
  Building2, Landmark, MapPin, Loader2, X,
  ArrowUpDown, Hash, Layers, Edit2, Trash2, Sparkles, Link as LinkIcon, Type, Upload,
  PanelLeft, Image as ImageIcon, ChevronDown, Check
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Work, Company } from "@/lib/types";
import { AdminProjectCard } from "@/components/admin/AdminProjectCard";
import { CompanyHierarchySidebar } from "@/components/portfolio/shared/CompanyHierarchySidebar";
import { PREDEFINED_TAGS } from "@/lib/constants";
import { clsx } from "clsx";

// Predefined sectors for autocomplete
const PREDEFINED_SECTORS = [
  "Hostaleria", "Restauració", "Turisme", "Institució", "Educació",
  "Salut", "Tecnologia", "Moda", "Retail", "Arquitectura",
  "Disseny", "Publicitat", "Comunicació", "Immobiliari", "Construcció",
  "Indústria", "Automòbil", "Alimentació", "Esports", "Entreteniment",
  "Cultura", "Arts", "Música", "Cinema", "Editorial",
  "Premsa", "ONG", "Administració Pública", "Legal", "Finances",
  "Consultoria", "Logística", "Energia", "Farmàcia", "Cosmètica",
];

type WorkWithCompany = Work & { 
  companies: { name: string; logo_url: string | null } | null;
};

// --- Sector Autocomplete ---
function SectorCombobox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const suggestions = useMemo(() =>
    value.length > 0
      ? PREDEFINED_SECTORS.filter(s => s.toLowerCase().includes(value.toLowerCase()))
      : PREDEFINED_SECTORS,
    [value]
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        placeholder="Ex: Hostaleria, Moda..."
        value={value}
        onFocus={() => setOpen(true)}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[1.5rem] px-6 py-4 text-white font-bold focus:outline-none focus:border-[var(--color-accent)] transition-colors"
      />
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto scrollbar-hide">
          {suggestions.map(s => (
            <button
              key={s}
              type="button"
              onMouseDown={() => { onChange(s); setOpen(false); }}
              className={clsx(
                "w-full text-left px-5 py-3 text-sm font-semibold transition-colors flex items-center justify-between group",
                value === s ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]" : "text-[var(--color-muted)] hover:bg-white/5 hover:text-white"
              )}
            >
              {s}
              {value === s && <Check size={14} className="text-[var(--color-accent)]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Logo Drag & Drop ---
function LogoUploader({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) { setError("Només imatges (PNG, JPG, SVG, WEBP)"); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Màxim 5MB"); return; }
    setError(null);
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `logos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error: uploadError } = await supabase.storage.from("portfolio-assets").upload(path, file, { upsert: false });
    if (uploadError) {
      // Fallback: create object URL for preview (upload failed - bucket may not exist yet)
      const localUrl = URL.createObjectURL(file);
      onChange(localUrl);
      setError("Imatge previsualitzada localment (el bucket no existeix)");
    } else {
      const { data: urlData } = supabase.storage.from("portfolio-assets").getPublicUrl(data.path);
      onChange(urlData?.publicUrl ?? "");
    }
    setUploading(false);
  };

  return (
    <div className="space-y-3">
      {/* Preview strip */}
      {value && (
        <div className="flex items-center gap-4 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Logo preview" className="w-14 h-14 object-contain rounded-xl bg-black/20 border border-white/10 p-1" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white font-bold truncate">{value.split("/").pop()}</p>
            <p className="text-[10px] text-[var(--color-muted)] mt-0.5">Logo actual</p>
          </div>
          <button type="button" onClick={() => onChange("")} className="p-2 text-[var(--color-muted)] hover:text-red-500 transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) uploadFile(f); }}
        onClick={() => inputRef.current?.click()}
        className={clsx(
          "relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all",
          isDragging ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5 scale-[1.01]" : "border-[var(--color-border)] hover:border-[var(--color-accent)]/40 hover:bg-white/2"
        )}
      >
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); }} />
        {uploading ? (
          <Loader2 size={28} className="text-[var(--color-accent)] animate-spin" />
        ) : (
          <div className={clsx("p-3 rounded-2xl transition-colors", isDragging ? "bg-[var(--color-accent)]/20 text-[var(--color-accent)]" : "bg-[var(--color-surface)] text-[var(--color-muted)]")}>
            <Upload size={24} />
          </div>
        )}
        <div className="text-center">
          <p className="text-sm font-bold text-white">{uploading ? "Pujant..." : "Arrossega el logo aquí"}</p>
          <p className="text-[11px] text-[var(--color-muted)] mt-1">o fes clic per seleccionar · PNG, JPG, SVG, WEBP · Màx. 5MB</p>
        </div>
      </div>

      {/* Manual URL fallback */}
      <div className="relative">
        <input
          type="text"
          placeholder="O enganxa una URL de logo..."
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[1.5rem] px-6 py-3 pl-12 text-white text-sm font-semibold focus:outline-none focus:border-[var(--color-accent)] transition-colors"
        />
        <ImageIcon size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
      </div>

      {error && <p className="text-xs text-amber-400 pl-2">{error}</p>}
    </div>
  );
}

// --- Main Page ---
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
  const emptyForm = {
    name: "", slug: "", sector: "", location: "", website: "",
    start_date: "", end_date: "", logo_url: "", description: "",
    is_freelance: false, parent_id: null as string | null,
  };
  const [companyFormData, setCompanyFormData] = useState(emptyForm);

  const supabase = createClient();
  const router = useRouter();

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    const { data: wData } = await supabase.from("works").select("*, companies(name, logo_url)").order("created_at", { ascending: false });
    const { data: cData } = await supabase.from("companies").select("*").order("name");
    if (wData) setWorks(wData as WorkWithCompany[]);
    if (cData) setEmpresas(cData);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchInitialData(); }, [fetchInitialData]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Eliminar "${title}"?`)) return;
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

  const handleOpenCompanyModal = (emp?: Company | Partial<Company>) => {
    if (emp && (emp as Company).id) {
      const e = emp as Company;
      setEditingCompany(e);
      setCompanyFormData({
        name: e.name || "", slug: e.slug || "", sector: e.sector || "",
        location: e.location || "", website: e.website || "",
        start_date: e.start_date || "", end_date: e.end_date || "",
        logo_url: e.logo_url || "", description: e.description || "",
        is_freelance: e.is_freelance || false, parent_id: e.parent_id || null,
      });
    } else {
      setEditingCompany(null);
      setCompanyFormData({ ...emptyForm, parent_id: emp?.parent_id || null });
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

  const set = (key: keyof typeof emptyForm, val: any) => setCompanyFormData(prev => ({ ...prev, [key]: val }));

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
  }, [works, statusFilter, activeCompanyId, searchQuery, sortBy, activeTag]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--color-bg)] animate-in fade-in duration-700">
      
      {isMobileContentOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[65] lg:hidden" onClick={() => setIsMobileContentOpen(false)} />
      )}

      <CompanyHierarchySidebar 
        empresas={empresas}
        activeCompanyId={activeCompanyId}
        onSelectCompany={setActiveCompanyId}
        isAdmin={true}
        onEditCompany={handleOpenCompanyModal}
        onAddSubcompany={(parent) => handleOpenCompanyModal({ parent_id: parent.id })}
        onDeleteCompany={handleDeleteCompany}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        totalWorks={works.length}
        companySortBy={companySortBy}
        setCompanySortBy={setCompanySortBy}
        onCloseMobile={() => setIsMobileContentOpen(false)}
      />

      <main className="flex-1 w-full min-w-0 overflow-x-hidden">
        <div className="p-3 md:p-8 lg:p-12 space-y-6 md:space-y-12">
          
          <div className="flex flex-col gap-4 md:gap-10">
             <div className="flex flex-wrap items-center justify-between gap-4">
                 <div className="flex items-center gap-3 min-w-0">
                    <button onClick={() => setIsMobileContentOpen(true)} className="lg:hidden p-2.5 bg-white/5 border border-white/10 rounded-xl text-[var(--color-accent)]">
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
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
                       <input type="text" placeholder="Busca..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                         className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-[var(--color-accent)] w-full sm:w-48 transition-all" />
                    </div>
                    <div className="flex items-center gap-2">
                       <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                         className="bg-[var(--color-surface)] border border-[var(--color-border)] text-white text-[10px] font-bold rounded-2xl px-3 py-2.5 outline-none focus:border-[var(--color-accent)] appearance-none cursor-pointer">
                          <option value="all">Tots</option>
                          <option value="published">Publicats</option>
                          <option value="draft">Esborranys</option>
                          <option value="archived">Arxivats</option>
                       </select>
                       <button onClick={() => setSortBy(sortBy === 'recent' ? 'alphabetical' : 'recent')}
                         className="p-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl text-[var(--color-muted)] hover:text-white hover:border-[var(--color-accent)] transition-all">
                         <ArrowUpDown size={16} />
                       </button>
                       <button onClick={() => router.push("/admin/trabajos/nuevo/editar")}
                         className="flex items-center gap-2 bg-[var(--color-accent)] text-white px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-[var(--color-accent-glow)]/20 hover:scale-[1.02] active:scale-95 transition-all">
                         <Plus size={16} /> <span className="hidden sm:inline">Nou Projecte</span>
                       </button>
                    </div>
                 </div>
             </div>
             <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => setActiveTag(null)}
                  className={clsx("px-4 md:px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all border",
                    activeTag === null ? 'bg-white text-black border-white shadow-xl scale-105' : 'bg-[var(--color-surface)]/20 text-[var(--color-muted)] border-[var(--color-border)] hover:text-white')}>
                  All Tags
                </button>
                <div className="hidden md:block w-px h-6 bg-[var(--color-border)] opacity-30" />
                {tagList.map(tag => (
                   <button key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                     className={clsx("px-4 md:px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all border flex items-center gap-1.5",
                       activeTag === tag ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-[0_0_15px_var(--color-accent-glow)] scale-105' : 'bg-[var(--color-surface)]/20 text-[var(--color-muted)] border-[var(--color-border)] hover:text-white')}>
                      <Hash size={10} className={activeTag === tag ? "opacity-100" : "opacity-30"} />
                      {tag}
                   </button>
                ))}
             </div>
          </div>

          {loading ? (
             <div className="py-32 flex flex-col items-center justify-center gap-4 text-[var(--color-muted)] opacity-50">
                <Loader2 className="animate-spin" size={32} />
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Sincronitzant arxius...</p>
             </div>
          ) : filteredWorks.length === 0 ? (
             <div className="py-32 border-2 border-dashed border-[var(--color-border)] rounded-[3rem] flex flex-col items-center justify-center gap-6 text-center opacity-80">
                <LayoutGrid size={40} className="text-[var(--color-muted)] opacity-20" />
                <p className="text-[var(--color-muted)] font-bold">No s&apos;ha trobat cap mòdul</p>
                <button onClick={() => { setSearchQuery(""); setStatusFilter("all"); setActiveCompanyId(null); }} className="text-[var(--color-accent)] font-black uppercase tracking-widest text-[10px] hover:underline">Reiniciar Filtres</button>
             </div>
          ) : (
              <div className="columns-1 sm:columns-2 lg:columns-2 xl:columns-3 2xl:columns-4 3xl:columns-5 gap-4 md:gap-8 space-y-4 md:space-y-8">
                 {filteredWorks.map((work) => (
                    <AdminProjectCard key={work.id} work={work} onDelete={handleDelete} onDuplicate={handleDuplicate} />
                 ))}
              </div>
          )}
        </div>
      </main>

      {/* ═══════════════ COMPANY MODAL — FULL SCREEN ═══════════════ */}
      {isCompanyModalOpen && (
        <div className="fixed inset-0 z-[200] flex flex-col">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsCompanyModalOpen(false)} />
          
          {/* Panel — almost full screen with small margin */}
          <div className="relative m-3 md:m-6 flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-300">
            
            {/* Header */}
            <div className="flex items-center justify-between px-8 md:px-12 py-6 border-b border-[var(--color-border)] bg-[var(--color-surface)]/50 shrink-0">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-black text-white tracking-tighter">
                  {editingCompany ? "Editar Client" : "Nou Client"}
                </h2>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--color-accent)] mt-1">Identitat Corporativa</p>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setIsCompanyModalOpen(false)}
                  className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl text-[var(--color-muted)] hover:text-white hover:border-[var(--color-accent)]/50 transition-all">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Scrollable form body */}
            <form onSubmit={handleSaveCompany} className="flex-1 overflow-y-auto scrollbar-hide p-8 md:p-12">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 xl:gap-16">
                
                {/* LEFT COLUMN */}
                <div className="space-y-8">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-muted)] border-b border-[var(--color-border)] pb-3">Informació Bàsica</h3>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest pl-1">Nom Comercial *</label>
                    <input type="text" placeholder="Ex: Apple Inc." value={companyFormData.name}
                      onChange={e => { set("name", e.target.value); if (!editingCompany) set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")); }}
                      className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[1.5rem] px-6 py-4 text-white font-bold focus:outline-none focus:border-[var(--color-accent)] transition-colors" required />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest pl-1">Slug *</label>
                    <input type="text" placeholder="ex-apple-inc" value={companyFormData.slug} onChange={e => set("slug", e.target.value)}
                      className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[1.5rem] px-6 py-4 text-white font-bold font-mono text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors" required />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest pl-1">Sector / Especialitat</label>
                    <SectorCombobox value={companyFormData.sector || ""} onChange={v => set("sector", v)} />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest pl-1">Ubicació</label>
                    <div className="relative">
                      <input type="text" placeholder="Tarragona, Catalunya..." value={companyFormData.location || ""} onChange={e => set("location", e.target.value)}
                        className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[1.5rem] px-6 py-4 pl-12 text-white font-bold focus:outline-none focus:border-[var(--color-accent)] transition-colors" />
                      <MapPin size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest pl-1">Website</label>
                    <div className="relative">
                      <input type="text" placeholder="https://" value={companyFormData.website || ""} onChange={e => set("website", e.target.value)}
                        className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[1.5rem] px-6 py-4 pl-12 text-white font-bold focus:outline-none focus:border-[var(--color-accent)] transition-colors" />
                      <LinkIcon size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest pl-1">Empresa Matriu</label>
                    <div className="relative">
                      <select value={companyFormData.parent_id || ""} onChange={e => set("parent_id", e.target.value || null)}
                        className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-white font-bold rounded-[1.5rem] px-6 py-4 focus:outline-none focus:border-[var(--color-accent)] appearance-none transition-colors cursor-pointer">
                        <option value="">Independent (sense empresa matriu)</option>
                        {empresas.filter(e => e.id !== editingCompany?.id).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                      </select>
                      <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--color-muted)] pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-8">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-muted)] border-b border-[var(--color-border)] pb-3">Identitat Visual i Relació</h3>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest pl-1">Logo</label>
                    <LogoUploader value={companyFormData.logo_url || ""} onChange={v => set("logo_url", v)} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest pl-1">Relació Des de</label>
                      <input type="date" value={companyFormData.start_date || ""} onChange={e => set("start_date", e.target.value)}
                        className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[1.5rem] px-6 py-4 text-white font-bold focus:outline-none focus:border-[var(--color-accent)] [color-scheme:dark] transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest pl-1">Fins a</label>
                      <input type="date" value={companyFormData.end_date || ""} onChange={e => set("end_date", e.target.value)}
                        className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[1.5rem] px-6 py-4 text-white font-bold focus:outline-none focus:border-[var(--color-accent)] [color-scheme:dark] transition-colors" />
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="space-y-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
                    <label className="flex items-center justify-between cursor-pointer group">
                      <div>
                        <p className="text-sm font-bold text-white">Col·laboració Pública</p>
                        <p className="text-xs text-[var(--color-muted)] mt-0.5">Apareix a l&apos;arxiu públic del portfolio</p>
                      </div>
                      <div className="relative shrink-0">
                        <input type="checkbox" checked={companyFormData.is_freelance} onChange={e => set("is_freelance", e.target.checked)} className="sr-only peer" />
                        <div className="w-12 h-6 bg-zinc-700 peer-checked:bg-[var(--color-accent)] rounded-full transition-colors duration-300"></div>
                        <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 peer-checked:translate-x-6"></div>
                      </div>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest pl-1">Descripció / Notes</label>
                    <textarea rows={5} placeholder="Breu descripció de la relació, projectes o context..."
                      value={companyFormData.description || ""} onChange={e => set("description", e.target.value)}
                      className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2rem] px-8 py-6 text-white font-medium focus:outline-none focus:border-[var(--color-accent)] resize-none transition-colors" />
                  </div>
                </div>
              </div>
            </form>

            {/* Footer actions */}
            <div className="shrink-0 px-8 md:px-12 py-6 border-t border-[var(--color-border)] bg-[var(--color-surface)]/50 flex items-center justify-between gap-4">
              {editingCompany && (
                <button type="button" onClick={() => handleDeleteCompany(editingCompany.id)}
                  className="px-6 py-3 text-red-500 border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center gap-2">
                  <Trash2 size={14} /> Eliminar
                </button>
              )}
              <div className="flex items-center gap-3 ml-auto">
                <button type="button" onClick={() => setIsCompanyModalOpen(false)}
                  className="px-8 py-3.5 font-black uppercase tracking-widest text-[10px] text-[var(--color-muted)] border border-[var(--color-border)] rounded-2xl hover:text-white hover:border-white/20 transition-all">
                  Cancel·lar
                </button>
                <button type="submit" onClick={handleSaveCompany} disabled={isSavingCompany}
                  className="px-10 py-3.5 bg-[var(--color-accent)] text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-[var(--color-accent-glow)]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2">
                  {isSavingCompany ? <Loader2 className="animate-spin" size={16} /> : null}
                  {editingCompany ? "Sincronitzar" : "Crear Client"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
