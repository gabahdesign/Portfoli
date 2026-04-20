import { createClient } from "@/lib/supabase/server";
import { getLocale } from "next-intl/server";
import Image from "next/image";
import { Mail, Link2, Globe, MapPin, ExternalLink } from "lucide-react";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";

export default async function AboutMePage({ params }: { params: Promise<{ token: string }> }) {
  await params;
  const locale = await getLocale();
  const supabase = await createClient();

  const ADMIN_PROFILE_ID = "00000000-0000-0000-0000-000000000000";
  const { data: about } = await supabase
    .from("about_me")
    .select("*")
    .eq("id", ADMIN_PROFILE_ID)
    .maybeSingle();

  if (!about) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center text-[var(--color-muted)]">
        Informació no disponible
      </div>
    );
  }

  const bioData = about.bio ? about.bio[locale] || about.bio["ca"] : "";
  let bioHtml = "";

  if (typeof bioData === "string") {
    bioHtml = bioData;
  } else if (bioData && typeof bioData === "object") {
    try {
      bioHtml = generateHTML(bioData as object, [
        StarterKit,
        ImageExtension,
        LinkExtension,
        Underline,
      ]);
    } catch (err: unknown) {
      console.error("Error parsing bio JSON:", err);
      bioHtml = "";
    }
  }
  
  const contactLinks = [
    {
      label: "Email Directo",
      value: "info@descobreix.com",
      link: "mailto:info@descobreix.com",
      icon: <Mail className="w-5 h-5" />
    },
    {
      label: "LinkedIn",
      value: "Professional Profile",
      link: about.social_links?.linkedin || "https://linkedin.com",
      icon: <Link2 className="w-5 h-5" />
    },
    {
      label: "GitHub",
      value: "gabahdesign/Portfoli",
      link: "https://github.com/gabahdesign/Portfoli",
      icon: <Globe className="w-5 h-5" />
    },
    {
      label: "Ubicació",
      value: "Baix Llobregat, Anoia, Barcelonès i Vallès Occidental",
      link: null,
      icon: <MapPin className="w-5 h-5" />
    }
  ];
  
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 animate-in fade-in duration-500">
      {/* 1. Header & Intro */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-start mb-16 border-b border-[var(--color-border)] pb-8 relative">
        <div className="flex-1">
          <h1 className="text-5xl md:text-7xl font-display font-black text-[var(--color-text)] tracking-tight mb-2">
            {about.name || "Marc"}
          </h1>
          <p className="text-xl md:text-2xl text-[var(--color-accent)] font-bold tracking-tight">
            {about.tagline || ""}
          </p>
        </div>
        
        {about.photo_url && (
          <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-3xl overflow-hidden shrink-0 border-2 border-[var(--color-border)] shadow-2xl rotate-3">
            <Image src={about.photo_url} alt="Profile" fill className="object-cover" />
          </div>
        )}
      </div>
      
      {/* 2. Bio Section */}
      <div className="mb-24">
        <div 
          className="text-[var(--color-text-subtle)] leading-relaxed text-lg space-y-4 prose prose-invert max-w-none prose-p:text-[var(--color-text-subtle)] prose-strong:text-[var(--color-accent)]"
          dangerouslySetInnerHTML={{ __html: typeof bioHtml === "string" ? bioHtml : "" }}
        />
      </div>

      {/* 3. Contact Integrated Section */}
      <div className="pt-16 border-t border-[var(--color-border)]">
        <h2 className="text-3xl font-display font-black text-[var(--color-text)] mb-8 tracking-tight">Contacte i Xarxes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contactLinks.map((c, i) => (
            <div key={i} className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-2xl flex items-center gap-5 hover:border-[var(--color-accent)]/40 transition-all group">
               <div className="p-3 bg-[var(--color-bg)] rounded-xl text-[var(--color-accent)]">
                 {c.icon}
               </div>
               <div className="flex-1">
                 <p className="text-[var(--color-muted)] text-[10px] uppercase font-black tracking-widest mb-0.5">{c.label}</p>
                 {c.link ? (
                   <a href={c.link} target="_blank" rel="noopener noreferrer" className="text-[var(--color-text)] font-bold text-sm flex items-center gap-1.5 hover:text-[var(--color-accent)] transition-colors">
                     {c.value}
                     <ExternalLink className="w-3 h-3 opacity-30" />
                   </a>
                 ) : (
                   <span className="text-[var(--color-text)] font-bold text-sm block">{c.value}</span>
                 )}
               </div>
            </div>
          ))}
        </div>

        {/* 4. Treballem Junts CTA */}
        <div className="mt-12 p-8 md:p-10 bg-gradient-to-br from-[var(--color-accent-subtle)] to-transparent border border-[var(--color-accent)]/20 rounded-3xl flex flex-col md:flex-row gap-8 items-center justify-between">
           <div>
             <h4 className="text-[var(--color-text)] font-display text-2xl font-black mb-2 tracking-tight">Treballem junts</h4>
             <p className="text-[var(--color-muted)] text-sm max-w-sm leading-relaxed">Si creus que el meu perfil encaixa amb el que busques, escriu-me i et respondré el més aviat possible.</p>
           </div>
           <a 
             href="mailto:info@descobreix.com" 
             className="shrink-0 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-[var(--color-accent-glow)] transition-all hover:scale-105 active:scale-95"
           >
             Enviar Correu Electrònic
           </a>
        </div>
      </div>
    </div>
  );
}
