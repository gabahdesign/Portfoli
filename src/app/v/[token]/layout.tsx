import { Navbar } from "@/components/portfolio/Navbar";
import { WelcomeBanner } from "@/components/portfolio/WelcomeBanner";
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
      .maybeSingle();

    const isActive = tokenData?.active ?? false;
    
    // We no longer call notFound() here. 
    // Validation for private sections like /blog will happen in their own layout.

    const welcome_msg = tokenData?.welcome_message as Record<string, string> | null;
    const defaultMsg = welcome_msg ? (welcome_msg as Record<string, string>)["ca"] : undefined;
    welcomeMessage = welcome_msg 
      ? (welcome_msg as Record<string, string>)[locale] || defaultMsg
      : undefined;
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex w-full">
      {!isPreview && <AnalyticsTracker token={token} />}
      <Navbar token={token} locale={locale} isAdmin={!!session} />
      
      <main className="flex-1 w-full ml-0 md:ml-[240px] pb-20 md:pb-0 min-h-screen pt-16 md:pt-0 transition-all duration-300 overflow-x-hidden">
        {!isPreview && <WelcomeBanner message={welcomeMessage} />}
        {children}
      </main>
    </div>
  );
}
