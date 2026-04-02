export type Gender = "men" | "women";

export type PhotoSource = "upload" | "strava";

export type SportType = "Run" | "TrailRun";

export interface StravaProfile {
  id: number;
  firstname: string;
  lastname: string;
  city: string;
  profile: string;
  profileMedium: string;
  ytdKm: number;
  ytdElevation: number;
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  memberNumber: string;
  gender: Gender;
  city: string;
  uploadPhoto: string;
  stravaPhoto: string;
  photoSource: PhotoSource;
  stravaConnected: boolean;
  stravaAthleteId: number | null;
  yearKm: number;
  yearElevation: number;
  isAdmin: boolean;
}

export interface SessionMember extends Member {
  email: string;
}

export interface RaceModality {
  id: string;
  name: string;
  distanceKm: number;
  elevationGain: number;
  date: string;
  time: string;
  order: number;
}

export interface RaceEvent {
  id: string;
  name: string;
  edition: string;
  createdAt: string;
  createdBy: string;
  modalities: RaceModality[];
}

export interface RaceClaim {
  id: string;
  memberId: string;
  eventId: string;
  modalityId: string;
  activityId: string;
  activityUrl: string;
  points: number;
  verifiedAt: string;
}

export interface RaceBreakdownItem {
  name: string;
  points: number;
}

export interface GeneralBreakdown {
  kmPoints: number;
  elevationPoints: number;
  races: RaceBreakdownItem[];
}

export interface LeaderboardRow extends Member {
  metricLabel: string;
  points: number;
  value?: number;
}

export interface LeagueSnapshot {
  activeMember: SessionMember | null;
  members: Member[];
  raceEvents: RaceEvent[];
  raceClaims: RaceClaim[];
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  memberNumber: string;
  gender: Gender;
  city: string;
  uploadPhoto?: string;
  useStravaPhoto: boolean;
  draftStravaProfile?: StravaProfile | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  email: string;
  memberNumber: string;
  gender: Gender;
  city: string;
  uploadPhoto?: string;
  useStravaPhoto: boolean;
}

export interface PasswordResetPayload {
  email: string;
  memberNumber: string;
  newPassword: string;
}

export interface RaceEventPayload {
  name: string;
  edition: string;
  modalities: RaceModality[];
}

export interface RaceClaimPayload {
  eventId: string;
  modalityId: string;
  activityUrl: string;
}

export interface StravaActivity {
  id: string;
  name: string;
  sportType: SportType;
  athleteId: number;
  startDate: string;
  startDateLocal: string;
  distance: number;
  elevationGain: number;
}
