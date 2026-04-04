"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import {
  fileToDataUrl,
  formatLastSync,
  requestJson,
} from "@/components/league/member-client-utils";
import { getDisplayName, resolvePhoto } from "@/lib/members";
import type { SessionMember } from "@/lib/types";

function SessionCard({ member }: { member: SessionMember }) {
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

export function ProfileExperience({ member }: { member: SessionMember }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startRouteTransition] = useTransition();
  const [editNote, setEditNote] = useState("");
  const [sessionNote, setSessionNote] = useState("");

  const stravaStatus =
    searchParams.get("strava_message") ||
    (member.stravaConnected
      ? `Conectado con Strava como ${getDisplayName(member)}. Ultima sincronizacion: ${formatLastSync(member.stravaLastSyncAt)}.`
      : "Conecta Strava para importar foto, perfil y metricas del ano en curso.");

  function refreshPage() {
    startRouteTransition(() => {
      router.refresh();
    });
  }

  async function handleDisconnectStrava() {
    try {
      await requestJson<SessionMember>("/api/app/profile/strava", {
        method: "DELETE",
      });
      setSessionNote("Strava desconectado. Este perfil queda fuera de la Liga Felina hasta volver a conectarlo.");
      refreshPage();
    } catch (error) {
      setSessionNote(error instanceof Error ? error.message : "No se pudo desconectar Strava.");
    }
  }

  async function handleSyncStrava() {
    if (!member.stravaConnected) {
      setSessionNote("Conecta Strava antes de intentar sincronizar datos reales.");
      return;
    }

    try {
      const updatedMember = await requestJson<SessionMember>("/api/app/profile/strava/sync", {
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
    setEditNote("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("photo");
    const selectedPhotoSource = String(formData.get("photoSource") || "upload");

    if (selectedPhotoSource === "strava" && !member.stravaConnected) {
      setEditNote("Conecta Strava antes de seleccionar la foto del perfil desde Strava.");
      return;
    }

    try {
      await requestJson<SessionMember>("/api/app/profile", {
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
          useStravaPhoto: selectedPhotoSource === "strava",
          uploadPhoto: await fileToDataUrl(file instanceof File && file.size > 0 ? file : null),
        }),
      });

      setEditNote("Perfil actualizado correctamente.");
      refreshPage();
    } catch (error) {
      setEditNote(error instanceof Error ? error.message : "No se pudo actualizar el perfil.");
    }
  }

  return (
    <main className="league-main">
      <section className="auth-section" id="perfil">
        <div className="section-heading">
          <p className="eyebrow dark">Edicion de socio</p>
          <h2>Gestiona tus datos y la conexion con Strava</h2>
          <p>
            Desde aqui puedes editar tus datos, decidir de donde sale tu foto de perfil
            y conectar tu cuenta de Strava para sincronizar metricas y clasificaciones.
          </p>
        </div>

        <div className="auth-grid">
          <article className="auth-card">
            <div className="card-head">
              <h3>Editar mis datos</h3>
              <span className="card-chip">Perfil</span>
            </div>

            <form className="member-form" onSubmit={handleEditProfile}>
              <label>
                Nombre
                <input type="text" name="firstName" required defaultValue={member.firstName || ""} placeholder="Nombre" />
              </label>
              <label>
                Apellidos
                <input type="text" name="lastName" required defaultValue={member.lastName || ""} placeholder="Apellidos" />
              </label>
              <label>
                Email
                <input type="email" name="email" required defaultValue={member.email || ""} placeholder="correo@ejemplo.com" />
              </label>
              <label>
                Ciudad
                <input type="text" name="city" defaultValue={member.city || ""} placeholder="Tu ciudad" />
              </label>
              <label>
                Numero de socio
                <input type="text" name="memberNumber" required defaultValue={member.memberNumber || ""} pattern="L-[0-9]{3}" placeholder="L-001" />
              </label>
              <label>
                Sexo para la clasificacion
                <select name="gender" defaultValue={member.gender || "men"}>
                  <option value="men">Hombre</option>
                  <option value="women">Mujer</option>
                </select>
              </label>
              <label className="full-width">
                Cambiar foto del socio
                <input type="file" name="photo" accept="image/*" />
              </label>
              <label className="full-width">
                Fuente de la foto del perfil
                <select
                  name="photoSource"
                  defaultValue={member.stravaConnected && member.photoSource === "strava" ? "strava" : "upload"}
                >
                  <option value="upload">Foto de archivo</option>
                  {member.stravaConnected ? <option value="strava">Foto de Strava</option> : null}
                </select>
              </label>
              <button className="button button-primary full-width" type="submit" disabled={isPending}>
                Guardar cambios
              </button>
              <p className="form-note full-width">{editNote}</p>
            </form>
          </article>

          <article className="auth-card">
            <div className="card-head">
              <h3>Cuenta y Strava</h3>
              <span className="card-chip alt">Sincronizacion</span>
            </div>

            <div className="session-box">
              <p className="session-label">Sesion actual</p>
              <SessionCard member={member} />
              <p className="form-note">
                Ultima sincronizacion de Strava: {formatLastSync(member.stravaLastSyncAt)}
              </p>
            </div>

            <div className="strava-box">
              <div>
                <strong>Conexion con Strava</strong>
                <p>
                  Enlaza tu cuenta para traer foto, perfil y metricas del ano en curso.
                  La Liga Felina se alimenta desde aqui.
                </p>
                <p className="strava-status">{stravaStatus}</p>
              </div>
              <div className="strava-actions">
                <a
                  className="strava-connect-official"
                  href="/api/strava/login?returnTo=/liga-felina/perfil/editar"
                  aria-label={member.stravaConnected ? "Reconectar con Strava" : "Conectar con Strava"}
                  title={member.stravaConnected ? "Reconectar con Strava" : "Conectar con Strava"}
                >
                  <Image
                    src="/assets/strava/btn_strava_connect_with_orange.svg"
                    alt="Connect with Strava"
                    width={237}
                    height={48}
                    className="strava-connect-official-image"
                    unoptimized
                  />
                </a>
                <button className="button ghost-button" type="button" onClick={handleSyncStrava}>
                  Actualizar Strava
                </button>
                {member.stravaConnected ? (
                  <button className="button ghost-button" type="button" onClick={handleDisconnectStrava}>
                    Desconectar Strava
                  </button>
                ) : null}
              </div>
            </div>

            <p className="form-note">{sessionNote}</p>
          </article>
        </div>
      </section>
    </main>
  );
}
