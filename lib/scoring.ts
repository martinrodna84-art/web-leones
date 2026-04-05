import {
  getCurrentLeaguePeriodBoundaries,
  isDateKeyInLeaguePeriod,
  isTimestampInLeaguePeriod,
} from "@/lib/league-periods";
import type {
  GeneralBreakdown,
  LeagueGenderFilter,
  LeagueStatsPeriod,
  LeaderboardRow,
  Member,
  RaceClaim,
  RaceEvent,
  RaceModality,
} from "@/lib/types";

type MemberStats = {
  km: number;
  elevation: number;
};

function getPeriodStats(member: Member, period: LeagueStatsPeriod): MemberStats {
  const lastSyncTimestamp = member.stravaLastSyncAt ? Date.parse(member.stravaLastSyncAt) : NaN;
  const boundaries = getCurrentLeaguePeriodBoundaries();

  if (period === "week") {
    if (!Number.isFinite(lastSyncTimestamp) || !isTimestampInLeaguePeriod(lastSyncTimestamp, "week", boundaries)) {
      return {
        km: 0,
        elevation: 0,
      };
    }

    return {
      km: member.weekKm,
      elevation: member.weekElevation,
    };
  }

  if (period === "month") {
    if (!Number.isFinite(lastSyncTimestamp) || !isTimestampInLeaguePeriod(lastSyncTimestamp, "month", boundaries)) {
      return {
        km: 0,
        elevation: 0,
      };
    }

    return {
      km: member.monthKm,
      elevation: member.monthElevation,
    };
  }

  return {
    km: member.yearKm,
    elevation: member.yearElevation,
  };
}

function getRaceEventLookup(raceEvents: RaceEvent[]) {
  return new Map(raceEvents.map((eventItem) => [eventItem.id, eventItem]));
}

function getClaimDateKey(claim: RaceClaim, eventLookup: Map<string, RaceEvent>): string {
  const eventItem = eventLookup.get(claim.eventId);
  const modality = eventItem?.modalities.find((item) => item.id === claim.modalityId);

  return modality?.date || claim.verifiedAt.slice(0, 10);
}

function getPeriodRaceClaims(
  raceClaims: RaceClaim[],
  raceEvents: RaceEvent[],
  memberId: string,
  period: LeagueStatsPeriod,
): RaceClaim[] {
  const eventLookup = getRaceEventLookup(raceEvents);
  const boundaries = getCurrentLeaguePeriodBoundaries();

  return raceClaims.filter((claim) => {
    if (claim.memberId !== memberId) {
      return false;
    }

    return isDateKeyInLeaguePeriod(getClaimDateKey(claim, eventLookup), period, boundaries);
  });
}

export function getKmPoints(km: number): number {
  return Math.floor(km);
}

export function getElevationPoints(elevationGain: number): number {
  return Math.floor(elevationGain / 100) * 10;
}

export function getRacePointsFromModality(modality: RaceModality): number {
  return getKmPoints(modality.distanceKm) + getElevationPoints(modality.elevationGain);
}

export function getMembersByGender(members: Member[], gender: LeagueGenderFilter): Member[] {
  return members.filter((member) => {
    if (!member.stravaConnected) {
      return false;
    }

    if (gender === "mixed") {
      return true;
    }

    return member.gender === gender;
  });
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
  period: LeagueStatsPeriod,
): GeneralBreakdown {
  const stats = getPeriodStats(member, period);
  const memberClaims = getPeriodRaceClaims(raceClaims, raceEvents, member.id, period);
  const eventLookup = getRaceEventLookup(raceEvents);

  return {
    devoraKmPoints: getKmPoints(stats.km),
    devoraElevationPoints: getElevationPoints(stats.elevation),
    racePoints: memberClaims.reduce((sum, claim) => sum + claim.points, 0),
    races: memberClaims.map((claim) => ({
      name: eventLookup.get(claim.eventId)?.name ?? "Carrera validada",
      points: claim.points,
    })),
  };
}

export function getGeneralRanking(
  members: Member[],
  raceEvents: RaceEvent[],
  raceClaims: RaceClaim[],
  gender: LeagueGenderFilter,
  period: LeagueStatsPeriod,
): LeaderboardRow[] {
  return getMembersByGender(members, gender)
    .map((member) => {
      const stats = getPeriodStats(member, period);
      const kmPoints = getKmPoints(stats.km);
      const elevationPoints = getElevationPoints(stats.elevation);
      const racePoints = getPeriodRaceClaims(raceClaims, raceEvents, member.id, period).reduce(
        (sum, claim) => sum + claim.points,
        0,
      );

      return {
        ...member,
        metricLabel: `${formatNumber(stats.km, 1)} km / ${formatInteger(stats.elevation)} m+ / ${formatInteger(racePoints)} pts`,
        points: kmPoints + elevationPoints + racePoints,
      };
    })
    .sort((left, right) => right.points - left.points);
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
