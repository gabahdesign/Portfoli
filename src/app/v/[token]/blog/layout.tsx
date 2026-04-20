import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function BlogLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const isPreview = token === "preview";

  if (!isPreview) {
    const supabase = await createClient();
    const { data: tokenData } = await supabase
      .from("access_tokens")
      .select("active")
      .eq("token", token)
      .maybeSingle();

    if (!tokenData || !tokenData.active) {
      notFound();
    }
  }

  return <>{children}</>;
}
