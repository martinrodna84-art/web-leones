import { failure, ok } from "@/lib/api";
import { syncCurrentMemberStrava } from "@/lib/strava-sync";

export async function POST() {
  try {
    return ok(await syncCurrentMemberStrava(true));
  } catch (error) {
    return failure(error, 400);
  }
}
