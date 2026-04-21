import { createClient } from "@/lib/supabase/server";
import { PublicArchiveView } from "./PublicArchiveView";
import { getLocale } from "next-intl/server";

export default async function ProjectesPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const locale = await getLocale();

  // 1. Fetch collaboration companies (all of them to build hierarchy)
  const { data: companies } = await supabase
    .from("companies")
    .select("*")
    .order("name");

  // 2. Fetch collaboration company IDs for filtering works initially (only those marked as freelance/collaboration)
  const collaborationIds = companies?.filter(c => c.is_freelance).map(c => c.id) || [];

  // 3. Fetch published works for those companies
  const { data: works } = await supabase
    .from("works")
    .select("slug, title, cover_url, summary, tags, protected, company_id, work_date, companies(name, logo_url)")
    .in("company_id", collaborationIds)
    .eq("status", "published")
    .order("work_date", { ascending: false });

  return (
    <PublicArchiveView 
      initialWorks={works || []}
      initialCompanies={companies || []}
      token={token}
      locale={locale}
    />
  );
}
