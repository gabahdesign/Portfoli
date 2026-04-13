"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Edit2, Trash2, Search, FileText, Newspaper, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminBlog() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const supabase = createClient();
  const router = useRouter();

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setPosts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Eliminar permanentemente l'article "${title}"?`)) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    fetchPosts();
  };

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-[var(--color-border)] pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Newspaper className="w-5 h-5 text-[var(--color-accent)]" />
             <h1 className="text-3xl font-black text-[var(--color-text)] tracking-tight">Gestió del Journal / Blog</h1>
          </div>
          <p className="text-[var(--color-muted)] text-sm">Crea articles "newspaper-style" i gestiona la monetització amb Stripe.</p>
        </div>
        <button 
          onClick={() => router.push("/admin/blog/nuevo/editar")} 
          className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white px-6 py-3 rounded-xl flex items-center justify-center transition-all font-bold shadow-lg shadow-[var(--color-accent-glow)] active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" /> Nou Article
        </button>
      </div>

      {/* Search & Stats */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
          <input 
            type="text" 
            placeholder="Cercar articles..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl pl-11 pr-4 py-2.5 focus:outline-none focus:border-[var(--color-accent)] text-sm"
          />
        </div>
        <div className="flex gap-2">
           <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 flex items-center gap-3">
              <span className="text-lg font-black text-[var(--color-text)]">{posts.length}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)]">Articles totals</span>
           </div>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-xl">
         {loading ? (
           <div className="p-20 text-center text-[var(--color-muted)] animate-pulse uppercase tracking-[0.2em] font-black text-[10px]">
             Sincronitzant amb el Journal...
           </div>
         ) : filteredPosts.length === 0 ? (
           <div className="p-20 text-center text-[var(--color-muted)] flex flex-col items-center">
             <FileText className="w-12 h-12 mb-4 opacity-10" />
             <p className="font-bold">Encara no hi ha articles publicats.</p>
             <p className="text-xs mt-1">Comença a escriure la teva primera entrada ara mateix.</p>
           </div>
         ) : (
           <table className="w-full text-left text-sm">
             <thead className="bg-[var(--color-bg)] text-[var(--color-muted)] border-b border-[var(--color-border)]">
               <tr>
                 <th className="px-6 py-4 font-black uppercase tracking-[0.2em] text-[9px]">Article</th>
                 <th className="px-6 py-4 font-black uppercase tracking-[0.2em] text-[9px]">Data</th>
                 <th className="px-6 py-4 font-black uppercase tracking-[0.2em] text-[9px] hidden sm:table-cell text-center">Premium</th>
                 <th className="px-6 py-4 font-black uppercase tracking-[0.2em] text-[9px] text-right">Accions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-[var(--color-border)]/50">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-[var(--color-surface-2)] transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[var(--color-text)] mb-0.5 group-hover:text-[var(--color-accent)] transition-colors">{post.title}</p>
                      <p className="text-[10px] text-[var(--color-muted)] font-mono uppercase truncate max-w-[200px]">/{post.slug}</p>
                    </td>
                    <td className="px-6 py-4 text-[var(--color-muted)] text-xs font-medium">
                      {new Date(post.created_at).toLocaleDateString("ca-ES", { day: "2-digit", month: "long" })}
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell text-center">
                       {post.is_premium ? (
                         <div className="flex items-center justify-center gap-1 text-amber-500 font-black text-[9px] uppercase tracking-widest bg-amber-500/5 py-1 px-2 rounded-lg border border-amber-500/20 mx-auto w-fit">
                           <CreditCard className="w-3 h-3" /> Stripe
                         </div>
                       ) : (
                         <span className="text-[var(--color-muted)] opacity-30">—</span>
                       )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => router.push(`/admin/blog/${post.id}/editar`)}
                          className="p-2 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-subtle)] transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(post.id, post.title)}
                          className="p-2 rounded-lg text-[var(--color-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
             </tbody>
           </table>
         )}
      </div>
    </div>
  );
}
