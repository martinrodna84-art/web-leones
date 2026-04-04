"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import {
  formatLastSync,
  requestJson,
} from "@/components/league/member-client-utils";
import { getDisplayName, resolvePhoto } from "@/lib/members";
import type { SessionMember } from "@/lib/types";

function formatKm(value: number): string {
  return value.toFixed(2);
}

function formatElevation(value: number): string {
  return Math.round(value).toString();
}

export function MemberZoneExperience({ member }: { member: SessionMember }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startRouteTransition] = useTransition();
  const [syncNote, setSyncNote] = useState("");

  const displayName = getDisplayName(member);
  const stravaMessage =
    searchParams.get("strava_message") ||
    (member.stravaConnected
      ? `Sincronizacion con Strava activa. Ultima actualizacion: ${formatLastSync(member.stravaLastSyncAt)}.`
      : "Tu cuenta todavia no esta conectada a Strava.");

  function refreshPage() {
    startRouteTransition(() => {
      router.refresh();
    });
  }

  async function handleSyncStrava() {
    if (!member.stravaConnected) {
      setSyncNote("Conecta Strava desde editar mis datos para empezar a sincronizar.");
      return;
    }

    try {
      const updatedMember = await requestJson<SessionMember>("/api/app/profile/strava/sync", {
        method: "POST",
      });
      setSyncNote(
        `Datos actualizados. Ultima sincronizacion: ${formatLastSync(updatedMember.stravaLastSyncAt)}.`,
      );
      refreshPage();
    } catch (error) {
      setSyncNote(error instanceof Error ? error.message : "No se pudo actualizar Strava.");
    }
  }

  return (
    <main className="league-main">
      <section className="member-zone-section" id="perfil">
        <div className="member-zone-intro">
          <p className="eyebrow dark">Zona de socio</p>
          <h2>Panel personal de control</h2>
        </div>

        <article className="member-zone-card">
          <div className="member-zone-header">
            <div className="member-zone-avatar-wrap">
              <div className="member-zone-avatar">
                <Image
                  src={resolvePhoto(member)}
                  alt={`Foto de ${displayName}`}
                  width={132}
                  height={132}
                  unoptimized
                />
              </div>
              {member.stravaConnected ? (
                <span className="member-zone-strava-badge" aria-label="Strava conectado" title="Strava conectado">
                  S
                </span>
              ) : null}
            </div>

            <div className="member-zone-identity">
              <h3>{displayName}</h3>
              <span className="member-zone-chip">Socio n. {member.memberNumber}</span>
            </div>
          </div>

          <div className="member-zone-divider" />

          <div className="member-zone-metrics">
            <article className="member-zone-metric">
              <span className="member-zone-metric-label">Kilometros (YTD)</span>
              <strong className="member-zone-metric-value">
                {formatKm(member.yearKm)} <span>km</span>
              </strong>
            </article>

            <article className="member-zone-metric">
              <span className="member-zone-metric-label">Desnivel (YTD)</span>
              <strong className="member-zone-metric-value is-lime">
                +{formatElevation(member.yearElevation)} <span>m</span>
              </strong>
            </article>
          </div>

          <div className="member-zone-status">
            <strong>{stravaMessage}</strong>
            <p>
              {member.stravaConnected
                ? "Puedes re-vincular o actualizar tus datos cuando quieras."
                : "Conecta Strava y activa tu presencia en la clasificacion."}
            </p>

            <div className="member-zone-status-actions">
              <Link className="button button-primary" href="/liga-felina/perfil/editar">
                Editar mis datos
              </Link>
              <Link className="button button-secondary-dark" href="/liga-felina">
                Ver Liga Felina
              </Link>
              {member.stravaConnected ? (
                <button className="button ghost-button" type="button" onClick={handleSyncStrava} disabled={isPending}>
                  Actualizar Strava
                </button>
              ) : null}
            </div>

            {syncNote ? <p className="form-note">{syncNote}</p> : null}
          </div>
        </article>
      </section>
    </main>
  );
}
