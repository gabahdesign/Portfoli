import { createClient } from "@/lib/supabase/server";
import { getLocale, getTranslations } from "next-intl/server";
import { Navbar } from "@/components/portfolio/Navbar";
import Image from "next/image";
import Link from "next/link";
import { Lock, ArrowRight, Sparkles } from "lucide-react";

export default async function PublicHome() {
  const locale = await getLocale();
  const t = await getTranslations("Index");
  const navT = await getTranslations("Navigation");
  const supabase = await createClient();

  const [{ data: aboutData }, { data: allCompanies }, { data: tokenData }] = await Promise.all([
    supabase.from("about_me").select("*").single(),
    supabase.from("companies").select("*").order("start_date", { ascending: false }),
    supabase.from("access_tokens").select("token").eq("active", true).order("created_at", { ascending: false }).limit(1).single()
  ]);

  const previewToken = tokenData?.token || "preview";

  // Fetch only public 'pràctiques' projects
  const { data: publicWorks } = await supabase
    .from("works")
    .select("slug, title, cover_url, summary, tags, protected, company_id, work_date, visibility_type, companies(name)")
    .eq("status", "published")
    .eq("visibility_type", "public_always") // This would be the 'pràctiques' category in DB
    .order("work_date", { ascending: false });

  const projectClients = (allCompanies || []).filter(c => c.is_freelance);
  const latestWorkCover = publicWorks && publicWorks.length > 0 ? publicWorks[0].cover_url : null;
  const tagline = aboutData?.tagline ? aboutData.tagline[locale] || aboutData.tagline["ca"] : "";

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex w-full">
      <Navbar token="preview" locale={locale} />
      
      <main className="flex-1 w-full ml-0 md:ml-[240px] pt-16 md:pt-0 transition-all duration-300">
      
      {/* 1. HERO BANNER */}
      <section className="relative w-full h-[600px] flex items-center justify-center overflow-hidden">
        {latestWorkCover ? (
          <div className="absolute inset-0 z-0">
            <Image src={latestWorkCover} alt="Background" fill className="object-cover opacity-30 blur-[4px]" priority />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[var(--color-bg)]" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/20 to-black/40 z-0" />
        )}
        
        <div className="z-10 text-center px-6 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/40 text-[9px] font-black uppercase tracking-[0.4em] mb-8 backdrop-blur-md">
            <Sparkles size={12} className="text-[var(--color-accent)]" /> Portfoli Públic
          </div>
          <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter mb-8 lowercase">
            {aboutData?.name || "Marc"}<span className="text-[var(--color-accent)]">.</span>
          </h1>
          <p className="text-xl md:text-2xl font-medium text-white/60 leading-relaxed mb-12">
            {tagline}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <Link 
               href="/blog" 
               className="px-8 py-4 rounded-2xl bg-white text-black font-black text-sm hover:bg-[var(--color-accent)] hover:text-white transition-all shadow-xl shadow-white/5"
             >
               Llegir Blog
             </Link>
             <Link 
               href="/tokens" 
               className="px-8 py-4 rounded-2xl bg-[#141416] border border-[#27272a] text-white font-bold text-sm hover:border-[var(--color-accent)] transition-all flex items-center gap-3"
             >
               <Lock size={16} className="text-[var(--color-accent)]" /> Accés amb Token
             </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 pb-32">
        {/* PUBLIC WORKS SECTION */}
        <section className="mt-20">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.4em] text-[var(--color-muted)] mb-2">Pràctiques & Labs</h2>
              <p className="text-xl font-bold text-white">Projectes d'accés lliure.</p>
            </div>
            <div className="hidden md:block h-px flex-1 bg-[var(--color-border)] mx-12 mb-3" />
          </div>

          {!publicWorks || publicWorks.length === 0 ? (
            <div className="p-20 text-center border border-dashed border-[var(--color-border)] rounded-3xl opacity-40">
               No hi ha projectes públics en aquest moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {publicWorks.map(work => (
                 <Link key={work.slug} href={`/p/${work.slug}`} className="group">
                    <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-[var(--color-border)] mb-4">
                       <Image src={work.cover_url || ""} alt={work.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                          <span className="text-white text-sm font-bold flex items-center gap-2">
                             Veure projecte <ArrowRight size={16} />
                          </span>
                       </div>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-[var(--color-accent)] transition-colors">{work.title}</h3>
                    <p className="text-[var(--color-muted)] text-xs mt-1">{Array.isArray(work.companies) ? work.companies[0]?.name : (work.companies as any)?.name}</p>
                 </Link>
               ))}
            </div>
          )}
        </section>

        {/* RESTRICTED SECTION PREVIEW */}
        <section className="mt-40 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-accent)]/10 blur-[100px] rounded-full" />
           <div className="relative z-10 max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                 <Lock size={24} className="text-[var(--color-accent)]" />
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-[var(--color-text)] tracking-tight mb-6">Contingut Confidencial</h2>
              <p className="text-[var(--color-muted)] text-lg mb-10 leading-relaxed">
                El gruix dels meus projectes estratègics i col·laboracions amb empreses estan protegits per acords de confidencialitat. Si tens un token d'accés, pots entrar per veure'ls.
              </p>
              <Link href="/tokens" className="inline-flex items-center gap-3 px-10 py-5 bg-[var(--color-accent)] text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-[var(--color-accent-glow)] hover:scale-105 transition-all">
                 Validar el meu accés <ArrowRight size={16} />
              </Link>
           </div>
        </section>

        {/* TRUSTED BY / CLIENTS */}
        <section className="mt-40 border-t border-[var(--color-border)] pt-20">
           <h2 className="text-sm font-black uppercase tracking-[0.4em] text-[var(--color-muted)] mb-16 text-center">Col·laboracions</h2>
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
              {projectClients.map(company => (
                 <div key={company.slug} className="flex flex-col items-center gap-4 group text-center lowercase">
                    <div className="relative w-40 h-40 md:w-36 md:h-36    flex items-center justify-center overflow-hidden transition-all duration-500 hover:scale-110 grayscale hover:grayscale-0 opacity-60 hover:opacity-100   ">
                       {company.logo_url ? (
                         <Image src={company.logo_url} alt={company.name} fill className="object-cover" />
                       ) : (
                         <span className="text-xl font-black">{company.name.charAt(0)}</span>
                       )}
                    </div>
                 </div>
              ))}
           </div>
        </section>
      </div>
    </main>
  </div>
);
}
