import type { Member } from "@/lib/types";

import { DEFAULT_AVATAR } from "@/lib/mock-data";

export function getDisplayName(member: Pick<Member, "fullName" | "firstName" | "lastName">): string {
  if (member.fullName) {
    return member.fullName;
  }

  return `${member.firstName || ""} ${member.lastName || ""}`.trim();
}

export function resolvePhoto(member: Pick<Member, "photoSource" | "stravaConnected" | "stravaPhoto" | "uploadPhoto">): string {
  return member.photoSource === "strava" && member.stravaConnected
    ? member.stravaPhoto || DEFAULT_AVATAR
    : member.uploadPhoto || DEFAULT_AVATAR;
}
