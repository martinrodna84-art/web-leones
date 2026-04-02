import { cache } from "react";

import { getCurrentSessionMember, listLeagueMembers } from "@/lib/member-service";
import { getSnapshot } from "@/lib/store";
import { maybeSyncCurrentMemberStrava } from "@/lib/strava-sync";

const getCachedSessionMember = cache(async () => getCurrentSessionMember());
const getCachedLeagueMembers = cache(async () => listLeagueMembers());

export async function getSessionMember() {
  return getCachedSessionMember();
}

export async function getLeagueSnapshotForRequest() {
  const activeMember = await maybeSyncCurrentMemberStrava();
  const members = await getCachedLeagueMembers();

  return getSnapshot(activeMember, members);
}
