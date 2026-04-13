import { Mail, MapPin, ExternalLink, Link2, Globe } from "lucide-react";

export default async function ContactoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  
  // This could easily be fetched from DB (about_me metrics) or hardcoded
  // For the portfolio, we'll implement a clean, straightforward contact card stack
  
  const contacts = [
    {
      platform: "Email Directo",
      value: "hola@descobreix.com",
      link: "mailto:hola@descobreix.com",
      icon: <Mail className="w-6 h-6" />
    },
    {
      platform: "LinkedIn",
      value: "linkedin.com/in/marc",
      link: "https://linkedin.com",
      icon: <Link2 className="w-6 h-6" />
    },
    {
      platform: "GitHub",
      value: "github.com/marc",
      link: "https://github.com",
      icon: <Globe className="w-6 h-6" />
    },
    {
      platform: "Centro Base",
      value: "Barcelona, España (Remoto global)",
      link: null,
      icon: <MapPin className="w-6 h-6" />
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <h1 className="text-4xl md:text-6xl font-display text-color-text tracking-tight mb-6">Contacte</h1>
      <p className="text-color-muted text-lg md:text-xl max-w-2xl mb-16 leading-relaxed">
        Gràcies per dedicar-li temps a la meva feina. Si creus que el meu perfil encaixa amb el que esteu buscant, em trobaràs de forma més ràpida a través dels següents canals.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contacts.map((c, i) => (
          <div key={i} className="bg-color-surface border border-color-border p-8 rounded-3xl flex items-start gap-6 hover:border-color-accent/50 hover:bg-color-surface/80 transition-all duration-300 group">
             <div className="p-4 bg-[var(--color-bg)] rounded-2xl text-[var(--color-accent)] group-hover:text-[var(--color-accent-hover)] transition-colors">
               {c.icon}
             </div>
             <div className="flex-1">
               <h3 className="text-color-muted text-sm uppercase tracking-widest font-semibold mb-2">{c.platform}</h3>
               {c.link ? (
                 <a href={c.link} target="_blank" rel="noopener noreferrer" className="text-color-text text-xl font-bold flex items-center gap-2 hover:text-color-accent transition-colors">
                   {c.value}
                   <ExternalLink className="w-4 h-4 opacity-50" />
                 </a>
               ) : (
                 <span className="text-color-text text-xl font-bold block">{c.value}</span>
               )}
             </div>
          </div>
        ))}
      </div>
      
      <div className="mt-20 p-10 bg-color-accent/10 border border-color-accent/20 rounded-3xl flex flex-col md:flex-row gap-8 items-center justify-between">
         <div>
           <h4 className="text-color-text font-display text-2xl mb-2">Treballem junts</h4>
           <p className="text-color-muted max-w-md">Estic obert a noves propostes i conèixer nous reptes. Escriu-me i respondré en menys de 24 hores.</p>
         </div>
         <a href="mailto:hola@descobreix.com" className="shrink-0 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-[var(--color-accent-glow)] transition-all hover:scale-105 active:scale-95">
           Enviar Correu Electrònic
         </a>
      </div>
    </div>
  );
}
