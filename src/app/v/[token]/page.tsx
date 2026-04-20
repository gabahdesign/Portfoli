import { createClient } from "@/lib/supabase/server";
import { getLocale, getTranslations } from "next-intl/server";
import { PortfolioFeed } from "@/components/portfolio/PortfolioFeed";
import Image from "next/image";

export default async function PortfolioHome({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ companyId?: string }>;
}) {
  const { token } = await params;
  const { companyId } = await searchParams;
  const locale = await getLocale();
  const t = await getTranslations("Index");
  const supabase = await createClient();

  let tokenData = null;
  let aboutData = null;
  let allCompanies = [];

  if (token === "preview") {
    // Only fetch common data for public view
    const [aboutRes, companiesRes] = await Promise.all([
      supabase.from("about_me").select("*").single(),
      supabase.from("companies").select("*").order("start_date", { ascending: false }),
    ]);
    aboutData = aboutRes.data;
    allCompanies = companiesRes.data || [];
  } else {
    const [tokenRes, aboutRes, companiesRes] = await Promise.all([
      supabase.from("access_tokens").select("company_ids").eq("token", token).maybeSingle(),
      supabase.from("about_me").select("*").single(),
      supabase.from("companies").select("*").order("start_date", { ascending: false }),
    ]);
    tokenData = tokenRes.data;
    aboutData = aboutRes.data;
    allCompanies = companiesRes.data || [];
  }

  const companyIdsFilter = tokenData?.company_ids || [];
  
  const projectClients = (allCompanies || []).filter(c => {
    if (!c.is_freelance) return false;
    if (companyIdsFilter.length === 0) return true;
    return companyIdsFilter.includes(c.id);
  });

  const collaborationCompanyIds = (allCompanies || []).filter(c => c.is_freelance).map(c => c.id);

  const { data: featuredWorks } = await supabase
    .from("works")
    .select("slug, title, cover_url, summary, tags, protected, company_id, work_date, featured, companies(name)")
    .eq("status", "published")
    .order("work_date", { ascending: false });

  // Filter works based on visibility and specifically ensuring that if a companyId is provided, 
  // we include those works regardless of being featured, while the client side handling 
  // will decide what to display (featured by default, or all if filtered).
  const visibleWorks = (featuredWorks || []).filter(w => {
    // 1. Check if the work belongs to a company allowed by the token
    const isAllowedByToken = companyIdsFilter.length === 0 || companyIdsFilter.includes(w.company_id);
    
    // 2. Check if it's a collaboration/freelance project (these are usually allowed)
    const isCollaboration = collaborationCompanyIds.includes(w.company_id);
    
    //Logic: Show if (Allowed by Token OR Collaboration) AND (Featured OR specific company filter)
    // Actually, in the server we should just pass all allowed works and let the client filter.
    return isAllowedByToken || isCollaboration;
  });

  const latestWorkCover = visibleWorks.length > 0 ? visibleWorks[0].cover_url : null;
  const tagline = aboutData?.tagline ? aboutData.tagline[locale] || aboutData.tagline["ca"] : "";

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      
      {/* 1. BLOG-STYLE BANNER (Latest Project Background) */}
      <section className="relative w-full h-[450px] md:h-[550px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax-like feel */}
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
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 pb-32">
        
        {/* 2. PORTFOLIO FEED (Search + Filtered Works Grid) */}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <PortfolioFeed 
          works={visibleWorks.map(w => ({
            ...w,
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            companies: Array.isArray(w.companies) ? w.companies[0] : (w.companies as any)
          })) as any} 
          token={token}
          locale={locale}
          initialCompanyId={companyId}
          companies={allCompanies || []}
        />

        {/* 3. TRUSTED BY / CLIENTS (Compact Activity Style) */}
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
                  <a href={`/v/${token}/cv`} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-bold text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-subtle)] hover:shadow-[0_0_20px_var(--color-accent-glow)] transition-all duration-300">
                    {t("view_cv")} <span className="ml-1 opacity-50">&rarr;</span>
                  </a>
                </div>
              </div>
              
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {projectClients.map((company) => (
                  <div key={company.slug} className="flex flex-col items-center gap-4 group text-center p-2">
                    <div className="relative w-32 h-32    flex items-center justify-center overflow-hidden shrink-0 transition-all duration-500 group-hover:scale-105   ">
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
    </div>
  );
}
