import Link from "next/link";

import { HomeHeader } from "@/components/home-header";
import { SiteFooter } from "@/components/site-footer";
import { SocialBar } from "@/components/social-bar";
import {
  clubCards,
  quickCards,
  spotlightCards,
  trainingCards,
} from "@/lib/site-content";
import type { Member } from "@/lib/types";

type HomePageProps = {
  member: Member | null;
};

export function HomePage({ member }: HomePageProps) {
  return (
    <>
      <SocialBar />
      <HomeHeader member={member} />

      <section className="hero-layout">
        <div className="hero-copy">
          <p className="eyebrow">Los Leones del Trail</p>
          <h1>Haz de la montana tu territorio.</h1>
          <p className="lead">
            Club Deportivo Los Leones del Trail reune a corredores y corredoras que
            quieren entrenar, compartir rutas, afrontar retos y crecer en comunidad
            desde el respeto por la montana y la pasion por el trail running.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/liga-felina/registro">
              Empieza a rugir
            </Link>
            <Link className="button button-secondary" href="/liga-felina">
              Descubrir Liga Felina
            </Link>
          </div>
        </div>

        <aside className="hero-panel">
          <p className="panel-kicker">Temporada 2026</p>
          <h2>Reto felino en marcha</h2>
          <ul>
            <li>Liga interna con objetivos por niveles</li>
            <li>Entrenamientos compartidos y rutas guiadas</li>
            <li>Espacio para federarte y crecer dentro del club</li>
          </ul>
          <Link className="text-link" href="/liga-felina">
            Entrar en Liga Felina
          </Link>
        </aside>
      </section>

      <main>
        <section className="quick-access">
          {quickCards.map((card) => (
            <article key={card.title} className={`quick-card ${card.accent ? "accent" : ""}`}>
              <span>{card.eyebrow}</span>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
              <Link href={card.href}>{card.accent ? "Explorar retos" : "Entrar"}</Link>
            </article>
          ))}
        </section>

        <section className="section intro-grid" id="informacion">
          <div className="section-heading">
            <p className="eyebrow dark">El Club</p>
            <h2>Un club pensado para correr, compartir y crecer.</h2>
            <p>
              Esta nueva home en Next recoge la estructura principal del club para que
              cualquier persona encuentre rapido como unirse, entrenar, federarse o seguir
              la actividad del equipo.
            </p>
          </div>

          <div className="info-grid">
            {clubCards.map((card) => (
              <article key={card.id} className="info-card" id={card.id}>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section spotlight" id="liga-felina">
          <div className="spotlight-copy">
            <p className="eyebrow">Retos</p>
            <h2>Liga Felina, retos de temporada y espiritu competitivo sano.</h2>
            <p>
              La nueva app separa la parte publica del club de la experiencia de socios
              para que la competicion, el ranking y la validacion de carreras tengan una base mas mantenible.
            </p>
            <p>
              <Link className="inline-link" href="/liga-felina">
                Abrir pagina completa de Liga Felina
              </Link>
            </p>
          </div>

          <div className="spotlight-cards">
            {spotlightCards.map((card) => (
              <article key={card.title} className="spotlight-card">
                <span className="tag">{card.tag}</span>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section training-section" id="planes">
          <div className="section-heading">
            <p className="eyebrow dark">Entrenamientos</p>
            <h2>Una zona lista para publicar planes, rutas y sesiones.</h2>
          </div>

          <div className="training-grid">
            {trainingCards.map((card) => (
              <article key={card.id} className="training-card" id={card.id}>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section contact-section" id="contacto">
          <div className="contact-copy">
            <p className="eyebrow dark">Contacto</p>
            <h2>Escribenos y da el primer paso con Los Leones del Trail.</h2>
            <p>
              Esta portada ya queda integrada en App Router y lista para conectar
              un formulario real cuando definamos el backend definitivo del club.
            </p>
          </div>

          <form className="contact-form">
            <label>
              Nombre
              <input type="text" placeholder="Tu nombre" />
            </label>
            <label>
              Correo electronico
              <input type="email" placeholder="tu@email.com" />
            </label>
            <label>
              Motivo
              <select defaultValue="Quiero unirme al club">
                <option>Quiero unirme al club</option>
                <option>Quiero mas informacion</option>
                <option>Quiero federarme</option>
                <option>Colaboracion o patrocinio</option>
              </select>
            </label>
            <label>
              Mensaje
              <textarea rows={5} placeholder="Cuentanos que te interesa y te responderemos lo antes posible" />
            </label>
            <Link className="button button-primary button-as-link" href="/liga-felina/registro">
              Ir al area de socios
            </Link>
            <p className="form-note">
              El formulario publico queda preparado para conectarlo despues a la solucion definitiva.
            </p>
          </form>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
