import { failure, ok } from "@/lib/api";
import {
  getCurrentSessionMember,
  updateCurrentMemberProfile,
} from "@/lib/member-service";
import type { UpdateProfilePayload } from "@/lib/types";

export async function GET() {
  try {
    return ok(await getCurrentSessionMember());
  } catch (error) {
    return failure(error, 400);
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as UpdateProfilePayload;
    const member = await updateCurrentMemberProfile(payload);
    return ok(member);
  } catch (error) {
    return failure(error, 400);
  }
}
