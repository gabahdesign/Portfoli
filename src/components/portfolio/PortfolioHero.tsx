import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";

const copy = {
  ca: { eyebrow: "Disseny gràfic · Multimèdia · Digital", title: "Idees que", end: "prenen forma.", work: "Explora els projectes", about: "Coneix-me", index: "Una mirada al meu univers creatiu" },
  es: { eyebrow: "Diseño gráfico · Multimedia · Digital", title: "Ideas que", end: "toman forma.", work: "Explora los proyectos", about: "Conóceme", index: "Una mirada a mi universo creativo" },
  en: { eyebrow: "Graphic design · Multimedia · Digital", title: "Ideas that", end: "take shape.", work: "Explore the projects", about: "About me", index: "A look into my creative universe" },
  fr: { eyebrow: "Design graphique · Multimédia · Digital", title: "Des idées qui", end: "prennent forme.", work: "Voir les projets", about: "À propos", index: "Un regard sur mon univers créatif" },
};

export function PortfolioHero({ name, tagline, locale, token = "preview" }: { name: string; tagline: string; locale: string; token?: string }) {
  const c = copy[locale as keyof typeof copy] || copy.ca;
  return (
    <section className="portfolio-hero" aria-labelledby="portfolio-title">
      <div className="hero-copy">
        <p className="studio-label"><span className="studio-dot" /> {c.eyebrow}</p>
        <h1 id="portfolio-title">{c.title}<br /><span>{c.end}</span></h1>
        <p className="hero-intro"><strong>{name.replace(/\.$/, "")}</strong><span> / </span>{tagline || c.eyebrow}</p>
        <div className="hero-actions">
          <a className="studio-button studio-button-solid" href="#projects">{c.work}<ArrowDown size={16} /></a>
          <Link className="studio-button" href={`/v/${token}/sobre-mi`}>{c.about}<ArrowUpRight size={16} /></Link>
        </div>
      </div>
      <div className="hero-object" aria-hidden="true">
        <span className="object-coordinate">FIG. 01 / FORM & FUNCTION</span>
        <div className="orb"><div className="orb-rings" /></div>
        <span className="object-caption">DESCOBREIX®<br />CREATIVE EXPLORATION</span>
        <span className="object-cross">+</span>
      </div>
      <div className="hero-footer"><span>DESCOBREIX</span><span>{c.index}</span><ArrowDown size={14} /></div>
    </section>
  );
}
