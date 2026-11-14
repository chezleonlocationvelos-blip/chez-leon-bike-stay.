export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 p-6 leading-relaxed">
      <p role="note" className="rounded-xl2 bg-accent/40 p-3 text-sm font-semibold">
        MODÈLE À COMPLÉTER ET À FAIRE VALIDER PAR UN JURISTE AVANT LA MISE EN LIGNE. Les passages entre crochets [À COMPLÉTER] sont des informations qu'il vous revient de fournir.
      </p>
      <h1 className="text-3xl font-bold text-forest">{title}</h1>
      {children}
    </main>
  );
}
export const H2 = ({ children }: { children: React.ReactNode }) => <h2 className="mt-4 text-xl font-semibold text-forest">{children}</h2>;
