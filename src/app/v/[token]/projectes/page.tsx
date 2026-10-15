import { recoveredWorks, recoveredCompanies } from "@/lib/public-portfolio-recovery";
import { getUiTranslator } from "@/lib/fixed-ui-server";
import WebProjectsSection from "@/components/portfolio/WebProjectsSection";
import { createClient } from "@/lib/supabase/server";
import { PublicArchiveView } from "./PublicArchiveView";
import { getLocale } from "next-intl/server";

export default async function ProjectesPage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ tab?: string }> }) {
 const ui = await getUiTranslator();




  const { token } = await params;
  const { tab } = await searchParams;
  const isWeb = tab === "web";
  const supabase = await createClient(token || undefined);
  const locale = await getLocale();

  // All companies remain available in the archive hierarchy.
  const { data: companies, error: companiesError } = await supabase
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
    <><nav className="studio-project-sections" aria-label={ui("Tipus de projectes")}><a href={`/v/${token}/projectes`} aria-current={!isWeb ? "page" : undefined}>{locale === "ca" ? ui("Disseny") : locale === "es" ? ui("Diseño") : locale === "fr" ? ui("Design") : ui("Design")}</a><a href={`/v/${token}/projectes?tab=web`} aria-current={isWeb ? "page" : undefined}>{ui("Web")}</a></nav>{isWeb ? <section id="projectes-web"><WebProjectsSection /></section> : <section id="projectes-grafics">
    {error && token !== "preview" ? <div className="studio-empty" role="status"><h1>{ui("Projectes")}</h1><p>{ui("No s'han pogut carregar els projectes. Torna-ho a provar més tard.")}</p></div> :
    <PublicArchiveView
      initialWorks={works || (error && token === "preview" ? recoveredWorks : [])}
      initialCompanies={companies || (companiesError && token === "preview" ? recoveredCompanies : [])}
      token={token}
      locale={locale}
    />}</section>}</>
  );
}
