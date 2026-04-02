import { LeagueHeader } from "@/components/league-header";
import { SiteFooter } from "@/components/site-footer";
import { SocialBar } from "@/components/social-bar";
import { rulesCards } from "@/lib/site-content";
import type { Member } from "@/lib/types";

type BasesPageProps = {
  member: Member | null;
};

export function BasesPage({ member }: BasesPageProps) {
  return (
    <>
      <SocialBar />
      <LeagueHeader
        member={member}
        subtitle="Bases Liga Felina"
        title="Como funciona la Liga Felina."
        lead="Esta pagina reune las reglas generales del sistema de puntuacion, las clasificaciones y la validacion de carreras con Strava."
        compact
      />

      <main className="league-main">
        <section className="rules-section">
          <div className="section-heading">
            <p className="eyebrow dark">Sistema</p>
            <h2>Puntuacion y validacion</h2>
            <p>
              La Liga Felina combina el volumen anual de entrenamiento con la participacion
              en carreras verificadas mediante Strava y con una base ya preparada para un backend real.
            </p>
          </div>

          <div className="rules-grid">
            {rulesCards.map((card) => (
              <article key={card.title} className="rule-card">
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
