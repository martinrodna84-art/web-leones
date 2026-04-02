import { failure, getSessionIdFromCookies, ok } from "@/lib/api";
import { deleteRaceEvent, upsertRaceEvent } from "@/lib/store";
import type { RaceEventPayload } from "@/lib/types";

export async function PATCH(request: Request, context: RouteContext<"/api/app/race-events/[eventId]">) {
  try {
    const sessionId = await getSessionIdFromCookies();
    const payload = (await request.json()) as RaceEventPayload;
    const { eventId } = await context.params;
    return ok(upsertRaceEvent(sessionId, payload, eventId));
  } catch (error) {
    return failure(error, 400);
  }
}

export async function DELETE(_request: Request, context: RouteContext<"/api/app/race-events/[eventId]">) {
  try {
    const sessionId = await getSessionIdFromCookies();
    const { eventId } = await context.params;
    deleteRaceEvent(sessionId, eventId);
    return ok({ ok: true });
  } catch (error) {
    return failure(error, 400);
  }
}
