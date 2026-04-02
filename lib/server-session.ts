import { cache } from "react";

import { getCurrentSessionMember, listLeagueMembers } from "@/lib/member-service";
import { getSnapshot } from "@/lib/store";

const getCachedSessionMember = cache(async () => getCurrentSessionMember());
const getCachedLeagueMembers = cache(async () => listLeagueMembers());

export async function getSessionMember() {
  return getCachedSessionMember();
}

export async function getLeagueSnapshotForRequest() {
  const [activeMember, members] = await Promise.all([
    getCachedSessionMember(),
    getCachedLeagueMembers(),
  ]);

  return getSnapshot(activeMember, members);
}
