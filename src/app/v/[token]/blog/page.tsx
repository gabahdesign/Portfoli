import { createClient } from "@/lib/supabase/server";
import { getLocale } from "next-intl/server";
import { Newspaper, Lock, ArrowRight, Calendar, Share2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function BlogPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const locale = await getLocale();
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*")
    .order("published_at", { ascending: false });

  const today = new Date().toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen pt-28 bg-[var(--color-bg)] text-[var(--color-text)] selection:bg-[var(--color-accent)] selection:text-white">
      {/* 1. NEWSPAPER HEADER (MASTHEAD) */}
      <header className="border-b-4 border-[var(--color-text)] border-double pt-12 pb-6 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end border-b border-[var(--color-border)] pb-2 mb-4">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-muted)]">{today}</span>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-muted)]">descobreix &middot; Gastronomia · Disseny · Tecnologia · Vida</span>
          <div className="flex gap-4">
             <Share2 size={14} className="opacity-40" />
          </div>
        </div>
        
        <h1 className="font-serif text-6xl md:text-9xl text-center font-black tracking-tighter py-6 border-b border-[var(--color-border)] lowercase">
          descobreix<span className="text-[var(--color-accent)]">.</span>
        </h1>
        
        <div className="flex flex-wrap justify-center gap-6 md:gap-12 py-4 text-[10px] font-black uppercase tracking-[0.2em]">
           <span className="cursor-pointer hover:text-[var(--color-accent)] transition-colors">Gastronomia</span>
           <span className="cursor-pointer hover:text-[var(--color-accent)] transition-colors">Disseny</span>
           <span className="cursor-pointer hover:text-[var(--color-accent)] transition-colors">Art</span>
           <span className="cursor-pointer hover:text-[var(--color-accent)] transition-colors">IA &amp; Eines</span>
           <span className="cursor-pointer hover:text-[var(--color-accent)] transition-colors">Tutorials</span>
           <span className="cursor-pointer hover:text-[var(--color-accent)] transition-colors">Muntanya</span>
           <span className="cursor-pointer hover:text-[var(--color-accent)] transition-colors">Barcelona</span>
           <span className="cursor-pointer hover:text-[var(--color-accent)] transition-colors">Festes Cat.</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        {!posts || posts.length === 0 ? (
          <div className="text-center py-32 border-2 border-dashed border-[var(--color-border)] rounded-3xl">
             <Newspaper size={48} className="mx-auto mb-4 opacity-10" />
             <p className="font-serif text-2xl italic text-[var(--color-muted)]">No hi ha noves edicions per avui.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Featured Post (LHS Large) */}
            <div className="lg:col-span-8 space-y-12">
               {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
               {(posts || []).slice(0, 1).map((post: any) => (
                 <article key={post.id} className="group">
                    <div className="relative aspect-[16/9] w-full overflow-hidden mb-8 border border-[var(--color-border)]">
                       {post.cover_url ? (
                         <Image src={post.cover_url} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                       ) : (
                         <div className="w-full h-full bg-[var(--color-surface)] flex items-center justify-center">
                            <Newspaper className="opacity-10" size={64} />
                         </div>
                       )}
                    </div>
                    <div className="max-w-3xl">
                       <div className="flex items-center gap-4 mb-4">
                          <span className="bg-[var(--color-accent)] text-white text-[9px] font-black uppercase tracking-widest px-2 py-1">Destacat</span>
                          <span className="text-[10px] text-[var(--color-muted)] font-bold uppercase tracking-widest">{new Date(post.published_at).toLocaleDateString(locale)}</span>
                       </div>
                       <Link href={`/v/${token}/blog/${post.slug}`}>
                         <h2 className="font-serif text-4xl md:text-6xl font-black leading-[1.1] mb-6 hover:text-[var(--color-accent)] transition-colors cursor-pointer text-[var(--color-text)]">
                           {post.title}
                         </h2>
                       </Link>
                       <p className="font-serif text-xl text-[var(--color-muted)] leading-relaxed italic mb-8">
                         {post.excerpt || "Descobreix els detalls d'aquesta nova entrada al nostre journal exclusiu..."}
                       </p>
                       
                       {post.is_premium ? (
                         <div className="bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/20 p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 bg-[var(--color-accent)] text-white rounded-full flex items-center justify-center">
                                  <Lock size={20} />
                               </div>
                               <div>
                                  <p className="font-bold text-sm text-[var(--color-text)]">Contingut Premium</p>
                                  <p className="text-xs text-[var(--color-muted)]">Subscriu-te per llegir l&apos;article complet.</p>
                               </div>
                            </div>
                            <button className="bg-[var(--color-text)] text-[var(--color-bg)] px-8 py-3 rounded-xl font-bold text-sm hover:bg-[var(--color-accent)] hover:text-white transition-all shadow-xl">
                               Desbloquejar ara
                            </button>
                         </div>
                       ) : (
                         <Link href={`/v/${token}/blog/${post.slug}`} className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest border-b-2 border-[var(--color-text)] pb-1 hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-all">
                            Llegir Article <ArrowRight size={14} />
                         </Link>
                       )}
                    </div>
                 </article>
               ))}
               
               {/* Grid of smaller posts */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-16 border-t border-[var(--color-border)]">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(posts || []).slice(1).map((post: any) => (
                    <article key={post.id}>
                       <div className="flex items-center gap-3 mb-3 text-[9px] font-black uppercase tracking-widest text-[var(--color-muted)]">
                          <Calendar size={12} /> {new Date(post.published_at).toLocaleDateString(locale)}
                       </div>
                       <h3 className="font-serif text-2xl font-black leading-tight mb-4 hover:text-[var(--color-accent)] transition-colors cursor-pointer">
                         {post.title}
                       </h3>
                       <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-4 line-clamp-3">
                         {post.excerpt}
                       </p>
                    </article>
                  ))}
               </div>
            </div>

            {/* Sidebar (RHS Column Style) */}
            <aside className="lg:col-span-4 border-l border-[var(--color-border)] pl-16 hidden lg:block">
               <div className="sticky top-32 space-y-16">
                  <div>
                     <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-accent)] mb-8">Darrera Hora</h4>
                     <div className="space-y-8">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(posts || []).slice(0, 5).map((post: any, i: number) => (
                          <div key={post.id} className="group cursor-pointer">
                             <div className="flex gap-4">
                                <span className="text-2xl font-serif text-[var(--color-muted)] font-black italic opacity-30">0{i+1}</span>
                                <div>
                                   <p className="text-xs font-black leading-snug group-hover:text-[var(--color-accent)] transition-colors">{post.title}</p>
                                   <p className="text-[9px] text-[var(--color-muted)] font-bold uppercase mt-1">Disseny</p>
                                </div>
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>

                  <div className="bg-[var(--color-text)] p-8 text-[var(--color-bg)] rounded-3xl">
                     <h4 className="font-serif text-2xl font-black mb-4">Descobreix Premium</h4>
                     <p className="text-xs text-[var(--color-bg)]/60 leading-relaxed mb-8">
                        Accedeix a tot el contingut exclusiu, anàlisis de mercat i plantilles per només un pagament únic.
                     </p>
                     <button className="w-full bg-[var(--color-accent)] text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-[var(--color-accent)]/20">
                        Subscriure&apos;m ara
                     </button>
                  </div>
               </div>
            </aside>

          </div>
        )}
      </main>

      <footer className="border-t border-[var(--color-border)] py-12 px-6 bg-[var(--color-surface)]">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="font-serif text-2xl font-black text-[var(--color-text)]">marc<span className="text-[var(--color-accent)]">.</span></p>
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)]">
               <span>Linkedin</span>
               <span>Instagram</span>
               <span>Twitter</span>
            </div>
            <p className="text-[9px] text-[var(--color-muted)] opacity-50 font-bold uppercase">&copy; 2024 Marc Portfolio Journal</p>
         </div>
      </footer>
    </div>
  );
}
