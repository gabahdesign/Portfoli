"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";

export function BackButton() {
  const router = useRouter();
  const t = useTranslations("Navigation");

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-2 text-sm font-bold text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-all group mb-8"
    >
      <div className="w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center group-hover:border-[var(--color-accent)] transition-colors">
        <ChevronLeft className="w-4 h-4" />
      </div>
      {t("back")}
    </button>
  );
}
