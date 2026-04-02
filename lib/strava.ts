import type {
  Member,
  RaceModality,
  StravaActivity,
  StravaProfile,
  StravaTokenExchange,
} from "@/lib/types";

import { MOCK_STRAVA_PROFILE } from "@/lib/mock-data";
import { getStravaEnv } from "@/lib/supabase/env";

const RUN_SPORTS = new Set(["Run", "TrailRun"]);

function ensureStravaConfig() {
  const config = getStravaEnv();

  if (!config.clientId || !config.clientSecret) {
    throw new Error("Faltan las credenciales reales de Strava.");
  }

  return config;
}

function normalizeTokenResponse(payload: Record<string, unknown>): StravaTokenExchange {
  return {
    accessToken: String(payload.access_token ?? ""),
    refreshToken: String(payload.refresh_token ?? ""),
    expiresAt: Number(payload.expires_at ?? 0),
    expiresIn: Number(payload.expires_in ?? 0),
  };
}

export function getStravaConfig() {
  return getStravaEnv();
}

export function hasRealStravaConfig(): boolean {
  const { clientId, clientSecret } = getStravaConfig();
  return Boolean(clientId && clientSecret);
}

export function hasStravaWebhookConfig(): boolean {
  return Boolean(getStravaConfig().webhookVerifyToken);
}

export function parseStravaScopes(value: string | null | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((scope) => scope.trim())
    .filter(Boolean);
}

export function toStravaProfile(member: Member): StravaProfile | null {
  if (!member.stravaConnected || !member.stravaAthleteId) {
    return null;
  }

  return {
    id: member.stravaAthleteId,
    username: member.memberNumber.toLowerCase(),
    firstname: member.firstName,
    lastname: member.lastName,
    city: member.city,
    state: "",
    country: "",
    profile: member.stravaPhoto,
    profileMedium: member.stravaPhoto,
    ytdKm: member.yearKm,
    ytdElevation: member.yearElevation,
  };
}

export async function exchangeStravaToken(
  code: string,
): Promise<StravaTokenExchange> {
  const { clientId, clientSecret } = ensureStravaConfig();

  const response = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudo intercambiar el token con Strava.");
  }

  return normalizeTokenResponse((await response.json()) as Record<string, unknown>);
}

export async function refreshStravaToken(
  refreshToken: string,
): Promise<StravaTokenExchange> {
  const { clientId, clientSecret } = ensureStravaConfig();

  const response = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudo refrescar el token de Strava.");
  }

  return normalizeTokenResponse((await response.json()) as Record<string, unknown>);
}

export async function deauthorizeStravaAccess(accessToken: string): Promise<void> {
  if (!accessToken || accessToken === "mock-token") {
    return;
  }

  await fetch("https://www.strava.com/oauth/deauthorize", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      access_token: accessToken,
    }),
    cache: "no-store",
  });
}

export async function fetchStravaAthlete(accessToken: string): Promise<StravaProfile> {
  const response = await fetch("https://www.strava.com/api/v3/athlete", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudo leer el atleta conectado en Strava.");
  }

  const athlete = (await response.json()) as Record<string, unknown>;

  return {
    id: Number(athlete.id ?? 0),
    username: String(athlete.username ?? ""),
    firstname: String(athlete.firstname ?? ""),
    lastname: String(athlete.lastname ?? ""),
    city: String(athlete.city ?? ""),
    state: String(athlete.state ?? ""),
    country: String(athlete.country ?? ""),
    profile: String(athlete.profile ?? MOCK_STRAVA_PROFILE.profile),
    profileMedium: String(
      athlete.profile_medium ?? athlete.profile ?? MOCK_STRAVA_PROFILE.profileMedium,
    ),
    ytdKm: 0,
    ytdElevation: 0,
  };
}

export async function fetchYtdStats(accessToken: string): Promise<Pick<StravaProfile, "ytdKm" | "ytdElevation">> {
  let distance = 0;
  let elevation = 0;
  let page = 1;
  const current = new Date();
  const yearStart = new Date(Date.UTC(current.getUTCFullYear(), 0, 1, 0, 0, 0));

  while (true) {
    const params = new URLSearchParams({
      after: String(Math.floor(yearStart.getTime() / 1000)),
      page: String(page),
      per_page: "200",
    });

    const response = await fetch(`https://www.strava.com/api/v3/athlete/activities?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("No se pudo calcular el acumulado anual en Strava.");
    }

    const activities = (await response.json()) as Array<Record<string, unknown>>;

    if (!activities.length) {
      break;
    }

    for (const activity of activities) {
      const sportType = String(activity.sport_type ?? activity.type ?? "");
      if (RUN_SPORTS.has(sportType)) {
        distance += Number(activity.distance ?? 0);
        elevation += Number(activity.total_elevation_gain ?? 0);
      }
    }

    if (activities.length < 200) {
      break;
    }

    page += 1;
  }

  return {
    ytdKm: Math.round((distance / 1000) * 10) / 10,
    ytdElevation: Math.round(elevation),
  };
}

export async function fetchStravaActivityById(
  activityId: string,
  accessToken: string,
): Promise<StravaActivity> {
  const response = await fetch(`https://www.strava.com/api/v3/activities/${activityId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudo leer esa actividad en Strava.");
  }

  const activity = (await response.json()) as Record<string, unknown>;
  const sportType = String(activity.sport_type ?? activity.type ?? "");

  if (!RUN_SPORTS.has(sportType)) {
    throw new Error("La actividad debe ser de carrera o trail run.");
  }

  return {
    id: String(activity.id ?? activityId),
    name: String(activity.name ?? "Actividad Strava"),
    sportType: sportType as StravaActivity["sportType"],
    athleteId: Number((activity.athlete as { id?: number } | undefined)?.id ?? 0),
    distance: Number(activity.distance ?? 0),
    elevationGain: Number(activity.total_elevation_gain ?? 0),
    startDate: String(activity.start_date ?? ""),
    startDateLocal: String(activity.start_date_local ?? activity.start_date ?? ""),
  };
}

export function buildMockStravaActivity(
  activityId: string,
  member: Member,
  modality: RaceModality,
): StravaActivity {
  return {
    id: activityId,
    name: `${modality.name} · Validacion mock`,
    sportType: "TrailRun",
    athleteId: member.stravaAthleteId ?? MOCK_STRAVA_PROFILE.id,
    distance: modality.distanceKm * 1000,
    elevationGain: modality.elevationGain,
    startDate: `${modality.date}T${modality.time}:00.000Z`,
    startDateLocal: `${modality.date}T${modality.time}:00.000Z`,
  };
}
