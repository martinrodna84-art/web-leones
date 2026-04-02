import { failure, getSessionIdFromCookies, ok } from "@/lib/api";
import { listRaceEvents, upsertRaceEvent } from "@/lib/store";
import type { RaceEventPayload } from "@/lib/types";

export async function GET() {
  try {
    return ok(listRaceEvents());
  } catch (error) {
    return failure(error, 400);
  }
}

export async function POST(request: Request) {
  try {
    const sessionId = await getSessionIdFromCookies();
    const payload = (await request.json()) as RaceEventPayload;
    return ok(upsertRaceEvent(sessionId, payload));
  } catch (error) {
    return failure(error, 400);
  }
}
