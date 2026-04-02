import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";
import type { StravaConnection, StravaConnectionStatus } from "@/lib/types";

type StravaConnectionRow = Database["public"]["Tables"]["strava_connections"]["Row"];

type UpsertStravaConnectionInput = {
  memberId: string;
  athleteId: number | null;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scopes: string[];
  status: StravaConnectionStatus;
  lastSyncAt?: string | null;
  lastWebhookAt?: string | null;
};

function mapConnectionRow(row: StravaConnectionRow): StravaConnection {
  return {
    memberId: row.member_id,
    athleteId: row.athlete_id,
    accessToken: row.access_token,
    refreshToken: row.refresh_token,
    expiresAt: row.expires_at,
    scopes: row.scopes ?? [],
    status: (row.status as StravaConnectionStatus) || "disconnected",
    lastSyncAt: row.last_sync_at,
    lastWebhookAt: row.last_webhook_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapConnectionError(error: unknown, fallback: string): Error {
  const message = error instanceof Error ? error.message : fallback;

  if (
    message.includes("strava_connections_athlete_id_key") ||
    message.includes("duplicate key value")
  ) {
    return new Error("Esa cuenta de Strava ya esta enlazada a otro socio.");
  }

  return new Error(message || fallback);
}

export async function getStravaConnectionByMemberId(
  memberId: string,
): Promise<StravaConnection | null> {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("strava_connections")
    .select("*")
    .eq("member_id", memberId)
    .maybeSingle();

  if (error) {
    throw mapConnectionError(error, "No se pudo leer la conexion de Strava.");
  }

  return data ? mapConnectionRow(data) : null;
}

export async function getStravaConnectionByAthleteId(
  athleteId: number,
): Promise<StravaConnection | null> {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("strava_connections")
    .select("*")
    .eq("athlete_id", athleteId)
    .maybeSingle();

  if (error) {
    throw mapConnectionError(error, "No se pudo localizar la conexion de Strava.");
  }

  return data ? mapConnectionRow(data) : null;
}

export async function upsertStravaConnection(
  input: UpsertStravaConnectionInput,
): Promise<StravaConnection> {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("strava_connections")
    .upsert(
      {
        member_id: input.memberId,
        athlete_id: input.athleteId,
        access_token: input.accessToken,
        refresh_token: input.refreshToken,
        expires_at: input.expiresAt,
        scopes: input.scopes,
        status: input.status,
        last_sync_at: input.lastSyncAt ?? null,
        last_webhook_at: input.lastWebhookAt ?? null,
      },
      {
        onConflict: "member_id",
      },
    )
    .select("*")
    .single();

  if (error) {
    throw mapConnectionError(error, "No se pudo guardar la conexion de Strava.");
  }

  return mapConnectionRow(data);
}

export async function updateStravaConnectionStatus(
  memberId: string,
  status: StravaConnectionStatus,
): Promise<void> {
  const admin = getSupabaseAdminClient();
  const { error } = await admin
    .from("strava_connections")
    .update({
      status,
    })
    .eq("member_id", memberId);

  if (error) {
    throw mapConnectionError(error, "No se pudo actualizar el estado de Strava.");
  }
}

export async function clearStravaConnectionSecrets(
  memberId: string,
  status: StravaConnectionStatus,
): Promise<void> {
  const admin = getSupabaseAdminClient();
  const { error } = await admin
    .from("strava_connections")
    .update({
      access_token: "",
      refresh_token: "",
      expires_at: 0,
      scopes: [],
      status,
      last_sync_at: null,
    })
    .eq("member_id", memberId);

  if (error) {
    throw mapConnectionError(error, "No se pudo limpiar la conexion de Strava.");
  }
}

export async function markStravaConnectionSynced(
  memberId: string,
  syncedAt: string,
): Promise<void> {
  const admin = getSupabaseAdminClient();
  const { error } = await admin
    .from("strava_connections")
    .update({
      last_sync_at: syncedAt,
      status: "active",
    })
    .eq("member_id", memberId);

  if (error) {
    throw mapConnectionError(error, "No se pudo registrar la sincronizacion de Strava.");
  }
}

export async function markStravaWebhookReceived(
  memberId: string,
  receivedAt: string,
): Promise<void> {
  const admin = getSupabaseAdminClient();
  const { error } = await admin
    .from("strava_connections")
    .update({
      last_webhook_at: receivedAt,
    })
    .eq("member_id", memberId);

  if (error) {
    throw mapConnectionError(error, "No se pudo registrar el webhook de Strava.");
  }
}
