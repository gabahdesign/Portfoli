"use client";

import { useUiTranslation } from "@/lib/fixed-ui-client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Pencil, Plus, LayoutDashboard } from "lucide-react";

export function AdminPageTools() {
 const ui = useUiTranslation();




  const pathname = usePathname();
  const search = useSearchParams();
  let tools = [{ href: "/admin/trabajos", label: "Gestiona projectes i clients" }];
  if (pathname.includes("/sobre-mi")) tools = [{ href: "/admin/sobre-mi", label: "Edita Sobre mi" }, { href: "/admin/cv", label: "Edita el currículum" }, { href: "/admin/accesos", label: "Gestiona els accessos" }];
  else if (pathname.includes("/blog")) tools = [{ href: "/admin/blog", label: "Gestiona les publicacions" }];
  else if (pathname.includes("/webs") || search.get("tab") === "web") tools = [{ href: "/admin/webs", label: "Gestiona els projectes web" }];
  return <div className="studio-admin-tools" aria-label={ui("Eines d’administració")}><span>{ui("Sessió d’administració")}</span>{tools.map(tool => <Link key={tool.href} href={tool.href}><Pencil size={15}/>{ui(tool.label)}</Link>)}<Link href="/admin/dashboard"><LayoutDashboard size={15}/>{ui("Resum")}</Link></div>;
}
