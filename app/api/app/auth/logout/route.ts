import { clearSessionCookie, failure, ok } from "@/lib/api";

export async function POST() {
  try {
    await clearSessionCookie();
    return ok({ ok: true });
  } catch (error) {
    return failure(error, 400);
  }
}
