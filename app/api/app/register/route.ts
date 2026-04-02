import { failure, ok } from "@/lib/api";
import { registerMember } from "@/lib/member-service";
import type { RegisterPayload } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as RegisterPayload;
    const member = await registerMember(payload);
    return ok(member);
  } catch (error) {
    return failure(error, 400);
  }
}
