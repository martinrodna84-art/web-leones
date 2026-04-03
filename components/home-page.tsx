import Link from "next/link";

import { HomeHeader } from "@/components/home-header";
import { SiteFooter } from "@/components/site-footer";
import { SocialBar } from "@/components/social-bar";
import {
  landingSponsorCards,
  landingStorySections,
} from "@/lib/site-content";
import { teko } from "@/lib/fonts";
import type { Member } from "@/lib/types";

type HomePageProps = {
  member: Member | null;
};

type LandingIconName =
  | (typeof landingStorySections)[number]["icon"]
  | (typeof landingSponsorCards)[number]["icon"];

function LucideLikeIcon({ name, className }: { name: LandingIconName; className?: string }) {
  switch (name) {
    case "mountain":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="m8 3 4 6 5-4 4 16H3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m13 11 4 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "shield":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "trophy":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M8 4h8v3a4 4 0 0 1-8 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 5H4a2 2 0 0 0 2 4h1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18 5h2a2 2 0 0 1-2 4h-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 11v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 21h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 15h4v3h-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "route":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="6" cy="19" r="2" stroke="currentColor" strokeWidth="2" />
          <path d="M20 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" stroke="currentColor" strokeWidth="2" />
          <path d="M8 19h3a2 2 0 0 0 2-2v-1a2 2 0 0 1 2-2h1a2 2 0 0 0 2-2V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "spark":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="m12 3 1.9 4.6L18.5 9l-4.6 1.9L12 15.5l-1.9-4.6L5.5 9l4.6-1.4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M19 14v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M22 17h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "flag":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M4 21V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="m4 5 5-2 6 4 5-2v10l-5 2-6-4-5 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "heart":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="m12 20-1.4-1.2C5.4 14.2 2 11.1 2 7.3 2 4.5 4.2 2.3 7 2.3c1.8 0 3.5.9 4.5 2.4 1-1.5 2.7-2.4 4.5-2.4 2.8 0 5 2.2 5 5 0 3.8-3.4 6.9-8.6 11.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "handshake":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M10 11 8 13a2.8 2.8 0 1 1-4-4l3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m14 13 2 2a2.8 2.8 0 0 0 4-4l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m7 8 3.4-2.1a3 3 0 0 1 3.2 0L17 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m9.5 11.5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }

  return null;
}

export function HomePage({ member }: HomePageProps) {
  return (
    <>
      <SocialBar />
      <HomeHeader member={member}>
        <section className="hero-layout">
          <div className="hero-copy">
            <p className={`${teko.className} hero-kicker`}>Ruge con la manada y</p>
            <h1 className="sr-only">
              <span>HAZ DE LA</span>
              <span>MONTAÑA TU</span>
              <span>TERRITORIO.</span>
            </h1>
            <p className={`${teko.className} hero-headline`} aria-hidden="true">
              <span>HAZ DE LA</span>
              <span>{"MONTA\u00D1A TU"}</span>
              <span>TERRITORIO.</span>
            </p>
            <span className="hero-divider" aria-hidden="true" />
            <p className="hero-support">
              {"En C.D. Los Leones del Trail reunimos a corredores y corredoras que quieren entrenar, compartir rutas, afrontar retos y crecer en comunidad desde el respeto por la monta\u00F1a y la pasion por el trail running."}
            </p>
            <div className="hero-actions">
              <Link className={`${teko.className} button button-primary hero-primary-cta`} href="/liga-felina/registro">
                Empieza a rugir
              </Link>
            </div>
          </div>
        </section>
      </HomeHeader>

      <main className="landing-main">
        <div className="landing-story-stack">
          {landingStorySections.map((section, index) => (
            <section
              key={section.title}
              className={`landing-z-section ${index % 2 === 1 ? "is-reversed" : ""}`}
            >
              {section.anchorIds.map((anchorId) => (
                <span key={anchorId} id={anchorId} className="landing-anchor" aria-hidden="true" />
              ))}

              <div
                className="landing-z-media"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(9, 12, 10, 0.12), rgba(9, 12, 10, 0.5)), url("${section.image}")`,
                  backgroundPosition: section.imagePosition,
                }}
                aria-hidden="true"
              >
                <div className="landing-z-media-badge">
                  <LucideLikeIcon name={section.icon} className="landing-lucide-icon" />
                </div>
              </div>

              <div className="landing-z-copy">
                <p className={`${teko.className} eyebrow landing-eyebrow`}>{section.eyebrow}</p>
                <h2>{section.title}</h2>
                <p className="landing-z-body">{section.body}</p>
                <ul className="landing-z-list">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>
                      <LucideLikeIcon name={section.icon} className="landing-list-icon" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                <Link className="landing-z-link" href={section.href}>
                  {section.hrefLabel}
                </Link>
              </div>
            </section>
          ))}
        </div>

        <section className="landing-sponsors">
          <div className="landing-sponsors-head">
            <p className={`${teko.className} eyebrow landing-eyebrow`}>Patrocinadores</p>
            <h2>Una parrilla afilada para las marcas que quieran rugir con la manada.</h2>
            <p>
              Hemos dejado una seccion propia, con cards cuadradas y un lenguaje visual
              coherente con la identidad del header y del hero.
            </p>
          </div>

          <div className="landing-sponsor-grid">
            {landingSponsorCards.map((sponsor) => (
              <article key={sponsor.name} className="landing-sponsor-card">
                <div className="landing-sponsor-icon">
                  <LucideLikeIcon name={sponsor.icon} className="landing-lucide-icon" />
                </div>
                <span className={`${teko.className} landing-sponsor-role`}>{sponsor.role}</span>
                <h3>{sponsor.name}</h3>
                <p>{sponsor.body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
