import { failure, ok } from "@/lib/api";
import { getCurrentSessionMember } from "@/lib/member-service";
import { createRaceClaim } from "@/lib/store";
import type { RaceClaimPayload } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as RaceClaimPayload;
    const member = await getCurrentSessionMember();
    const claim = await createRaceClaim(member, payload);
    return ok(claim);
  } catch (error) {
    return failure(error, 400);
  }
}
