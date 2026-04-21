"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, Loader2 } from "lucide-react";

export default function AdminEmpresas() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/trabajos");
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 bg-[var(--color-bg)] text-[var(--color-text)]">
       <div className="w-20 h-20 rounded-3xl bg-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent)] animate-pulse">
          <Building2 size={40} />
       </div>
       <div className="text-center space-y-2">
          <h1 className="text-2xl font-black uppercase tracking-tighter">Sincronitzant Univers...</h1>
          <p className="text-[var(--color-muted)] text-sm font-medium">Estem unificant els teus projectes i clients en un sol espai.</p>
       </div>
       <Loader2 className="animate-spin text-[var(--color-accent)] mt-4" size={24} />
    </div>
  );
}
