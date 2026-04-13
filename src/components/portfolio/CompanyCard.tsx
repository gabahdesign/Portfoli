import Link from "next/link";
import Image from "next/image";
import { Building2, Calendar } from "lucide-react";

interface CompanyCardProps {
  slug: string;
  name: string;
  logoUrl?: string;
  sector: string;
  startDate: string;
  endDate?: string;
  description: string;
  token: string;
}

export function CompanyCard({
  slug,
  name,
  logoUrl,
  sector,
  startDate,
  endDate,
  description,
  token,
}: CompanyCardProps) {
  const formattedDates = `${new Date(startDate).getFullYear()} — ${
    endDate ? new Date(endDate).getFullYear() : "Present"
  }`;

  return (
    <Link
      href={`/v/${token}/empresa/${slug}`}
      className="group block bg-[var(--color-surface)] border border-[var(--color-border)]/50 rounded-2xl p-6 transition-all duration-300 hover:border-[var(--color-accent)]/30 hover:shadow-xl hover:shadow-black/5"
    >
      <div className="flex items-start gap-6">
        {/* Minimal Logo */}
        <div className="w-16 h-16 bg-[var(--color-bg)] rounded-xl flex items-center justify-center overflow-hidden border border-[var(--color-border)]/50 shrink-0 group-hover:border-[var(--color-accent)]/20 transition-colors">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={name}
              width={64}
              height={64}
              className="object-contain p-2 grayscale group-hover:grayscale-0 transition-all opacity-80 group-hover:opacity-100"
            />
          ) : (
            <Building2 className="w-6 h-6 text-[var(--color-muted)] opacity-20" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div>
              <h3 className="text-lg font-bold text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
                {name}
              </h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)]">
                {sector}
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--color-muted)] bg-[var(--color-bg)] px-3 py-1 rounded-full border border-[var(--color-border)]">
              <Calendar className="w-3 h-3" />
              {formattedDates}
            </div>
          </div>
          <p className="text-sm text-[var(--color-muted)] line-clamp-2 leading-relaxed opacity-70">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}
