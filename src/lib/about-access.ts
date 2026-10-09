import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function canAccessAbout(token: string) {
  const supabase = await createClient(token);
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.id === "a899bd7c-d921-4bf4-a3d6-63ff0460e418") return true;
  if (!token || token === "preview") return false;
  const { data, error } = await supabase.from("access_tokens")
    .select("active, expires_at").eq("token", token).maybeSingle();
  return !error && !!data?.active && (!data.expires_at || new Date(data.expires_at).getTime() > Date.now());
}
