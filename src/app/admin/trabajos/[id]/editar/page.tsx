"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { TipTapEditor } from "@/components/admin/TipTapEditor";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Activity, Clock, RotateCcw } from "lucide-react";

export default function EditWorkPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const workId = resolvedParams.id;
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);
  const [versionHistory, setVersionHistory] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    company_id: "",
    work_date: "",
    cover_url: "",
    summary: "",
    tags: "",
    status: "draft",
    featured: false,
    protected: false,
    visibility_type: "public_token", // Default
    content: null as any
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    async function loadData() {
      // 1. Load available companies
      const { data: cData } = await supabase.from("companies").select("id, name").order("name");
      if (cData) setCompanies(cData);

      // 2. Load work
      if (workId !== "nuevo") {
        const { data: wData } = await supabase.from("works").select("*").eq("id", workId).single();
        if (wData) {
          setFormData({
            title: wData.title || "",
            slug: wData.slug || "",
            company_id: wData.company_id || "",
            work_date: wData.work_date ? new Date(wData.work_date).toISOString().split('T')[0] : "",
            cover_url: wData.cover_url || "",
            summary: wData.summary || "",
            tags: wData.tags ? wData.tags.join(", ") : "",
            status: wData.status || "draft",
            featured: wData.featured || false,
            protected: wData.protected || false,
            visibility_type: wData.visibility_type || "public_token",
            content: wData.content || null
          });
          if (wData.version_history) setVersionHistory(wData.version_history);
        }
      }
      setLoading(false);
    }
    loadData();
  }, [workId, supabase]);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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

    const payload = {
      ...formData,
      tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
      work_date: formData.work_date || null,
      version_history: newHistory
    };

    if (workId === "nuevo") {
      const { error } = await supabase.from("works").insert([payload]);
      if (!error) router.push("/admin/trabajos");
      else showToast("Error: " + error.message, "error");
    } else {
      const { error } = await supabase.from("works").update(payload).eq("id", workId);
      if (!error) {
        showToast("Guardado correctamente", "success");
        setVersionHistory(newHistory);
      } else {
        showToast("Error: " + error.message, "error");
      }
    }
    setSaving(false);
  };

  const restoreSnapshot = (snapshot: any) => {
    if(!confirm("¿Restaurar esta versión? Se sobreescribirán los cambios no guardados en el editor.")) return;
    setFormData(prev => ({
      ...prev,
      title: snapshot.title,
      summary: snapshot.summary,
      content: snapshot.content
    }));
    showToast("Versión restaurada en el editor. Guarda para aplicar los cambios en la base de datos.", "success");
  };

  if (loading) return <div className="p-4 md:p-8 text-[var(--color-muted)] animate-pulse">Cargando editor...</div>;

  return (
    <div className="p-4 md:p-8 pb-32 animate-in fade-in duration-500 max-w-7xl mx-auto relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-xl text-white font-medium z-50 flex items-center gap-2 animate-in slide-in-from-bottom-5 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-center gap-4 mb-8 border-b border-color-border pb-4">
        <button onClick={() => router.back()} className="p-2 border border-color-border text-color-muted hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-display font-bold text-[var(--color-text)] flex-1">
          {workId === "nuevo" ? "Crear Nuevo Proyecto" : "Editar Proyecto"}
        </h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-color-accent hover:bg-color-accent-hover text-white px-6 py-2.5 rounded-lg flex items-center transition-colors font-medium disabled:opacity-50"
        >
          {saving ? <Activity className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
          Guardar Proyecto
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Editor Principal (3 columnas) */}
        <div className="lg:col-span-3 space-y-6">
           <div className="space-y-4">
             <input
               type="text"
               value={formData.title}
               onChange={handleTitleChange}
               placeholder="Título majestuoso..."
                className="w-full bg-transparent border-none text-4xl font-display font-bold text-[var(--color-text)] focus:outline-none focus:ring-0 placeholder-[var(--color-muted-2)]"
             />
             <input
               type="text"
               value={formData.summary}
               onChange={(e) => setFormData({...formData, summary: e.target.value})}
               placeholder="Un resumen cautivador en una o dos líneas..."
               className="w-full bg-transparent border-none text-lg text-color-muted focus:outline-none focus:ring-0 placeholder-[var(--color-muted-2)]"
             />
           </div>

           <div className="mt-8 border border-color-border rounded-xl">
             <TipTapEditor content={formData.content} onChange={(html) => setFormData({...formData, content: html})} />
           </div>
        </div>

        {/* Panel Lateral Meta-datos i Versions */}
        <div className="space-y-6">
           <div className="bg-color-surface border border-color-border rounded-xl p-6 space-y-4">
              <h3 className="font-bold text-[var(--color-text)] uppercase tracking-wider text-xs mb-4">Meta-datos</h3>
              
              <div>
                <label className="block text-xs font-bold text-color-muted mb-1.5 uppercase tracking-wider">Estado</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-[var(--color-bg)] border border-color-border text-[var(--color-text)] text-sm rounded-xl px-3 py-2 outline-none focus:border-color-accent transition-colors"
                >
                  <option value="draft">Borrador</option>
                  <option value="published">Publicado</option>
                  <option value="archived">Archivado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-color-muted mb-1.5 uppercase tracking-wider">URL (Slug)</label>
                <input 
                  type="text" 
                  value={formData.slug} 
                  onChange={e => setFormData({...formData, slug: e.target.value})} 
                  className="w-full bg-[var(--color-bg)] border border-color-border text-[var(--color-text)] text-sm rounded-xl px-3 py-2 outline-none focus:border-color-accent transition-colors" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-color-muted mb-1.5 uppercase tracking-wider">Empresa Asociada</label>
                <select 
                  value={formData.company_id || ""}
                  onChange={e => setFormData({...formData, company_id: e.target.value === "" ? "" : e.target.value})}
                  className="w-full bg-[var(--color-bg)] border border-color-border text-[var(--color-text)] text-sm rounded-xl px-3 py-2 outline-none focus:border-color-accent transition-colors"
                >
                  <option value="">-- Ninguna (Desvinculado) --</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-color-muted mb-1.5 uppercase tracking-wider">Data del Projecte</label>
                <input 
                  type="date" 
                  value={formData.work_date} 
                  onChange={e => setFormData({...formData, work_date: e.target.value})}
                  className="w-full bg-[var(--color-bg)] border border-color-border text-[var(--color-text)] text-sm rounded-xl px-3 py-2 outline-none focus:border-color-accent transition-colors [color-scheme:dark]" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-color-muted mb-1.5 uppercase tracking-wider">Etiquetas (separadas por coma)</label>
                <input 
                  type="text" 
                  value={formData.tags} 
                  onChange={e => setFormData({...formData, tags: e.target.value})} 
                  placeholder="UI, UX, React..."
                  className="w-full bg-[var(--color-bg)] border border-color-border text-[var(--color-text)] text-sm rounded-xl px-3 py-2 outline-none focus:border-color-accent transition-colors" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-color-muted mb-1.5 uppercase tracking-wider">Imagen de Portada (URL)</label>
                <input 
                  type="text" 
                  value={formData.cover_url} 
                  onChange={e => setFormData({...formData, cover_url: e.target.value})} 
                  placeholder="https://..."
                  className="w-full bg-[var(--color-bg)] border border-color-border text-[var(--color-text)] text-sm rounded-xl px-3 py-2 outline-none focus:border-color-accent transition-colors" 
                />
              </div>

              <div className="pt-4 border-t border-color-border space-y-4">
                 <div className="space-y-2">
                    <label className="block text-[10px] font-black text-color-muted uppercase tracking-widest">Visibilitat Pública</label>
                    <select 
                      value={formData.visibility_type}
                      onChange={e => setFormData({...formData, visibility_type: e.target.value})}
                      className="w-full bg-[var(--color-bg)] border border-color-border text-[var(--color-text)] text-xs rounded-xl px-3 py-2.5 outline-none focus:border-color-accent transition-all appearance-none"
                    >
                      <option value="private">Privat (Només Admin)</option>
                      <option value="public_token">Protegit (Requereix Token)</option>
                      <option value="public_always">Públic (Pràctiques / Obert)</option>
                    </select>
                    <p className="text-[9px] text-color-muted italic px-1">"Públic" apareixerà a la home sense necessitat de token.</p>
                 </div>

                 <div className="pt-2 flex flex-col gap-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={formData.featured}
                        onChange={e => setFormData({...formData, featured: e.target.checked})}
                        className="w-5 h-5 rounded border-color-border bg-color-bg text-color-accent focus:ring-color-accent"
                      />
                      <span className="text-sm font-medium text-color-text group-hover:text-[var(--color-accent)] transition-colors">
                        Destacar en Portada
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={formData.protected}
                        onChange={e => setFormData({...formData, protected: e.target.checked})}
                        className="w-5 h-5 rounded border-color-border bg-color-bg text-color-accent focus:ring-color-accent"
                      />
                      <span className="text-sm font-medium text-color-text group-hover:text-[var(--color-accent)] transition-colors">
                        Protegit per PIN extra
                      </span>
                    </label>
                 </div>
              </div>
           </div>

           {workId !== "nuevo" && versionHistory.length > 0 && (
             <div className="bg-color-surface border border-color-border rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-color-muted" />
                  <h3 className="font-bold text-[var(--color-text)] uppercase tracking-wider text-xs">Historial</h3>
                </div>
                <div className="space-y-3">
                  {versionHistory.map((snap, i) => (
                    <div key={i} className="flex flex-col gap-1 pb-3 border-b border-color-border last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-color-text font-medium">
                          {new Date(snap.timestamp).toLocaleString("ca-ES", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit"})}
                        </span>
                        <button 
                          onClick={() => restoreSnapshot(snap)}
                          className="text-[10px] bg-color-bg border border-color-border hover:border-color-accent px-2 py-1 rounded flex items-center gap-1 text-color-muted hover:text-color-accent transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" /> Restaurar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
