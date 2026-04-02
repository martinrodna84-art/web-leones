import { failure, ok } from "@/lib/api";
import { disconnectCurrentMemberStrava } from "@/lib/strava-sync";

export async function GET() {
  try {
    await disconnectCurrentMemberStrava();
    return ok({ ok: true });
  } catch (error) {
    return failure(error, 400);
  }
}
