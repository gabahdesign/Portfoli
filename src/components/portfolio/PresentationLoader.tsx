"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

const Presentation = dynamic(() => import("./PdfPresentationMode").then(m => m.PdfPresentationMode));

export function PresentationLoader({ works }: { works: Array<{ slug: string; title: string; pdf_url?: string; cover_url?: string }> }) {
  const params = useSearchParams();
  return params.get("mode") === "present" ? <Presentation works={works} /> : null;
}
