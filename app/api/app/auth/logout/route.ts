import { failure, ok } from "@/lib/api";
import { logoutMember } from "@/lib/member-service";

export async function POST() {
  try {
    await logoutMember();
    return ok({ ok: true });
  } catch (error) {
    return failure(error, 400);
  }
}
