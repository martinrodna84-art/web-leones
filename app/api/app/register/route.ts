import { ok, failure, setSessionCookie } from "@/lib/api";
import { registerMember } from "@/lib/store";
import type { RegisterPayload } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as RegisterPayload;
    const member = registerMember(payload);
    await setSessionCookie(member.id);
    return ok(member);
  } catch (error) {
    return failure(error, 400);
  }
}
