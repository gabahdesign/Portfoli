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
        content: "El responsable del tractament de les dades recollides en aquest portfolio és en Marc. Totes les dades s'utilitzen exclusivament per gestionar l'accés professional mitjançant tokens i per respondre a les sol·licituds de contacte directes." 
      },
      { 
        title: "Dades i Finalitat", 
        content: "Recollim el teu correu electrònic només si decideixes contactar directament. S'utilitza exclusivament per a comunicacions professionals. No cedim dades a tercers, excepte els proveïdors tecnològics necessaris per al servei (Supabase per a la base de dades i Resend per a l'enviament de correus)." 
      },
      { 
        title: "Seguretat", 
        content: "Apliquem mesures de seguretat tècniques com xifrat de dades i polítiques de Row Level Security (RLS) per blindar el contingut privat del portfolio davant de qualsevol accés no autoritzat." 
      },
      { 
        title: "Drets", 
        content: "Pots exercir els teus drets d'accés, rectificació o supressió enviant un correu electrònic a info@descobreix.com." 
      }
    ]
  },
  cookies: {
    title: "Política de Cookies",
    sections: [
      { 
        title: "Ús de Cookies", 
        content: "Aquest web utilitza cookies tècniques essencials per al funcionament de la sessió privada i per recordar les teves preferències (idioma i mode visual). També podem utilitzar cookies d'anàlisi anonimitzades per millorar l'experiència d'usuari." 
      },
      { 
        title: "Gestió", 
        content: "Pots configurar el teu navegador per bloquejar-les, però recorda que l'accés privat per token podria no funcionar correctament sense les cookies tècniques." 
      }
    ]
  },
  condicions: {
    title: "Condicions d'Ús",
    sections: [
      { 
        title: "Ús del Portfolio", 
        content: "L'accés a aquest portfolio a través de token és personal i intransferible. Queda prohibida la compartició del token amb tercers sense el consentiment d'en Marc." 
      },
      { 
        title: "Responsabilitat", 
        content: "En Marc no es fa responsable de l'ús inadequat que es pugui fer dels continguts un cop extrets d'aquesta plataforma per mètodes no autoritzats." 
      }
    ]
  },
  "avis-legal": {
    title: "Avís Legal",
    sections: [
      { 
        title: "Titularitat", 
        content: "En compliment de la Llei 34/2002 (LSSICE), s'informa que el titular d'aquest lloc web és en Marc, amb correu de contacte info@descobreix.com i residència a Catalunya." 
      },
      { 
        title: "Propietat Intel·lectual", 
        content: "Tots els projectes i continguts digitals d'aquesta web estan protegits per drets d'autor. El codi d'aquest portfolio i el seu disseny són propietat exclusiva d'en Marc." 
      }
    ]
  },
  llicencia: {
    title: "Llicència de Continguts",
    sections: [
      { 
        title: "Reserva de Drets de Propietat", 
        content: "Tots els drets sobre el contingut, el disseny original, les marques i el codi d'aquesta aplicació estan reservats exclusivament a en Marc. No es permet la reproducció, distribució o transformació d'aquest material sense autorització prèvia." 
      },
      { 
        title: "Projectes sota NDA", 
        content: "Molts dels treballs visibles a la zona privada estan sota acords de confidencialitat (NDA). Queda totalment prohibida la captura, descàrrega o difusió d'aquests materials en qualsevol mitjà públic o privat." 
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

