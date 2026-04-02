import type {
  LeagueSnapshot,
  LoginPayload,
  Member,
  PasswordResetPayload,
  RaceClaim,
  RaceClaimPayload,
  RaceEvent,
  RaceEventPayload,
  RegisterPayload,
  StravaActivity,
  StravaProfile,
  UpdateProfilePayload,
} from "@/lib/types";

import {
  DEFAULT_AVATAR,
  MOCK_STRAVA_PROFILE,
  seedMembers,
  seedRaceClaims,
  seedRaceEvents,
} from "@/lib/mock-data";
import { getRacePointsFromModality, parseStravaActivityId, sameDate } from "@/lib/scoring";
import { buildMockStravaActivity, fetchStravaActivityById } from "@/lib/strava";

export const SESSION_COOKIE_NAME = "leones_member_session";

type StravaConnection = {
  athlete: StravaProfile;
  accessToken: string;
  expiresAt: number;
};

type AppStore = {
  members: Member[];
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
      members: clone(seedMembers),
      raceEvents: clone(seedRaceEvents),
      raceClaims: clone(seedRaceClaims),
      stravaConnections: new Map<string, StravaConnection>(),
      pendingStates: new Map<string, { returnTo: string; createdAt: number }>(),
    };
  }

  return store;
}

export function getSnapshot(sessionMemberId: string | null): LeagueSnapshot {
  const appStore = getStore();
  const activeMember = sessionMemberId
    ? appStore.members.find((member) => member.id === sessionMemberId) ?? null
    : null;

  return {
    activeMember: activeMember ? clone(activeMember) : null,
    members: clone(appStore.members),
    raceEvents: clone(appStore.raceEvents),
    raceClaims: clone(appStore.raceClaims),
  };
}

export function findMemberBySession(sessionMemberId: string | null): Member | null {
  if (!sessionMemberId) {
    return null;
  }

  return getStore().members.find((item) => item.id === sessionMemberId) ?? null;
}

function ensureAuthenticated(sessionMemberId: string | null): Member {
  const member = findMemberBySession(sessionMemberId);
  if (!member) {
    throw new Error("Necesitas iniciar sesion para continuar.");
  }

  return member;
}

function ensureAdmin(sessionMemberId: string | null): Member {
  const member = ensureAuthenticated(sessionMemberId);
  if (!member.isAdmin) {
    throw new Error("Solo la administracion puede gestionar eventos.");
  }

  return member;
}

function updateMember(memberId: string, updater: (member: Member) => Member): Member {
  const appStore = getStore();
  const index = appStore.members.findIndex((member) => member.id === memberId);

  if (index === -1) {
    throw new Error("No hemos encontrado ese socio.");
  }

  const updated = updater(appStore.members[index]);
  appStore.members[index] = updated;
  return clone(updated);
}

export function registerMember(payload: RegisterPayload): Member {
  const appStore = getStore();
  const memberNumber = payload.memberNumber.trim().toUpperCase();
  const email = payload.email.trim().toLowerCase();

  if (!/^L-\d{3}$/.test(memberNumber)) {
    throw new Error("El numero de socio debe tener formato L-000.");
  }

  if (memberNumber === "L-000") {
    throw new Error("L-000 queda reservado para administracion.");
  }

  if (appStore.members.some((member) => member.memberNumber === memberNumber)) {
    throw new Error("Ese numero de socio ya existe.");
  }

  if (appStore.members.some((member) => member.email === email)) {
    throw new Error("Ese email ya esta registrado.");
  }

  const firstName = payload.firstName.trim();
  const lastName = payload.lastName.trim();
  const profile = payload.draftStravaProfile ?? null;
  const uploadPhoto = payload.uploadPhoto || DEFAULT_AVATAR;

  const newMember: Member = {
    id: crypto.randomUUID(),
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim(),
    email,
    password: payload.password,
    memberNumber,
    gender: payload.gender,
    city: payload.city.trim(),
    uploadPhoto,
    stravaPhoto: profile?.profileMedium || profile?.profile || DEFAULT_AVATAR,
    photoSource: payload.useStravaPhoto && profile ? "strava" : "upload",
    stravaConnected: Boolean(profile),
    stravaAthleteId: profile?.id ?? null,
    yearKm: profile?.ytdKm ?? 0,
    yearElevation: profile?.ytdElevation ?? 0,
    isAdmin: false,
  };

  appStore.members.push(newMember);
  if (profile) {
    appStore.stravaConnections.set(newMember.id, {
      athlete: profile,
      accessToken: "mock-token",
      expiresAt: Date.now() + 1000 * 60 * 60,
    });
  }

  return clone(newMember);
}

export function loginMember(payload: LoginPayload): Member {
  const email = payload.email.trim().toLowerCase();
  const member = getStore().members.find(
    (item) => item.email === email && item.password === payload.password,
  );

  if (!member) {
    throw new Error("No encontramos un socio con ese email y contrasena.");
  }

  return clone(member);
}

export function updateProfile(sessionMemberId: string | null, payload: UpdateProfilePayload): Member {
  const activeMember = ensureAuthenticated(sessionMemberId);
  const appStore = getStore();
  const email = payload.email.trim().toLowerCase();
  const memberNumber = payload.memberNumber.trim().toUpperCase();

  if (memberNumber && !/^L-\d{3}$/.test(memberNumber)) {
    throw new Error("El numero de socio debe tener formato L-000.");
  }

  if (memberNumber === "L-000" && !activeMember.isAdmin) {
    throw new Error("L-000 queda reservado para administracion.");
  }

  if (appStore.members.some((member) => member.id !== activeMember.id && member.email === email)) {
    throw new Error("Ya existe otro socio con ese email.");
  }

  if (
    appStore.members.some(
      (member) => member.id !== activeMember.id && member.memberNumber === memberNumber,
    )
  ) {
    throw new Error("Ya existe otro socio con ese numero.");
  }

  return updateMember(activeMember.id, (member) => {
    const firstName = payload.firstName.trim();
    const lastName = payload.lastName.trim();

    return {
      ...member,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`.trim(),
      email,
      city: payload.city.trim(),
      memberNumber,
      gender: payload.gender,
      uploadPhoto: payload.uploadPhoto || member.uploadPhoto,
      photoSource: payload.useStravaPhoto && member.stravaConnected ? "strava" : "upload",
    };
  });
}

export function resetPassword(payload: PasswordResetPayload): void {
  const email = payload.email.trim().toLowerCase();
  const memberNumber = payload.memberNumber.trim().toUpperCase();
  const appStore = getStore();
  const member = appStore.members.find(
    (item) => item.email === email && item.memberNumber === memberNumber,
  );

  if (!member) {
    throw new Error("No hemos encontrado un socio con ese email y numero.");
  }

  updateMember(member.id, (current) => ({
    ...current,
    password: payload.newPassword,
  }));
}

export function connectMockStrava(sessionMemberId: string | null): Member {
  const activeMember = ensureAuthenticated(sessionMemberId);
  const profile: StravaProfile = {
    ...MOCK_STRAVA_PROFILE,
    id: activeMember.stravaAthleteId ?? MOCK_STRAVA_PROFILE.id,
    firstname: activeMember.firstName || MOCK_STRAVA_PROFILE.firstname,
    lastname: activeMember.lastName || MOCK_STRAVA_PROFILE.lastname,
    city: activeMember.city || MOCK_STRAVA_PROFILE.city,
  };

  const updated = updateMember(activeMember.id, (member) => ({
    ...member,
    stravaConnected: true,
    stravaAthleteId: profile.id,
    stravaPhoto: profile.profileMedium,
    photoSource: "strava",
    yearKm: profile.ytdKm,
    yearElevation: profile.ytdElevation,
  }));

  getStore().stravaConnections.set(activeMember.id, {
    athlete: profile,
    accessToken: "mock-token",
    expiresAt: Date.now() + 1000 * 60 * 60,
  });

  return updated;
}

export function setStravaConnection(
  sessionMemberId: string | null,
  profile: StravaProfile,
  accessToken: string,
  expiresAt: number,
): Member {
  const activeMember = ensureAuthenticated(sessionMemberId);
  const updated = updateMember(activeMember.id, (member) => ({
    ...member,
    firstName: member.firstName || profile.firstname,
    lastName: member.lastName || profile.lastname,
    fullName: `${member.firstName || profile.firstname} ${member.lastName || profile.lastname}`.trim(),
    city: member.city || profile.city,
    stravaConnected: true,
    stravaAthleteId: profile.id,
    stravaPhoto: profile.profileMedium || profile.profile,
    photoSource: "strava",
    yearKm: profile.ytdKm,
    yearElevation: profile.ytdElevation,
  }));

  getStore().stravaConnections.set(activeMember.id, {
    athlete: profile,
    accessToken,
    expiresAt,
  });

  return updated;
}

export function disconnectStrava(sessionMemberId: string | null): Member {
  const activeMember = ensureAuthenticated(sessionMemberId);
  getStore().stravaConnections.delete(activeMember.id);

  return updateMember(activeMember.id, (member) => ({
    ...member,
    stravaConnected: false,
    stravaAthleteId: null,
    stravaPhoto: DEFAULT_AVATAR,
    photoSource: "upload",
    yearKm: 0,
    yearElevation: 0,
  }));
}

export function getStoredStravaConnection(sessionMemberId: string | null): StravaConnection | null {
  if (!sessionMemberId) {
    return null;
  }

  return getStore().stravaConnections.get(sessionMemberId) ?? null;
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

export function listRaceEvents(): RaceEvent[] {
  return clone(getStore().raceEvents);
}

export function upsertRaceEvent(
  sessionMemberId: string | null,
  payload: RaceEventPayload,
  eventId?: string,
): RaceEvent {
  const admin = ensureAdmin(sessionMemberId);
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

export function deleteRaceEvent(sessionMemberId: string | null, eventId: string): void {
  ensureAdmin(sessionMemberId);
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
  sessionMemberId: string | null,
  payload: RaceClaimPayload,
): Promise<RaceClaim> {
  const member = ensureAuthenticated(sessionMemberId);

  if (!member.stravaConnected) {
    throw new Error("Necesitas tener Strava conectado para validar carreras.");
  }

  const eventItem = getStore().raceEvents.find((event) => event.id === payload.eventId);
  const modality = eventItem?.modalities.find((item) => item.id === payload.modalityId);

  if (!eventItem || !modality) {
    throw new Error("No encontramos la carrera que intentas validar.");
  }

  const existingClaim = getStore().raceClaims.find(
    (claim) => claim.memberId === member.id && claim.eventId === eventItem.id,
  );

  if (existingClaim) {
    throw new Error("Este evento ya esta bloqueado para tu perfil.");
  }

  const activityId = parseStravaActivityId(payload.activityUrl.trim());
  if (!activityId) {
    throw new Error("La URL de Strava no parece valida.");
  }

  const activity = await resolveActivityForClaim(member, modality.id, activityId);

  if (!sameDate(activity.startDateLocal, modality.date)) {
    throw new Error("La fecha de la actividad no coincide con la modalidad seleccionada.");
  }

  if (member.stravaAthleteId && activity.athleteId !== member.stravaAthleteId) {
    throw new Error("La actividad no pertenece a la cuenta de Strava vinculada a este socio.");
  }

  const claim: RaceClaim = {
    id: crypto.randomUUID(),
    memberId: member.id,
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
  sessionMemberId: string | null,
  activityId: string,
): StravaActivity {
  const member = ensureAuthenticated(sessionMemberId);

  if (!member.stravaConnected) {
    throw new Error("No hay sesion de Strava activa.");
  }

  return buildMockStravaActivity(activityId, member, {
    id: "preview",
    name: "Actividad de prueba",
    distanceKm: 12.4,
    elevationGain: 640,
    date: new Date().toISOString().slice(0, 10),
    time: "09:00",
    order: 0,
  });
}
