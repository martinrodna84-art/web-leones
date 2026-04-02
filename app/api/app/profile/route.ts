import { failure, getSessionIdFromCookies, ok } from "@/lib/api";
import { getSnapshot, updateProfile } from "@/lib/store";
import type { UpdateProfilePayload } from "@/lib/types";

export async function GET() {
  try {
    const sessionId = await getSessionIdFromCookies();
    return ok(getSnapshot(sessionId).activeMember);
  } catch (error) {
    return failure(error, 400);
  }
}

export async function PATCH(request: Request) {
  try {
    const sessionId = await getSessionIdFromCookies();
    const payload = (await request.json()) as UpdateProfilePayload;
    const member = updateProfile(sessionId, payload);
    return ok(member);
  } catch (error) {
    return failure(error, 400);
  }
}
