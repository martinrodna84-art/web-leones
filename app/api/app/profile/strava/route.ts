import { failure, getSessionIdFromCookies, ok } from "@/lib/api";
import { connectMockStrava, disconnectStrava } from "@/lib/store";

export async function POST() {
  try {
    const sessionId = await getSessionIdFromCookies();
    return ok(connectMockStrava(sessionId));
  } catch (error) {
    return failure(error, 400);
  }
}

export async function DELETE() {
  try {
    const sessionId = await getSessionIdFromCookies();
    return ok(disconnectStrava(sessionId));
  } catch (error) {
    return failure(error, 400);
  }
}
