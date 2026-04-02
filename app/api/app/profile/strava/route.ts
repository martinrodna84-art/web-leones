import { failure, ok } from "@/lib/api";
import {
  connectMockStrava,
  disconnectCurrentMemberStrava,
} from "@/lib/member-service";

export async function POST() {
  try {
    return ok(await connectMockStrava());
  } catch (error) {
    return failure(error, 400);
  }
}

export async function DELETE() {
  try {
    return ok(await disconnectCurrentMemberStrava());
  } catch (error) {
    return failure(error, 400);
  }
}
