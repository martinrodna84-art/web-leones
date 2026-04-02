import Image from "next/image";
import Link from "next/link";

import { SessionBadge } from "@/components/session-badge";
import type { Member } from "@/lib/types";

type LeagueHeaderProps = {
  member: Member | null;
  subtitle: string;
  title: string;
  lead: string;
  compact?: boolean;
};

export function LeagueHeader({ member, subtitle, title, lead, compact = false }: LeagueHeaderProps) {
  return (
    <header className={`league-hero ${compact ? "compact-hero" : ""}`}>
      <div className="hero-topbar">
        <Link className="hero-brand" href="/">
          <Image src="/assets/logos/logo_2026.png" alt="Logo de Los Leones del Trail" width={72} height={72} priority />
          <span>
            <strong>LOS LEONES DEL TRAIL</strong>
            <small>{subtitle}</small>
          </span>
        </Link>
        <nav className="hero-links">
          <Link href="/">Volver al club</Link>
          <Link href="/bases">Bases</Link>
          <Link href="/liga-felina">Liga Felina</Link>
          <Link className="hero-cta" href="/liga-felina/registro">
            Registrarse
          </Link>
        </nav>
        <SessionBadge
          member={member}
          href="/liga-felina/registro"
          guestSubtitle="Accede para gestionar tu perfil"
          memberSubtitle={member?.stravaConnected ? "Strava conectado" : "Perfil del club"}
        />
      </div>

      <section className={`league-hero-layout ${compact ? "compact-layout" : ""}`}>
        <div className="hero-copy">
          <p className="eyebrow">{subtitle}</p>
          <h1>{title}</h1>
          <p className="lead">{lead}</p>
        </div>
        {!compact ? (
          <aside className="hero-sidecard">
            <p className="card-kicker">Liga 2026</p>
            <h2>Ranking vivo del club</h2>
            <ul>
              <li>Clasificacion general por puntos totales</li>
              <li>DevoraKm para el volumen anual</li>
              <li>Devora+ para el desnivel positivo</li>
              <li>Carreras validadas con flujo listo para Strava</li>
            </ul>
          </aside>
        ) : null}
      </section>
    </header>
  );
}
