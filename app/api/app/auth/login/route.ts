import { ok, failure, setSessionCookie } from "@/lib/api";
import { loginMember } from "@/lib/store";
import type { LoginPayload } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as LoginPayload;
    const member = loginMember(payload);
    await setSessionCookie(member.id);
    return ok(member);
  } catch (error) {
    return failure(error, 400);
  }
}
