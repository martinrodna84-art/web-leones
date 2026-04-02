import { failure, ok } from "@/lib/api";
import { getCurrentSessionMember } from "@/lib/member-service";
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
    const payload = (await request.json()) as RaceEventPayload;
    const member = await getCurrentSessionMember();
    return ok(upsertRaceEvent(member, payload));
  } catch (error) {
    return failure(error, 400);
  }
}
