import { createClient } from "@/lib/supabase/server";
import { getLocale, getTranslations } from "next-intl/server";
import { Navbar } from "@/components/portfolio/Navbar";
import { PortfolioFeed } from "@/components/portfolio/PortfolioFeed";
import { PdfPresentationMode } from "@/components/portfolio/PdfPresentationMode";
import Image from "next/image";
import Link from "next/link";
import { Move, Maximize2 } from "lucide-react";

export default async function PublicHome({ searchParams }: { searchParams: Promise<{ companyId?: string }> }) {
  const { companyId } = await searchParams;
  const locale = await getLocale();
  const t = await getTranslations("Index");
  const navT = await getTranslations("Navigation");
  const supabase = await createClient();

  const [aboutRes, companiesRes] = await Promise.all([
    supabase.from("about_me").select("*").single(),
    supabase.from("companies").select("*").order("start_date", { ascending: false }),
  ]);
  const aboutData = aboutRes.data;
  const allCompanies = companiesRes.data || [];
  
  const projectClients = (allCompanies || []).filter(c => c.is_freelance);
  
  const { data: featuredWorks } = await supabase
    .from("works")
    .select("slug, title, cover_url, summary, tags, protected, company_id, work_date, featured, pdf_url, companies(name)")
    .eq("status", "published")
    .order("work_date", { ascending: false });

  // For public preview, we display all published works via the Feed.
  // Those that are protected will show a padlock and require PIN in their respective route.
  const visibleWorks = featuredWorks || [];

  const latestWorkCover = visibleWorks.length > 0 ? visibleWorks[0].cover_url : null;
  const tagline = aboutData?.tagline ? aboutData.tagline[locale] || aboutData.tagline["ca"] : "";

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex w-full">
      <Navbar token="preview" locale={locale} />
      
      <main className="flex-1 w-full ml-0 md:ml-[240px] pt-16 md:pt-0 transition-all duration-300 overflow-x-hidden">
        
        {/* 1. BLOG-STYLE BANNER (Latest Project Background) */}
        <section className="relative w-full h-[450px] md:h-[550px] flex items-center justify-center overflow-hidden">
          {latestWorkCover ? (
            <div className="absolute inset-0 z-0">
              <Image 
                src={latestWorkCover} 
                alt="Latest Project" 
                fill 
                className="object-cover opacity-40 scale-105 blur-[2px]" 
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[var(--color-bg)]/40 to-[var(--color-bg)]" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/20 to-black/40 z-0" />
          )}
          
          <div className="z-10 text-center px-6 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="inline-block px-4 py-1.5 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 text-[var(--color-accent)] text-[10px] font-black uppercase tracking-[0.3em] mb-4 backdrop-blur-md">
              {locale === 'ca' ? 'Actualització Recent' : 'Latest Update'}
            </div>
            <div className="flex items-center justify-center gap-2 mb-8 text-[9px] text-[var(--color-muted)] font-black uppercase tracking-[0.2em] opacity-50">
              Web en procés &middot; Continguts i idiomes sota revisió (poden haver-hi faltes)
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-[var(--color-text)] tracking-tighter mb-6 drop-shadow-2xl">
              {aboutData?.name || "Marc"}<span className="text-[var(--color-accent)]">.</span>
            </h1>
            <p className="text-xl md:text-2xl font-medium text-[var(--color-text)] opacity-70 max-w-2xl mx-auto drop-shadow-md leading-relaxed">
              {tagline}
            </p>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
               <Link
                 href="?mode=present"
                 className="group relative px-8 py-4 bg-white text-black font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-2xl overflow-hidden"
               >
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent)] to-[#AF52F2] opacity-0 group-hover:opacity-10 transition-opacity" />
                  <div className="relative flex items-center gap-3">
                     <Maximize2 size={20} className="text-[var(--color-accent)]" />
                     {locale === 'ca' ? 'Presentació de Projectes' : 'Project Presentation'}
                  </div>
               </Link>

               <Link
                 href="/v/preview/move"
                 className="group px-8 py-4 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] font-bold rounded-2xl transition-all hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-subtle)] flex items-center gap-3"
               >
                  <div className="w-8 h-8 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent)] group-hover:scale-110 transition-transform">
                     <Move size={18} />
                  </div>
                  <span>Move</span>
               </Link>
            </div>
          </div>
        </section>

        {/* Global PDF Presentation Overlay */}
        <PdfPresentationMode works={visibleWorks.filter(w => !!w.pdf_url) as any} />

        <div className="max-w-7xl mx-auto px-6 pb-32 mt-12">
          
          {/* 2. PORTFOLIO FEED */}
          { }
          <PortfolioFeed 
            works={visibleWorks.map(w => ({
              ...w,
              /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
              companies: Array.isArray(w.companies) ? w.companies[0] : (w.companies as any)
            })) as any} 
            token="preview"
            locale={locale}
            initialCompanyId={companyId}
            companies={allCompanies || []}
          />

          {/* 3. TRUSTED BY / CLIENTS */}
          {projectClients.length > 0 && (
            <section className="mt-40 border-t border-[var(--color-border)] pt-20">
              <div className="flex flex-col md:flex-row gap-16 md:gap-24">
                <div className="w-full md:w-[320px] shrink-0">
                  <h2 className="text-sm font-black uppercase tracking-[0.4em] text-[var(--color-muted)] mb-6">
                    {t("collaborations_title")}
                  </h2>
                  <p className="text-sm text-[var(--color-muted)] leading-relaxed opacity-80">
                    {t("collaborations_desc")}
                  </p>
                  <div className="mt-10">
                    <a href={`/v/preview/cv`} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-bold text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-subtle)] hover:shadow-[0_0_20px_var(--color-accent-glow)] transition-all duration-300">
                      {t("view_cv")} <span className="ml-1 opacity-50">&rarr;</span>
                    </a>
                  </div>
                </div>
                
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {projectClients.map((company) => (
                    <div key={company.slug} className="flex flex-col items-center gap-3 group text-center p-2">
                      <div className="relative w-24 h-24    flex items-center justify-center overflow-hidden shrink-0 transition-all duration-500 group-hover:scale-105   ">
                        {company.logo_url ? (
                          <Image 
                            src={company.logo_url} 
                            alt={company.name} 
                            fill 
                            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500 opacity-80 group-hover:opacity-100" 
                          />
                        ) : (
                          <span className="text-[var(--color-muted)] text-2xl font-black group-hover:text-[var(--color-accent)] transition-colors">{company.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-black uppercase tracking-widest text-[var(--color-text)] opacity-60 group-hover:opacity-100 transition-opacity">{company.name}</h4>
                        <p className="text-[9px] text-[var(--color-muted)] font-bold uppercase tracking-[0.2em]">{company.sector}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

        </div>
      </main>
    </div>
  );
}
