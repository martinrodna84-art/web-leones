import { failure, getSessionIdFromCookies, ok } from "@/lib/api";
import { createRaceClaim } from "@/lib/store";
import type { RaceClaimPayload } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const sessionId = await getSessionIdFromCookies();
    const payload = (await request.json()) as RaceClaimPayload;
    const claim = await createRaceClaim(sessionId, payload);
    return ok(claim);
  } catch (error) {
    return failure(error, 400);
  }
}
