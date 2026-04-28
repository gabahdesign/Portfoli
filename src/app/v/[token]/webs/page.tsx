import { Globe, Download, Zap, Monitor, Cpu } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getLocale, getTranslations } from "next-intl/server";

export default async function WebsPage() {
  const supabase = await createClient();
  const locale = await getLocale();
  const t = await getTranslations("Navigation");

  const { data: webProjects } = await supabase
    .from("web_projects")
    .select("*")
    .eq("is_active", true)
    .order("order", { ascending: true });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-10 py-12 md:py-20 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 border-b border-[var(--color-border)] pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 text-[var(--color-accent)] text-[10px] font-black uppercase tracking-widest mb-6">
             <Zap size={12} className="animate-pulse" /> Experimental Web Lab
          </div>
          <h1 className="font-display text-6xl md:text-8xl font-black text-[var(--color-text)] tracking-tighter lowercase leading-[0.8]">
            {t("webs")}<span className="text-[var(--color-accent)]">.</span>
          </h1>
          <p className="text-[var(--color-muted)] mt-10 max-w-xl font-medium leading-relaxed">
            {locale === 'ca' 
              ? "Projectes web creats amb IA o programats manualment. Un recull d'experiments, jocs i eines digitals."
              : locale === 'es'
              ? "Proyectos web creados con IA o programados manualmente. Una colección de experimentos, juegos y herramientas digitales."
              : "Web projects created with AI or manually programmed. A collection of experiments, games, and digital tools."}
          </p>
        </div>
      </div>

      {/* PROJECTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {webProjects?.map((project) => (
          <div 
            key={project.id}
            className="group relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2rem] p-8 flex flex-col justify-between hover:border-[var(--color-accent)]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[var(--color-accent-glow)]/10"
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl ${project.type === 'ia' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'}`}>
                  {project.type === 'ia' ? <Cpu size={24} /> : <Monitor size={24} />}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${project.type === 'ia' ? 'border-purple-500/30 text-purple-500' : 'border-blue-500/30 text-blue-500'}`}>
                  {project.type === 'ia' ? 'AI Project' : 'Development'}
                </span>
              </div>
              
              <h3 className="text-2xl font-black text-[var(--color-text)] mb-3 tracking-tight">
                {project.title}
              </h3>
              
              <p className="text-[var(--color-muted)] text-sm leading-relaxed mb-8">
                {locale === 'ca' ? project.description_ca : locale === 'es' ? project.description_es : project.description_en}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {project.url && (
                <a 
                  href={project.url}
                  target="_blank"
                  className="flex items-center justify-center gap-3 w-full py-4 bg-[var(--color-text)] text-[var(--color-bg)] font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
                >
                  <Globe size={18} />
                  <span>{locale === 'ca' ? 'Anar al web' : locale === 'es' ? 'Ir a la web' : 'Go to Site'}</span>
                </a>
              )}
              
              {project.download_url && (
                <a 
                  href={project.download_url}
                  download
                  className="flex items-center justify-center gap-3 w-full py-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] font-black rounded-2xl hover:bg-[var(--color-accent)] hover:text-white hover:border-[var(--color-accent)] transition-all"
                >
                  <Download size={18} />
                  <span>{locale === 'ca' ? 'Descarregar' : locale === 'es' ? 'Descargar' : 'Download'}</span>
                </a>
              )}
            </div>
          </div>
        ))}
        
        {(!webProjects || webProjects.length === 0) && (
          <div className="col-span-full py-20 text-center">
            <p className="text-[var(--color-muted)]">No s&apos;han trobat projectes web.</p>
          </div>
        )}
      </div>
    </div>
  );
}
