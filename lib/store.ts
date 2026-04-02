import type {
  LeagueSnapshot,
  Member,
  RaceClaim,
  RaceClaimPayload,
  RaceEvent,
  RaceEventPayload,
  SessionMember,
  StravaActivity,
  StravaProfile,
} from "@/lib/types";

import { seedRaceClaims, seedRaceEvents } from "@/lib/mock-data";
import { getRacePointsFromModality, parseStravaActivityId, sameDate } from "@/lib/scoring";
import { buildMockStravaActivity, fetchStravaActivityById } from "@/lib/strava";

type StravaConnection = {
  athlete: StravaProfile;
  accessToken: string;
  expiresAt: number;
};

type AppStore = {
  raceEvents: RaceEvent[];
  raceClaims: RaceClaim[];
  stravaConnections: Map<string, StravaConnection>;
  pendingStates: Map<string, { returnTo: string; createdAt: number }>;
};

let store: AppStore | null = null;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function getStore(): AppStore {
  if (!store) {
    store = {
      raceEvents: clone(seedRaceEvents),
      raceClaims: clone(seedRaceClaims),
      stravaConnections: new Map<string, StravaConnection>(),
      pendingStates: new Map<string, { returnTo: string; createdAt: number }>(),
    };
  }

  return store;
}

function ensureAuthenticated(member: Member | null): Member {
  if (!member) {
    throw new Error("Necesitas iniciar sesion para continuar.");
  }

  return member;
}

function ensureAdmin(member: Member | null): Member {
  const currentMember = ensureAuthenticated(member);
  if (!currentMember.isAdmin) {
    throw new Error("Solo la administracion puede gestionar eventos.");
  }

  return currentMember;
}

export function getSnapshot(
  activeMember: SessionMember | null,
  members: Member[],
): LeagueSnapshot {
  const appStore = getStore();

  return {
    activeMember: activeMember ? clone(activeMember) : null,
    members: clone(members),
    raceEvents: clone(appStore.raceEvents),
    raceClaims: clone(appStore.raceClaims),
  };
}

export function listRaceEvents(): RaceEvent[] {
  return clone(getStore().raceEvents);
}

export function listRaceClaims(): RaceClaim[] {
  return clone(getStore().raceClaims);
}

export function rememberStravaConnection(
  memberId: string,
  profile: StravaProfile,
  accessToken: string,
  expiresAt: number,
): void {
  getStore().stravaConnections.set(memberId, {
    athlete: profile,
    accessToken,
    expiresAt,
  });
}

export function forgetStravaConnection(memberId: string): void {
  getStore().stravaConnections.delete(memberId);
}

export function getStoredStravaConnection(memberId: string | null): StravaConnection | null {
  if (!memberId) {
    return null;
  }

  return getStore().stravaConnections.get(memberId) ?? null;
}

export function savePendingStravaState(state: string, returnTo: string): void {
  getStore().pendingStates.set(state, {
    returnTo,
    createdAt: Date.now(),
  });
}

export function consumePendingStravaState(state: string | null): { returnTo: string } | null {
  if (!state) {
    return null;
  }

  const pending = getStore().pendingStates.get(state) ?? null;
  getStore().pendingStates.delete(state);
  return pending ? { returnTo: pending.returnTo } : null;
}

export function upsertRaceEvent(
  member: Member | null,
  payload: RaceEventPayload,
  eventId?: string,
): RaceEvent {
  const admin = ensureAdmin(member);
  const name = payload.name.trim();
  const edition = payload.edition.trim();
  const modalities = payload.modalities
    .map((modality, index) => ({
      ...modality,
      id: modality.id || crypto.randomUUID(),
      name: modality.name.trim(),
      date: modality.date.trim(),
      time: modality.time.trim(),
      order: index,
    }))
    .filter((modality) => modality.name && modality.date && modality.time);

  if (!name || !edition || !modalities.length) {
    throw new Error("Debes completar el evento y al menos una modalidad.");
  }

  const appStore = getStore();

  if (eventId) {
    const index = appStore.raceEvents.findIndex((eventItem) => eventItem.id === eventId);
    if (index === -1) {
      throw new Error("No hemos encontrado el evento que intentas editar.");
    }

    const updatedEvent: RaceEvent = {
      ...appStore.raceEvents[index],
      name,
      edition,
      modalities,
    };
    appStore.raceEvents[index] = updatedEvent;
    return clone(updatedEvent);
  }

  const newEvent: RaceEvent = {
    id: crypto.randomUUID(),
    name,
    edition,
    createdAt: new Date().toISOString(),
    createdBy: admin.id,
    modalities,
  };
  appStore.raceEvents.push(newEvent);
  return clone(newEvent);
}

export function deleteRaceEvent(member: Member | null, eventId: string): void {
  ensureAdmin(member);
  const appStore = getStore();
  appStore.raceEvents = appStore.raceEvents.filter((eventItem) => eventItem.id !== eventId);
  appStore.raceClaims = appStore.raceClaims.filter((claim) => claim.eventId !== eventId);
}

async function resolveActivityForClaim(
  member: Member,
  modalityId: string,
  activityId: string,
): Promise<StravaActivity> {
  const eventItem = getStore().raceEvents.find((event) =>
    event.modalities.some((modality) => modality.id === modalityId),
  );
  const modality = eventItem?.modalities.find((item) => item.id === modalityId);

  if (!modality) {
    throw new Error("No hemos encontrado la modalidad seleccionada.");
  }

  const connection = getStore().stravaConnections.get(member.id);
  if (connection && connection.accessToken !== "mock-token") {
    return fetchStravaActivityById(activityId, connection.accessToken);
  }

  return buildMockStravaActivity(activityId, member, modality);
}

export async function createRaceClaim(
  member: Member | null,
  payload: RaceClaimPayload,
): Promise<RaceClaim> {
  const currentMember = ensureAuthenticated(member);

  if (!currentMember.stravaConnected) {
    throw new Error("Necesitas tener Strava conectado para validar carreras.");
  }

  const eventItem = getStore().raceEvents.find((event) => event.id === payload.eventId);
  const modality = eventItem?.modalities.find((item) => item.id === payload.modalityId);

  if (!eventItem || !modality) {
    throw new Error("No encontramos la carrera que intentas validar.");
  }

  const existingClaim = getStore().raceClaims.find(
    (claim) => claim.memberId === currentMember.id && claim.eventId === eventItem.id,
  );

  if (existingClaim) {
    throw new Error("Este evento ya esta bloqueado para tu perfil.");
  }

  const activityId = parseStravaActivityId(payload.activityUrl.trim());
  if (!activityId) {
    throw new Error("La URL de Strava no parece valida.");
  }

  const activity = await resolveActivityForClaim(currentMember, modality.id, activityId);

  if (!sameDate(activity.startDateLocal, modality.date)) {
    throw new Error("La fecha de la actividad no coincide con la modalidad seleccionada.");
  }

  if (currentMember.stravaAthleteId && activity.athleteId !== currentMember.stravaAthleteId) {
    throw new Error("La actividad no pertenece a la cuenta de Strava vinculada a este socio.");
  }

  const claim: RaceClaim = {
    id: crypto.randomUUID(),
    memberId: currentMember.id,
    eventId: eventItem.id,
    modalityId: modality.id,
    activityId,
    activityUrl: payload.activityUrl.trim(),
    points: getRacePointsFromModality(modality),
    verifiedAt: new Date().toISOString(),
  };

  getStore().raceClaims.push(claim);
  return clone(claim);
}

export function getActivityForCurrentMember(
  member: Member | null,
  activityId: string,
): StravaActivity {
  const currentMember = ensureAuthenticated(member);

  if (!currentMember.stravaConnected) {
    throw new Error("No hay sesion de Strava activa.");
  }

  return buildMockStravaActivity(activityId, currentMember, {
    id: "preview",
    name: "Actividad de prueba",
    distanceKm: 12.4,
    elevationGain: 640,
    date: new Date().toISOString().slice(0, 10),
    time: "09:00",
    order: 0,
  });
}
