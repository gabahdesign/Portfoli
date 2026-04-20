import { notFound } from "next/navigation";

interface LegalContent {
  title: string;
  sections: { title: string; content: string }[];
}

const legalData: Record<string, LegalContent> = {
  privacitat: {
    title: "Política de Privacitat",
    sections: [
      { 
        title: "Responsable del Tractament", 
        content: "Les dades personals recollides a través d'aquest portfolio seran tractades per l'equip de Descobreix, sota la supervisió de Marc, amb la finalitat de gestionar les consultes, contactes professionals i l'enviament de tokens d'accés personalitzat." 
      },
      { 
        title: "Finalitat del Tractament", 
        content: "La finalitat principal és facilitar que clients i col·laboradors puguin veure projectes sota NDA de manera segura. També s'utilitzen per respondre a sol·licituds de contacte i per analitzar les visites mitjançant serveis estadístics per millorar l'experiència de l'usuari." 
      },
      { 
        title: "Dades Recollides", 
        content: "Recollim exclusivament dades identificatives (com nom o email en cas de contacte directe) i dades de navegació tècnica (IP anonimitzada, tipus de dispositiu, pàgines visitades) per garantir el correcte funcionament dels accessos restringits." 
      },
      { 
        title: "Legitimació", 
        content: "El tractament de les seves dades es basa en el consentiment exprés de l'usuari en sol·licitar accés o en navegar per les seccions del portfolio, així com en l'interès legítim del titular per oferir una versió restringida i segura de la seva feina." 
      },
      { 
        title: "Drets de l'Usuari", 
        content: "Com a usuari, tens dret a accedir, rectificar i suprimir les teves dades, així com a limitar-ne o oposar-te al seu tractament. Pots exercir aquests drets enviant un correu electrònic a la direcció de contacte proporcionada en el portfolio." 
      }
    ]
  },
  cookies: {
    title: "Política de Cookies",
    sections: [
      { 
        title: "Què són les cookies?", 
        content: "Les cookies són petits fitxers de text que s'emmagatzemen al seu navegador quan visita la nostra web. Ajuden a reconèixer el seu dispositiu i a oferir-li una experiència personalitzada i segura." 
      },
      { 
        title: "Cookies Tècniques i Necessàries", 
        content: "Són aquelles imprescindibles pel funcionament de la web. En aquest portfolio, s'utilitzen per mantenir la sessió de l'usuari quan entra amb un token d'accés i per recordar les preferències d'idioma i mode (fosc/clar)." 
      },
      { 
        title: "Cookies d'Anàlisi", 
        content: "Utilitzem serveis d'anàlisi (com Google Analytics o Vercel Analytics) per obtenir informació agregada sobre el trànsit de la web. Aquesta informació és totalment anonimitzada i ens ajuda a entendre quins projectes desperten més interès." 
      },
      { 
        title: "Com desactivar les cookies?", 
        content: "Pots configurar el teu navegador per bloquejar totes les cookies o per avisar-te quan se n'estigui enviant una. Tingues en compte que algunes funcionalitats del portfolio (especialment les zones privades) podrien no funcionar correctament sense cookies actives." 
      }
    ]
  },
  condicions: {
    title: "Condicions d'Ús",
    sections: [
      { 
        title: "Objecte i Acceptació", 
        content: "Aquestes condicions regulen l'accés i l'ús del portfolio professional de 'Descobreix' gestionat per Marc. L'accés al lloc web implica l'acceptació plena i sense reserves de totes i cadascuna de les disposicions incloses en aquest text." 
      },
      { 
        title: "Propietat Intel·lectual", 
        content: "Tot el contingut d'aquest lloc web, incloent projectes, gràfics, codi i logotips, és propietat intel·lectual de Marc o han estat inclosos sota permís per portfoli. Qualsevol reproducció, distribució o comunicació pública total o parcial sense autorització expressa queda totalment prohibida." 
      },
      { 
        title: "Reserva de Drets", 
        content: "El titular es reserva el dret de retirar l'accés a les zones privades si es detecta un ús indegut del token d'accés proporcionat." 
      }
    ]
  },
  "avis-legal": {
    title: "Avís Legal",
    sections: [
      { 
        title: "Dades Identificatives", 
        content: "En compliment de l'article 10 de la Llei 34/2002, s'informa que el titular del domini descobreix.com i d'aquest web és l'equip professional liderat per Marc, amb residència a Tarragona/Barcelona." 
      },
      { 
        title: "Exclusió de Responsabilitat", 
        content: "L'autor d'aquest lloc web no pot garantir la inexistència d'errors en l'accés al web, ni que el seu contingut estigui totalment actualitzat, tot i que farà els millors esforços per evitar-los o esmenar-los." 
      }
    ]
  }
};

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = legalData[slug];
  
  if (!content) notFound();

  return (
    <div className="max-w-3xl mx-auto px-6 py-20 animate-in slide-in-from-bottom-4 duration-700">
      <header className="mb-16 border-b border-[var(--color-border)] pb-10">
        <h1 className="text-4xl md:text-5xl font-display font-black text-[var(--color-text)] tracking-tight">
          {content.title}
        </h1>
        <p className="text-[var(--color-muted)] mt-4 font-medium italic">
          Darrera actualització: Abril 2026
        </p>
      </header>

      <div className="space-y-12">
        {content.sections.map((section, idx) => (
          <section key={idx} className="group">
            <h2 className="text-xl font-bold text-[var(--color-accent)] mb-4 flex items-center gap-3">
              <span className="w-8 h-[2px] bg-[var(--color-accent)] opacity-30 group-hover:opacity-100 transition-opacity" />
              {section.title}
            </h2>
            <div className="text-[var(--color-text-subtle)] leading-relaxed text-lg">
              {section.content}
            </div>
          </section>
        ))}
      </div>

      <footer className="mt-24 pt-10 border-t border-[var(--color-border)] text-sm text-[var(--color-muted)] text-center font-medium">
        &copy; {new Date().getFullYear()} Descobreix &middot; Tots els drets reservats
      </footer>
    </div>
  );
}

