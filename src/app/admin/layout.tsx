import { createClient } from "@/lib/supabase/server";
import { StudioHeader } from "@/components/portfolio/StudioHeader";
import { getLocale } from "next-intl/server";


export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const locale = await getLocale();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch a token for the portfolio menu preview
  const { data: tokenData } = await supabase
    .from("access_tokens")
    .select("token")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const previewToken = tokenData?.token || "preview";

  return (
    <div className="portfolio-shell studio-interior studio-admin min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* 1. PORTFOLIO MENU (LEFT) */}
      {user && (
        <>
          <StudioHeader token={previewToken} locale={locale} isAdmin />
        </>
      )}

      {/* 2. ADMIN CONTENT (CENTER) */}
      <main className="studio-route-content flex flex-col min-w-0 bg-[var(--color-bg)] relative z-0 pb-20 md:pb-0">
        {children}
      </main>

      {/* 3. ADMIN PANEL (RIGHT) */}

    </div>
  );
}
