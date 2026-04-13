"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/admin/dashboard" && pathname?.startsWith(href));

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center px-4 py-2.5 rounded-xl transition-all font-semibold text-sm ${
        isActive 
          ? "bg-[var(--color-accent)] text-white shadow-lg shadow-[var(--color-accent-glow)]" 
          : "text-[var(--color-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-accent)]"
      }`}
    >
      {children}
    </Link>
  );
}
