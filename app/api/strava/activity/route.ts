import { failure, ok } from "@/lib/api";
import { getCurrentSessionMember } from "@/lib/member-service";
import { getActivityForCurrentMember, getStoredStravaConnection } from "@/lib/store";
import { fetchStravaActivityById } from "@/lib/strava";

export async function GET(request: Request) {
  try {
    const member = await getCurrentSessionMember();
    const url = new URL(request.url);
    const activityId = url.searchParams.get("id");

    if (!activityId) {
      return failure(new Error("Falta el identificador de actividad."), 400);
    }

    const connection = getStoredStravaConnection(member?.id ?? null);
    if (connection && connection.accessToken !== "mock-token") {
      return ok(await fetchStravaActivityById(activityId, connection.accessToken));
    }

    return ok(getActivityForCurrentMember(member, activityId));
  } catch (error) {
    return failure(error, 400);
  }
}
