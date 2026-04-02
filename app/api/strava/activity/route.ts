import { failure, ok } from "@/lib/api";
import { getCurrentSessionMember } from "@/lib/member-service";
import { getActivityForCurrentMember } from "@/lib/store";

export async function GET(request: Request) {
  try {
    const member = await getCurrentSessionMember();
    const url = new URL(request.url);
    const activityId = url.searchParams.get("id");

    if (!activityId) {
      return failure(new Error("Falta el identificador de actividad."), 400);
    }

    return ok(await getActivityForCurrentMember(member, activityId));
  } catch (error) {
    return failure(error, 400);
  }
}
