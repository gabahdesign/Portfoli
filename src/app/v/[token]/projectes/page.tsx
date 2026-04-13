import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { FeaturedWorkCard } from "@/components/portfolio/FeaturedWorkCard";

export default async function ProjectesPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const t = await getTranslations("Navigation");
  const tIndex = await getTranslations("Index");
  const supabase = await createClient();

  // Find all project/collaboration company ids (formerly freelance)
  const { data: collaborationCompanies } = await supabase
    .from("companies")
    .select("id")
    .eq("is_freelance", true);

  const collaborationIds = collaborationCompanies?.map((c) => c.id) || [];

  const { data: works } = await supabase
    .from("works")
    .select("slug, title, cover_url, summary, tags, protected, company_id")
    .in("company_id", collaborationIds)
    .eq("status", "published")
    .order("work_date", { ascending: false });

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 animate-in fade-in duration-500">
      <h1 className="font-display text-4xl md:text-5xl font-black text-[var(--color-text)] mb-12 border-b border-[var(--color-border)] pb-6 tracking-tight">
        {t("projectes")}
      </h1>
      
      {(!works || works.length === 0) ? (
        <div className="text-center py-20 text-color-muted border border-dashed border-color-border rounded-xl bg-color-surface/30 px-6">
          {tIndex("no_projects_found")}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {works.map((work) => (
             <FeaturedWorkCard
               key={work.slug}
               slug={work.slug}
               title={work.title}
               coverUrl={work.cover_url}
               summary={work.summary}
               tags={work.tags || []}
               protectedNode={work.protected}
               token={token}
             />
          ))}
        </div>
      )}
    </div>
  );
}
