"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import {
  normalizeInternalHref,
  requestJson,
} from "@/components/league/member-client-utils";
import { getDisplayName } from "@/lib/members";
import type { SessionMember } from "@/lib/types";

export function MemberAccessExperience({ member }: { member: SessionMember | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startRouteTransition] = useTransition();
  const [loginNote, setLoginNote] = useState("");
  const [resetNote, setResetNote] = useState("");

  const returnTo = normalizeInternalHref(searchParams.get("next"), "/liga-felina/perfil");

  function goToReturnTo() {
    startRouteTransition(() => {
      router.push(returnTo);
      router.refresh();
    });
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginNote("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const sessionMember = await requestJson<SessionMember>("/api/app/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: String(formData.get("email") || ""),
          password: String(formData.get("password") || ""),
        }),
      });

      setLoginNote(`Bienvenido, ${getDisplayName(sessionMember)}. Redirigiendo...`);
      form.reset();
      goToReturnTo();
    } catch (error) {
      setLoginNote(error instanceof Error ? error.message : "No se pudo iniciar sesion.");
    }
  }

  async function handlePasswordReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResetNote("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      await requestJson<{ ok: true }>("/api/app/auth/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: String(formData.get("email") || ""),
          memberNumber: String(formData.get("memberNumber") || ""),
          newPassword: String(formData.get("newPassword") || ""),
        }),
      });

      setResetNote("Contrasena actualizada. Ya puedes iniciar sesion con la nueva.");
      form.reset();
    } catch (error) {
      setResetNote(error instanceof Error ? error.message : "No se pudo actualizar la contrasena.");
    }
  }

  return (
    <main className="league-main">
      <section className="auth-section" id="acceso">
        <div className="section-heading">
          <p className="eyebrow dark">Acceso socios</p>
          <h2>Inicia sesion o recupera tu contrasena</h2>
          <p>
            El acceso a la zona de socio vive ya en una pantalla separada para que
            registro, autenticacion y perfil tengan un flujo mucho mas limpio.
          </p>
          <p className="member-entry-note">
            Aun no tienes perfil?{" "}
            <Link className="inline-form-link" href="/liga-felina/registro">
              Registrate
            </Link>
          </p>
          {member ? (
            <p className="form-note">
              Ya has iniciado sesion como {getDisplayName(member)}. Si continuas, entraras en tu perfil.
            </p>
          ) : null}
        </div>

        <div className="auth-grid">
          <article className="auth-card">
            <div className="card-head">
              <h3>Iniciar sesion</h3>
              <span className="card-chip alt">Acceso socios</span>
            </div>

            <form className="member-form" onSubmit={handleLogin}>
              <label className="full-width">
                Email
                <input type="email" name="email" required placeholder="correo@ejemplo.com" />
              </label>
              <label className="full-width">
                Contrasena
                <input type="password" name="password" required placeholder="Tu contrasena" />
              </label>
              <button className="button button-secondary-dark full-width" type="submit" disabled={isPending}>
                Entrar
              </button>
              <p className="form-note full-width">{loginNote}</p>
            </form>
          </article>

          <article className="auth-card">
            <div className="card-head">
              <h3>Recuperar contrasena</h3>
              <span className="card-chip alt">Acceso</span>
            </div>

            <form className="member-form" onSubmit={handlePasswordReset}>
              <label className="full-width">
                Email de la cuenta
                <input type="email" name="email" required placeholder="correo@ejemplo.com" />
              </label>
              <label className="full-width">
                Numero de socio
                <input type="text" name="memberNumber" required pattern="L-[0-9]{3}" placeholder="L-001" />
              </label>
              <label className="full-width">
                Nueva contrasena
                <input type="password" name="newPassword" required minLength={6} placeholder="Nueva contrasena" />
              </label>
              <button className="button button-secondary-dark full-width" type="submit" disabled={isPending}>
                Actualizar contrasena
              </button>
              <p className="form-note full-width">{resetNote}</p>
            </form>
          </article>
        </div>
      </section>
    </main>
  );
}
