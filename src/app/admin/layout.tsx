import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/portfolio/Navbar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

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
    <div className="min-h-screen bg-[var(--color-bg)] flex text-[var(--color-text)]">
      {/* 1. PORTFOLIO MENU (LEFT) */}
      {session && (
        <>
          <div className="hidden lg:block w-[240px] shrink-0 border-r border-[var(--color-border)] relative z-0" />
          <Navbar token={previewToken} locale="ca" />
        </>
      )}

      {/* 2. ADMIN CONTENT (CENTER) */}
      <main className="flex-1 flex flex-col min-w-0 bg-[var(--color-bg)] relative z-0 pb-20 md:pb-0 pt-16 xl:pt-0">
        {children}
      </main>

      {/* 3. ADMIN PANEL (RIGHT) */}
      {session && <AdminSidebar />}
    </div>
  );
}
