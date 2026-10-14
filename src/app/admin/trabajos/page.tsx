import { getUiTranslator } from "@/lib/fixed-ui-server";
import Link from "next/link";
import DesignProjectsEditor from "@/components/admin/DesignProjectsEditor";
import WebProjectsEditor from "../webs/page";

export default async function ProjectsEditor({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
 const ui = await getUiTranslator();




  const { tab } = await searchParams;
  const web = tab === "web";
  return <><nav className="studio-project-sections" aria-label={ui("Tipus de projectes")}><Link href="/admin/trabajos" aria-current={!web ? "page" : undefined}>{ui("Disseny")}</Link><Link href="/admin/trabajos?tab=web" aria-current={web ? "page" : undefined}>{ui("Web")}</Link></nav>{web ? <WebProjectsEditor /> : <DesignProjectsEditor />}</>;
}