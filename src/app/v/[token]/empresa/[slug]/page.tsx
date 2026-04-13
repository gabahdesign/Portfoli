import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { FeaturedWorkCard } from "@/components/portfolio/FeaturedWorkCard";
import Image from "next/image";

export default async function CompanyPage({ params }: { params: Promise<{ token: string, slug: string }> }) {
  const { token, slug } = await params;
  const supabase = await createClient();

  const { data: company, error } = await supabase
    .from("companies")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !company) {
    notFound();
  }

  // Authorization check (same logic as in Home)
  const { data: tokenData } = await supabase.from("access_tokens").select("company_ids").eq("token", token).single();
  if (tokenData && tokenData.company_ids && tokenData.company_ids.length > 0) {
     if (!tokenData.company_ids.includes(company.id) && !company.is_freelance) {
       notFound(); 
     }
  }

  const { data: works } = await supabase
    .from("works")
    .select("slug, title, cover_url, summary, tags, protected")
    .eq("company_id", company.id)
    .eq("status", "published")
    .order("work_date", { ascending: false });

  const formattedDates = `${new Date(company.start_date).getFullYear()} - ${
    company.end_date ? new Date(company.end_date).getFullYear() : "Present"
  }`;

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 animate-in fade-in duration-500">
      
      {/* HEADER EMPRESA */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-16 pb-8 border-b border-color-border">
         <div className="w-24 h-24 bg-color-surface border border-color-border rounded-xl flex items-center justify-center p-3 relative shrink-0">
            {company.logo_url ? (
              <Image src={company.logo_url} alt={company.name} fill className="object-contain p-2" />
            ) : (
               <span className="text-3xl font-display font-black text-[var(--color-muted)]">{company.name.charAt(0)}</span>
            )}
         </div>
         <div>
            <h1 className="font-display text-4xl md:text-5xl font-black text-[var(--color-text)] mb-3 tracking-tight">{company.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-color-muted text-sm">
                <span className="text-[var(--color-accent)] font-bold px-2 py-0.5 rounded bg-[var(--color-accent-subtle)]">{company.sector}</span>
               <span className="w-1 h-1 rounded-full bg-color-border hidden md:block"></span>
               <span>{formattedDates}</span>
               <span className="w-1 h-1 rounded-full bg-color-border hidden md:block"></span>
               <span>{company.location}</span>
               {company.website && (
                 <>
                   <span className="w-1 h-1 rounded-full bg-color-border hidden md:block"></span>
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors font-bold underline underline-offset-4 decoration-2">Web</a>
                 </>
               )}
            </div>
            <p className="mt-4 leading-relaxed max-w-3xl text-color-text">{company.description}</p>
         </div>
      </div>
      
      {/* TRABAJOS DE LA EMPRESA */}
      {(!works || works.length === 0) ? (
        <div className="text-center py-20 text-color-muted border border-dashed border-color-border rounded-xl bg-color-surface/30">
          No hay trabajos publicados en este momento.
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
