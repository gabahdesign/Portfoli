import { createClient } from "@/lib/supabase/server";
import { PublicArchiveView } from "./PublicArchiveView";
import { getLocale } from "next-intl/server";

export default async function ProjectesPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
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
    error ? <div className="studio-empty" role="status"><h1>Projectes</h1><p>No s&apos;han pogut carregar els projectes. Torna-ho a provar més tard.</p></div> :
    <PublicArchiveView 
      initialWorks={works || []}
      initialCompanies={companies || []}
      token={token}
      locale={locale}
    />
  );
}
