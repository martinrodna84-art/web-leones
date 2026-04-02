"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { getDisplayName, resolvePhoto } from "@/lib/members";
import { MOCK_STRAVA_PROFILE } from "@/lib/mock-data";
import type { LeagueSnapshot, Member, StravaProfile } from "@/lib/types";

async function requestJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const payload = (await response.json()) as { data?: T; error?: string };

  if (!response.ok) {
    throw new Error(payload.error || "La operacion no se pudo completar.");
  }

  if (payload.data === undefined) {
    throw new Error("La respuesta del servidor no es valida.");
  }

  return payload.data;
}

async function fileToDataUrl(file: File | null): Promise<string | undefined> {
  if (!file) {
    return undefined;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("No hemos podido leer la imagen seleccionada."));
    reader.readAsDataURL(file);
  });
}

function SessionCard({ member }: { member: Member | null }) {
  if (!member) {
    return (
      <div className="session-user">
        <div className="session-avatar">L</div>
        <div>
          <strong>No has iniciado sesion</strong>
          <span>Registra o accede a un perfil para probar el flujo.</span>
        </div>
      </div>
    );
  }

  const displayName = getDisplayName(member);

  return (
    <div className="session-user">
      <div className="session-avatar">
        <Image src={resolvePhoto(member)} alt={`Foto de ${displayName}`} width={64} height={64} unoptimized />
      </div>
      <div>
        <strong>{displayName}</strong>
        <span>{member.stravaConnected ? "Strava conectado" : "Sin Strava todavia"}</span>
      </div>
    </div>
  );
}

function formatLastSync(value: string | null | undefined): string {
  if (!value) {
    return "Pendiente de sincronizar";
  }

  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function RegisterExperience({ snapshot }: { snapshot: LeagueSnapshot }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startRouteRefresh] = useTransition();
  const [registerNote, setRegisterNote] = useState("");
  const [loginNote, setLoginNote] = useState("");
  const [editNote, setEditNote] = useState("");
  const [resetNote, setResetNote] = useState("");
  const [sessionNote, setSessionNote] = useState("");
  const [manualStravaStatus, setManualStravaStatus] = useState("");
  const [draftStravaProfile, setDraftStravaProfile] = useState<StravaProfile | null>(null);

  const activeMember = snapshot.activeMember;
  const stravaStatus =
    searchParams.get("strava_message") ||
    manualStravaStatus ||
    (activeMember?.stravaConnected
      ? `Conectado con Strava como ${getDisplayName(activeMember)}. Ultima sincronizacion: ${formatLastSync(activeMember.stravaLastSyncAt)}.`
      : draftStravaProfile
        ? "Modo de prueba activado con conexion simulada para el registro."
        : activeMember
          ? "Conecta Strava para importar foto, perfil y metricas del ano en curso."
          : "Crea tu perfil o usa la simulacion para precargar foto y metricas.");

  function refreshPage() {
    startRouteRefresh(() => {
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
      await requestJson<Member>("/api/app/register", {
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
          useStravaPhoto: Boolean(formData.get("useStravaPhoto")),
          draftStravaProfile,
          uploadPhoto: await fileToDataUrl(file instanceof File && file.size > 0 ? file : null),
        }),
      });

      setDraftStravaProfile(null);
      setRegisterNote("Perfil creado correctamente. Ya has iniciado sesion.");
      setSessionNote("Cuenta apta para Liga Felina.");
      form.reset();
      refreshPage();
    } catch (error) {
      setRegisterNote(error instanceof Error ? error.message : "No se pudo crear el perfil.");
    }
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginNote("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const member = await requestJson<Member>("/api/app/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: String(formData.get("email") || ""),
          password: String(formData.get("password") || ""),
        }),
      });

      setLoginNote(`Bienvenido, ${getDisplayName(member)}.`);
      setSessionNote(member.stravaConnected ? "Cuenta apta para Liga Felina." : "Sin Strava: este perfil queda fuera de la clasificacion.");
      form.reset();
      refreshPage();
    } catch (error) {
      setLoginNote(error instanceof Error ? error.message : "No se pudo iniciar sesion.");
    }
  }

  async function handleLogout() {
    setSessionNote("");
    try {
      await requestJson<{ ok: true }>("/api/app/auth/logout", {
        method: "POST",
      });
      refreshPage();
    } catch (error) {
      setSessionNote(error instanceof Error ? error.message : "No se pudo cerrar la sesion.");
    }
  }

  async function handleMockStrava() {
    if (!activeMember) {
      setDraftStravaProfile((current) => (current ? null : MOCK_STRAVA_PROFILE));
      return;
    }

    try {
      await requestJson<Member>("/api/app/profile/strava", {
        method: "POST",
      });
      setSessionNote("Strava conectado en modo de prueba.");
      refreshPage();
    } catch (error) {
      setSessionNote(error instanceof Error ? error.message : "No se pudo conectar Strava.");
    }
  }

  async function handleDisconnectStrava() {
    if (!activeMember) {
      setDraftStravaProfile(null);
      return;
    }

    try {
      await requestJson<Member>("/api/app/profile/strava", {
        method: "DELETE",
      });
      setSessionNote("Strava desconectado. Este perfil queda fuera de la Liga Felina hasta volver a conectarlo.");
      refreshPage();
    } catch (error) {
      setSessionNote(error instanceof Error ? error.message : "No se pudo desconectar Strava.");
    }
  }

  async function handleSyncStrava() {
    if (!activeMember?.stravaConnected) {
      setSessionNote("Conecta Strava antes de intentar sincronizar datos reales.");
      return;
    }

    try {
      const updatedMember = await requestJson<Member>("/api/app/profile/strava/sync", {
        method: "POST",
      });
      setSessionNote(
        `Datos de Strava actualizados. Ultima sincronizacion: ${formatLastSync(updatedMember.stravaLastSyncAt)}.`,
      );
      refreshPage();
    } catch (error) {
      setSessionNote(error instanceof Error ? error.message : "No se pudo sincronizar Strava.");
    }
  }

  async function handleEditProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeMember) {
      setEditNote("Primero inicia sesion para editar tu perfil.");
      return;
    }

    setEditNote("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("photo");

    try {
      await requestJson<Member>("/api/app/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: String(formData.get("firstName") || ""),
          lastName: String(formData.get("lastName") || ""),
          email: String(formData.get("email") || ""),
          memberNumber: String(formData.get("memberNumber") || ""),
          gender: String(formData.get("gender") || "men"),
          city: String(formData.get("city") || ""),
          useStravaPhoto: Boolean(formData.get("useStravaPhoto")),
          uploadPhoto: await fileToDataUrl(file instanceof File && file.size > 0 ? file : null),
        }),
      });

      setEditNote("Perfil actualizado correctamente.");
      refreshPage();
    } catch (error) {
      setEditNote(error instanceof Error ? error.message : "No se pudo actualizar el perfil.");
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

  const displayMember = activeMember ?? null;

  return (
    <main className="league-main">
      <section className="auth-section" id="registro">
        <div className="section-heading">
          <p className="eyebrow dark">Socios</p>
          <h2>Registro e inicio de sesion</h2>
          <p>
            El flujo ya vive dentro del proyecto Next con Supabase Auth, sesiones por cookie,
            RPCs para el perfil y una capa de datos separada del cliente.
          </p>
        </div>

        <div className="auth-grid">
          <article className="auth-card">
            <div className="card-head">
              <h3>Registro de socio</h3>
              <span className="card-chip">Nuevo perfil</span>
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
                Numero de socio
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

              <div className="strava-box full-width">
                <div>
                  <strong>Conectar con Strava</strong>
                  <p>
                    El perfil del socio ya queda persistido en Supabase y Strava pasa a ser
                    la fuente de verdad para foto, kilometros y desnivel del ano.
                  </p>
                  <p className="strava-status">{stravaStatus}</p>
                </div>
                <div className="strava-actions">
                  <a
                    className={`button button-strava ${!activeMember ? "is-disabled-link" : ""}`}
                    href={activeMember ? "/api/strava/login?returnTo=/liga-felina/registro" : "#registro"}
                    onClick={(event) => {
                      if (!activeMember) {
                        event.preventDefault();
                        setManualStravaStatus("Inicia sesion primero para conectar una cuenta real de Strava.");
                      }
                    }}
                  >
                    Conectar Strava real
                  </a>
                  <button className="button ghost-button" type="button" onClick={handleMockStrava}>
                    {draftStravaProfile ? "Quitar simulacion" : "Simular conexion"}
                  </button>
                </div>
              </div>

              <label className="compact-switch full-width" htmlFor="use-strava-photo">
                <span>Usar foto de Strava</span>
                <input type="checkbox" name="useStravaPhoto" id="use-strava-photo" defaultChecked={Boolean(draftStravaProfile)} />
                <span className="switch-track" aria-hidden="true">
                  <span className="switch-thumb" />
                </span>
              </label>

              <button className="button button-primary full-width" type="submit" disabled={isPending}>
                Crear cuenta de socio
              </button>
              <p className="form-note full-width">{registerNote}</p>
            </form>
          </article>

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

            <div className="session-box">
              <p className="session-label">Sesion actual</p>
              <SessionCard member={displayMember} />
              {activeMember?.stravaConnected ? (
                <p className="form-note">
                  Ultima sincronizacion de Strava: {formatLastSync(activeMember.stravaLastSyncAt)}
                </p>
              ) : null}
              <div className="session-actions">
                <button className="button ghost-button" type="button" onClick={handleSyncStrava}>
                  Actualizar Strava
                </button>
                <button className="button ghost-button" type="button" onClick={handleDisconnectStrava}>
                  Desconectar Strava
                </button>
                <button className="button ghost-button" type="button" onClick={handleLogout}>
                  Cerrar sesion
                </button>
              </div>
              <p className="form-note">{sessionNote}</p>
            </div>
          </article>
        </div>

        <div className="manage-grid">
          <article className="auth-card">
            <div className="card-head">
              <h3>Editar mis datos</h3>
              <span className="card-chip">Perfil</span>
            </div>

            <form className="member-form" onSubmit={handleEditProfile}>
              <label>
                Nombre
                <input type="text" name="firstName" required defaultValue={activeMember?.firstName || ""} placeholder="Nombre" />
              </label>
              <label>
                Apellidos
                <input type="text" name="lastName" required defaultValue={activeMember?.lastName || ""} placeholder="Apellidos" />
              </label>
              <label>
                Email
                <input type="email" name="email" required defaultValue={activeMember?.email || ""} placeholder="correo@ejemplo.com" />
              </label>
              <label>
                Ciudad
                <input type="text" name="city" defaultValue={activeMember?.city || ""} placeholder="Tu ciudad" />
              </label>
              <label>
                Numero de socio
                <input type="text" name="memberNumber" required defaultValue={activeMember?.memberNumber || ""} pattern="L-[0-9]{3}" placeholder="L-001" />
              </label>
              <label>
                Sexo para la clasificacion
                <select name="gender" defaultValue={activeMember?.gender || "men"}>
                  <option value="men">Hombre</option>
                  <option value="women">Mujer</option>
                </select>
              </label>
              <label className="full-width">
                Cambiar foto del socio
                <input type="file" name="photo" accept="image/*" />
              </label>
              <label className="compact-switch full-width" htmlFor="edit-use-strava-photo">
                <span>Usar foto de Strava</span>
                <input
                  type="checkbox"
                  name="useStravaPhoto"
                  id="edit-use-strava-photo"
                  defaultChecked={Boolean(activeMember?.stravaConnected && activeMember.photoSource === "strava")}
                />
                <span className="switch-track" aria-hidden="true">
                  <span className="switch-thumb" />
                </span>
              </label>
              <button className="button button-primary full-width" type="submit" disabled={isPending}>
                Guardar cambios
              </button>
              <p className="form-note full-width">{editNote}</p>
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
