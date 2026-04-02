import { failure, ok } from "@/lib/api";
import { resetMemberPassword } from "@/lib/member-service";
import type { PasswordResetPayload } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as PasswordResetPayload;
    await resetMemberPassword(payload);
    return ok({ ok: true });
  } catch (error) {
    return failure(error, 400);
  }
}
