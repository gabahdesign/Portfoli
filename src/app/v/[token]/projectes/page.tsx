import WebProjectsSection from "@/components/portfolio/WebProjectsSection";
import { createClient } from "@/lib/supabase/server";
import { PublicArchiveView } from "./PublicArchiveView";
import { getLocale } from "next-intl/server";

export default async function ProjectesPage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { token } = await params;
  const { tab } = await searchParams;
  const isWeb = tab === "web";
  const supabase = await createClient(token || undefined);
  const locale = await getLocale();

  // All companies remain available in the archive hierarchy.
  const { data: companies } = await supabase
    .from("companies")
    .select("*")
    .order("name");

  // Include every published work, regardless of the company's collaboration flag.
  const { data: works, error } = await supabase
    .from("works")
    .select("slug, title, cover_url, summary, tags, protected, company_id, work_date, companies(name, logo_url)")
    .eq("status", "published")
    .order("work_date", { ascending: false });

  return (
    <><nav className="studio-project-sections" aria-label="Tipus de projectes"><a href={`/v/${token}/projectes`} aria-current={!isWeb ? "page" : undefined}>{locale === "ca" ? "Disseny" : locale === "es" ? "Diseño" : locale === "fr" ? "Design" : "Design"}</a><a href={`/v/${token}/projectes?tab=web`} aria-current={isWeb ? "page" : undefined}>Web</a></nav>{isWeb ? <section id="projectes-web"><WebProjectsSection /></section> : <section id="projectes-grafics">
    {error ? <div className="studio-empty" role="status"><h1>Projectes</h1><p>No s&apos;han pogut carregar els projectes. Torna-ho a provar més tard.</p></div> :
    <PublicArchiveView 
      initialWorks={works || []}
      initialCompanies={companies || []}
      token={token}
      locale={locale}
    />}</section>}</>
  );
}
