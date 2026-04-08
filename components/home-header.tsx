"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { LeagueSessionMenu, MobileSessionActions } from "@/components/league-session-menu";
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

function BurgerMenuIcon() {
  return (
    <svg
      className="menu-toggle-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
      <path d="M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
      <path d="M4 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </svg>
  );
}

const navGroups = [
  {
    label: "El Club",
    links: [
      { href: "/club#informacion", label: "Informacion" },
      { href: "/club#unete", label: "Unete al equipo" },
      { href: "/club#inscripcion", label: "Formulario inscripcion" },
      { href: "/club#federarse", label: "Federarse con nosotros" },
      { href: "/club#tablon", label: "Tablon" },
    ],
  },
  {
    label: "Retos",
    links: [
      { href: "/liga-felina", label: "Liga Felina" },
      { href: "/liga-felina", label: "Retos de temporada" },
      { href: "/liga-felina", label: "Desafio del club" },
    ],
  },
  {
    label: "Entrenamientos",
    links: [
      { href: "/club#planes", label: "Planes de entrenamiento" },
      { href: "/club#rutas", label: "Rutas" },
      { href: "/club#sesiones", label: "Sesiones del club" },
    ],
  },
];

export function HomeHeader({ member, children }: HomeHeaderProps) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement | null>(null);
  const mobileMenuMotionTimeoutRef = useRef<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuMotionEnabled, setMobileMenuMotionEnabled] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [sessionMenuOpen, setSessionMenuOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState("");
  const [heroMediaTop, setHeroMediaTop] = useState(80);
  const hasHero = children != null;

  useEffect(() => {
    function syncHash() {
      setCurrentHash(readWindowHash());
    }

    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  useEffect(() => {
    if (!hasHero) {
      return;
    }

    const nav = navRef.current;

    if (!nav) {
      return;
    }

    const navElement = nav;
    let frameId = 0;

    function syncNavHeight() {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const nextHeight = Math.round(navElement.getBoundingClientRect().height);
        setHeroMediaTop((current) => (current === nextHeight ? current : nextHeight));
      });
    }

    syncNavHeight();

    const resizeObserver =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(syncNavHeight);

    resizeObserver?.observe(navElement);
    window.addEventListener("resize", syncNavHeight);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", syncNavHeight);
    };
  }, [hasHero]);

  useEffect(() => {
    return () => {
      if (mobileMenuMotionTimeoutRef.current !== null) {
        window.clearTimeout(mobileMenuMotionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 820px)");

    function syncNavigationForViewportChange() {
      if (mobileMenuMotionTimeoutRef.current !== null) {
        window.clearTimeout(mobileMenuMotionTimeoutRef.current);
        mobileMenuMotionTimeoutRef.current = null;
      }
      setMenuOpen(false);
      setMobileMenuMotionEnabled(false);
      setOpenGroup(null);
    }

    syncNavigationForViewportChange();
    mediaQuery.addEventListener("change", syncNavigationForViewportChange);

    return () => mediaQuery.removeEventListener("change", syncNavigationForViewportChange);
  }, []);

  function triggerMobileMenuMotion() {
    if (mobileMenuMotionTimeoutRef.current !== null) {
      window.clearTimeout(mobileMenuMotionTimeoutRef.current);
    }

    setMobileMenuMotionEnabled(true);
    mobileMenuMotionTimeoutRef.current = window.setTimeout(() => {
      setMobileMenuMotionEnabled(false);
      mobileMenuMotionTimeoutRef.current = null;
    }, 260);
  }

  function closeNavigation() {
    triggerMobileMenuMotion();
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
    <header
      className={hasHero ? "hero" : "home-header-shell"}
      id="inicio"
      style={hasHero ? { background: "none" } : undefined}
    >
      {hasHero ? (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: `${heroMediaTop}px`,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: 0,
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          <Image
            src="/assets/hero/hero-landing.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            style={{
              objectFit: "cover",
              objectPosition: "50% 0%",
            }}
          />
        </div>
      ) : null}
      <nav ref={navRef} className={`main-nav ${teko.className}`}>
        <Link className="brand" href="/">
          <Image
            src="/assets/logos/logo-main-header.svg"
            alt="Logo de Los Leones del Trail"
            width={78}
            height={48}
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
          aria-label="Abrir menu"
          onClick={() => {
            triggerMobileMenuMotion();
            setMenuOpen((current) => !current);
            setSessionMenuOpen(false);
            setOpenGroup(null);
          }}
        >
          <BurgerMenuIcon />
          <span className="sr-only">Menu</span>
        </button>

        <div
          className={`nav-panel ${menuOpen ? "is-open" : ""} ${mobileMenuMotionEnabled ? "nav-panel--animated" : ""}`.trim()}
          id="site-menu"
        >
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

          <MobileSessionActions member={member} onNavigate={closeNavigation} />
        </div>
        <button
          className={`nav-backdrop ${menuOpen ? "is-open" : ""} ${mobileMenuMotionEnabled ? "nav-backdrop--animated" : ""}`.trim()}
          type="button"
          aria-label="Cerrar menu"
          tabIndex={menuOpen ? 0 : -1}
          onClick={closeNavigation}
        />
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
