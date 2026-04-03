"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { LeagueSessionMenu } from "@/components/league-session-menu";
import { teko } from "@/lib/fonts";
import { isHrefActive } from "@/lib/navigation";
import type { Member } from "@/lib/types";

type LeagueHeaderProps = {
  member: Member | null;
  subtitle: string;
  title: string;
  lead: string;
  compact?: boolean;
  hideSidecard?: boolean;
  landingAligned?: boolean;
  titleLines?: string[];
};

export function LeagueHeader({
  member,
  subtitle,
  title,
  lead,
  compact = false,
  hideSidecard = false,
  landingAligned = false,
  titleLines,
}: LeagueHeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sessionMenuOpen, setSessionMenuOpen] = useState(false);

  function closeNavigation() {
    setMenuOpen(false);
    setSessionMenuOpen(false);
  }

  return (
    <header className={`league-hero ${compact ? "compact-hero" : ""}`}>
      <nav className={`main-nav league-main-nav ${teko.className}`}>
        <Link className="brand" href="/">
          <Image
            src="/assets/logos/logo_header_clean.png"
            alt="Logo de Los Leones del Trail"
            width={340}
            height={51}
            className="brand-logo"
            priority
            unoptimized
          />
        </Link>

        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="league-menu"
          onClick={() => {
            setMenuOpen((current) => !current);
            setSessionMenuOpen(false);
          }}
        >
          Menu
        </button>

        <div className={`nav-panel ${menuOpen ? "is-open" : ""}`} id="league-menu">
          <Link
            className={`nav-link ${isHrefActive(pathname, "", "/") ? "is-active" : ""}`}
            href="/"
            aria-current={isHrefActive(pathname, "", "/") ? "page" : undefined}
            onClick={closeNavigation}
          >
            Volver al club
          </Link>
          <Link
            className={`nav-link ${isHrefActive(pathname, "", "/bases") ? "is-active" : ""}`}
            href="/bases"
            aria-current={isHrefActive(pathname, "", "/bases") ? "page" : undefined}
            onClick={closeNavigation}
          >
            Bases
          </Link>
          <Link
            className={`nav-link ${isHrefActive(pathname, "", "/liga-felina") ? "is-active" : ""}`}
            href="/liga-felina"
            aria-current={isHrefActive(pathname, "", "/liga-felina") ? "page" : undefined}
            onClick={closeNavigation}
          >
            Liga Felina
          </Link>
          <Link
            className={`nav-link ${isHrefActive(pathname, "", "/contacto") ? "is-active" : ""}`}
            href="/contacto"
            aria-current={isHrefActive(pathname, "", "/contacto") ? "page" : undefined}
            onClick={closeNavigation}
          >
            Contacto
          </Link>
        </div>

        <LeagueSessionMenu
          member={member}
          open={sessionMenuOpen}
          onOpenChange={(nextOpen) => {
            setSessionMenuOpen(nextOpen);
            if (nextOpen) {
              setMenuOpen(false);
            }
          }}
        />
      </nav>

      <section
        className={`league-hero-layout ${compact ? "compact-layout" : ""} ${
          landingAligned ? "league-hero-layout--landing" : ""
        }`}
      >
        <div className={`hero-copy league-hero-copy ${landingAligned ? "league-hero-copy--landing" : ""}`}>
          <p className="eyebrow league-hero-eyebrow">{subtitle}</p>
          <h1 className={`league-hero-title ${titleLines?.length ? "league-hero-title--stacked" : ""}`}>
            {titleLines?.length
              ? titleLines.map((line) => <span key={line}>{line}</span>)
              : title}
          </h1>
          <span className="hero-divider league-hero-divider" aria-hidden="true" />
          <p className="lead league-hero-lead">{lead}</p>
        </div>
        {!compact && !hideSidecard ? (
          <aside className="hero-sidecard">
            <p className="card-kicker">Liga 2026</p>
            <h2>Ranking vivo del club</h2>
            <ul>
              <li>Clasificacion general por puntos totales</li>
              <li>DevoraKm para el volumen anual</li>
              <li>Devora+ para el desnivel positivo</li>
              <li>DevoraCarreras con flujo de validacion listo para Strava</li>
            </ul>
          </aside>
        ) : null}
      </section>
    </header>
  );
}
