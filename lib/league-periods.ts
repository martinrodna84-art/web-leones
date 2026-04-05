import type { LeagueStatsPeriod } from "@/lib/types";

const LEAGUE_TIME_ZONE = "Europe/Madrid";

const datePartsFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: LEAGUE_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  weekday: "short",
});

const timeZoneOffsetFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: LEAGUE_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const weekdayIndexMap: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
};

type LeagueDateParts = {
  year: number;
  month: number;
  day: number;
  weekday: string;
};

export type LeaguePeriodBoundaries = {
  yearStartMs: number;
  monthStartMs: number;
  weekStartMs: number;
  yearStartDateKey: string;
  monthStartDateKey: string;
  weekStartDateKey: string;
};

function getDatePartsMap(parts: Intl.DateTimeFormatPart[]) {
  const values = new Map<string, string>();

  for (const part of parts) {
    if (part.type !== "literal") {
      values.set(part.type, part.value);
    }
  }

  return values;
}

function getLeagueDateParts(date: Date): LeagueDateParts {
  const values = getDatePartsMap(datePartsFormatter.formatToParts(date));

  return {
    year: Number(values.get("year") ?? 0),
    month: Number(values.get("month") ?? 0),
    day: Number(values.get("day") ?? 0),
    weekday: values.get("weekday") ?? "Mon",
  };
}

function getTimeZoneOffsetMs(date: Date): number {
  const values = getDatePartsMap(timeZoneOffsetFormatter.formatToParts(date));
  const zonedUtcMs = Date.UTC(
    Number(values.get("year") ?? 0),
    Number(values.get("month") ?? 1) - 1,
    Number(values.get("day") ?? 1),
    Number(values.get("hour") ?? 0),
    Number(values.get("minute") ?? 0),
    Number(values.get("second") ?? 0),
  );

  return zonedUtcMs - date.getTime();
}

function toLeagueUtcDate(year: number, month: number, day: number): Date {
  const guess = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  const offsetMs = getTimeZoneOffsetMs(guess);

  return new Date(guess.getTime() - offsetMs);
}

function toDateKey(date: Date): string {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

export function getCurrentLeaguePeriodBoundaries(now = new Date()): LeaguePeriodBoundaries {
  const parts = getLeagueDateParts(now);
  const weekdayIndex = weekdayIndexMap[parts.weekday] ?? 1;

  const todayDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  const weekDate = new Date(todayDate);
  weekDate.setUTCDate(todayDate.getUTCDate() - (weekdayIndex - 1));

  const monthDate = new Date(Date.UTC(parts.year, parts.month - 1, 1));
  const yearDate = new Date(Date.UTC(parts.year, 0, 1));

  const weekStart = toLeagueUtcDate(
    weekDate.getUTCFullYear(),
    weekDate.getUTCMonth() + 1,
    weekDate.getUTCDate(),
  );
  const monthStart = toLeagueUtcDate(parts.year, parts.month, 1);
  const yearStart = toLeagueUtcDate(parts.year, 1, 1);

  return {
    yearStartMs: yearStart.getTime(),
    monthStartMs: monthStart.getTime(),
    weekStartMs: weekStart.getTime(),
    yearStartDateKey: toDateKey(yearDate),
    monthStartDateKey: toDateKey(monthDate),
    weekStartDateKey: toDateKey(weekDate),
  };
}

export function isTimestampInLeaguePeriod(
  timestampMs: number,
  period: LeagueStatsPeriod,
  boundaries = getCurrentLeaguePeriodBoundaries(),
): boolean {
  if (!Number.isFinite(timestampMs)) {
    return false;
  }

  if (period === "week") {
    return timestampMs >= boundaries.weekStartMs;
  }

  if (period === "month") {
    return timestampMs >= boundaries.monthStartMs;
  }

  return timestampMs >= boundaries.yearStartMs;
}

export function isDateKeyInLeaguePeriod(
  dateKey: string,
  period: LeagueStatsPeriod,
  boundaries = getCurrentLeaguePeriodBoundaries(),
): boolean {
  if (!dateKey) {
    return false;
  }

  if (period === "week") {
    return dateKey >= boundaries.weekStartDateKey;
  }

  if (period === "month") {
    return dateKey >= boundaries.monthStartDateKey;
  }

  return dateKey >= boundaries.yearStartDateKey;
}
