import { createClient } from "@/lib/supabase/server";
import { getLocale, getTranslations } from "next-intl/server";
import { Download } from "lucide-react";
import { Heatmap } from "@/components/portfolio/Heatmap";

export default async function CVPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const locale = await getLocale();
  const t = await getTranslations("Navigation");
  const supabase = await createClient();

  const { data: cvData } = await supabase
    .from("cv_sections")
    .select("*")
    .order("sort_order", { ascending: true });

  // Deduplicate by type in case there are duplicate rows in the DB
  const uniqueSections = new Map();
  if (cvData) {
    cvData.forEach(section => {
      if (!uniqueSections.has(section.type)) {
        uniqueSections.set(section.type, section);
      }
    });
  }
  const cvSections = Array.from(uniqueSections.values());

  const renderSectionContent = (content: unknown) => {
    if (!content) return null;
    
    // If array directly (new flat format)
    if (Array.isArray(content)) {
       return renderArrayContent(content);
    }
    
    // If object with language keys {ca:[...], es:[...]}
    const localizedContent = (content as Record<string, unknown>)[locale] || (content as Record<string, unknown>)["ca"] || (content as Record<string, unknown>)["es"] || (content as Record<string, unknown>)["en"];
    
    if (Array.isArray(localizedContent)) {
       return renderArrayContent(localizedContent);
    }
    
    if (typeof localizedContent === "string") {
      return (
        <div 
          className="prose prose-invert prose-p:text-[var(--color-muted)] max-w-none"
          dangerouslySetInnerHTML={{ __html: localizedContent }} 
        />
      );
    }
    
    return null;
  };

  interface CVItem {
    title?: string;
    name?: string;
    date?: string;
    date_start?: string;
    date_end?: string;
    place?: string;
    subtitle?: string;
    level?: string;
    description?: string;
  }

  const renderArrayContent = (items: CVItem[]) => (
    <div className="space-y-8">
      {items.map((item, i: number) => (
        <div key={i} className="border-l-2 border-[var(--color-border)] pl-6 relative">
          <div className="absolute w-2 h-2 rounded-full bg-[var(--color-accent)] -left-[5px] top-2 shadow-[0_0_10px_var(--color-accent-glow)]"></div>
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-[var(--color-text)] text-xl tracking-tight">{item.title || item.name}</h3>
            {(item.date || item.date_start) && (
              <span className="text-xs font-mono font-bold text-[var(--color-muted)] bg-[var(--color-surface)] px-2.5 py-1 rounded-lg border border-[var(--color-border)]">
                {item.date || `${item.date_start}${item.date_end ? ` - ${item.date_end}` : ''}`}
              </span>
            )}
          </div>
          
          {(item.place || item.subtitle || item.level) && <h4 className="text-[var(--color-accent)] font-semibold text-sm mb-3">{item.place || item.subtitle || item.level}</h4>}
          {item.description && (
            <div 
              className="text-[var(--color-muted)] text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: item.description }}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-16 gap-6 border-b border-color-border pb-6">
          <h1 className="font-display text-4xl md:text-5xl font-black text-[var(--color-text)] tracking-tight">
            {t("cv")}
          </h1>
         <a 
           href={`/api/cv/pdf?token=${token}&lang=${locale}`} 
           target="_blank"            
           className="inline-flex items-center gap-2 bg-[var(--color-accent)] text-white px-6 py-3 rounded-xl font-bold hover:bg-[var(--color-accent-hover)] transition-all shadow-lg shadow-[var(--color-accent-glow)] hover:scale-105 active:scale-95"
          >
            <Download size={18} />
            Descarregar PDF
          </a>
      </div>

      <div className="mb-20">
        <Heatmap />
      </div>

      <div className="space-y-20">
        {(!cvSections || cvSections.length === 0) && (
           <div className="text-center text-color-muted py-12 border border-dashed border-color-border rounded-xl">
             Secciones del CV no configuradas.
           </div>
        )}
        
        {(cvSections || []).map((section) => (
          <section 
            key={section.id} 
            id={`cv-section-${section.type}`} 
            className="cv-section scroll-mt-24 grid grid-cols-1 md:grid-cols-4 gap-8"
          >
            <h2 className="font-sans text-sm font-bold text-color-muted uppercase tracking-wider pt-1">
              {section.title ? (section.title[locale] || section.title["ca"]) : section.type.replace('_', ' ')}
            </h2>
            <div className="md:col-span-3 text-color-text">
               {renderSectionContent(section.content)}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
