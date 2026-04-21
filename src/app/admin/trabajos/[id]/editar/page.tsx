"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Activity, Clock, RotateCcw, Shield, Eye, Lock, ChevronDown, Check, Building2, Upload, FileText, Loader2 } from "lucide-react";
import { useRef } from "react";
import { BlockBuilder, Block } from "@/components/admin/block-builder/BlockBuilder";

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
  const coverInputRef = useRef<HTMLInputElement>(null);
  
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
    visibility_type: "public_token",
    content: [] as Block[],
    accent_color: "#5e6efc"
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
            work_date: wData.work_date ? new Date(wData.work_date).toISOString().split('T')[0] : "",
            cover_url: wData.cover_url || "",
            summary: wData.summary || "",
            tags: wData.tags ? wData.tags.join(", ") : "",
            status: wData.status || "draft",
            featured: wData.featured || false,
            protected: wData.protected || false,
            visibility_type: wData.visibility_type || "public_token",
            content: Array.isArray(wData.content) ? wData.content : (wData.content?.type === 'doc' ? [{
              id: 'initial',
              type: 'text',
              content: { text: "", json: wData.content }, // Keep the raw Tiptap JSON if it exists
              settings: { padding: '2.5rem' }
            }] : []),
            accent_color: wData.accent_color || "#5e6efc"
          });
          if (wData.version_history) setVersionHistory(wData.version_history);
        }
      }
      setLoading(false);
    }
    loadData();
  }, [workId]); // Removed unstable supabase from dependencies to prevent infinite loops

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

  const handleSave = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
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
        showToast("Guardat correctament", "success");
        setVersionHistory(newHistory);
      } else {
        showToast("Error: " + error.message, "error");
      }
    }
    setSaving(false);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Accept all media: images (including SVG/GIF), videos, audio, and PDF
    const allowedMimeGroups = ["image/", "video/", "audio/", "application/pdf"];
    const isSvg = file.name.toLowerCase().endsWith(".svg");
    const isAllowed = allowedMimeGroups.some(g => file.type.startsWith(g)) || isSvg;
    if (!isAllowed) {
      showToast("Format no suportat. Usa imatges, GIFs, vídeos, audios, SVG o PDF.", "error");
      return;
    }

    setUploadingCover(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const filePath = `works/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("portfolio-media")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("portfolio-media").getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, cover_url: data.publicUrl }));
      showToast("Imatge/Vídeo de portada pujat!", "success");
    } catch (err: any) {
      showToast("Error pujant mèdia: " + err.message, "error");
    } finally {
      setUploadingCover(false);
    }
  };

  const restoreSnapshot = (snapshot: any) => {
    if(!confirm("Restaurar aquesta versió? Es sobreescriuran els canvis no guardats a l'editor.")) return;
    setFormData(prev => ({
      ...prev,
      title: snapshot.title,
      summary: snapshot.summary,
      content: snapshot.content
    }));
    showToast("Versió restaurada. Guarda per aplicar els canvis.", "success");
  };

  if (loading) return <div className="p-4 md:p-8 text-[var(--color-muted)] animate-pulse">Carregant editor...</div>;

  return (
    <div className="p-4 md:p-8 pb-32 animate-in fade-in duration-500 max-w-7xl mx-auto relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-xl text-white font-medium z-50 flex items-center gap-2 animate-in slide-in-from-bottom-5 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      <div className="sticky top-0 z-40 bg-[var(--color-bg)]/80 backdrop-blur-md -mx-4 md:-mx-8 px-4 md:px-8 py-4 border-b border-[var(--color-border)] mb-8 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-[200px]">
          <button
            onClick={() => router.back()}
            className="p-2 border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] rounded-lg transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl md:text-3xl font-display font-bold text-[var(--color-text)] truncate">
            {workId === "nuevo" ? "Crear Nou" : "Editar Projecte"}
          </h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors font-bold shadow-lg shadow-[var(--color-accent-glow)] disabled:opacity-50 order-last sm:order-none"
        >
          {saving ? <Activity className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          <span className="sm:inline">{workId === "nuevo" ? "Crear Projecte" : "Guardar Projecte"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Editor Principal (3 columnes) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="space-y-4">
            <input
              type="text"
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="Títol del projecte..."
              className="w-full bg-transparent border-none text-4xl font-display font-bold text-[var(--color-text)] focus:outline-none focus:ring-0 placeholder-[var(--color-muted-2)]"
            />
            <input
              type="text"
              value={formData.summary}
              onChange={(e) => setFormData({...formData, summary: e.target.value})}
              placeholder="Un resum en una o dues línies..."
              className="w-full bg-transparent border-none text-lg text-[var(--color-muted)] focus:outline-none focus:ring-0 placeholder-[var(--color-muted-2)]"
            />
          </div>

          <div className="mt-8 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)]/10">
            <BlockBuilder blocks={formData.content} onChange={(blocks) => setFormData({...formData, content: blocks})} />
          </div>
        </div>

        {/* Panel Lateral Meta-dades i Versions */}
        <div className="space-y-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-[var(--color-text)] uppercase tracking-wider text-xs mb-4">Meta-dades</h3>
            
            <div>
              <label className="block text-[10px] font-black text-[var(--color-muted)] mb-3 uppercase tracking-[0.2em]">Estat</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsStatusOpen(!isStatusOpen)}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-[var(--color-text)] text-sm rounded-xl px-4 py-3 flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${formData.status === 'published' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : formData.status === 'draft' ? 'bg-amber-500' : 'bg-zinc-500'}`} />
                    <span className="font-bold">
                      {formData.status === 'published' ? "Publicat" : formData.status === 'draft' ? "Esborrany" : "Arxivat"}
                    </span>
                  </div>
                  <ChevronDown size={14} className={`text-[var(--color-muted)] transition-transform duration-300 ${isStatusOpen ? 'rotate-180' : ''}`} />
                </button>
                {isStatusOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xl z-30 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                    {[
                      { id: 'draft', label: 'Esborrany', color: 'bg-amber-500' },
                      { id: 'published', label: 'Publicat', color: 'bg-green-500' },
                      { id: 'archived', label: 'Arxivat', color: 'bg-zinc-500' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => { setFormData({...formData, status: st.id}); setIsStatusOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--color-bg)] transition-colors ${formData.status === st.id ? 'bg-[var(--color-accent)]/5' : ''}`}
                      >
                        <div className={`w-2 h-2 rounded-full ${st.color}`} />
                        <span className={`text-sm ${formData.status === st.id ? 'font-bold text-[var(--color-accent)]' : 'text-[var(--color-text)]'}`}>{st.label}</span>
                        {formData.status === st.id && <Check size={12} className="ml-auto text-[var(--color-accent)]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-[var(--color-muted)] mb-3 uppercase tracking-[0.2em]">Empresa Associada</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsCompanyOpen(!isCompanyOpen)}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-[var(--color-text)] text-sm rounded-xl px-4 py-3 flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Building2 size={14} className="text-[var(--color-muted)] shrink-0" />
                    <span className="font-bold truncate">
                      {companies.find(c => c.id === formData.company_id)?.name || "Cap (Desvinculat)"}
                    </span>
                  </div>
                  <ChevronDown size={14} className={`text-[var(--color-muted)] transition-transform duration-300 ${isCompanyOpen ? 'rotate-180' : ''}`} />
                </button>
                {isCompanyOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xl z-30 overflow-hidden max-h-[300px] overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200">
                    <button
                      type="button"
                      onClick={() => { setFormData({...formData, company_id: ""}); setIsCompanyOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--color-red)]/10 text-red-400 transition-colors ${formData.company_id === "" ? 'bg-red-400/5 font-bold' : ''}`}
                    >
                      <span className="text-sm">Sense Empresa</span>
                      {formData.company_id === "" && <Check size={12} className="ml-auto" />}
                    </button>
                    {companies.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => { setFormData({...formData, company_id: c.id}); setIsCompanyOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--color-bg)] transition-colors ${formData.company_id === c.id ? 'bg-[var(--color-accent)]/5 font-bold text-[var(--color-accent)]' : 'text-[var(--color-text)]'}`}
                      >
                        <span className="text-sm truncate">{c.name}</span>
                        {formData.company_id === c.id && <Check size={12} className="ml-auto" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-muted)] mb-1.5 uppercase tracking-wider">Data del Projecte</label>
              <input 
                type="date" 
                value={formData.work_date} 
                onChange={e => setFormData({...formData, work_date: e.target.value})}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] text-sm rounded-xl px-3 py-2 outline-none focus:border-[var(--color-accent)] transition-colors [color-scheme:dark]" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-muted)] mb-1.5 uppercase tracking-wider">Etiquetes (separades per coma)</label>
              <input 
                type="text" 
                value={formData.tags} 
                onChange={e => setFormData({...formData, tags: e.target.value})} 
                placeholder="UI, UX, React..."
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] text-sm rounded-xl px-3 py-2 outline-none focus:border-[var(--color-accent)] transition-colors" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-muted)] mb-1.5 uppercase tracking-wider">Imatge o Vídeo de Portada (Miniatura)</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={formData.cover_url} 
                  onChange={e => setFormData({...formData, cover_url: e.target.value})} 
                  placeholder="https://..."
                  className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] text-sm rounded-xl px-3 py-2 outline-none focus:border-[var(--color-accent)] transition-colors" 
                />
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploadingCover}
                  className="bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-[var(--color-muted)] hover:text-[var(--color-accent)] p-2.5 rounded-xl transition-all"
                  title="Pujar imatge, GIF o vídeo"
                >
                  {uploadingCover ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                </button>
                <input 
                  ref={coverInputRef}
                  type="file" 
                  accept="image/*,video/*,audio/*,.svg,.pdf,application/pdf" 
                  className="hidden" 
                  onChange={handleCoverUpload} 
                />
              </div>
              
              {formData.cover_url && (
                <div className="mt-4 relative group rounded-xl overflow-hidden border border-[var(--color-border)] bg-black/20">
                  {formData.cover_url.match(/\.(mp4|webm|mov)$/i) || formData.cover_url.includes('video') ? (
                    <div className="aspect-video">
                      <video 
                        src={formData.cover_url} 
                        className="w-full h-full object-cover" 
                        autoPlay muted loop playsInline
                      />
                    </div>
                  ) : formData.cover_url.match(/\.(mp3|wav|ogg|aac|m4a)$/i) ? (
                    <div className="flex flex-col items-center gap-3 p-6">
                      <div className="w-12 h-12 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center">
                        <svg className="w-6 h-6 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                      </div>
                      <audio src={formData.cover_url} controls className="w-full" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)]">Fitxer d'Àudio</span>
                    </div>
                  ) : formData.cover_url.match(/\.pdf$/i) ? (
                    <div className="flex flex-col items-center gap-3 p-6">
                      <FileText className="w-10 h-10 text-[var(--color-accent)] opacity-70" />
                      <span className="text-xs font-bold text-[var(--color-muted)] truncate max-w-full px-4">{formData.cover_url.split('/').pop()}</span>
                      <a href={formData.cover_url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-widest text-[var(--color-accent)] hover:underline">Obrir PDF</a>
                    </div>
                  ) : (
                    <div className="aspect-video">
                      <img 
                        src={formData.cover_url} 
                        className="w-full h-full object-cover" 
                        alt="Preview"
                      />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <button type="button" onClick={() => setFormData(p => ({...p, cover_url: ''}))} className="bg-red-500/80 hover:bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest transition-colors">✕ Treure</button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-muted)] mb-1.5 uppercase tracking-wider text-left">Color d'Accent del Projecte</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={formData.accent_color} 
                  onChange={e => setFormData({...formData, accent_color: e.target.value})}
                  className="w-12 h-12 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] cursor-pointer overflow-hidden p-0" 
                />
                <input 
                  type="text" 
                  value={formData.accent_color} 
                  onChange={e => setFormData({...formData, accent_color: e.target.value})}
                  className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] text-sm rounded-xl px-3 py-2 outline-none focus:border-[var(--color-accent)] transition-colors" 
                  placeholder="#5e6efc"
                />
              </div>
              <p className="text-[9px] text-[var(--color-muted)] mt-2 opacity-60">Aquest color personalitzarà els botons i detalls quan l'usuari vegi aquest projecte.</p>
            </div>

            <div className="pt-4 border-t border-[var(--color-border)] space-y-5">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-[var(--color-muted)] uppercase tracking-[0.2em]">Visibilitat Pública</label>
                
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsVisOpen(!isVisOpen)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-[var(--color-text)] text-sm rounded-2xl px-4 py-3.5 flex items-center justify-between transition-all group shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent)] group-hover:scale-110 transition-transform">
                        {formData.visibility_type === 'private' && <Lock size={16} />}
                        {formData.visibility_type === 'public_token' && <Shield size={16} />}
                        {formData.visibility_type === 'public_always' && <Eye size={16} />}
                      </div>
                      <div className="flex flex-col items-start leading-tight">
                        <span className="font-bold">
                          {formData.visibility_type === 'private' && "Privat"}
                          {formData.visibility_type === 'public_token' && "Protegit"}
                          {formData.visibility_type === 'public_always' && "Públic"}
                        </span>
                        <span className="text-[10px] text-[var(--color-muted)]">
                          {formData.visibility_type === 'private' && "Només visible per tu"}
                          {formData.visibility_type === 'public_token' && "Requereix clau d'accés"}
                          {formData.visibility_type === 'public_always' && "Obert a tothom"}
                        </span>
                      </div>
                    </div>
                    <ChevronDown size={14} className={`text-[var(--color-muted)] transition-transform duration-300 ${isVisOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isVisOpen && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      {[
                        { id: 'private', label: 'Privat', desc: 'Accés restringit a l\'administrador', icon: Lock },
                        { id: 'public_token', label: 'Protegit', desc: 'Per a clients amb token d\'accés', icon: Shield },
                        { id: 'public_always', label: 'Públic', desc: 'Apareix obertament al teu portfoli', icon: Eye },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setFormData({...formData, visibility_type: opt.id});
                            setIsVisOpen(false);
                          }}
                          className={`w-full flex items-center gap-4 px-4 py-4 text-left transition-all border-b border-[var(--color-border)]/50 last:border-0 ${formData.visibility_type === opt.id ? 'bg-[var(--color-accent)]/10' : 'hover:bg-[var(--color-bg)]'}`}
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${formData.visibility_type === opt.id ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-border)] text-[var(--color-muted)]'}`}>
                            <opt.icon size={16} />
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-bold ${formData.visibility_type === opt.id ? 'text-[var(--color-accent)]' : 'text-[var(--color-text)]'}`}>{opt.label}</p>
                            <p className="text-[10px] text-[var(--color-muted)]">{opt.desc}</p>
                          </div>
                          {formData.visibility_type === opt.id && <Check size={14} className="text-[var(--color-accent)]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={formData.featured}
                    onChange={e => setFormData({...formData, featured: e.target.checked})}
                    className="w-5 h-5 rounded border-[var(--color-border)] bg-[var(--color-bg)] accent-[var(--color-accent)]"
                  />
                  <span className="text-sm font-medium text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
                    Destacar en Portada
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={formData.protected}
                    onChange={e => setFormData({...formData, protected: e.target.checked})}
                    className="w-5 h-5 rounded border-[var(--color-border)] bg-[var(--color-bg)] accent-[var(--color-accent)]"
                  />
                  <span className="text-sm font-medium text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
                    Protegit per PIN extra
                  </span>
                </label>
              </div>
            </div>
          </div>

          {workId !== "nuevo" && versionHistory.length > 0 && (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-[var(--color-muted)]" />
                <h3 className="font-bold text-[var(--color-text)] uppercase tracking-wider text-xs">Historial</h3>
              </div>
              <div className="space-y-3">
                {versionHistory.map((snap, i) => (
                  <div key={i} className="flex flex-col gap-1 pb-3 border-b border-[var(--color-border)] last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--color-text)] font-medium">
                        {new Date(snap.timestamp).toLocaleString("ca-ES", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit"})}
                      </span>
                      <button 
                        onClick={() => restoreSnapshot(snap)}
                        className="text-[10px] bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent)] px-2 py-1 rounded flex items-center gap-1 text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors"
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
