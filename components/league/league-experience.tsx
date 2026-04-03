"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { getDisplayName, resolvePhoto } from "@/lib/members";
import {
  formatDate,
  formatInteger,
  formatNumber,
  getClaimedEventIds,
  getElevationRanking,
  getGeneralBreakdown,
  getGeneralRanking,
  getKmRanking,
  getRacePointsFromModality,
  getRankIcon,
} from "@/lib/scoring";
import type { LeagueGenderFilter, LeagueSnapshot, RaceEvent, RaceModality } from "@/lib/types";

type RankingTab = "general" | "km" | "elevation" | "races";

type EventFormState = {
  id?: string;
  name: string;
  edition: string;
  modalities: RaceModality[];
};

type ClaimState = {
  eventId: string;
  modalityId: string;
  activityUrl: string;
};

function createEmptyModality(): RaceModality {
  return {
    id: "",
    name: "",
    distanceKm: 0,
    elevationGain: 0,
    date: "",
    time: "",
    order: 0,
  };
}

function buildEventForm(eventItem?: RaceEvent): EventFormState {
  if (!eventItem) {
    return {
      name: "",
      edition: "",
      modalities: [createEmptyModality()],
    };
  }

  return {
    id: eventItem.id,
    name: eventItem.name,
    edition: eventItem.edition,
    modalities: eventItem.modalities.map((modality) => ({ ...modality })),
  };
}

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

export function LeagueExperience({ snapshot }: { snapshot: LeagueSnapshot }) {
  const router = useRouter();
  const [isPending, startRouteRefresh] = useTransition();
  const [currentGender, setCurrentGender] = useState<LeagueGenderFilter>("mixed");
  const [currentTab, setCurrentTab] = useState<RankingTab>("general");
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [eventForm, setEventForm] = useState<EventFormState | null>(null);
  const [eventNote, setEventNote] = useState("");
  const [claimState, setClaimState] = useState<ClaimState | null>(null);
  const [claimNote, setClaimNote] = useState("");
  const [selectedEventId, setSelectedEventId] = useState(snapshot.raceEvents[0]?.id ?? "");

  const events = snapshot.raceEvents
    .slice()
    .sort((left, right) => `${left.edition}${left.name}`.localeCompare(`${right.edition}${right.name}`));
  const activeMember = snapshot.activeMember;
  const effectiveSelectedEventId =
    selectedEventId && events.some((eventItem) => eventItem.id === selectedEventId)
      ? selectedEventId
      : events[0]?.id ?? "";
  const selectedEvent =
    events.find((eventItem) => eventItem.id === effectiveSelectedEventId) ?? events[0] ?? null;
  const claimedEventIds = activeMember ? getClaimedEventIds(snapshot.raceClaims, activeMember.id) : new Set<string>();
  const canManageRaceEvents = Boolean(activeMember);
  const rankings = {
    general: getGeneralRanking(snapshot.members, snapshot.raceClaims, currentGender),
    km: getKmRanking(snapshot.members, currentGender),
    elevation: getElevationRanking(snapshot.members, currentGender),
  };

  function refreshPage() {
    startRouteRefresh(() => {
      router.refresh();
    });
  }

  function toggleExpandedRow(memberId: string) {
    setExpandedRows((current) =>
      current.includes(memberId) ? current.filter((item) => item !== memberId) : [...current, memberId],
    );
  }

  function handleCreateEvent() {
    setEventNote("");
    setEventForm(buildEventForm());
  }

  function handleEditEvent(eventItem: RaceEvent) {
    setEventNote("");
    setEventForm(buildEventForm(eventItem));
  }

  async function handleDeleteEvent(eventId: string) {
    if (!window.confirm("Se borrara la carrera completa con sus validaciones. Continuar?")) {
      return;
    }

    try {
      await requestJson<{ ok: true }>(`/api/app/race-events/${eventId}`, {
        method: "DELETE",
      });
      refreshPage();
    } catch (error) {
      setClaimNote(error instanceof Error ? error.message : "No se pudo borrar la carrera.");
      setCurrentTab("races");
    }
  }

  async function handleEventSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!eventForm) {
      return;
    }

    setEventNote("");

    try {
      const body = JSON.stringify({
        name: eventForm.name,
        edition: eventForm.edition,
        modalities: eventForm.modalities,
      });

      if (eventForm.id) {
        await requestJson<RaceEvent>(`/api/app/race-events/${eventForm.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body,
        });
      } else {
        await requestJson<RaceEvent>("/api/app/race-events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body,
        });
      }

      setEventForm(null);
      refreshPage();
    } catch (error) {
      setEventNote(error instanceof Error ? error.message : "No se pudo guardar la carrera.");
    }
  }

  async function handleClaimSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!claimState) {
      return;
    }

    setClaimNote("");

    try {
      await requestJson("/api/app/race-claims", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(claimState),
      });
      setClaimState(null);
      refreshPage();
    } catch (error) {
      setClaimNote(error instanceof Error ? error.message : "No se pudo validar la carrera.");
    }
  }

  return (
    <main className="league-main">
      <section className="ranking-section" id="clasificaciones">
        <div className="ranking-head">
          <div className="ranking-head-copy">
            <p className="eyebrow dark">Clasificaciones</p>
          </div>

          <div className="ranking-controls">
            <div className="ranking-tabs" role="tablist" aria-label="Clasificaciones Liga Felina">
              <button className={`tab-button ${currentTab === "general" ? "is-active" : ""}`} type="button" onClick={() => setCurrentTab("general")}>
                Clasificacion general
              </button>
              <button className={`tab-button ${currentTab === "km" ? "is-active" : ""}`} type="button" onClick={() => setCurrentTab("km")}>
                DevoraKm
              </button>
              <button className={`tab-button ${currentTab === "elevation" ? "is-active" : ""}`} type="button" onClick={() => setCurrentTab("elevation")}>
                Devora+
              </button>
              <button className={`tab-button ${currentTab === "races" ? "is-active" : ""}`} type="button" onClick={() => setCurrentTab("races")}>
                DevoraCarreras
              </button>
            </div>

            <div className="gender-switch" role="tablist" aria-label="Clasificacion por categoria">
              <button
                className={`gender-option is-men ${currentGender === "men" ? "is-active" : ""}`}
                type="button"
                onClick={() => setCurrentGender("men")}
              >
                Leones
              </button>
              <button
                className={`gender-option is-mixed ${currentGender === "mixed" ? "is-active" : ""}`}
                type="button"
                onClick={() => setCurrentGender("mixed")}
              >
                Mixto
              </button>
              <button
                className={`gender-option is-women ${currentGender === "women" ? "is-active" : ""}`}
                type="button"
                onClick={() => setCurrentGender("women")}
              >
                Leonas
              </button>
            </div>
          </div>
        </div>

        <article className={`ranking-panel ${currentTab === "general" ? "is-active" : ""}`}>
          <div className="panel-intro">
            <h3>Clasificacion general</h3>
            <p>Suma total de puntos de kilometros, desnivel positivo y carreras validadas.</p>
          </div>
          <LeaderboardTable
            rows={rankings.general}
            currentGender={currentGender}
            isGeneral
            expandedRows={expandedRows}
            onToggleRow={toggleExpandedRow}
            raceEvents={snapshot.raceEvents}
            raceClaims={snapshot.raceClaims}
          />
        </article>

        <article className={`ranking-panel ${currentTab === "km" ? "is-active" : ""}`}>
          <div className="panel-intro">
            <h3>DevoraKm</h3>
            <p>Ranking por kilometros acumulados en el ano en curso y su puntuacion asociada.</p>
          </div>
          <LeaderboardTable rows={rankings.km} currentGender={currentGender} />
        </article>

        <article className={`ranking-panel ${currentTab === "elevation" ? "is-active" : ""}`}>
          <div className="panel-intro">
            <h3>Devora+</h3>
            <p>Ranking por desnivel positivo acumulado en el ano en curso y su puntuacion asociada.</p>
          </div>
          <LeaderboardTable rows={rankings.elevation} currentGender={currentGender} />
        </article>

        <article className={`ranking-panel ${currentTab === "races" ? "is-active" : ""}`}>
          <div className="panel-intro">
            <h3>DevoraCarreras</h3>
            <p>Crea carreras, anade modalidades y valida participaciones con la URL de Strava de cada socio.</p>
          </div>

          <div className="race-admin-bar">
            <div>
              <strong>Gestion de DevoraCarreras</strong>
              <p>
                {!activeMember
                  ? "Inicia sesion para crear, editar, borrar y validar carreras."
                  : "Tu cuenta puede crear, editar, borrar y validar carreras del calendario de la liga."}
              </p>
            </div>
            <button
              className="button button-primary"
              type="button"
              onClick={handleCreateEvent}
              disabled={!canManageRaceEvents}
              title={!canManageRaceEvents ? "Inicia sesion para crear carreras." : undefined}
            >
              Crear carrera
            </button>
          </div>

          <label className="race-selector-label">
            <span>Selecciona una carrera</span>
            <select value={effectiveSelectedEventId} onChange={(event) => setSelectedEventId(event.target.value)}>
              <option value="">Elige una carrera para ver sus modalidades</option>
              {events.map((eventItem) => (
                <option key={eventItem.id} value={eventItem.id}>
                  {eventItem.name} · {eventItem.edition}
                </option>
              ))}
            </select>
          </label>

          {eventForm ? (
            <form className="race-event-form" onSubmit={handleEventSubmit}>
              <div className="card-head">
                <h3>{eventForm.id ? "Editar carrera" : "Nueva carrera"}</h3>
                <span className="card-chip">DevoraCarreras</span>
              </div>

              <div className="race-event-grid">
                <label>
                  Nombre de la carrera
                  <input value={eventForm.name} onChange={(event) => setEventForm((current) => current ? { ...current, name: event.target.value } : current)} />
                </label>
                <label>
                  Edicion
                  <input value={eventForm.edition} onChange={(event) => setEventForm((current) => current ? { ...current, edition: event.target.value } : current)} />
                </label>
              </div>

              <div className="modalities-head">
                <strong>Modalidades</strong>
                <button
                  className="button ghost-button"
                  type="button"
                  onClick={() =>
                    setEventForm((current) =>
                      current
                        ? { ...current, modalities: [...current.modalities, createEmptyModality()] }
                        : current,
                    )
                  }
                >
                  Anadir modalidad
                </button>
              </div>

              <div className="modalities-list">
                {eventForm.modalities.map((modality, index) => (
                  <div key={`${modality.id || "new"}-${index}`} className="race-mode-editor">
                    <div className="race-mode-grid">
                      <label>
                        Modalidad
                        <input
                          value={modality.name}
                          onChange={(event) =>
                            setEventForm((current) =>
                              current
                                ? {
                                    ...current,
                                    modalities: current.modalities.map((item, itemIndex) =>
                                      itemIndex === index ? { ...item, name: event.target.value } : item,
                                    ),
                                  }
                                : current,
                            )
                          }
                        />
                      </label>
                      <label>
                        Distancia (km)
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={modality.distanceKm}
                          onChange={(event) =>
                            setEventForm((current) =>
                              current
                                ? {
                                    ...current,
                                    modalities: current.modalities.map((item, itemIndex) =>
                                      itemIndex === index ? { ...item, distanceKm: Number(event.target.value) } : item,
                                    ),
                                  }
                                : current,
                            )
                          }
                        />
                      </label>
                      <label>
                        Desnivel + (m)
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={modality.elevationGain}
                          onChange={(event) =>
                            setEventForm((current) =>
                              current
                                ? {
                                    ...current,
                                    modalities: current.modalities.map((item, itemIndex) =>
                                      itemIndex === index ? { ...item, elevationGain: Number(event.target.value) } : item,
                                    ),
                                  }
                                : current,
                            )
                          }
                        />
                      </label>
                      <label>
                        Fecha
                        <input
                          type="date"
                          value={modality.date}
                          onChange={(event) =>
                            setEventForm((current) =>
                              current
                                ? {
                                    ...current,
                                    modalities: current.modalities.map((item, itemIndex) =>
                                      itemIndex === index ? { ...item, date: event.target.value } : item,
                                    ),
                                  }
                                : current,
                            )
                          }
                        />
                      </label>
                      <label>
                        Hora
                        <input
                          type="time"
                          value={modality.time}
                          onChange={(event) =>
                            setEventForm((current) =>
                              current
                                ? {
                                    ...current,
                                    modalities: current.modalities.map((item, itemIndex) =>
                                      itemIndex === index ? { ...item, time: event.target.value } : item,
                                    ),
                                  }
                                : current,
                            )
                          }
                        />
                      </label>
                    </div>
                    <div className="race-mode-actions">
                      <button
                        className="button ghost-button"
                        type="button"
                        onClick={() =>
                          setEventForm((current) =>
                            current
                              ? {
                                  ...current,
                                  modalities: current.modalities.filter((_, itemIndex) => itemIndex !== index),
                                }
                              : current,
                          )
                        }
                      >
                        Eliminar modalidad
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-actions">
                <button className="button button-primary" type="submit" disabled={isPending}>
                  Guardar carrera
                </button>
                <button className="button ghost-button" type="button" onClick={() => setEventForm(null)}>
                  Cancelar
                </button>
              </div>
              <p className="form-note">{eventNote}</p>
            </form>
          ) : null}

          {!selectedEvent ? (
            <div className="races-placeholder">
              <strong>Sin carreras todavia</strong>
              <p>Cuando se creen eventos, apareceran aqui para validar participaciones.</p>
            </div>
          ) : (
            <article className="race-event-card">
              <div className="race-event-head">
                <div>
                  <h4>
                    {selectedEvent.name} <span>· {selectedEvent.edition}</span>
                  </h4>
                  <p>{selectedEvent.modalities.length} modalidad(es) disponibles para validar.</p>
                </div>
                {canManageRaceEvents ? (
                  <div className="race-event-actions">
                    <button className="button ghost-button" type="button" onClick={() => handleEditEvent(selectedEvent)}>
                      Editar carrera
                    </button>
                    <button className="button ghost-button" type="button" onClick={() => handleDeleteEvent(selectedEvent.id)}>
                      Borrar carrera
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="race-modes-list">
                {selectedEvent.modalities
                  .slice()
                  .sort((left, right) => (left.date + left.time).localeCompare(right.date + right.time))
                  .map((modality) => {
                    const locked = activeMember ? claimedEventIds.has(selectedEvent.id) : false;
                    const claimDisabled = !activeMember || locked || !activeMember.stravaConnected;
                    const statusLabel = !activeMember
                      ? "Inicia sesion para validar"
                      : !locked && !activeMember.stravaConnected
                        ? "Necesitas Strava conectado"
                        : "";
                    const buttonLabel = locked ? "Validado" : "He corrido esta";

                    return (
                      <article key={modality.id} className="race-mode-card">
                        <h5>{modality.name}</h5>
                        <div className="mode-meta">
                          <span className="mode-chip">{formatNumber(modality.distanceKm, 1)} km</span>
                          <span className="mode-chip">{formatInteger(modality.elevationGain)} m+</span>
                          <span className="mode-chip">
                            {formatDate(modality.date)} · {modality.time}
                          </span>
                          <span className="mode-chip">{formatInteger(getRacePointsFromModality(modality))} pts</span>
                        </div>
                        <div className="claim-status">
                          <button
                            className={`button ${locked ? "is-validated" : "button-primary"}`}
                            type="button"
                            disabled={claimDisabled}
                            onClick={() => {
                              setClaimNote("");
                              setClaimState({
                                eventId: selectedEvent.id,
                                modalityId: modality.id,
                                activityUrl: "",
                              });
                            }}
                          >
                            {buttonLabel}
                          </button>
                          {statusLabel ? <span className="claim-badge">{statusLabel}</span> : null}
                        </div>
                      </article>
                    );
                  })}
              </div>
            </article>
          )}

          {claimState ? (
            <form className="race-claim-form" onSubmit={handleClaimSubmit}>
              <div className="card-head">
                <h3>Validar carrera</h3>
                <span className="card-chip alt">Strava</span>
              </div>
              <p>Pega la URL de la actividad de Strava para sumar puntos.</p>
              <label>
                URL de la actividad de Strava
                <input
                  type="url"
                  value={claimState.activityUrl}
                  onChange={(event) =>
                    setClaimState((current) =>
                      current ? { ...current, activityUrl: event.target.value } : current,
                    )
                  }
                  placeholder="https://www.strava.com/activities/123456789"
                />
              </label>
              <div className="form-actions">
                <button className="button button-primary" type="submit" disabled={isPending}>
                  Verificar y sumar puntos
                </button>
                <button className="button ghost-button" type="button" onClick={() => setClaimState(null)}>
                  Cancelar
                </button>
              </div>
              <p className="form-note">{claimNote}</p>
            </form>
          ) : null}
        </article>
      </section>
    </main>
  );
}

function LeaderboardTable({
  rows,
  currentGender,
  isGeneral = false,
  expandedRows = [],
  onToggleRow,
  raceEvents = [],
  raceClaims = [],
}: {
  rows: ReturnType<typeof getGeneralRanking>;
  currentGender: LeagueGenderFilter;
  isGeneral?: boolean;
  expandedRows?: string[];
  onToggleRow?: (memberId: string) => void;
  raceEvents?: LeagueSnapshot["raceEvents"];
  raceClaims?: LeagueSnapshot["raceClaims"];
}) {
  return (
    <div className={`table-shell filter-${currentGender}`}>
      <table className="ranking-table">
        <colgroup>
          <col className="ranking-col-position" />
          <col className="ranking-col-athlete" />
          <col className="ranking-col-metric" />
          <col className="ranking-col-points" />
        </colgroup>
        <thead>
          <tr>
            <th>Posicion</th>
            <th>Socio</th>
            <th>Dato</th>
            <th>Puntuacion</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const open = isGeneral && expandedRows.includes(row.id);
            const breakdown = isGeneral ? getGeneralBreakdown(row, raceEvents, raceClaims) : null;

            return (
              <tr key={row.id}>
                <td className="position-cell">
                  <span className="position-badge">
                    <span className="position-icon">{getRankIcon(index + 1)}</span>
                    {index + 1}
                  </span>
                </td>
                <td className="athlete-column">
                  <div className="athlete-cell">
                    <div className="athlete-avatar">
                      <Image src={resolvePhoto(row)} alt={`Foto de ${getDisplayName(row)}`} width={56} height={56} unoptimized />
                    </div>
                    <div className="athlete-copy">
                      <strong>{getDisplayName(row)}</strong>
                      <div>{row.memberNumber}</div>
                      {isGeneral ? (
                        <>
                          <button
                            className="general-breakdown-button"
                            type="button"
                            onClick={() => onToggleRow?.(row.id)}
                          >
                            {open ? "Ocultar detalle" : "Ver detalle"}
                          </button>
                          {open && breakdown ? (
                            <div className="general-breakdown">
                              <ul className="general-breakdown-list">
                                <li>
                                  <strong>Puntos por Kms:</strong> {formatInteger(breakdown.kmPoints)} pts
                                </li>
                                <li>
                                  <strong>Puntos por D+:</strong> {formatInteger(breakdown.elevationPoints)} pts
                                </li>
                                {breakdown.races.length ? (
                                  breakdown.races.map((race) => (
                                    <li key={`${row.id}-${race.name}`}>
                                      <strong>{race.name}:</strong> {formatInteger(race.points)} pts
                                    </li>
                                  ))
                                ) : (
                                  <li>
                                    <strong>DevoraCarreras:</strong> 0 pts
                                  </li>
                                )}
                              </ul>
                            </div>
                          ) : null}
                        </>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="metric-cell">
                  <span className="metric-pill">{row.metricLabel}</span>
                </td>
                <td className="points-cell">{formatInteger(row.points)} pts</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
