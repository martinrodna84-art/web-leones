import { failure, getSessionIdFromCookies, ok } from "@/lib/api";
import { getSnapshot } from "@/lib/store";
import { toStravaProfile } from "@/lib/strava";

export async function GET() {
  try {
    const sessionId = await getSessionIdFromCookies();
    const member = getSnapshot(sessionId).activeMember;

    if (!member?.stravaConnected) {
      return failure(new Error("No hay sesion de Strava activa."), 401);
    }

    const profile = toStravaProfile(member);
    if (!profile) {
      return failure(new Error("No hemos podido reconstruir el perfil de Strava."), 400);
    }

    return ok(profile);
  } catch (error) {
    return failure(error, 400);
  }
}
