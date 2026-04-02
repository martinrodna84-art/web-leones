import type { Member, RaceModality, StravaActivity, StravaProfile } from "@/lib/types";

import { MOCK_STRAVA_PROFILE } from "@/lib/mock-data";

const RUN_SPORTS = new Set(["Run", "TrailRun"]);

export function getStravaConfig() {
  return {
    clientId: process.env.STRAVA_CLIENT_ID ?? "",
    clientSecret: process.env.STRAVA_CLIENT_SECRET ?? "",
    redirectUri: process.env.STRAVA_REDIRECT_URI ?? "",
  };
}

export function hasRealStravaConfig(): boolean {
  const { clientId, clientSecret } = getStravaConfig();
  return Boolean(clientId && clientSecret);
}

export function toStravaProfile(member: Member): StravaProfile | null {
  if (!member.stravaConnected || !member.stravaAthleteId) {
    return null;
  }

  return {
    id: member.stravaAthleteId,
    firstname: member.firstName,
    lastname: member.lastName,
    city: member.city,
    profile: member.stravaPhoto,
    profileMedium: member.stravaPhoto,
    ytdKm: member.yearKm,
    ytdElevation: member.yearElevation,
  };
}

export async function exchangeStravaToken(code: string) {
  const { clientId, clientSecret } = getStravaConfig();

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

  return response.json();
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

  const athlete = await response.json();

  return {
    id: athlete.id,
    firstname: athlete.firstname ?? "",
    lastname: athlete.lastname ?? "",
    city: athlete.city ?? "",
    profile: athlete.profile ?? MOCK_STRAVA_PROFILE.profile,
    profileMedium: athlete.profile_medium ?? athlete.profile ?? MOCK_STRAVA_PROFILE.profileMedium,
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

    const activities: Array<Record<string, unknown>> = await response.json();

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

  const activity = await response.json();
  const sportType = String(activity.sport_type ?? activity.type ?? "");

  if (!RUN_SPORTS.has(sportType)) {
    throw new Error("La actividad debe ser de carrera o trail run.");
  }

  return {
    id: String(activity.id),
    name: String(activity.name ?? "Actividad Strava"),
    sportType: sportType as StravaActivity["sportType"],
    athleteId: Number(activity.athlete?.id ?? 0),
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
