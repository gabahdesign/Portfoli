import { createClient } from "@/lib/supabase/server";
import { getLocale, getTranslations } from "next-intl/server";
import { PortfolioFeed, type FeedWork } from "@/components/portfolio/PortfolioFeed";
import { PortfolioHero } from "@/components/portfolio/PortfolioHero";
import { StudioHeader } from "@/components/portfolio/StudioHeader";
import { PresentationLoader } from "@/components/portfolio/PresentationLoader";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MOVE_URL } from "@/lib/move-url";
import { AnalyticsTracker } from "@/components/portfolio/AnalyticsTracker";

export default async function PublicHome({ searchParams }: { searchParams: Promise<{ companyId?: string }> }) {
  const { companyId } = await searchParams;
  const locale = await getLocale();
  const t = await getTranslations("Index");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const [aboutRes, companiesRes, worksRes] = await Promise.all([
    supabase.from("about_me").select("name, tagline").limit(1).maybeSingle(),
    supabase.from("companies").select("id, slug, name, logo_url, sector, is_freelance").order("start_date", { ascending: false }),
    supabase.from("works").select("slug, title, cover_url, summary, tags, protected, company_id, work_date, pdf_url, companies(name)").eq("status", "published").order("work_date", { ascending: false }),
  ]);
  const about = aboutRes.data;
  const companies = companiesRes.data || [];
  const works: FeedWork[] = (worksRes.data || []).map(work => ({ ...work, companies: Array.isArray(work.companies) ? work.companies[0] : work.companies }));
  const clients = companies.filter(company => company.is_freelance);
  const tagline = typeof about?.tagline === "object" && about.tagline ? about.tagline[locale] || about.tagline.ca || "" : about?.tagline || "";
  const c = {
    ca: { unavailable: "Els projectes no estan disponibles temporalment. Torna-ho a provar més tard.", more: "Més enllà del disseny", move: "Connecta. Comparteix. Mou-te.", calendar: "Obre el calendari", game: "Joc de l'Impostor", play: "Juga ara", footer: "Disseny gràfic, multimèdia i experiències digitals." },
    es: { unavailable: "Los proyectos no están disponibles temporalmente. Vuelve a intentarlo más tarde.", more: "Más allá del diseño", move: "Conecta. Comparte. Muévete.", calendar: "Abrir el calendario", game: "Juego del Impostor", play: "Jugar ahora", footer: "Diseño gráfico, multimedia y experiencias digitales." },
    en: { unavailable: "Projects are temporarily unavailable. Please try again later.", more: "Beyond design", move: "Connect. Share. Move.", calendar: "Open the calendar", game: "The Impostor Game", play: "Play now", footer: "Graphic design, multimedia and digital experiences." },
    fr: { unavailable: "Les projets sont temporairement indisponibles. Réessayez plus tard.", more: "Au-delà du design", move: "Connectez. Partagez. Bougez.", calendar: "Ouvrir le calendrier", game: "Le jeu de l'Imposteur", play: "Jouer", footer: "Design graphique, multimédia et expériences digitales." },
  }[locale as "ca" | "es" | "en" | "fr"];
  const sectionCopy = {
    ca: { move: "Plans, activitats i comunitats per compartir experiències i conèixer gent. Descobreix què passa i troba el teu pròxim pla.", blog: "Idees, descobertes i articles sobre disseny, cultura, tecnologia i territori.", read: "Explora el blog" },
    es: { move: "Planes, actividades y comunidades para compartir experiencias y conocer gente. Descubre qué pasa y encuentra tu próximo plan.", blog: "Ideas, descubrimientos y artículos sobre diseño, cultura, tecnología y territorio.", read: "Explora el blog" },
    en: { move: "Activities and communities to share experiences and meet people. Discover what’s happening and find your next plan.", blog: "Ideas, discoveries and articles about design, culture, technology and places.", read: "Explore the blog" },
    fr: { move: "Des activités et des communautés pour partager des expériences et faire des rencontres. Découvrez les événements à venir.", blog: "Idées, découvertes et articles sur le design, la culture, la technologie et les territoires.", read: "Explorer le blog" },
  }[locale as "ca" | "es" | "en" | "fr"];
  return (
    <div className="portfolio-shell">
      <AnalyticsTracker token="preview" />
      <StudioHeader locale={locale} isAdmin={!!user} />
      <main className="studio-main">

        <PortfolioHero name={about?.name || "Marc G."} tagline={tagline} locale={locale} />
        <details className="studio-portfolio-group" open>
          <summary className="studio-section-summary"><span className="studio-label">01 / PORTFOLI</span><h2>Portfoli</h2><span className="studio-disclosure" aria-hidden="true">+</span></summary>
        <PresentationLoader works={works.map(work => ({ slug: work.slug, title: work.title, cover_url: work.cover_url || undefined, pdf_url: work.pdf_url || undefined }))} />
        {worksRes.error ? <section className="studio-empty" id="projects" role="status"><p>{c.unavailable}</p></section> : <PortfolioFeed works={works} token="preview" locale={locale} initialCompanyId={companyId} companies={companies} />}
        {clients.length > 0 && <section className="studio-clients">
          <div><p className="studio-label">02 / CLIENTS</p><h2>{t("collaborations_title")}</h2><p className="clients-intro">{t("collaborations_desc")}</p></div>
          <div className="client-grid">{clients.map(company => <Link href={`/v/preview/empresa/${company.slug}`} prefetch={false} key={company.id} className="studio-client">
            {company.logo_url && <div className="client-logo"><Image src={company.logo_url} alt="" fill sizes="64px" quality={75} className="object-contain" /></div>}
            <span>{company.name}</span>
          </Link>)}</div>
        </section>}
        <section className="studio-experiments">
          <p className="studio-label">03 / {c.more}</p><h2 className="studio-section-title">{c.more}</h2>

          <a href={`/webs/impostor/index.html?lang=${locale}`} className="experiment-row"><span className="experiment-number">01</span><div><h2>{c.game}</h2><p>Experimental AI project</p></div><span className="experiment-cta">{c.play}<ArrowUpRight size={19} /></span></a>
        </section>
        </details>
        <section className="studio-home-section" aria-labelledby="move-title">
          <p className="studio-label">02 / MOVE</p><h2 id="move-title" className="studio-section-title">Move</h2>
          <p className="clients-intro">{sectionCopy.move}</p>
          <a href={MOVE_URL} className="studio-button">{c.calendar}<ArrowUpRight size={16} /></a>
        </section>
        <section className="studio-home-section" aria-labelledby="blog-title">
          <p className="studio-label">03 / BLOG</p><h2 id="blog-title" className="studio-section-title">Blog</h2>
          <p className="clients-intro">{sectionCopy.blog}</p>
          <Link href="/v/preview/blog" className="studio-button">{sectionCopy.read}<ArrowUpRight size={16} /></Link>
        </section>
      </main>
      <footer className="studio-footer"><Link href="/" className="studio-wordmark">descobreix</Link><p>{c.footer}</p><Link href="/v/preview/cv">{t("view_cv")}<ArrowUpRight size={14} /></Link></footer>
    </div>
  );
}
