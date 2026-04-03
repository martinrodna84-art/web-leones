"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { fileToDataUrl, requestJson } from "@/components/league/member-client-utils";
import type { SessionMember } from "@/lib/types";

const CLUB_SIGNUP_HREF = "/#inscripcion";

export function RegisterSignupExperience() {
  const router = useRouter();
  const [isPending, startRouteTransition] = useTransition();
  const [registerNote, setRegisterNote] = useState("");

  function goToProfile() {
    startRouteTransition(() => {
      router.push("/liga-felina/perfil");
      router.refresh();
    });
  }

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRegisterNote("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("photo");

    try {
      await requestJson<SessionMember>("/api/app/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: String(formData.get("firstName") || ""),
          lastName: String(formData.get("lastName") || ""),
          email: String(formData.get("email") || ""),
          password: String(formData.get("password") || ""),
          memberNumber: String(formData.get("memberNumber") || ""),
          gender: String(formData.get("gender") || "men"),
          city: String(formData.get("city") || ""),
          uploadPhoto: await fileToDataUrl(file instanceof File && file.size > 0 ? file : null),
        }),
      });

      setRegisterNote("Perfil creado correctamente. Redirigiendo a tu area de socio...");
      form.reset();
      goToProfile();
    } catch (error) {
      setRegisterNote(error instanceof Error ? error.message : "No se pudo crear el perfil.");
    }
  }

  return (
    <main className="league-main">
      <section className="auth-section" id="registro">
        <div className="section-heading">
          <p className="eyebrow dark">Socios</p>
          <h2>Registro de nuevos miembros</h2>
          <p>
            Crea tu perfil de socio con Supabase Auth y completa tus datos basicos.
            La gestion de acceso, perfil y Strava vive ahora en pasos separados para
            hacer el flujo mucho mas claro.
          </p>
        </div>

        <div className="auth-grid auth-grid-single">
          <article className="auth-card">
            <div className="card-head card-head-stack">
              <div>
                <h3>Registro de socio</h3>
                <span className="card-chip">Nuevo perfil</span>
              </div>
              <p className="member-entry-note">
                Ya eres miembro?{" "}
                <Link className="inline-form-link" href="/liga-felina/acceso">
                  Iniciar sesion
                </Link>
              </p>
            </div>

            <form className="member-form" onSubmit={handleRegister}>
              <label>
                Nombre
                <input type="text" name="firstName" required placeholder="Nombre" />
              </label>
              <label>
                Apellidos
                <input type="text" name="lastName" required placeholder="Apellidos" />
              </label>
              <label>
                Email
                <input type="email" name="email" required placeholder="correo@ejemplo.com" />
              </label>
              <label>
                Contrasena
                <input type="password" name="password" required minLength={6} placeholder="Minimo 6 caracteres" />
              </label>
              <label>
                <span className="field-heading">
                  <span>Numero de socio</span>
                  <span className="field-link-copy">
                    Aun no eres socio?{" "}
                    <Link className="inline-form-link" href={CLUB_SIGNUP_HREF}>
                      Pincha aqui
                    </Link>
                  </span>
                </span>
                <input type="text" name="memberNumber" required pattern="L-[0-9]{3}" placeholder="L-001" />
              </label>
              <label>
                Sexo para la clasificacion
                <select name="gender" defaultValue="men">
                  <option value="men">Hombre</option>
                  <option value="women">Mujer</option>
                </select>
              </label>
              <label>
                Ciudad
                <input type="text" name="city" placeholder="Tu ciudad" />
              </label>
              <label className="full-width">
                Foto del socio
                <input type="file" name="photo" accept="image/*" />
              </label>

              <button className="button button-primary full-width" type="submit" disabled={isPending}>
                Crear cuenta de socio
              </button>
              <p className="form-note full-width">{registerNote}</p>
            </form>
          </article>
        </div>
      </section>
    </main>
  );
}
