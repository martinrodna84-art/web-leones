import Link from "next/link";

import { HomeHeader } from "@/components/home-header";
import { SiteFooter } from "@/components/site-footer";
import { SocialBar } from "@/components/social-bar";
import { teko } from "@/lib/fonts";
import { clubCards, trainingCards } from "@/lib/site-content";
import type { Member } from "@/lib/types";

type ClubPageProps = {
  member: Member | null;
};

export function ClubPage({ member }: ClubPageProps) {
  return (
    <>
      <SocialBar />
      <HomeHeader member={member} />

      <main className="club-main">
        <section className="club-hero" id="informacion">
          <div className="club-shell">
            <p className={`${teko.className} club-kicker`}>El club</p>
            <h1 className={`${teko.className} club-title`}>
              Informacion, altas y entrenamientos en una sola pagina.
            </h1>
            <p className="club-lead">
              Todo lo que hemos sacado de la landing principal vive ahora aqui:
              quienes somos, como unirte, el alta, el tablon interno y la base
              de entrenamientos del club.
            </p>
            <div className="club-hero-actions">
              <Link className={`${teko.className} club-button club-button--primary`} href="/liga-felina/registro">
                Hazte socio
              </Link>
              <Link className={`${teko.className} club-button`} href="/contacto">
                Contactar
              </Link>
            </div>
          </div>
        </section>

        <section className="club-section">
          <div className="club-shell club-grid">
            {clubCards.map((card) => (
              <article key={card.id} id={card.id} className="club-card">
                <p className={`${teko.className} club-card-kicker`}>El club</p>
                <h2 className={`${teko.className} club-card-title`}>{card.title}</h2>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="club-section club-section--training">
          <div className="club-shell">
            <div className="club-section-head">
              <p className={`${teko.className} club-kicker`}>Entrenamientos</p>
              <h2 className={`${teko.className} club-section-title`}>
                Planes, rutas y sesiones para ordenar la actividad del equipo.
              </h2>
            </div>

            <div className="club-grid club-grid--training">
              {trainingCards.map((card) => (
                <article key={card.id} id={card.id} className="club-card club-card--training">
                  <p className={`${teko.className} club-card-kicker`}>Entrenamientos</p>
                  <h3 className={`${teko.className} club-card-title`}>{card.title}</h3>
                  <p>{card.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
