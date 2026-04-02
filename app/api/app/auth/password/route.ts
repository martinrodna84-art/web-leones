import { failure, ok } from "@/lib/api";
import { resetPassword } from "@/lib/store";
import type { PasswordResetPayload } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as PasswordResetPayload;
    resetPassword(payload);
    return ok({ ok: true });
  } catch (error) {
    return failure(error, 400);
  }
}
