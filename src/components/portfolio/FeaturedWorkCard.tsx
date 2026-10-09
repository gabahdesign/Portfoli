"use client";

import Link from "next/link";
import Image from "next/image";
import { Lock, ArrowUpRight, FileText, Play } from "lucide-react";
import { useLocale } from "next-intl";
import { useRef, useState } from "react";

interface FeaturedWorkCardProps {
  slug: string; title: string; coverUrl?: string; summary: string; tags: string[];
  protectedNode?: boolean; token: string; workDate?: string; pdfUrl?: string;
  layout?: "grid" | "list"; index?: number;
}
export function FeaturedWorkCard({ slug, title, coverUrl, summary, tags, protectedNode = false, token, workDate, pdfUrl, layout = "grid", index = 0 }: FeaturedWorkCardProps) {
  const locale = useLocale();
  const video = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const path = coverUrl?.split(/[?#]/)[0] || "";
  const isVideo = /\.(mp4|webm|mov)$/i.test(path);
  const isPdf = /\.pdf$/i.test(path);
  const href = `/v/${token}/trabajo/${slug}`;
  return (
    <article className={`studio-work-card ${layout === "list" ? "is-list" : ""}`}>
      <Link href={href} prefetch={false} className="work-media" aria-label={title} onMouseEnter={() => video.current?.play().catch(() => {})} onMouseLeave={() => { if (video.current) { video.current.pause(); video.current.currentTime = 0; } }}>
        {coverUrl && !failed && !isPdf ? isVideo ? <><video ref={video} src={coverUrl} muted loop playsInline preload="none" onError={() => setFailed(true)} /><span className="work-video-label"><Play size={15} /> VIDEO</span></> : <Image src={coverUrl} alt={title} fill sizes={layout === "list" ? "96px" : "(max-width: 639px) calc(100vw - 40px), (max-width: 1023px) calc((100vw - 104px) / 2), (max-width: 1519px) calc((100vw - 152px) / 3), 456px"} quality={70} loading="lazy" className="work-image" onError={() => setFailed(true)} /> : <div className="work-placeholder"><span>{(index + 1).toString().padStart(2, "0")}</span>{isPdf || pdfUrl ? <FileText size={32} /> : <ArrowUpRight size={32} />}<small>{isPdf || pdfUrl ? "PDF / PROJECT" : title}</small></div>}
        <span className="work-open" aria-hidden="true"><ArrowUpRight size={19} /></span>
        {protectedNode && <span className="work-lock"><Lock size={13} /><span className="sr-only">{locale === "es" ? "Proyecto protegido" : "Protected project"}</span></span>}
      </Link>
      <div className="work-information">
        <div className="work-caption"><span>{tags.slice(0, 2).join(" / ") || "PROJECT"}</span>{workDate && <time dateTime={workDate}>{workDate.slice(0, 4)}</time>}</div>
        <Link href={href} prefetch={false}><h3>{title}</h3></Link>
        {summary && <p>{summary}</p>}
      </div>
      {layout === "list" && <Link href={href} prefetch={false} className="list-open" aria-label={title}><ArrowUpRight size={20} /></Link>}
    </article>
  );
}
