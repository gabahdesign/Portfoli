import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { PinGateWrapper } from "@/components/portfolio/PinGateWrapper";
import { BackButton } from "@/components/portfolio/BackButton";

export default async function WorkPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string; slug: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { token, slug } = await params;
  const { mode } = await searchParams;
  const isPresentMode = mode === "present";

  const supabase = await createClient();

  // Obtain work info
  const { data: work, error } = await supabase
    .from("works")
    .select("*, companies (name, is_freelance)")
    .eq("slug", slug)
    .single();

  if (error || !work || work.status !== "published") {
    notFound();
  }

  // Authorization token check
  const { data: tokenData } = await supabase
    .from("access_tokens")
    .select("company_ids, active")
    .eq("token", token)
    .single();

  if (!tokenData || !tokenData.active) notFound();
  
  if (tokenData.company_ids && tokenData.company_ids.length > 0) {
    // Note: work.companies is the joined company record
    if (!tokenData.company_ids.includes(work.company_id) && !work.companies?.is_freelance) {
      notFound();
    }
  }

  let htmlContent = "";
  if (work.content && typeof work.content === "object") {
    try {
      htmlContent = generateHTML(work.content as object, [
        StarterKit,
        ImageExtension,
        LinkExtension,
        Underline,
      ]);
    } catch (err) {
      console.error("TipTap parsing error:", err);
    }
  }

  // -----------------------------------------
  // Obtener prev/next works autorizados
  // -----------------------------------------
  let prevWork: { slug: string, title: string } | null = null;
  let nextWork: { slug: string, title: string } | null = null;
  
  const { data: rawWorks } = await supabase
    .from("works")
    .select("slug, title, company_id, companies (is_freelance)")
    .eq("status", "published")
    .order("work_date", { ascending: false });

  if (rawWorks) {
    let validWorks = rawWorks;
    if (tokenData.company_ids && tokenData.company_ids.length > 0) {
      validWorks = validWorks.filter((w) => {
        const company = Array.isArray(w.companies) ? w.companies[0] : w.companies;
        return tokenData.company_ids.includes(w.company_id) || (company as { is_freelance: boolean })?.is_freelance;
      });
    }

    const currentIndex = validWorks.findIndex(w => w.slug === slug);
    if (currentIndex !== -1) {
      // Orden DESC means prev is index + 1 (más antiguo), next is index - 1 (más nuevo)
      // Ajustamos la semántica: "Anterior" (más nuevo) -> index - 1, "Següent" (más antiguo) -> index + 1
      prevWork = currentIndex > 0 ? validWorks[currentIndex - 1] : null;
      nextWork = currentIndex < validWorks.length - 1 ? validWorks[currentIndex + 1] : null;
    }
  }

  let contentNode;

  if (isPresentMode) {
    contentNode = (
       <div className="fixed inset-0 bg-[#0A0014] z-[100] overflow-y-auto w-full h-full text-[var(--color-text)] px-8 md:px-20 py-16">
        <Link 
          href={`/v/${token}/trabajo/${slug}`} 
          className="fixed top-6 right-6 text-[var(--color-muted)] hover:text-[var(--color-accent)] bg-[var(--color-surface-2)] p-2 rounded-full backdrop-blur-xl border border-[var(--color-border)] transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </Link>
        <div className="max-w-4xl mx-auto animate-in fade-in duration-[1000ms]">
           <h1 className="font-display text-5xl md:text-7xl font-black mb-16 leading-tight text-[var(--color-text)] tracking-tight">{work.title}</h1>
           <div 
            className="prose prose-invert prose-2xl max-w-none prose-img:rounded-2xl prose-img:shadow-2xl prose-a:text-[var(--color-accent)] prose-headings:font-display prose-headings:text-[var(--color-text)]"
             dangerouslySetInnerHTML={{ __html: htmlContent }}
           />
        </div>
      </div>
    );
  } else {
    contentNode = (
      <div className="max-w-4xl mx-auto px-6 py-12 animate-in fade-in duration-500">
        
        <BackButton />

        {/* COVER */}
        <div className="w-full aspect-video relative rounded-2xl overflow-hidden mb-12 border border-color-border shadow-2xl">
           {work.cover_url ? (
             <Image src={work.cover_url} alt={work.title} fill className="object-cover" priority />
           ) : (
             <div className="w-full h-full bg-color-surface flex items-center justify-center">
               <span className="text-color-muted font-display text-2xl opacity-50">Marc Portfolio</span>
             </div>
           )}
           
           {work.protected && (
              <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2 shadow-2xl">
                <Lock className="w-4 h-4 text-[var(--color-accent)]" />
                <span className="text-sm font-bold text-white shadow-sm uppercase tracking-widest text-[10px]">Strictly Confidential</span>
              </div>
           )}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-color-border pb-8">
           <div>
             <div className="flex items-center gap-3 mb-4">
               <Link 
                 href={`/v/${token}?companyId=${work.company_id}`}
                 className="text-color-accent font-medium hover:underline flex items-center gap-1.5 group"
               >
                 {work.companies?.name || "Proyecto Independiente"}
               </Link>
               <span className="w-1 h-1 rounded-full bg-color-border"></span>
               <span className="text-color-muted font-mono text-sm">{work.work_date ? new Date(work.work_date).getFullYear() : "Presente"}</span>
             </div>
              <h1 className="font-display text-4xl md:text-6xl font-black text-[var(--color-text)] leading-tight tracking-tight">{work.title}</h1>
          </div>
           
           <Link 
              href={`?mode=present`}
              className="shrink-0 bg-color-surface border border-color-border hover:border-color-accent hover:text-color-accent text-color-muted px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2"
           >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
              Modo Presentación
           </Link>
        </div>

        <div className="flex flex-wrap gap-2 mb-16">
          {(work.tags || []).map((tag: string) => (
             <span key={tag} className="text-sm font-medium text-color-muted bg-color-surface px-3 py-1.5 rounded-md border border-color-border shadow-sm">
               #{tag}
             </span>
          ))}
        </div>

        <article 
          className="prose prose-invert prose-lg max-w-none prose-headings:font-display prose-headings:text-[var(--color-text)] prose-p:text-[var(--color-muted)] prose-p:leading-relaxed prose-a:text-[var(--color-accent)] hover:prose-a:text-[var(--color-accent-hover)] prose-img:rounded-2xl prose-img:border prose-img:border-[var(--color-border)] mb-16"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* NAVEGACIÓ ANTERIOR / SEGÜENT */}
        {(prevWork || nextWork) && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-8 border-t border-[var(--color-border)] mt-16">
            {prevWork ? (
               <Link href={`/v/${token}/trabajo/${prevWork.slug}`} className="flex flex-col items-start w-full sm:w-1/2 p-4 rounded-xl hover:bg-[var(--color-surface)] transition-colors border border-transparent hover:border-[var(--color-border)] group text-left">
                 <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-muted)] group-hover:text-[var(--color-accent)] mb-1 transition-colors">Anterior</span>
                 <span className="font-display font-bold text-[var(--color-text)] group-hover:text-white transition-colors line-clamp-1">{prevWork.title}</span>
               </Link>
            ) : <div className="hidden sm:block w-1/2" />}
            
            {nextWork ? (
               <Link href={`/v/${token}/trabajo/${nextWork.slug}`} className="flex flex-col items-end w-full sm:w-1/2 p-4 rounded-xl hover:bg-[var(--color-surface)] transition-colors border border-transparent hover:border-[var(--color-border)] group text-right">
                 <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-muted)] group-hover:text-[var(--color-accent)] mb-1 transition-colors">Següent</span>
                 <span className="font-display font-bold text-[var(--color-text)] group-hover:text-white transition-colors line-clamp-1">{nextWork.title}</span>
               </Link>
            ) : <div className="hidden sm:block w-1/2" />}
          </div>
        )}
      </div>
    );
  }

  return (
    <PinGateWrapper slug={slug} token={token} isProtected={work.protected}>
      {contentNode}
    </PinGateWrapper>
  );
}
