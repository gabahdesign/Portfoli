import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, FileText, Maximize } from "lucide-react";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { PinGateWrapper } from "@/components/portfolio/PinGateWrapper";
import { BackButton } from "@/components/portfolio/BackButton";
import { VideoNode, AudioNode, IframeNode } from "@/components/admin/TipTapExtensions";
import { clsx } from "clsx";
import { Tracker } from "@/components/portfolio/Tracker";
import { Maximize2, Minimize2 } from "lucide-react";
import { ZenToggle } from "@/components/portfolio/ZenToggle";
import { PinterestGallery } from "@/components/portfolio/PinterestGallery";

export default async function WorkPage({
  params,
  searchParams: _searchParams,
}: {
  params: Promise<{ token: string; slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
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

  // -----------------------------------------
  // RENDER BLOCKS
  // -----------------------------------------
  const renderBlock = (block: any) => {
    const settings = block.settings || {};
    const content = block.content || {};

    const blockStyle = {
      backgroundColor: settings.backgroundColor || 'transparent',
      paddingTop: settings.padding || '0px',
      paddingBottom: settings.padding || '0px',
    };

    switch (block.type) {
      case 'text':
        let html = "";
        if (content.json) {
           html = generateHTML(content.json, [StarterKit, ImageExtension, LinkExtension, Underline, VideoNode, AudioNode, IframeNode]);
        } else if (content.text) {
           html = `<p>${content.text}</p>`;
        }
        return (
          <div key={block.id} style={blockStyle}>
            <div className={clsx("mx-auto px-6", settings.fullWidth ? "w-full" : "max-w-4xl")}>
              <article 
                className="prose prose-invert prose-lg max-w-none prose-p:text-[var(--color-muted)] prose-headings:text-[var(--color-text)]"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          </div>
        );

      case 'media':
        if (!content.url) return null;
        return (
          <div key={block.id} style={blockStyle}>
            <div className={clsx("mx-auto px-6", settings.fullWidth ? "w-full px-0" : "max-w-[1400px]")}>
               <div className={clsx("relative rounded-2xl overflow-hidden shadow-2xl border border-white/5")}>
                  {content.mimeType?.startsWith('video') ? (
                    <video src={content.url} controls className="w-full h-auto block" />
                  ) : (
                    <img src={content.url} className="w-full h-auto block" alt="" />
                  )}
               </div>
            </div>
          </div>
        );

      case 'gallery':
        const items = content.items || [];
        if (items.length === 0) return null;
        return (
          <div key={block.id} style={blockStyle}>
            <div className={clsx("mx-auto px-6", settings.fullWidth ? "w-full px-0" : "max-w-[2000px]")}>
               <PinterestGallery items={items} />
            </div>
          </div>
        );

      case 'pdf':
        if (!content.url) return null;
        if (content.display === 'embed') {
           return (
             <div key={block.id} style={blockStyle}>
               <div className={clsx("mx-auto px-6", settings.fullWidth ? "w-full px-0" : "max-w-[1400px]")}>
                 <div className="relative w-full min-h-[500px] md:min-h-[800px] rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-black/20 group">
                    {/* Clean Viewer Wrapper */}
                    <iframe 
                      src={`${content.url}#toolbar=0&navpanes=0&scrollbar=0`}
                      className="absolute inset-0 w-full h-full border-none pointer-events-none md:pointer-events-auto"
                      title={content.title}
                    />
                     
                     {/* Overlay for mobile or to provide a clean exit/open action */}
                     <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a 
                          href={content.url} 
                          target="_blank" 
                          className="p-3 bg-black/60 backdrop-blur-xl text-white rounded-xl border border-white/10 hover:bg-[var(--color-accent)] transition-all"
                          title="Veure en pantalla completa"
                        >
                          <Maximize className="w-5 h-5" />
                        </a>
                     </div>
                  </div>
                  {content.description && (
                    <p className="mt-4 text-center text-sm text-[var(--color-muted)] max-w-2xl mx-auto italic">{content.description}</p>
                  )}
               </div>
             </div>
           );
        }
        return (
          <div key={block.id} style={blockStyle}>
            <div className="max-w-4xl mx-auto px-6">
               <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-xl hover:border-[var(--color-accent)]/30 transition-all group">
                  <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0 group-hover:scale-110 transition-transform">
                     <FileText size={40} />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-muted)] mb-2">Documentació Oficial PDF</p>
                     <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">{content.title}</h3>
                     {content.description && <p className="text-sm text-[var(--color-muted)] line-clamp-2">{content.description}</p>}
                  </div>
                  <a 
                    href={content.url} 
                    target="_blank" 
                    className="bg-[var(--color-accent)] text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-[var(--color-accent-glow)] hover:scale-105 transition-all"
                  >
                    Obrir Document
                  </a>
               </div>
            </div>
          </div>
        );

      case 'spacer':
        return <div key={block.id} className="h-16 md:h-24" />;

      default:
        return null;
    }
  };

  // -----------------------------------------
  // FETCH NAVIGATION
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
    if (tokenData?.company_ids && tokenData.company_ids.length > 0) {
      validWorks = validWorks.filter((w) => {
        const company = Array.isArray(w.companies) ? w.companies[0] : w.companies;
        return tokenData.company_ids!.includes(w.company_id) || (company as { is_freelance: boolean })?.is_freelance;
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

  const content = work.content || {};
  let htmlContent = "";
  if (content && typeof content === "object" && !Array.isArray(content)) {
    try {
      htmlContent = generateHTML(content as object, [
        StarterKit,
        ImageExtension,
        LinkExtension,
        Underline,
        VideoNode,
        AudioNode,
        IframeNode,
      ]);
    } catch (err) {
      console.error("TipTap parsing error:", err);
    }
  }

  const contentNode = (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-in fade-in duration-500">
        <Tracker token={token} eventType="work_view" workId={work.id} />
        <ZenToggle />
        <BackButton />

        {/* TITLE SECTION */}
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
           
           {work.protected && (
              <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2 shadow-2xl">
                <Lock className="w-4 h-4 text-[var(--color-accent)]" />
                <span className="text-sm font-bold text-white shadow-sm uppercase tracking-widest text-[10px]">Strictly Confidential</span>
              </div>
           )}
        </div>

        <div className="flex flex-wrap gap-2 mb-16">
          {(work.tags || []).map((tag: string) => (
             <span key={tag} className="text-sm font-medium text-color-muted bg-color-surface px-3 py-1.5 rounded-md border border-color-border shadow-sm">
               #{tag}
             </span>
          ))}
        </div>

        {/* PROJECT BLOCKS */}
        <div className="space-y-0">
           {Array.isArray(work.content) ? (
             work.content.map((block: any) => renderBlock(block))
           ) : (
             <article 
               className="prose prose-invert prose-lg max-w-none prose-headings:font-display prose-headings:text-[var(--color-text)] prose-p:text-[var(--color-muted)] prose-p:leading-relaxed prose-a:text-[var(--color-accent)] hover:prose-a:text-[var(--color-accent-hover)] prose-img:rounded-2xl prose-img:border prose-img:border-[var(--color-border)] mb-16"
               dangerouslySetInnerHTML={{ __html: htmlContent || "" }}
             />
           )}
        </div>

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
