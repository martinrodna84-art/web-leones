import { cookies } from "next/headers";

import { findMemberBySession, getSnapshot, SESSION_COOKIE_NAME } from "@/lib/store";

export async function getSessionMemberId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function getSessionMember() {
  return findMemberBySession(await getSessionMemberId());
}

export async function getLeagueSnapshotForRequest() {
  return getSnapshot(await getSessionMemberId());
}
