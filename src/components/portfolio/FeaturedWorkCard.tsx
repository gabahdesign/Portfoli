import Link from "next/link";
import Image from "next/image";
import { Lock, ArrowUpRight } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

interface FeaturedWorkCardProps {
  slug: string;
  title: string;
  coverUrl?: string;
  summary: string;
  tags: string[];
  protectedNode?: boolean;
  token: string;
  workDate?: string;
}

export function FeaturedWorkCard({
  slug,
  title,
  coverUrl,
  summary,
  tags,
  protectedNode = false,
  token,
  workDate,
}: FeaturedWorkCardProps) {
  const t = useTranslations("Index");
  const locale = useLocale();

  return (
    <div className="group flex flex-col animate-in fade-in duration-700">
      {/* 1. Mèdia (The Shot) */}
      <Link
        href={`/v/${token}/trabajo/${slug}`}
        className="relative aspect-[4/3] w-full bg-[var(--color-surface)] rounded-[2rem] overflow-hidden border border-[var(--color-border)]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-black/10 group-hover:-translate-y-2"
      >
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--color-border)]">
             <div className="flex flex-col items-center gap-2 opacity-20">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-[10px] font-black uppercase tracking-widest">No Image</span>
             </div>
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
           <div className="p-4 bg-white text-black rounded-full scale-75 group-hover:scale-100 transition-transform duration-300 shadow-xl">
              <ArrowUpRight className="w-6 h-6" />
           </div>
        </div>

        {protectedNode && (
          <div className="absolute top-6 right-6 bg-black/40 backdrop-blur-xl p-2.5 rounded-2xl border border-white/20 shadow-xl">
             <Lock className="w-4 h-4 text-white" />
          </div>
        )}
      </Link>

      {/* 2. Info (The Metadata) */}
      <div className="mt-6 px-2">
        <div className="flex justify-between items-start gap-4">
          <Link href={`/v/${token}/trabajo/${slug}`} className="hover:text-[var(--color-accent)] transition-colors">
            <h3 className="text-xl font-bold tracking-tight text-[var(--color-text)]">
              {title}
            </h3>
          </Link>
          <div className="flex gap-1 pt-1">
            {tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[9px] font-black uppercase tracking-widest text-[var(--color-muted)] border border-[var(--color-border)] px-2 py-0.5 rounded-md">
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        {workDate && (
          <div className="flex items-center gap-1.5 mt-2.5 mb-1 text-[10px] font-bold text-[var(--color-muted)] uppercase tracking-widest opacity-40">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
            {new Date(workDate).toLocaleDateString(locale === 'ca' ? 'ca-ES' : 'en-US', { month: 'short', year: 'numeric' })}
          </div>
        )}

        <p className="text-sm text-[var(--color-muted)] mt-2 line-clamp-2 leading-relaxed opacity-80">
          {summary}
        </p>
      </div>
    </div>
  );
}
