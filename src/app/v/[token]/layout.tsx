import { Navbar } from "@/components/portfolio/Navbar";
import { WelcomeBanner } from "@/components/portfolio/WelcomeBanner";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AnalyticsTracker } from "@/components/portfolio/AnalyticsTracker";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  const supabase = await createClient();
  
  const isPreview = token === "preview";
  
  let title = "Portfolio de Marc";
  let description = "Explora mis últimos proyectos y experiencia profesional.";

  if (!isPreview) {
    const { data: tokenData } = await supabase.from("access_tokens").select("label").eq("token", token).single();
    if (tokenData && tokenData.label) {
      title = `Portfolio de Marc · Para ${tokenData.label}`;
    }
    const { data: aboutData } = await supabase.from("about_me").select("tagline").single();
    if (aboutData && aboutData.tagline) {
       description = aboutData.tagline["ca"] || description;
    }
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    }
  };
}

export default async function TokenLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();
  const locale = await getLocale();
  const { data: { session } } = await supabase.auth.getSession();

  const isPreview = token === "preview";
  let welcomeMessage = undefined;

  if (!isPreview) {
    const { data: tokenData } = await supabase
      .from("access_tokens")
      .select("welcome_message, active")
      .eq("token", token)
      .single();

    if (!tokenData || !tokenData.active) {
      notFound();
    }

    const defaultMsg = tokenData.welcome_message ? (tokenData.welcome_message as any)["ca"] : undefined;
    welcomeMessage = tokenData.welcome_message 
      ? (tokenData.welcome_message as any)[locale] || defaultMsg
      : undefined;
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex w-full">
      {!isPreview && <AnalyticsTracker token={token} />}
      <Navbar token={token} locale={locale} />
      
      <main className="flex-1 w-full ml-0 md:ml-[240px] pb-20 md:pb-0 min-h-screen pt-16 md:pt-0 transition-all duration-300 overflow-x-hidden">
        {!isPreview && <WelcomeBanner message={welcomeMessage} />}
        {children}
      </main>
    </div>
  );
}
