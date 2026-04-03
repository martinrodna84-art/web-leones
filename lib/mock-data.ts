import type { Member, RaceClaim, RaceEvent, StravaProfile } from "@/lib/types";

export const DEFAULT_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#6DC5D8"/>
          <stop offset="100%" stop-color="#CCFF00"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="60" fill="url(#g)"/>
      <text x="60" y="72" text-anchor="middle" font-size="42" font-family="Arial" font-weight="700" fill="#1D1E1C">LL</text>
    </svg>
  `);

export const MOCK_STRAVA_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <rect width="120" height="120" rx="60" fill="#FC5200"/>
      <path d="M60 22 79 60 67 60 60 45 53 60 41 60 60 22Z" fill="#fff"/>
      <path d="M72 68 84 92 73 92 67 80 60 92 49 92 61 68Z" fill="#fff"/>
    </svg>
  `);

export const MOCK_STRAVA_PROFILE: StravaProfile = {
  id: 459274,
  username: "leones-mock",
  firstname: "Leona",
  lastname: "Mock",
  city: "Madrid",
  state: "Madrid",
  country: "Spain",
  profile: MOCK_STRAVA_AVATAR,
  profileMedium: MOCK_STRAVA_AVATAR,
  ytdKm: 742.6,
  ytdElevation: 13240,
};

function createSeedMember({
  id,
  firstName,
  lastName,
  memberNumber,
  gender,
  city,
  athleteId,
  yearKm,
  yearElevation,
  photoSource = "strava",
}: {
  id: string;
  firstName: string;
  lastName: string;
  memberNumber: string;
  gender: Member["gender"];
  city: string;
  athleteId: number;
  yearKm: number;
  yearElevation: number;
  photoSource?: Member["photoSource"];
}): Member {
  return {
    id,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    memberNumber,
    gender,
    city,
    uploadPhoto: DEFAULT_AVATAR,
    stravaPhoto: MOCK_STRAVA_AVATAR,
    photoSource,
    stravaConnected: true,
    stravaAthleteId: athleteId,
    yearKm,
    yearElevation,
    isAdmin: false,
    stravaLastSyncAt: "2026-04-03T09:30:00.000Z",
  };
}

export const seedMembers: Member[] = [
  createSeedMember({
    id: "seed-1",
    firstName: "Aitor",
    lastName: "Monte",
    memberNumber: "L-101",
    gender: "men",
    city: "Bilbao",
    athleteId: 3101,
    yearKm: 1428.6,
    yearElevation: 23640,
  }),
  createSeedMember({
    id: "seed-2",
    firstName: "Diego",
    lastName: "Bermejo",
    memberNumber: "L-102",
    gender: "men",
    city: "Segovia",
    athleteId: 3102,
    yearKm: 1312.4,
    yearElevation: 22180,
    photoSource: "upload",
  }),
  createSeedMember({
    id: "seed-3",
    firstName: "Raul",
    lastName: "Espin",
    memberNumber: "L-103",
    gender: "men",
    city: "Avila",
    athleteId: 3103,
    yearKm: 1184.3,
    yearElevation: 19520,
  }),
  createSeedMember({
    id: "seed-4",
    firstName: "Sergio",
    lastName: "Tormo",
    memberNumber: "L-104",
    gender: "men",
    city: "Guadalajara",
    athleteId: 3104,
    yearKm: 1066.7,
    yearElevation: 17740,
    photoSource: "upload",
  }),
  createSeedMember({
    id: "seed-5",
    firstName: "Victor",
    lastName: "Navas",
    memberNumber: "L-105",
    gender: "men",
    city: "Leon",
    athleteId: 3105,
    yearKm: 954.1,
    yearElevation: 14980,
  }),
  createSeedMember({
    id: "seed-6",
    firstName: "Nuria",
    lastName: "Tejada",
    memberNumber: "L-106",
    gender: "women",
    city: "Madrid",
    athleteId: 3201,
    yearKm: 1388.2,
    yearElevation: 22890,
  }),
  createSeedMember({
    id: "seed-7",
    firstName: "Clara",
    lastName: "Montalvo",
    memberNumber: "L-107",
    gender: "women",
    city: "Burgos",
    athleteId: 3202,
    yearKm: 1241.5,
    yearElevation: 21060,
    photoSource: "upload",
  }),
  createSeedMember({
    id: "seed-8",
    firstName: "Irene",
    lastName: "Valera",
    memberNumber: "L-108",
    gender: "women",
    city: "Soria",
    athleteId: 3203,
    yearKm: 1123.8,
    yearElevation: 18320,
  }),
  createSeedMember({
    id: "seed-9",
    firstName: "Paula",
    lastName: "Herrero",
    memberNumber: "L-109",
    gender: "women",
    city: "Cuenca",
    athleteId: 3204,
    yearKm: 1008.9,
    yearElevation: 16610,
    photoSource: "upload",
  }),
  createSeedMember({
    id: "seed-10",
    firstName: "Elena",
    lastName: "Prado",
    memberNumber: "L-110",
    gender: "women",
    city: "Toledo",
    athleteId: 3205,
    yearKm: 918.4,
    yearElevation: 14270,
  }),
];

export const seedRaceEvents: RaceEvent[] = [
  {
    id: "event-1",
    name: "Rugido de Gredos",
    edition: "2026",
    createdAt: "2026-01-18T10:00:00.000Z",
    createdBy: "seed-1",
    modalities: [
      {
        id: "mode-1",
        name: "Trail 13K",
        distanceKm: 13.2,
        elevationGain: 720,
        date: "2026-05-10",
        time: "09:30",
        order: 0,
      },
      {
        id: "mode-2",
        name: "Trail 25K",
        distanceKm: 24.8,
        elevationGain: 1460,
        date: "2026-05-10",
        time: "08:30",
        order: 1,
      },
    ],
  },
  {
    id: "event-2",
    name: "Desafio Pico Lobo",
    edition: "2026",
    createdAt: "2026-02-02T11:00:00.000Z",
    createdBy: "seed-2",
    modalities: [
      {
        id: "mode-3",
        name: "Sky 18K",
        distanceKm: 18.4,
        elevationGain: 1120,
        date: "2026-06-07",
        time: "09:00",
        order: 0,
      },
      {
        id: "mode-4",
        name: "Maraton 34K",
        distanceKm: 33.5,
        elevationGain: 2140,
        date: "2026-06-07",
        time: "08:00",
        order: 1,
      },
    ],
  },
  {
    id: "event-3",
    name: "Nocturna del Jabalcon",
    edition: "2026",
    createdAt: "2026-02-25T19:30:00.000Z",
    createdBy: "seed-6",
    modalities: [
      {
        id: "mode-5",
        name: "Nocturna 10K",
        distanceKm: 10.1,
        elevationGain: 410,
        date: "2026-07-11",
        time: "22:00",
        order: 0,
      },
    ],
  },
  {
    id: "event-4",
    name: "Cumbres del Silencio",
    edition: "2026",
    createdAt: "2026-03-15T12:15:00.000Z",
    createdBy: "seed-3",
    modalities: [
      {
        id: "mode-6",
        name: "Subida 16K",
        distanceKm: 15.7,
        elevationGain: 880,
        date: "2026-09-13",
        time: "09:30",
        order: 0,
      },
      {
        id: "mode-7",
        name: "Trail 30K",
        distanceKm: 29.9,
        elevationGain: 1810,
        date: "2026-09-13",
        time: "08:15",
        order: 1,
      },
    ],
  },
  {
    id: "event-5",
    name: "Ultra Garra Montesa",
    edition: "2026",
    createdAt: "2026-03-28T08:45:00.000Z",
    createdBy: "seed-7",
    modalities: [
      {
        id: "mode-8",
        name: "Advance 24K",
        distanceKm: 24.3,
        elevationGain: 1540,
        date: "2026-10-18",
        time: "08:45",
        order: 0,
      },
      {
        id: "mode-9",
        name: "Ultra 47K",
        distanceKm: 47.1,
        elevationGain: 3180,
        date: "2026-10-18",
        time: "07:00",
        order: 1,
      },
    ],
  },
];

export const seedRaceClaims: RaceClaim[] = [
  {
    id: "claim-1",
    memberId: "seed-1",
    eventId: "event-5",
    modalityId: "mode-9",
    activityId: "98100001",
    activityUrl: "https://www.strava.com/activities/98100001",
    points: 357,
    verifiedAt: "2026-10-18T14:10:00.000Z",
  },
  {
    id: "claim-2",
    memberId: "seed-6",
    eventId: "event-2",
    modalityId: "mode-4",
    activityId: "98100002",
    activityUrl: "https://www.strava.com/activities/98100002",
    points: 243,
    verifiedAt: "2026-06-07T13:25:00.000Z",
  },
  {
    id: "claim-3",
    memberId: "seed-2",
    eventId: "event-1",
    modalityId: "mode-2",
    activityId: "98100003",
    activityUrl: "https://www.strava.com/activities/98100003",
    points: 164,
    verifiedAt: "2026-05-10T13:10:00.000Z",
  },
  {
    id: "claim-4",
    memberId: "seed-7",
    eventId: "event-4",
    modalityId: "mode-7",
    activityId: "98100004",
    activityUrl: "https://www.strava.com/activities/98100004",
    points: 209,
    verifiedAt: "2026-09-13T13:45:00.000Z",
  },
  {
    id: "claim-5",
    memberId: "seed-3",
    eventId: "event-2",
    modalityId: "mode-3",
    activityId: "98100005",
    activityUrl: "https://www.strava.com/activities/98100005",
    points: 128,
    verifiedAt: "2026-06-07T12:05:00.000Z",
  },
  {
    id: "claim-6",
    memberId: "seed-8",
    eventId: "event-1",
    modalityId: "mode-1",
    activityId: "98100006",
    activityUrl: "https://www.strava.com/activities/98100006",
    points: 83,
    verifiedAt: "2026-05-10T11:55:00.000Z",
  },
  {
    id: "claim-7",
    memberId: "seed-4",
    eventId: "event-3",
    modalityId: "mode-5",
    activityId: "98100007",
    activityUrl: "https://www.strava.com/activities/98100007",
    points: 50,
    verifiedAt: "2026-07-11T23:40:00.000Z",
  },
  {
    id: "claim-8",
    memberId: "seed-9",
    eventId: "event-5",
    modalityId: "mode-8",
    activityId: "98100008",
    activityUrl: "https://www.strava.com/activities/98100008",
    points: 174,
    verifiedAt: "2026-10-18T12:10:00.000Z",
  },
  {
    id: "claim-9",
    memberId: "seed-10",
    eventId: "event-4",
    modalityId: "mode-6",
    activityId: "98100009",
    activityUrl: "https://www.strava.com/activities/98100009",
    points: 95,
    verifiedAt: "2026-09-13T11:20:00.000Z",
  },
];
