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
}) {
  const { token, slug } = await params;

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
    .maybeSingle();

  const isActive = tokenData?.active ?? false;
  
  // No longer blocking access to works by token validity here. 
  // Portfolio is now public. 
  
  if (tokenData && tokenData.active && tokenData.company_ids && tokenData.company_ids.length > 0) {
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

  const contentNode = (
      <div className="max-w-4xl mx-auto px-6 py-12 animate-in fade-in duration-500">
        
        <BackButton />

        {/* COVER / MEDIA */}
        <div className="w-full aspect-video relative rounded-2xl overflow-hidden mb-12 border border-color-border shadow-2xl bg-black/20">
           {work.cover_url ? (
             work.cover_url.match(/\.(mp4|webm|mov)$|video/i) ? (
               <video 
                 src={work.cover_url} 
                 className="w-full h-full object-cover" 
                 autoPlay 
                 muted 
                 loop 
                 playsInline 
               />
             ) : (
               <Image src={work.cover_url} alt={work.title} fill className="object-cover" priority />
             )
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
           
           <div className="flex gap-3">
              {work.pdf_url && (
                <a 
                  href={work.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 bg-[var(--color-accent)] border border-transparent hover:brightness-110 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-[var(--color-accent)]/20 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Veure PDF
                </a>
              )}
            </div>
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

  return (
    <PinGateWrapper slug={slug} token={token} isProtected={work.protected}>
      {work.accent_color && (
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --color-accent: ${work.accent_color} !important;
            --color-accent-subtle: ${work.accent_color}15 !important;
            --color-accent-hover: ${work.accent_color} !important;
          }
          .prose a { color: ${work.accent_color} !important; }
          .prose h1, .prose h2, .prose h3 { color: var(--color-text); }
        `}} />
      )}
      {contentNode}
    </PinGateWrapper>
  );
}
