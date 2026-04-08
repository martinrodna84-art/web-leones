import Link from "next/link";

import { HomeHeader } from "@/components/home-header";
import { SiteFooter } from "@/components/site-footer";
import { SocialBar } from "@/components/social-bar";
import { teko } from "@/lib/fonts";
import type { Member } from "@/lib/types";

type HomePageProps = {
  member: Member | null;
};

const benefits = [
  {
    title: "Comunidad activa y apasionada",
    body:
      "Unete a un equipo donde el companerismo y la pasion por el deporte nos impulsan a entrenar y competir juntos, sin importar el nivel.",
    icon: "heart",
  },
  {
    title: "Entrenamientos para todos los niveles",
    body:
      "Trail, asfalto o ultrafondo: ofrecemos sesiones presenciales y planes generales disenados para ayudarte a alcanzar tus metas.",
    icon: "team",
  },
  {
    title: "Beneficios exclusivos para miembros",
    body:
      "Disfruta de descuentos en material, inscripciones, federaciones y acceso a una comunidad que comparte tu pasion por correr.",
    icon: "benefits",
  },
] as const;

const captureOneImages = {
  primary:
    "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1600&q=80",
  secondary:
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
  accent:
    "https://images.unsplash.com/photo-1486218119243-13883505764c?auto=format&fit=crop&w=900&q=80",
} as const;

function BenefitIcon({ kind }: { kind: (typeof benefits)[number]["icon"] }) {
  if (kind === "heart") {
    return (
      <svg className="landing-benefit-icon" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M21 35.4 18.4 33.1C10.2 25.8 5 21 5 14.7 5 10 8.6 6.4 13.3 6.4c3 0 5.8 1.4 7.7 3.8 1.9-2.4 4.7-3.8 7.7-3.8 4.7 0 8.3 3.6 8.3 8.3 0 6.3-5.2 11.1-13.4 18.4L21 35.4Z" stroke="currentColor" strokeWidth="2.6" strokeLinecap="square" strokeLinejoin="miter" />
        <path d="M8.2 17.7H14l2.1-4.4 4.2 9 2.3-4.6h7.3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter" />
      </svg>
    );
  }

  if (kind === "team") {
    return (
      <svg className="landing-benefit-icon" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="14" cy="12" r="5.5" stroke="currentColor" strokeWidth="2.4" />
        <circle cx="28" cy="12" r="5.5" stroke="currentColor" strokeWidth="2.4" />
        <path d="M6.8 31.4c0-4.8 3.9-8.7 8.7-8.7h0c4.8 0 8.7 3.9 8.7 8.7V36H6.8v-4.6Z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="miter" />
        <path d="M17.8 36v-4.6c0-4.8 3.9-8.7 8.7-8.7h0c4.8 0 8.7 3.9 8.7 8.7V36" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="miter" />
      </svg>
    );
  }

  return (
    <svg className="landing-benefit-icon" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M7.5 14.5 24.6 7l9.9 9.9-7.5 17.1-8.2 2.6-11.3-11.3 0-11.8Z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="miter" />
      <path d="M20.9 12.2 29.8 21" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" />
      <circle cx="12.7" cy="14.2" r="2.2" fill="currentColor" />
    </svg>
  );
}

export function HomePage({ member }: HomePageProps) {
  return (
    <>
      <SocialBar />
      <HomeHeader member={member}>
        <section className="hero-layout">
          <div className="hero-copy">
            <p className={`${teko.className} hero-kicker`}>Ruge con la manada y</p>
            <h1 className={`${teko.className} hero-headline`}>
              {"HAZ\u00A0DE\u00A0LA"}
              <br />
              {"MONTA\u00D1A\u00A0TU"}
              <br />
              TERRITORIO.
            </h1>
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

      <main className="landing-main landing-main--streamlined">
        <section className="landing-capture landing-capture--intro">
          <div className="landing-capture-shell">
            <div className="landing-capture-collage" aria-hidden="true">
              <div className="landing-capture-backplate" />
              <span className={`${teko.className} landing-capture-watermark`}>TRAIL TEAM</span>
              <div className="landing-capture-stack-label">
                <span className={`${teko.className} landing-capture-stack-primary`}>LEONES</span>
                <span className={`${teko.className} landing-capture-stack-outline`}>TRAIL</span>
                <span className={`${teko.className} landing-capture-stack-shadow`}>CLUB</span>
              </div>

              <div
                className="landing-capture-photo landing-capture-photo--accent"
                style={{ backgroundImage: `url("${captureOneImages.accent}")` }}
              />

              <div
                className="landing-capture-photo landing-capture-photo--primary"
                style={{ backgroundImage: `url("${captureOneImages.primary}")` }}
              />

              <div
                className="landing-capture-photo landing-capture-photo--secondary"
                style={{ backgroundImage: `url("${captureOneImages.secondary}")` }}
              />
            </div>

            <div className="landing-capture-copy">
              <p className={`${teko.className} landing-capture-kicker`}>
                Bienvenido a Los Leones del Trail
              </p>
              <h1 className={`${teko.className} landing-capture-title`}>
                LOS LEONES
                <br />
                DEL TRAIL
                <span>Desde 2015</span>
              </h1>
              <span className="landing-capture-divider" aria-hidden="true" />
              <p className="landing-capture-quote">
                {"El exito no se logra solo con cualidades especiales. Es sobre todo un trabajo de constancia, metodo y organizacion"}
              </p>
            </div>
          </div>
        </section>

        <section className="landing-benefits-strip">
          <div className="landing-benefits-shell">
            {benefits.map((benefit) => (
              <article key={benefit.title} className="landing-benefit-card">
                <div className="landing-benefit-head">
                  <BenefitIcon kind={benefit.icon} />
                  <h2 className={`${teko.className} landing-benefit-title`}>{benefit.title}</h2>
                </div>
                <p>{benefit.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-video-section">
          <div className="landing-video-media" aria-hidden="true">
            <video
              className="landing-video-player"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            >
              <source src="/assets/video/landing-cta.webm" type="video/webm" />
            </video>
          </div>
          <div className="landing-video-overlay" />
          <div className="landing-video-shell">
            <div className="landing-video-copy">
              <p className={`${teko.className} landing-video-kicker`}>
                {"Supera tus l\u00EDmites con"}
              </p>
              <h2 className={`${teko.className} landing-video-title`}>
                Los Leones del Trail
              </h2>
              <span className="landing-video-divider" aria-hidden="true" />
              <p className="landing-video-support">
                {"\u00BFQuieres formar parte del equipo mas din\u00E1mico y unido? \u00A1Sigue los pasos y \u00FAnete hoy mismo!"}
              </p>
              <Link className={`${teko.className} landing-video-cta`} href="/liga-felina/registro">
                {"\u00A1UNETE AHORA!"}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
