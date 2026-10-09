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

export default async function PublicHome({ searchParams }: { searchParams: Promise<{ companyId?: string }> }) {
  const { companyId } = await searchParams;
  const locale = await getLocale();
  const t = await getTranslations("Index");
  const supabase = await createClient();
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
  return (
    <div className="portfolio-shell">
      <StudioHeader locale={locale} />
      <main className="studio-main">
        <PortfolioHero name={about?.name || "Marc G."} tagline={tagline} locale={locale} />
        <PresentationLoader works={works.map(work => ({ slug: work.slug, title: work.title, cover_url: work.cover_url || undefined, pdf_url: work.pdf_url || undefined }))} />
        {worksRes.error ? <section className="studio-empty" id="projects" role="status"><p>{c.unavailable}</p></section> : <PortfolioFeed works={works} token="preview" locale={locale} initialCompanyId={companyId} companies={companies} />}
        {clients.length > 0 && <section className="studio-clients">
          <div><p className="studio-label">03 / COLLABORATIONS</p><h2>{t("collaborations_title")}</h2><p className="clients-intro">{t("collaborations_desc")}</p></div>
          <div className="client-grid">{clients.map(company => <Link href={`/v/preview/empresa/${company.slug}`} prefetch={false} key={company.id} className="studio-client">
            {company.logo_url && <div className="client-logo"><Image src={company.logo_url} alt="" fill sizes="64px" quality={75} className="object-contain" /></div>}
            <span>{company.name}</span>
          </Link>)}</div>
        </section>}
        <section className="studio-experiments">
          <p className="studio-label">04 / {c.more}</p>
          <a href={MOVE_URL} className="experiment-row"><span className="experiment-number">01</span><div><h2>Move</h2><p>{c.move}</p></div><span className="experiment-cta">{c.calendar}<ArrowUpRight size={19} /></span></a>
          <a href={`/webs/impostor/index.html?lang=${locale}`} className="experiment-row"><span className="experiment-number">02</span><div><h2>{c.game}</h2><p>Experimental AI project</p></div><span className="experiment-cta">{c.play}<ArrowUpRight size={19} /></span></a>
        </section>
      </main>
      <footer className="studio-footer"><Link href="/" className="studio-wordmark">descobreix<span>↗</span></Link><p>{c.footer}</p><Link href="/v/preview/cv">{t("view_cv")}<ArrowUpRight size={14} /></Link></footer>
    </div>
  );
}
