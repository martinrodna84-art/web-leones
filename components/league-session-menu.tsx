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
      viewBox="0 0 512 512"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M406.5 399.6C387.4 352.9 341.5 320 288 320l-64 0c-53.5 0-99.4 32.9-118.5 79.6-35.6-37.3-57.5-87.9-57.5-143.6 0-114.9 93.1-208 208-208s208 93.1 208 208c0 55.7-21.9 106.2-57.5 143.6zm-40.1 32.7C334.4 452.4 296.6 464 256 464s-78.4-11.6-110.5-31.7c7.3-36.7 39.7-64.3 78.5-64.3l64 0c38.8 0 71.2 27.6 78.5 64.3zM256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zm0-272a40 40 0 1 1 0-80 40 40 0 1 1 0 80zm-88-40a88 88 0 1 0 176 0 88 88 0 1 0 -176 0z"
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
