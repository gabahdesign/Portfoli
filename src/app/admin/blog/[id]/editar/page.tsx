"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { TipTapEditor } from "@/components/admin/TipTapEditor";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Activity, Newspaper, Lock, CreditCard } from "lucide-react";

export default function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const postId = resolvedParams.id;
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: null as any,
    cover_url: "",
    is_premium: false,
    published_at: new Date().toISOString().split('T')[0],
    status: "draft"
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    async function loadData() {
      if (postId !== "nuevo") {
        const { data } = await supabase.from("blog_posts").select("*").eq("id", postId).single();
        if (data) {
          setFormData({
            title: data.title || "",
            slug: data.slug || "",
            excerpt: data.excerpt || "",
            content: data.content || null,
            cover_url: data.cover_url || "",
            is_premium: data.is_premium || false,
            published_at: data.published_at ? new Date(data.published_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            status: data.status || "draft"
          });
        }
      }
      setLoading(false);
    }
    loadData();
  }, [postId, supabase]);

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
    const payload = {
      ...formData,
      published_at: formData.published_at ? new Date(formData.published_at).toISOString() : new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (postId === "nuevo") {
      const { error } = await supabase.from("blog_posts").insert([payload]);
      if (!error) router.push("/admin/blog");
      else showToast("Error: " + error.message, "error");
    } else {
      const { error } = await supabase.from("blog_posts").update(payload).eq("id", postId);
      if (!error) showToast("Article desat correctament", "success");
      else showToast("Error: " + error.message, "error");
    }
    setSaving(false);
  };

  if (loading) return <div className="p-4 md:p-8 text-[var(--color-muted)] animate-pulse uppercase tracking-[0.2em] font-black text-[10px]">Carregant editor de Journal...</div>;

  return (
    <div className="p-4 md:p-8 pb-32 animate-in fade-in duration-500 w-full relative">
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-2xl shadow-xl text-white font-bold z-50 flex items-center gap-2 animate-in slide-in-from-bottom-5 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-center gap-4 mb-10 border-b border-[var(--color-border)] pb-6">
        <button onClick={() => router.back()} className="p-2 border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] rounded-xl transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
           <div className="flex items-center gap-2 mb-1">
              <Newspaper size={14} className="text-[var(--color-accent)]" />
              <h1 className="text-3xl font-black text-[var(--color-text)] tracking-tight">
                {postId === "nuevo" ? "Redactar Article" : "Editar Entrada"}
              </h1>
           </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white px-8 py-3 rounded-2xl flex items-center transition-all font-bold shadow-xl shadow-[var(--color-accent-glow)] active:scale-95 disabled:opacity-50"
        >
          {saving ? <Activity className="w-5 h-5 mr-3 animate-spin" /> : <Save className="w-5 h-5 mr-3" />}
          Desar Article
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Maincontent */}
        <div className="lg:col-span-3 space-y-8">
           <div className="space-y-6">
              <input
                type="text"
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="Títol del nou article..."
                className="w-full bg-transparent border-none text-5xl font-serif font-black text-[var(--color-text)] focus:outline-none focus:ring-0 placeholder-[var(--color-muted)] opacity-80"
              />
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                placeholder="Sub-títol o resum que inciti a la lectura..."
                rows={2}
                className="w-full bg-transparent border-none text-xl font-serif italic text-[var(--color-muted)] focus:outline-none focus:ring-0 placeholder-[var(--color-muted-2)] resize-none"
              />
           </div>

           <div className="mt-8 border border-[var(--color-border)] rounded-2xl bg-[var(--color-surface)] shadow-inner">
             <TipTapEditor content={formData.content} onChange={(html) => setFormData({...formData, content: html})} />
           </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-8">
           <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8 space-y-6 shadow-xl">
              <h3 className="font-black text-[var(--color-muted)] uppercase tracking-[0.2em] text-[10px] mb-2">Preferències de Publicació</h3>
              
              <div>
                <label className="block text-[10px] font-black text-[var(--color-muted)] mb-2 uppercase tracking-widest">Estat</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] text-sm rounded-xl px-4 py-3 outline-none focus:border-[var(--color-accent)] transition-all appearance-none"
                >
                  <option value="draft">Esborrany</option>
                  <option value="published">Publicat</option>
                  <option value="archived">Arxivat</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-[var(--color-muted)] mb-2 uppercase tracking-widest">URL Personalitzada (Slug)</label>
                <input 
                  type="text" 
                  value={formData.slug} 
                  onChange={e => setFormData({...formData, slug: e.target.value})} 
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] text-sm rounded-xl px-4 py-3 outline-none focus:border-[var(--color-accent)] transition-all" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-[var(--color-muted)] mb-2 uppercase tracking-widest">Data de l'Article</label>
                <input 
                  type="date" 
                  value={formData.published_at} 
                  onChange={e => setFormData({...formData, published_at: e.target.value})}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] text-sm rounded-xl px-4 py-3 outline-none focus:border-[var(--color-accent)] transition-all [color-scheme:dark]" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-[var(--color-muted)] mb-2 uppercase tracking-widest">Imatge de Capçalera (URL)</label>
                <input 
                  type="text" 
                  value={formData.cover_url} 
                  onChange={e => setFormData({...formData, cover_url: e.target.value})} 
                  placeholder="https://..."
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] text-sm rounded-xl px-4 py-3 outline-none focus:border-[var(--color-accent)] transition-all" 
                />
              </div>

              <div className="pt-6 border-t border-[var(--color-border)] space-y-4">
                 <label className="flex items-center justify-between cursor-pointer group p-3 bg-[var(--color-bg)]/50 rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all">
                    <div className="flex items-center gap-3">
                       <CreditCard size={18} className={formData.is_premium ? "text-amber-500" : "text-[var(--color-muted)]"} />
                       <span className="text-xs font-bold text-[var(--color-text)]">Article Premium</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={formData.is_premium}
                      onChange={e => setFormData({...formData, is_premium: e.target.checked})}
                      className="w-5 h-5 rounded border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                    />
                 </label>
                 <p className="text-[10px] text-[var(--color-muted)] italic leading-relaxed">Els articles premium requereixen de subscripció activa via Stripe per a la lectura completa.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
