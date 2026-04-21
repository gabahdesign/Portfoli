"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Save, Activity, Clock, RotateCcw, Shield, Eye, Lock, 
  ChevronDown, Check, Building2, Upload, FileText, Loader2, Sparkles,
  Palette, Calendar, Hash, Type, Trash2, Globe, Layout, Maximize2
} from "lucide-react";
import { BlockBuilder, Block } from "@/components/admin/block-builder/BlockBuilder";
import { PREDEFINED_TAGS } from "@/lib/constants";
import { clsx } from "clsx";

// REUSABLE DROPZONE COMPONENT
function DropZone({ 
  onFileDrop, 
  isUploading, 
  currentUrl, 
  label, 
  accept = "image/*,video/*",
  icon: Icon = Upload
}: { 
  onFileDrop: (file: File) => void, 
  isUploading: boolean, 
  currentUrl?: string, 
  label: string,
  accept?: string,
  icon?: any
}) {
  const [isOver, setIsOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };
  const handleDragLeave = () => setIsOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileDrop(file);
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={clsx(
        "relative cursor-pointer group transition-all duration-500",
        "border-2 border-dashed rounded-3xl overflow-hidden flex flex-col items-center justify-center gap-4 py-12",
        isOver ? "bg-[var(--color-accent)]/10 border-[var(--color-accent)] scale-[1.02] shadow-2xl" : "bg-[var(--color-surface)]/30 border-[var(--color-border)] hover:border-[var(--color-accent)]/50"
      )}
    >
      <input type="file" ref={inputRef} accept={accept} className="hidden" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) onFileDrop(file);
      }} />
      
      {isUploading ? (
        <Loader2 className="w-10 h-10 text-[var(--color-accent)] animate-spin" />
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className={clsx(
            "w-16 h-16 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-lg",
            isOver && "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
          )}>
            <Icon size={28} className={isOver ? "animate-bounce" : "text-[var(--color-muted)]"} />
          </div>
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-text)] mb-1">{label}</p>
            <p className="text-[10px] text-[var(--color-muted)] uppercase tracking-widest">{isOver ? "Amolla ara!" : "Arrossega o fes clic"}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EditWorkPage() {
  const params = useParams();
  const workId = params.id as string;
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);
  const [versionHistory, setVersionHistory] = useState<any[]>([]);
  const [isVisOpen, setIsVisOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    company_id: "",
    work_date: "",
    cover_url: "",
    summary: "",
    tags: [] as string[],
    status: "draft",
    featured: false,
    protected: false,
    visibility_type: "public_token",
    content: [] as Block[],
    accent_color: "#5e6efc",
    pdf_url: ""
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    async function loadData() {
      const { data: cData } = await supabase.from("companies").select("id, name").order("name");
      if (cData) setCompanies(cData);

      if (workId !== "nuevo") {
        const { data: wData } = await supabase.from("works").select("*").eq("id", workId).single();
        if (wData) {
          setFormData({
            title: wData.title || "",
            slug: wData.slug || "",
            company_id: wData.company_id || "",
            work_date: wData.work_date ? (wData.work_date.endsWith('-01-01') ? wData.work_date.slice(0, 4) : new Date(wData.work_date).toISOString().split('T')[0]) : "",
            cover_url: wData.cover_url || "",
            summary: wData.summary || "",
            tags: Array.isArray(wData.tags) ? wData.tags : [],
            status: wData.status || "draft",
            featured: wData.featured || false,
            protected: wData.protected || false,
            visibility_type: wData.visibility_type || "public_token",
            content: Array.isArray(wData.content) ? wData.content : [],
            accent_color: wData.accent_color || "#5e6efc",
            pdf_url: wData.pdf_url || ""
          });
          if (wData.version_history) setVersionHistory(wData.version_history);
        }
      }
      setLoading(false);
    }
    loadData();
  }, [workId]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setFormData(prev => {
      const currentSlug = prev.slug;
      const targetSlug = prev.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const autoSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const newSlug = (currentSlug === '' || currentSlug === targetSlug) ? autoSlug : currentSlug;
      return { ...prev, title: newTitle, slug: newSlug };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    let newHistory = versionHistory;
    if (workId !== "nuevo") {
      const snapshot = {
        timestamp: new Date().toISOString(),
        title: formData.title,
        summary: formData.summary,
        content: formData.content
      };
      newHistory = [snapshot, ...versionHistory].slice(0, 20);
    }

    let finalDate = formData.work_date ? formData.work_date.trim() : null;
    if (finalDate && finalDate.length === 4 && !isNaN(Number(finalDate))) {
      finalDate = `${finalDate}-01-01`;
    }

    const payload = {
      ...formData,
      work_date: finalDate,
      version_history: newHistory
    };

    const { error } = workId === "nuevo" 
      ? await supabase.from("works").insert([payload])
      : await supabase.from("works").update(payload).eq("id", workId);

    if (!error) {
      showToast("Guardat correctament", "success");
      if (workId === "nuevo") router.push("/admin/trabajos");
      setVersionHistory(newHistory);
    } else {
      showToast("Error: " + error.message, "error");
    }
    setSaving(false);
  };

  const processFileUpload = async (file: File, field: 'cover_url' | 'pdf_url') => {
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (field === 'cover_url' && isPdf) {
      if (confirm("Vols posar aquest PDF com a ARXIU adjunt en lloc de portada?")) {
        return processFileUpload(file, 'pdf_url');
      }
    }

    if (field === 'cover_url') setUploadingCover(true);
    else setUploadingPdf(true);

    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const filePath = `works/${fileName}`;

      const { error: uploadError } = await supabase.storage.from("portfolio-media").upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("portfolio-media").getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, [field]: data.publicUrl }));
      showToast("Pujat correctament!", "success");
    } catch (err: any) {
      showToast("Error: " + err.message, "error");
    } finally {
      setUploadingCover(false);
      setUploadingPdf(false);
    }
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => {
      const currentTags = prev.tags || [];
      const newTags = currentTags.includes(tag) 
        ? currentTags.filter(t => t !== tag) 
        : [...currentTags, tag];
      return { ...prev, tags: newTags };
    });
  };

  if (loading) return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[var(--color-bg)] gap-4">
      <Loader2 className="w-12 h-12 text-[var(--color-accent)] animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--color-muted)]">Carregant Univers...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 pb-32 animate-in fade-in duration-700 max-w-7xl mx-auto space-y-12">
      {/* Toast Notification */}
      {toast && (
        <div className={clsx(
          "fixed bottom-8 right-8 px-8 py-4 rounded-2xl shadow-2xl text-white font-bold z-50 flex items-center gap-3 animate-in slide-in-from-bottom-5",
          toast.type === 'success' ? 'bg-green-600 shadow-green-900/20' : 'bg-red-600 shadow-red-900/20'
        )}>
          {toast.type === 'success' ? <Check size={20} /> : <Activity size={20} />}
          {toast.message}
        </div>
      )}

      {/* HEADER BENTO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2.5rem] p-8 md:p-12 flex flex-col justify-between gap-8 h-full shadow-xl">
          <div className="flex items-center gap-6">
             <button onClick={() => router.back()} className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl text-[var(--color-muted)] hover:text-white hover:border-[var(--color-accent)] transition-all group active:scale-95 shadow-md">
                <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
             </button>
             <div className="h-10 w-px bg-[var(--color-border)]" />
             <h1 className="text-2xl md:text-4xl font-black text-[var(--color-text)] tracking-tight font-display">
                {workId === "nuevo" ? "Crear Nou" : "Edita el Teu Món"}
             </h1>
          </div>
          
          <div className="space-y-2">
            <input
              type="text"
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="Títol del projecte..."
              className="w-full bg-transparent border-none text-4xl md:text-6xl font-display font-black text-[var(--color-text)] focus:outline-none focus:ring-0 placeholder-[var(--color-muted)]/20 p-0"
            />
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData({...formData, summary: e.target.value})}
              placeholder="Escriu un resum captivador aquí..."
              className="w-full bg-transparent border-none text-lg md:text-xl text-[var(--color-muted)] focus:outline-none focus:ring-0 placeholder-[var(--color-muted)]/30 p-0 resize-none h-20"
            />
          </div>
        </div>

        <div className="bg-[var(--color-accent)] rounded-[2.5rem] p-8 flex flex-col justify-between text-white shadow-2xl shadow-[var(--color-accent-glow)] relative overflow-hidden group">
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 opacity-10 group-hover:rotate-12 transition-transform duration-1000 scale-150" />
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 mb-2">Editor d&apos;Univers</p>
            <h2 className="text-2xl font-bold font-display">Publicació Immediata</h2>
          </div>
          <div className="relative z-10 flex flex-col gap-4 mt-12">
            <button
               onClick={handleSave}
               disabled={saving}
               className="w-full bg-white text-[var(--color-accent)] py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {workId === "nuevo" ? "Llançar Projecte" : "Actualitzar Ara"}
            </button>
            <button className="w-full bg-white/10 backdrop-blur-md text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-white/20 transition-all border border-white/10">
              <Eye size={16} /> Vista Prèvia de Client
            </button>
          </div>
        </div>
      </div>

      {/* CONTEXT GRID BI-BENTO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: VISUALS & MEDIA */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2.5rem] p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-8">
               <div className="p-3 bg-[var(--color-accent)]/10 rounded-2xl text-[var(--color-accent)]"><Layout size={20} /></div>
               <h3 className="font-black uppercase tracking-[0.2em] text-[var(--color-text)] text-xs">Identitat Visual</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-[var(--color-muted)] mb-3 uppercase tracking-widest">Portada Principal</label>
                {!formData.cover_url ? (
                  <DropZone 
                    onFileDrop={(f) => processFileUpload(f, 'cover_url')} 
                    isUploading={uploadingCover} 
                    label="Pujar Portada"
                    icon={Upload}
                  />
                ) : (
                  <div className="relative rounded-3xl overflow-hidden border border-[var(--color-border)] group shadow-2xl">
                     {formData.cover_url.match(/\.(mp4|webm|mov)$/i) || formData.cover_url.includes('video') ? (
                       <video src={formData.cover_url} autoPlay muted loop className="w-full aspect-video object-cover" />
                     ) : (
                       <img src={formData.cover_url} className="w-full aspect-video object-cover" alt="" />
                     )}
                     <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button onClick={() => setFormData(p => ({...p, cover_url: ''}))} className="p-4 bg-red-500 text-white rounded-2xl hover:scale-110 transition-transform">
                           <Trash2 size={24} />
                        </button>
                        <button onClick={() => processFileUpload(null as any, 'cover_url')} className="p-4 bg-white text-black rounded-2xl hover:scale-110 transition-transform">
                           <RotateCcw size={24} />
                        </button>
                     </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-black text-[var(--color-muted)] mb-3 uppercase tracking-widest">Arxiu PDF / Lectura</label>
                <div className="flex items-center gap-2 mb-4">
                   <div className={clsx("flex-1 p-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl flex items-center gap-3", !formData.pdf_url && "opacity-30")}>
                      <FileText size={16} className="text-red-500" />
                      <span className="text-[10px] font-bold truncate max-w-[200px]">{formData.pdf_url ? "Fitxer Adjunt" : "Cap fitxer"}</span>
                   </div>
                   {formData.pdf_url && (
                     <button onClick={() => setFormData(p => ({...p, pdf_url: ''}))} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors">
                        <Trash2 size={16} />
                     </button>
                   )}
                </div>
                {!formData.pdf_url && (
                  <DropZone 
                    onFileDrop={(f) => processFileUpload(f, 'pdf_url')} 
                    isUploading={uploadingPdf} 
                    label="Adjuntar PDF"
                    accept="application/pdf"
                    icon={FileText}
                  />
                )}
              </div>

              <div>
                <label className="block text-[10px] font-black text-[var(--color-muted)] mb-4 uppercase tracking-widest">Color de l&apos;Aura</label>
                <div className="flex items-center gap-4 p-4 bg-[var(--color-bg)] rounded-2xl border border-[var(--color-border)]">
                   <input type="color" value={formData.accent_color} onChange={e => setFormData({...formData, accent_color: e.target.value})} className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer p-0" />
                   <input type="text" value={formData.accent_color} onChange={e => setFormData({...formData, accent_color: e.target.value})} className="flex-1 bg-transparent border-none text-sm font-bold uppercase tracking-widest focus:outline-none" />
                   <div className="w-4 h-4 rounded-full shadow-[0_0_15px_var(--color-accent-glow)]" style={{ backgroundColor: formData.accent_color }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: METADATA & TAGS */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2.5rem] p-8 shadow-lg">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-[var(--color-accent)]/10 rounded-2xl text-[var(--color-accent)]"><Globe size={20} /></div>
                    <h3 className="font-black uppercase tracking-[0.2em] text-[var(--color-text)] text-xs">Visibilitat i Context</h3>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-[var(--color-muted)] mb-3 uppercase tracking-widest">Estat Publicació</label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: 'draft', label: 'Esborrany', icon: Type },
                          { id: 'published', label: 'Publicat', icon: Check },
                          { id: 'archived', label: 'Arxivat', icon: Clock }
                        ].map(st => (
                          <button 
                            key={st.id}
                            onClick={() => setFormData({...formData, status: st.id})}
                            className={clsx(
                              "flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2",
                              formData.status === st.id ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-lg" : "bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)]/50"
                            )}
                          >
                             <st.icon size={14} /> {st.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-[var(--color-muted)] mb-3 uppercase tracking-widest">Tipus d&apos;Accés</label>
                      <div className="flex flex-col gap-2">
                        {[
                          { id: 'private', label: 'Privat', icon: Lock },
                          { id: 'public_token', label: 'Protegit amb Token', icon: Shield },
                          { id: 'public_always', label: 'Obert al Públic', icon: Eye }
                        ].map(st => (
                          <button 
                            key={st.id}
                            onClick={() => setFormData({...formData, visibility_type: st.id})}
                            className={clsx(
                              "w-full px-4 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-between group",
                              formData.visibility_type === st.id ? "bg-[var(--color-accent)]/5 text-[var(--color-accent)] border-[var(--color-accent)]" : "bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)]/50"
                            )}
                          >
                             <div className="flex items-center gap-3">
                               <st.icon size={16} /> {st.label}
                             </div>
                             {formData.visibility_type === st.id && <Check size={14} />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl hover:border-[var(--color-accent)]/50 transition-colors cursor-pointer group" onClick={() => setFormData({...formData, featured: !formData.featured})}>
                        <div className={clsx("w-5 h-5 rounded-md border flex items-center justify-center transition-all", formData.featured ? "bg-amber-500 border-amber-500 text-white" : "border-[var(--color-border)]")}>
                          {formData.featured && <Check size={12} />}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] group-hover:text-white">Destacat</span>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl hover:border-[var(--color-accent)]/50 transition-colors cursor-pointer group" onClick={() => setFormData({...formData, protected: !formData.protected})}>
                        <div className={clsx("w-5 h-5 rounded-md border flex items-center justify-center transition-all", formData.protected ? "bg-red-500 border-red-500 text-white" : "border-[var(--color-border)]")}>
                          {formData.protected && <Check size={12} />}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] group-hover:text-white">Pin Extra</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-[var(--color-accent)]/10 rounded-2xl text-[var(--color-accent)]"><Hash size={20} /></div>
                    <h3 className="font-black uppercase tracking-[0.2em] text-[var(--color-text)] text-xs">Anotacions i Etiquetes</h3>
                  </div>

                  <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-[var(--color-muted)] mb-3 uppercase tracking-widest flex items-center gap-2">
                           <Building2 size={12} /> Empresa Associada
                        </label>
                        <div className="relative">
                           <button 
                            onClick={() => setIsCompanyOpen(!isCompanyOpen)}
                            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] text-sm font-bold rounded-2xl px-5 py-4 flex items-center justify-between"
                           >
                              {companies.find(c => c.id === formData.company_id)?.name || "Acció Independent"}
                              <ChevronDown size={14} className={clsx("transition-transform", isCompanyOpen && "rotate-180")} />
                           </button>
                           {isCompanyOpen && (
                             <div className="absolute top-full left-0 w-full mt-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[250px] overflow-y-auto animate-in zoom-in-95 duration-200">
                                <button onClick={() => { setFormData({...formData, company_id: ""}); setIsCompanyOpen(false); }} className="w-full text-left px-5 py-4 hover:bg-[var(--color-bg)] text-xs font-bold border-b border-[var(--color-border)]/50">Cap (Desvinculat)</button>
                                {companies.map(c => (
                                  <button key={c.id} onClick={() => { setFormData({...formData, company_id: c.id}); setIsCompanyOpen(false); }} className="w-full text-left px-5 py-4 hover:bg-[var(--color-bg)] text-xs font-bold border-b border-[var(--color-border)]/50 last:border-0">{c.name}</button>
                                ))}
                             </div>
                           )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-[var(--color-muted)] mb-3 uppercase tracking-widest flex items-center gap-2">
                           <Calendar size={12} /> Data del Mòdul
                        </label>
                        <input 
                          type="text" 
                          placeholder="Ex: 2024 o 2024-12-31"
                          value={formData.work_date} 
                          onChange={e => setFormData({...formData, work_date: e.target.value})} 
                          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-white text-sm font-bold rounded-2xl px-5 py-3.5 focus:outline-none focus:border-[var(--color-accent)] placeholder-[var(--color-muted)]/30" 
                        />
                        <p className="text-[9px] text-[var(--color-muted)] mt-2 pl-1">Pots escriure només l&apos;any si no saps el dia exacte.</p>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-[var(--color-muted)] mb-4 uppercase tracking-widest">Selecciona Etiquetes Predefinides</label>
                        <div className="flex flex-wrap gap-2 overflow-y-auto max-h-[160px] p-1 scrollbar-hide">
                           {PREDEFINED_TAGS.map(tag => {
                             const isSelected = formData.tags?.includes(tag);
                             return (
                               <button 
                                 key={tag}
                                 onClick={() => toggleTag(tag)}
                                 className={clsx(
                                   "px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border",
                                   isSelected ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-md shadow-[var(--color-accent-glow)]" : "bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)]/50"
                                 )}
                               >
                                 {tag}
                               </button>
                             );
                           })}
                        </div>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* CONTENT BLOCKS BENTO SECTION */}
      <div className="space-y-6">
         <div className="flex items-center gap-4 text-[var(--color-text)]">
            <Maximize2 size={20} className="text-[var(--color-accent)]" />
            <h2 className="text-xl font-display font-black tracking-tight uppercase">Arquitectura del Contingut</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-[var(--color-border)] to-transparent" />
         </div>
         <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[3rem] p-8 md:p-16 shadow-2xl relative">
            <BlockBuilder blocks={formData.content} onChange={(blocks) => setFormData({...formData, content: blocks})} />
         </div>
      </div>

      {/* VERSION HISTORY BENTO (SMALL) */}
      {workId !== "nuevo" && versionHistory.length > 0 && (
        <div className="max-w-3xl mx-auto bg-[var(--color-bg)] border border-[var(--color-border)] rounded-3xl p-8">
           <div className="flex items-center gap-3 mb-6">
              <Clock size={16} className="text-[var(--color-muted)]" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-muted)]">Càpsules del Temps (Versions)</p>
           </div>
           <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {versionHistory.map((snap, i) => (
                <button 
                  key={i} 
                  onClick={() => {
                    if(confirm("Restaurar?")) setFormData(p => ({...p, title: snap.title, summary: snap.summary, content: snap.content }));
                  }}
                  className="shrink-0 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl hover:border-[var(--color-accent)] transition-all flex flex-col gap-1 items-start min-w-[200px]"
                >
                  <span className="text-[10px] font-black text-white">{new Date(snap.timestamp).toLocaleString("ca-ES", { day:"numeric", month:"long" })}</span>
                  <span className="text-[9px] text-[var(--color-muted)] uppercase tracking-widest">{new Date(snap.timestamp).toLocaleTimeString("ca-ES", { hour: '2-digit', minute: '2-digit'})}</span>
                </button>
              ))}
           </div>
        </div>
      )}
    </div>
  );
}
