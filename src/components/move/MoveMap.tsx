"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import the real Leaflet Map, disabling Server-Side Rendering
// because Leaflet relies heavily on the browser's `window` object.
const DynamicLeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-[21/9] rounded-[2.5rem] border border-[var(--color-border)] overflow-hidden relative shadow-2xl bg-[var(--color-surface)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-[var(--color-muted)]">
        <Loader2 className="animate-spin text-[var(--color-accent)]" size={32} />
        <span className="text-[10px] font-black uppercase tracking-widest">Carregant Mapa...</span>
      </div>
    </div>
  )
});

export function MoveMap({ activities }: { activities?: any[] }) {
  return (
    <div className="w-full relative">
      <DynamicLeafletMap activities={activities || []} />
    </div>
  );
}

