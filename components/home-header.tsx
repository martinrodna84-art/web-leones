"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { LeagueSessionMenu } from "@/components/league-session-menu";
import { teko } from "@/lib/fonts";
import { isHrefActive, readWindowHash } from "@/lib/navigation";
import type { Member } from "@/lib/types";

type HomeHeaderProps = {
  member: Member | null;
  children?: React.ReactNode;
};

function ChevronDownIcon() {
  return (
    <svg
      className="nav-chevron"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3.25 5.75L8 10.25L12.75 5.75"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

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

export function HomeHeader({ member, children }: HomeHeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [sessionMenuOpen, setSessionMenuOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState("");

  useEffect(() => {
    function syncHash() {
      setCurrentHash(readWindowHash());
    }

    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  function closeNavigation() {
    setMenuOpen(false);
    setOpenGroup(null);
    setSessionMenuOpen(false);
  }

  function handleSessionMenuChange(nextOpen: boolean) {
    setSessionMenuOpen(nextOpen);

    if (nextOpen) {
      setOpenGroup(null);
      setMenuOpen(false);
    }
  }

  function handleGroupOpen(groupLabel: string) {
    setOpenGroup(groupLabel);
    setSessionMenuOpen(false);
  }

  function handleGroupLeave(groupLabel: string) {
    setOpenGroup((current) => (current === groupLabel ? null : current));
  }

  return (
    <header className="hero" id="inicio">
      <nav className={`main-nav ${teko.className}`}>
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
          aria-controls="site-menu"
          onClick={() => {
            setMenuOpen((current) => !current);
            setSessionMenuOpen(false);
            setOpenGroup(null);
          }}
        >
          Menu
        </button>

        <div className={`nav-panel ${menuOpen ? "is-open" : ""}`} id="site-menu">
          {navGroups.map((group) => {
            const isOpen = openGroup === group.label;
            const isGroupActive = group.links.some((link) =>
              isHrefActive(pathname, currentHash, link.href),
            );
            return (
              <div
                key={group.label}
                className={`nav-item has-dropdown ${isOpen ? "open" : ""}`}
                onMouseEnter={() => handleGroupOpen(group.label)}
                onMouseLeave={() => handleGroupLeave(group.label)}
              >
                <button
                  className={`nav-link nav-button nav-link--dropdown ${isGroupActive ? "is-active" : ""}`}
                  type="button"
                  aria-expanded={isOpen}
                  onFocus={() => handleGroupOpen(group.label)}
                  onClick={() =>
                    setOpenGroup((current) => {
                      const nextOpen = current === group.label ? null : group.label;
                      setSessionMenuOpen(false);
                      return nextOpen;
                    })
                  }
                >
                  <span className="nav-link-label">{group.label}</span>
                  <ChevronDownIcon />
                </button>
                <div className="dropdown">
                  {group.links.map((link) => (
                    <Link
                      key={link.label}
                      className={isHrefActive(pathname, currentHash, link.href) ? "is-active" : ""}
                      href={link.href}
                      aria-current={isHrefActive(pathname, currentHash, link.href) ? "location" : undefined}
                      onClick={closeNavigation}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}

          <Link
            className={`nav-link ${isHrefActive(pathname, currentHash, "/contacto") ? "is-active" : ""}`}
            href="/contacto"
            aria-current={isHrefActive(pathname, currentHash, "/contacto") ? "page" : undefined}
            onClick={closeNavigation}
          >
            Contacto
          </Link>
        </div>
        <LeagueSessionMenu
          member={member}
          open={sessionMenuOpen}
          onOpenChange={handleSessionMenuChange}
        />
      </nav>

      {children}
    </header>
  );
}
