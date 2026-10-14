import { getUiTranslator } from "@/lib/fixed-ui-server";
import AccessManager from "../accesos/page";
import { createClient } from "@/lib/supabase/server";

export default async function AdminAjustos() {
 const ui = await getUiTranslator();




  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return <div className="p-4 md:p-8 max-w-4xl space-y-10">
    <header className="border-b border-[var(--color-border)] pb-6"><h1 className="text-3xl">{ui("Ajustos del sistema")}</h1><p className="text-[var(--color-muted)] mt-2">{ui("Configuració actual del web i del teu compte.")}</p></header>
    <section className="space-y-4"><h2 className="text-xl">{ui("Web i idioma")}</h2><dl className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><dt className="text-[var(--color-muted)] text-sm">{ui("Nom del web")}</dt><dd>Descobreix</dd></div><div><dt className="text-[var(--color-muted)] text-sm">{ui("Idioma inicial")}</dt><dd>{ui("Català")}</dd></div></dl><p className="text-sm text-[var(--color-muted)]">{ui("El selector d’idiomes i el tema clar o fosc són a la barra de navegació. La preferència es conserva en aquest navegador.")}</p></section>
    <section className="border-t border-[var(--color-border)] pt-6 space-y-3"><h2 className="text-xl">{ui("Compte d’administració")}</h2><p>{user?.email}</p><p className="text-sm text-[var(--color-muted)]">{ui("Aquest és el compte amb què has iniciat sessió. L’autenticació i la recuperació de la contrasenya es gestionen amb Supabase Auth.")}</p></section>
    <section className="border-t border-[var(--color-border)] pt-6 space-y-3"><h2 className="text-xl">{ui("Privacitat de Sobre mi")}</h2><p>{ui("Sobre mi, el currículum i el PDF requereixen un enllaç actiu i no caducat. Pots consultar-los mentre tens la sessió d’administració oberta.")}</p><p className="text-sm text-[var(--color-muted)]">{ui("Els enllaços es creen, copien i desactiven des d’Accessos Sobre mi. Inici, Projectes, Move i Blog continuen accessibles públicament.")}</p></section>
    <section className="border-t border-[var(--color-border)] pt-6"><AccessManager /></section>
  </div>;
}