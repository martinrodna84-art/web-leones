"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { SessionBadge } from "@/components/session-badge";
import type { Member } from "@/lib/types";

type HomeHeaderProps = {
  member: Member | null;
};

const navGroups = [
  {
    label: "El Club",
    links: [
      { href: "#informacion", label: "Informacion" },
      { href: "#unete", label: "Unete al equipo" },
      { href: "#inscripcion", label: "Formulario inscripcion" },
      { href: "#federarse", label: "Federarse con nosotros" },
      { href: "#tablon", label: "Tablon" },
    ],
  },
  {
    label: "Retos",
    links: [
      { href: "/liga-felina", label: "Liga Felina" },
      { href: "#liga-felina", label: "Retos de temporada" },
      { href: "#liga-felina", label: "Desafio del club" },
    ],
  },
  {
    label: "Entrenamientos",
    links: [
      { href: "#planes", label: "Planes de entrenamiento" },
      { href: "#rutas", label: "Rutas" },
      { href: "#sesiones", label: "Sesiones del club" },
    ],
  },
];

export function HomeHeader({ member }: HomeHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  return (
    <header className="hero" id="inicio">
      <nav className="main-nav">
        <Link className="brand" href="/">
          <Image src="/assets/logos/logo_2026.png" alt="Logo de Los Leones del Trail" width={78} height={78} priority />
          <span>
            <strong>C.D. Los Leones del Trail</strong>
            <small>Montana, equipo y desafio</small>
          </span>
        </Link>

        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          onClick={() => setMenuOpen((current) => !current)}
        >
          Menu
        </button>

        <div className={`nav-panel ${menuOpen ? "is-open" : ""}`} id="site-menu">
          {navGroups.map((group) => {
            const isOpen = openGroup === group.label;
            return (
              <div key={group.label} className={`nav-item has-dropdown ${isOpen ? "open" : ""}`}>
                <button
                  className="nav-link nav-button"
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenGroup((current) => (current === group.label ? null : group.label))}
                >
                  {group.label} <span className="nav-caret">V</span>
                </button>
                <div className="dropdown">
                  {group.links.map((link) => (
                    <Link key={link.label} href={link.href} onClick={() => setMenuOpen(false)}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}

          <Link className="nav-link" href="#contacto">
            Contacto
          </Link>
          <SessionBadge
            member={member}
            href="/liga-felina/registro"
            guestSubtitle="Accede a tu zona de socio"
            memberSubtitle={member?.stravaConnected ? "Cuenta de la Liga Felina" : "Perfil del club"}
          />
        </div>
      </nav>
    </header>
  );
}
