"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useId, useRef, useState, useTransition } from "react";

import { requestJson } from "@/components/league/member-client-utils";
import { teko } from "@/lib/fonts";
import { resolvePhoto } from "@/lib/members";
import { isPathActive } from "@/lib/navigation";
import type { Member } from "@/lib/types";

type LeagueSessionMenuProps = {
  member: Member | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function GuestSessionIcon() {
  return (
    <svg
      className="league-session-guest-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="8.5"
        r="3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 17.5a5 5 0 0 1 10 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LeagueSessionMenu({ member, open, onOpenChange }: LeagueSessionMenuProps) {
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const [isPending, startRouteTransition] = useTransition();
  const [logoutNote, setLogoutNote] = useState("");

  const profileHref = member ? "/liga-felina/perfil" : "/liga-felina/acceso";

  if (!member) {
    return (
      <div className="league-session-shell">
        <Link
          className="league-session-guest-link"
          href="/liga-felina/acceso"
          aria-label="Ir a inicio de sesion"
        >
          <span className="league-session-guest-frame">
            <GuestSessionIcon />
          </span>
        </Link>
      </div>
    );
  }

  function closeMenu() {
    onOpenChange(false);
  }

  function openMenu() {
    onOpenChange(true);
  }

  function toggleMenu() {
    onOpenChange(!open);
  }

  function handleBlur(event: React.FocusEvent<HTMLDivElement>) {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && menuRef.current?.contains(nextTarget)) {
      return;
    }

    closeMenu();
  }

  async function handleLogout() {
    setLogoutNote("");
    closeMenu();

    try {
      await requestJson<{ ok: true }>("/api/app/auth/logout", {
        method: "POST",
      });

      startRouteTransition(() => {
        router.push("/liga-felina/acceso");
        router.refresh();
      });
    } catch (error) {
      setLogoutNote(error instanceof Error ? error.message : "No se pudo cerrar la sesion.");
    }
  }

  return (
    <div className="league-session-shell">
      <div
        ref={menuRef}
        className={`league-session-menu ${open ? "is-open" : ""}`}
        onMouseEnter={openMenu}
        onMouseLeave={closeMenu}
        onBlur={handleBlur}
      >
        <button
          className="league-session-trigger"
          type="button"
          aria-label={member ? "Abrir menu de perfil" : "Abrir menu de socio"}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-controls={menuId}
          onClick={toggleMenu}
          onFocus={openMenu}
        >
          <span className="header-session-avatar league-session-avatar">
            {member ? (
              <Image
                src={resolvePhoto(member)}
                alt="Foto de perfil"
                width={48}
                height={48}
                unoptimized
              />
            ) : (
              "L"
            )}
          </span>
        </button>

        <div className={`league-session-dropdown ${teko.className}`} id={menuId} role="menu">
          <Link
            className={`league-session-link ${pathname === "/liga-felina" ? "is-active" : ""}`}
            href="/liga-felina"
            aria-current={pathname === "/liga-felina" ? "page" : undefined}
            onClick={closeMenu}
          >
            Liga Felina
          </Link>
          <Link
            className={`league-session-link ${
              isPathActive(pathname, "/liga-felina/perfil") || isPathActive(pathname, "/liga-felina/acceso")
                ? "is-active"
                : ""
            }`}
            href={profileHref}
            aria-current={
              isPathActive(pathname, "/liga-felina/perfil") || isPathActive(pathname, "/liga-felina/acceso")
                ? "page"
                : undefined
            }
            onClick={closeMenu}
          >
            Mi Perfil
          </Link>
          {member ? (
            <button
              className="league-session-action"
              type="button"
              onClick={handleLogout}
              disabled={isPending}
            >
              Cerrar sesion
            </button>
          ) : null}
          {logoutNote ? <p className="league-session-note">{logoutNote}</p> : null}
        </div>
      </div>
    </div>
  );
}
