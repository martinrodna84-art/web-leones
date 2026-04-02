import type {
  GeneralBreakdown,
  Gender,
  LeaderboardRow,
  Member,
  RaceClaim,
  RaceEvent,
  RaceModality,
} from "@/lib/types";

export function getKmPoints(km: number): number {
  return Math.floor(km);
}

export function getElevationPoints(elevationGain: number): number {
  return Math.floor(elevationGain / 100) * 10;
}

export function getRacePointsFromModality(modality: RaceModality): number {
  return getKmPoints(modality.distanceKm) + getElevationPoints(modality.elevationGain);
}

export function getMembersByGender(members: Member[], gender: Gender): Member[] {
  return members.filter((member) => member.gender === gender && member.stravaConnected);
}

export function getTotalRacePoints(claims: RaceClaim[], memberId: string): number {
  return claims
    .filter((claim) => claim.memberId === memberId)
    .reduce((sum, claim) => sum + claim.points, 0);
}

export function getClaimedEventIds(claims: RaceClaim[], memberId: string): Set<string> {
  return new Set(claims.filter((claim) => claim.memberId === memberId).map((claim) => claim.eventId));
}

export function getGeneralBreakdown(
  member: Member,
  raceEvents: RaceEvent[],
  raceClaims: RaceClaim[],
): GeneralBreakdown {
  const memberClaims = raceClaims.filter((claim) => claim.memberId === member.id);

  return {
    kmPoints: getKmPoints(member.yearKm),
    elevationPoints: getElevationPoints(member.yearElevation),
    races: memberClaims.map((claim) => {
      const eventItem = raceEvents.find((eventItem) => eventItem.id === claim.eventId);
      return {
        name: eventItem?.name ?? "Carrera validada",
        points: claim.points,
      };
    }),
  };
}

export function getGeneralRanking(
  members: Member[],
  raceClaims: RaceClaim[],
  gender: Gender,
): LeaderboardRow[] {
  return getMembersByGender(members, gender)
    .map((member) => {
      const kmPoints = getKmPoints(member.yearKm);
      const elevationPoints = getElevationPoints(member.yearElevation);
      const racePoints = getTotalRacePoints(raceClaims, member.id);

      return {
        ...member,
        metricLabel: `${formatNumber(member.yearKm, 1)} km + ${formatInteger(member.yearElevation)} m+ + ${formatInteger(racePoints)} pts carreras`,
        points: kmPoints + elevationPoints + racePoints,
      };
    })
    .sort((left, right) => right.points - left.points);
}

export function getKmRanking(members: Member[], gender: Gender): LeaderboardRow[] {
  return getMembersByGender(members, gender)
    .map((member) => ({
      ...member,
      metricLabel: `${formatNumber(member.yearKm, 1)} km`,
      points: getKmPoints(member.yearKm),
      value: member.yearKm,
    }))
    .sort((left, right) => (right.value ?? 0) - (left.value ?? 0));
}

export function getElevationRanking(members: Member[], gender: Gender): LeaderboardRow[] {
  return getMembersByGender(members, gender)
    .map((member) => ({
      ...member,
      metricLabel: `${formatInteger(member.yearElevation)} m+`,
      points: getElevationPoints(member.yearElevation),
      value: member.yearElevation,
    }))
    .sort((left, right) => (right.value ?? 0) - (left.value ?? 0));
}

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatInteger(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(dateValue: string): string {
  if (!dateValue) {
    return "";
  }

  const [year, month, day] = dateValue.split("-");
  return `${day}/${month}/${year}`;
}

export function parseStravaActivityId(value: string): string {
  const match = value.match(/activities\/(\d+)/i);
  return match ? match[1] : "";
}

export function sameDate(isoDate: string, expectedDate: string): boolean {
  if (!isoDate || !expectedDate) {
    return false;
  }

  return isoDate.slice(0, 10) === expectedDate;
}

export function getRankIcon(position: number): string {
  if (position === 1) return "🏆";
  if (position === 2) return "🥈";
  if (position === 3) return "🥉";
  if (position === 4) return "🎫";
  return "•";
}
