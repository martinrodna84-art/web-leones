import { failure, ok } from "@/lib/api";
import { loginMember } from "@/lib/member-service";
import type { LoginPayload } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as LoginPayload;
    const member = await loginMember(payload.email, payload.password);
    return ok(member);
  } catch (error) {
    return failure(error, 400);
  }
}
