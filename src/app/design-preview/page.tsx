import { notFound } from "next/navigation";
import { StudioHeader } from "@/components/portfolio/StudioHeader";
import { PortfolioHero } from "@/components/portfolio/PortfolioHero";
import { PortfolioFeed } from "@/components/portfolio/PortfolioFeed";
import { PresentationLoader } from "@/components/portfolio/PresentationLoader";

// Local visual QA only. This route returns 404 in production.
export default function DesignPreview() {
  if (process.env.NODE_ENV !== "development") notFound();
  const base = "https://tsnatwflznqhtpxfxlcd.supabase.co/storage/v1/object/public/portfolio-media/";
  const examples = [
    ["REBAIXES HIVERN CC SANT CUGAT", "works/1776818297989-qjssva0u7lr.jpg", "Photography"],
    ["Arròs Mariner", "content/aeht/cartell/AAFF_ARROS_MARINER_TARRAGONA_XXSS.png", "Cartell"],
    ["Felicitació Nadal", "works/1776820033468-0fk0882oq62a.png", "Identity"],
    ["AHORRA50", "works/1776810826020-mdy0g871o8.jpg", "Branding"],
    ["Aviso Inspección Periódica Caducada", "works/1776811617917-d1630reodr8.jpg", "Typography"],
    ["Il·lustracions", "works/1776812134969-vnvl8iwrm6b.jpg", "Illustration"],
    ["Sabors de la Conca de Tardor", "works/1776815016609-oecig8yt8c.jpg", "Cartell"],
    ["Publicacions XXSS", "", "Social Media"],
    ["2024", "", "Identity"],
    ["Logo Move Social Club", "", "Branding"],
    ["INMOBILIARIAS", "", "Cartell"],
    ["BANNERS", "", "Web Design"],
  ];
  const works = examples.map(([title, image, tag], index) => ({ slug: "preview-" + index, title, cover_url: image ? base + image : null, summary: "", tags: [tag], protected: false, company_id: "preview", work_date: "2024-01-01" }));
  return <div className="portfolio-shell"><StudioHeader locale="ca" /><main className="studio-main"><PortfolioHero name="Marc G." tagline="Dissenyador gràfic i multimèdia" locale="ca" /><PresentationLoader works={works.map(w => ({ ...w, cover_url: w.cover_url || undefined }))} /><PortfolioFeed works={works} token="preview" locale="ca" /></main></div>;
}
