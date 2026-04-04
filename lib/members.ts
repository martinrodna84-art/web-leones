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

export function hasCustomPhoto(
  member: Pick<Member, "photoSource" | "stravaConnected" | "stravaPhoto" | "uploadPhoto">,
): boolean {
  if (member.photoSource === "strava" && member.stravaConnected) {
    return Boolean(member.stravaPhoto && member.stravaPhoto !== DEFAULT_AVATAR);
  }

  return Boolean(member.uploadPhoto && member.uploadPhoto !== DEFAULT_AVATAR);
}

export function getMemberInitials(
  member: Pick<Member, "fullName" | "firstName" | "lastName">,
): string {
  const words = getDisplayName(member)
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean);

  return words
    .slice(0, 2)
    .map((word) => Array.from(word)[0]?.toUpperCase() || "")
    .join("") || "LL";
}
