import { failure, getSessionIdFromCookies, ok } from "@/lib/api";
import { disconnectStrava } from "@/lib/store";

export async function GET() {
  try {
    const sessionId = await getSessionIdFromCookies();
    disconnectStrava(sessionId);
    return ok({ ok: true });
  } catch (error) {
    return failure(error, 400);
  }
}
