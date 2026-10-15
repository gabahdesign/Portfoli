import "server-only";
import snapshot from "@/data/public-portfolio-recovery.json";

// Emergency, verified public-only copy. Never use for authenticated or private views.
export const recoveredWorks = snapshot.works.filter(work => work.status === "published" && work.visibility_type === "public_always" && work.protected === false);
export const recoveredCompanies = snapshot.companies;
