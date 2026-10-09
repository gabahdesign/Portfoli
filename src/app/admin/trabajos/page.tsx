import Link from "next/link";
import DesignProjectsEditor from "@/components/admin/DesignProjectsEditor";
import WebProjectsEditor from "../webs/page";

export default async function ProjectsEditor({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const web = tab === "web";
  return <><nav className="studio-project-sections" aria-label="Tipus de projectes"><Link href="/admin/trabajos" aria-current={!web ? "page" : undefined}>Disseny</Link><Link href="/admin/trabajos?tab=web" aria-current={web ? "page" : undefined}>Web</Link></nav>{web ? <WebProjectsEditor /> : <DesignProjectsEditor />}</>;
}