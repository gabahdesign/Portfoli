import { createClient } from "@/lib/supabase/server";
import { Globe, Plus, Trash2, Edit2, Zap, Monitor, Cpu, ExternalLink, Download } from "lucide-react";
import { WebProjectsList } from "@/components/admin/WebProjectsList";

export default async function AdminWebs() {
  const supabase = await createClient();

  const { data: webProjects } = await supabase
    .from("web_projects")
    .select("*")
    .order("order", { ascending: true });

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500 w-full mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-10 border-b border-[var(--color-border)] pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2 tracking-tight">Projectes Web</h1>
          <p className="text-[var(--color-muted)]">Gestiona els teus experiments i aplicacions web personals.</p>
        </div>
      </div>

      <WebProjectsList initialProjects={webProjects || []} />
    </div>
  );
}
