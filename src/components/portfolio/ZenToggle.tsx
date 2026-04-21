"use client";

import { useState, useEffect } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export function ZenToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isZen = searchParams.get("mode") === "zen";

  useEffect(() => {
    if (isZen) {
      document.body.classList.add("zen-mode");
    } else {
      document.body.classList.remove("zen-mode");
    }
  }, [isZen]);

  const toggleZen = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (isZen) {
      params.delete("mode");
    } else {
      params.set("mode", "zen");
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <button
      onClick={toggleZen}
      className={`fixed top-6 right-6 z-[100] p-3 rounded-full backdrop-blur-xl border border-white/10 shadow-2xl transition-all hover:scale-110 active:scale-95 ${
        isZen ? "bg-[var(--color-accent)] text-white" : "bg-black/60 text-[var(--color-muted)] hover:text-white"
      }`}
      title={isZen ? "Sortir del mode presentació" : "Activar mode presentació"}
    >
      {isZen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
    </button>
  );
}
