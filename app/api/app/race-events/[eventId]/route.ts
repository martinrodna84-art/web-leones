import { failure, ok } from "@/lib/api";
import { getCurrentSessionMember } from "@/lib/member-service";
import { deleteRaceEvent, upsertRaceEvent } from "@/lib/store";
import type { RaceEventPayload } from "@/lib/types";

export async function PATCH(request: Request, context: RouteContext<"/api/app/race-events/[eventId]">) {
  try {
    const payload = (await request.json()) as RaceEventPayload;
    const { eventId } = await context.params;
    const member = await getCurrentSessionMember();
    return ok(upsertRaceEvent(member, payload, eventId));
  } catch (error) {
    return failure(error, 400);
  }
}

export async function DELETE(_request: Request, context: RouteContext<"/api/app/race-events/[eventId]">) {
  try {
    const { eventId } = await context.params;
    const member = await getCurrentSessionMember();
    deleteRaceEvent(member, eventId);
    return ok({ ok: true });
  } catch (error) {
    return failure(error, 400);
  }
}
