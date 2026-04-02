import "server-only";

import { MOCK_STRAVA_PROFILE } from "@/lib/mock-data";
import {
  getCurrentSessionMember,
  getSessionMemberById,
} from "@/lib/member-service";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";
import {
  buildMockStravaActivity,
  deauthorizeStravaAccess,
  exchangeStravaToken,
  fetchStravaActivityById,
  fetchStravaAthlete,
  fetchYtdStats,
  parseStravaScopes,
  refreshStravaToken,
} from "@/lib/strava";
import {
  clearStravaConnectionSecrets,
  getStravaConnectionByAthleteId,
  getStravaConnectionByMemberId,
  markStravaConnectionSynced,
  markStravaWebhookReceived,
  upsertStravaConnection,
} from "@/lib/strava-connections";
import type {
  Member,
  RaceModality,
  SessionMember,
  StravaActivity,
  StravaConnection,
  StravaConnectionStatus,
  StravaProfile,
  StravaWebhookEvent,
} from "@/lib/types";

type MemberProfileUpdate = Database["public"]["Tables"]["member_profiles"]["Update"];

const REQUIRED_SCOPES = ["activity:read_all", "profile:read_all"];
const TOKEN_REFRESH_BUFFER_SECONDS = 10 * 60;
const STRAVA_SYNC_TTL_MS = 60 * 60 * 1000;

function mapSupabaseError(error: unknown, fallback: string): Error {
  const message = error instanceof Error ? error.message : fallback;
  return new Error(message || fallback);
}

function needsSync(lastSyncAt: string | null, force: boolean): boolean {
  if (force || !lastSyncAt) {
    return true;
  }

  return Date.now() - Date.parse(lastSyncAt) >= STRAVA_SYNC_TTL_MS;
}

function resolvePhotoSource(member: SessionMember): SessionMember["photoSource"] {
  if (member.photoSource === "strava") {
    return "strava";
  }

  return member.uploadPhoto ? member.photoSource : "strava";
}

function ensureRequiredScopes(scopes: string[]): void {
  for (const scope of REQUIRED_SCOPES) {
    if (!scopes.includes(scope)) {
      throw new Error("La autorizacion de Strava no concedio todos los permisos requeridos.");
    }
  }
}

async function updateMemberProfileFromStrava(
  memberId: string,
  profile: StravaProfile,
  syncedAt: string,
): Promise<void> {
  const currentMember = await getSessionMemberById(memberId);
  if (!currentMember) {
    throw new Error("No hemos encontrado el socio que intenta sincronizar Strava.");
  }

  const admin = getSupabaseAdminClient();
  const payload: MemberProfileUpdate = {
    first_name: currentMember.firstName || profile.firstname,
    last_name: currentMember.lastName || profile.lastname,
    city: currentMember.city || profile.city || "",
    strava_connected: true,
    strava_athlete_id: profile.id,
    strava_photo: profile.profileMedium || profile.profile || currentMember.stravaPhoto,
    photo_source: resolvePhotoSource(currentMember),
    year_km: profile.ytdKm,
    year_elevation: profile.ytdElevation,
    strava_last_sync_at: syncedAt,
  };

  const { error } = await admin
    .from("member_profiles")
    .update(payload)
    .eq("user_id", memberId);

  if (error) {
    throw mapSupabaseError(error, "No se pudo actualizar el perfil con datos de Strava.");
  }
}

async function clearMemberStravaProfile(memberId: string): Promise<void> {
  const admin = getSupabaseAdminClient();
  const payload: MemberProfileUpdate = {
    strava_connected: false,
    strava_athlete_id: null,
    strava_photo: "",
    photo_source: "upload",
    year_km: 0,
    year_elevation: 0,
    strava_last_sync_at: null,
  };

  const { error } = await admin
    .from("member_profiles")
    .update(payload)
    .eq("user_id", memberId);

  if (error) {
    throw mapSupabaseError(error, "No se pudo limpiar el estado de Strava del socio.");
  }
}

async function buildCurrentStravaProfile(accessToken: string): Promise<StravaProfile> {
  const [athlete, stats] = await Promise.all([
    fetchStravaAthlete(accessToken),
    fetchYtdStats(accessToken),
  ]);

  return {
    ...athlete,
    ytdKm: stats.ytdKm,
    ytdElevation: stats.ytdElevation,
  };
}

async function markConnectionInactive(
  memberId: string,
  status: StravaConnectionStatus,
): Promise<void> {
  await clearStravaConnectionSecrets(memberId, status);
  await clearMemberStravaProfile(memberId);
}

export async function getUsableStravaConnectionForMember(
  memberId: string,
): Promise<StravaConnection | null> {
  const connection = await getStravaConnectionByMemberId(memberId);
  if (!connection || connection.status !== "active") {
    return null;
  }

  if (
    connection.accessToken &&
    connection.accessToken !== "mock-token" &&
    connection.expiresAt > Math.floor(Date.now() / 1000) + TOKEN_REFRESH_BUFFER_SECONDS
  ) {
    return connection;
  }

  if (connection.accessToken === "mock-token") {
    return connection;
  }

  if (!connection.refreshToken) {
    await markConnectionInactive(memberId, "revoked");
    return null;
  }

  try {
    const refreshed = await refreshStravaToken(connection.refreshToken);
    return upsertStravaConnection({
      memberId: connection.memberId,
      athleteId: connection.athleteId,
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken,
      expiresAt: refreshed.expiresAt,
      scopes: connection.scopes,
      status: "active",
      lastSyncAt: connection.lastSyncAt,
      lastWebhookAt: connection.lastWebhookAt,
    });
  } catch {
    await markConnectionInactive(memberId, "revoked");
    return null;
  }
}

export async function syncStravaMemberById(
  memberId: string,
  options?: { force?: boolean },
): Promise<SessionMember | null> {
  const currentMember = await getSessionMemberById(memberId);
  if (!currentMember) {
    return null;
  }

  if (!needsSync(currentMember.stravaLastSyncAt, Boolean(options?.force))) {
    return currentMember;
  }

  const connection = await getUsableStravaConnectionForMember(memberId);
  if (!connection) {
    return getSessionMemberById(memberId);
  }

  if (connection.accessToken === "mock-token") {
    const syncedAt = new Date().toISOString();
    await updateMemberProfileFromStrava(
      memberId,
      {
        ...MOCK_STRAVA_PROFILE,
        id: connection.athleteId ?? MOCK_STRAVA_PROFILE.id,
      },
      syncedAt,
    );
    await markStravaConnectionSynced(memberId, syncedAt);
    return getSessionMemberById(memberId);
  }

  const profile = await buildCurrentStravaProfile(connection.accessToken);
  const syncedAt = new Date().toISOString();

  await upsertStravaConnection({
    memberId,
    athleteId: profile.id,
    accessToken: connection.accessToken,
    refreshToken: connection.refreshToken,
    expiresAt: connection.expiresAt,
    scopes: connection.scopes,
    status: "active",
    lastSyncAt: syncedAt,
    lastWebhookAt: connection.lastWebhookAt,
  });
  await updateMemberProfileFromStrava(memberId, profile, syncedAt);
  await markStravaConnectionSynced(memberId, syncedAt);

  return getSessionMemberById(memberId);
}

export async function maybeSyncCurrentMemberStrava(): Promise<SessionMember | null> {
  const currentMember = await getCurrentSessionMember();
  if (!currentMember?.stravaConnected) {
    return currentMember;
  }

  try {
    return await syncStravaMemberById(currentMember.id);
  } catch {
    return currentMember;
  }
}

export async function completeCurrentMemberStravaAuthorization(
  code: string,
  grantedScope: string | null | undefined,
): Promise<SessionMember> {
  const currentMember = await getCurrentSessionMember();
  if (!currentMember) {
    throw new Error("Necesitas iniciar sesion para enlazar Strava.");
  }

  const scopes = parseStravaScopes(grantedScope);
  ensureRequiredScopes(scopes);

  const tokenExchange = await exchangeStravaToken(code);
  const profile = await buildCurrentStravaProfile(tokenExchange.accessToken);
  const syncedAt = new Date().toISOString();

  await upsertStravaConnection({
    memberId: currentMember.id,
    athleteId: profile.id,
    accessToken: tokenExchange.accessToken,
    refreshToken: tokenExchange.refreshToken,
    expiresAt: tokenExchange.expiresAt,
    scopes,
    status: "active",
    lastSyncAt: syncedAt,
  });
  await updateMemberProfileFromStrava(currentMember.id, profile, syncedAt);

  const updatedMember = await getSessionMemberById(currentMember.id);
  if (!updatedMember) {
    throw new Error("No hemos podido recargar tu perfil tras conectar Strava.");
  }

  return updatedMember;
}

export async function syncCurrentMemberStrava(
  force = false,
): Promise<SessionMember> {
  const currentMember = await getCurrentSessionMember();
  if (!currentMember) {
    throw new Error("Necesitas iniciar sesion para continuar.");
  }
  if (!currentMember.stravaConnected) {
    throw new Error("No hay una cuenta de Strava conectada para este socio.");
  }

  const updatedMember = await syncStravaMemberById(currentMember.id, { force });
  if (!updatedMember) {
    throw new Error("No hemos podido sincronizar el perfil de Strava.");
  }

  return updatedMember;
}

export async function connectMockStrava(): Promise<SessionMember> {
  const currentMember = await getCurrentSessionMember();
  if (!currentMember) {
    throw new Error("Necesitas iniciar sesion para continuar.");
  }

  const profile: StravaProfile = {
    ...MOCK_STRAVA_PROFILE,
    id: currentMember.stravaAthleteId ?? MOCK_STRAVA_PROFILE.id,
    firstname: currentMember.firstName || MOCK_STRAVA_PROFILE.firstname,
    lastname: currentMember.lastName || MOCK_STRAVA_PROFILE.lastname,
    city: currentMember.city || MOCK_STRAVA_PROFILE.city,
  };
  const syncedAt = new Date().toISOString();

  await upsertStravaConnection({
    memberId: currentMember.id,
    athleteId: profile.id,
    accessToken: "mock-token",
    refreshToken: "mock-refresh-token",
    expiresAt: Math.floor(Date.now() / 1000) + 60 * 60,
    scopes: [...REQUIRED_SCOPES],
    status: "active",
    lastSyncAt: syncedAt,
  });
  await updateMemberProfileFromStrava(currentMember.id, profile, syncedAt);

  const updatedMember = await getSessionMemberById(currentMember.id);
  if (!updatedMember) {
    throw new Error("No hemos podido activar el modo mock de Strava.");
  }

  return updatedMember;
}

export async function disconnectCurrentMemberStrava(): Promise<SessionMember> {
  const currentMember = await getCurrentSessionMember();
  if (!currentMember) {
    throw new Error("Necesitas iniciar sesion para continuar.");
  }

  const connection = await getStravaConnectionByMemberId(currentMember.id);

  try {
    if (connection?.accessToken) {
      await deauthorizeStravaAccess(connection.accessToken);
    }
  } catch {
    // Ignore remote revoke failures and keep local cleanup deterministic.
  }

  await markConnectionInactive(currentMember.id, "disconnected");

  const updatedMember = await getSessionMemberById(currentMember.id);
  if (!updatedMember) {
    throw new Error("No hemos podido recargar tu perfil tras desconectar Strava.");
  }

  return updatedMember;
}

export async function getStravaActivityForMember(
  member: Member,
  activityId: string,
  fallbackModality?: RaceModality,
): Promise<StravaActivity> {
  const connection = await getUsableStravaConnectionForMember(member.id);

  if (connection?.accessToken && connection.accessToken !== "mock-token") {
    return fetchStravaActivityById(activityId, connection.accessToken);
  }

  if (connection?.accessToken === "mock-token" && fallbackModality) {
    return buildMockStravaActivity(activityId, member, fallbackModality);
  }

  throw new Error("No hay una conexion activa de Strava para este socio.");
}

export async function handleStravaWebhookEvent(
  event: StravaWebhookEvent,
): Promise<void> {
  const athleteId =
    event.object_type === "athlete" ? event.object_id : event.owner_id;
  if (!athleteId) {
    return;
  }

  const connection = await getStravaConnectionByAthleteId(athleteId);
  if (!connection) {
    return;
  }

  const receivedAt = new Date(event.event_time * 1000).toISOString();
  await markStravaWebhookReceived(connection.memberId, receivedAt);

  if (event.object_type === "athlete" && event.updates?.authorized === "false") {
    await markConnectionInactive(connection.memberId, "revoked");
    return;
  }

  if (connection.status !== "active") {
    return;
  }

  await syncStravaMemberById(connection.memberId, { force: true });
}
