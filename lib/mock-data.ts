import type { Member, RaceClaim, RaceEvent, StravaProfile } from "@/lib/types";

export const DEFAULT_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#6DC5D8"/>
          <stop offset="100%" stop-color="#C5D200"/>
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
  firstname: "Leona",
  lastname: "Mock",
  city: "Madrid",
  profile: MOCK_STRAVA_AVATAR,
  profileMedium: MOCK_STRAVA_AVATAR,
  ytdKm: 742.6,
  ytdElevation: 13240,
};

export const seedMembers: Member[] = [
  {
    id: "seed-1",
    firstName: "Juanma",
    lastName: "Leon",
    fullName: "Juanma Leon",
    email: "juanma@leonestrail.test",
    password: "felina2026",
    memberNumber: "L-000",
    gender: "men",
    city: "Madrid",
    uploadPhoto: DEFAULT_AVATAR,
    stravaPhoto: MOCK_STRAVA_AVATAR,
    photoSource: "strava",
    stravaConnected: true,
    stravaAthleteId: 1001,
    yearKm: 1487.4,
    yearElevation: 25430,
    isAdmin: true,
  },
  {
    id: "seed-2",
    firstName: "Carlos",
    lastName: "Sierra",
    fullName: "Carlos Sierra",
    email: "carlos@leonestrail.test",
    password: "felina2026",
    memberNumber: "L-018",
    gender: "men",
    city: "Segovia",
    uploadPhoto: DEFAULT_AVATAR,
    stravaPhoto: DEFAULT_AVATAR,
    photoSource: "upload",
    stravaConnected: false,
    stravaAthleteId: null,
    yearKm: 1321.8,
    yearElevation: 21980,
    isAdmin: false,
  },
  {
    id: "seed-3",
    firstName: "Miguel",
    lastName: "Cima",
    fullName: "Miguel Cima",
    email: "miguel@leonestrail.test",
    password: "felina2026",
    memberNumber: "L-027",
    gender: "men",
    city: "Toledo",
    uploadPhoto: DEFAULT_AVATAR,
    stravaPhoto: DEFAULT_AVATAR,
    photoSource: "upload",
    stravaConnected: false,
    stravaAthleteId: null,
    yearKm: 1189.2,
    yearElevation: 18660,
    isAdmin: false,
  },
  {
    id: "seed-4",
    firstName: "David",
    lastName: "Sendero",
    fullName: "David Sendero",
    email: "david@leonestrail.test",
    password: "felina2026",
    memberNumber: "L-031",
    gender: "men",
    city: "Avila",
    uploadPhoto: DEFAULT_AVATAR,
    stravaPhoto: DEFAULT_AVATAR,
    photoSource: "upload",
    stravaConnected: false,
    stravaAthleteId: null,
    yearKm: 1011.6,
    yearElevation: 16240,
    isAdmin: false,
  },
  {
    id: "seed-5",
    firstName: "Lucia",
    lastName: "Castano",
    fullName: "Lucia Castano",
    email: "lucia@leonestrail.test",
    password: "felina2026",
    memberNumber: "L-014",
    gender: "women",
    city: "Leon",
    uploadPhoto: DEFAULT_AVATAR,
    stravaPhoto: MOCK_STRAVA_AVATAR,
    photoSource: "strava",
    stravaConnected: true,
    stravaAthleteId: 2001,
    yearKm: 1265.1,
    yearElevation: 20840,
    isAdmin: false,
  },
  {
    id: "seed-6",
    firstName: "Marta",
    lastName: "Robles",
    fullName: "Marta Robles",
    email: "marta@leonestrail.test",
    password: "felina2026",
    memberNumber: "L-021",
    gender: "women",
    city: "Burgos",
    uploadPhoto: DEFAULT_AVATAR,
    stravaPhoto: DEFAULT_AVATAR,
    photoSource: "upload",
    stravaConnected: false,
    stravaAthleteId: null,
    yearKm: 1114.9,
    yearElevation: 19030,
    isAdmin: false,
  },
  {
    id: "seed-7",
    firstName: "Sandra",
    lastName: "Pico",
    fullName: "Sandra Pico",
    email: "sandra@leonestrail.test",
    password: "felina2026",
    memberNumber: "L-024",
    gender: "women",
    city: "Guadalajara",
    uploadPhoto: DEFAULT_AVATAR,
    stravaPhoto: DEFAULT_AVATAR,
    photoSource: "upload",
    stravaConnected: false,
    stravaAthleteId: null,
    yearKm: 963.7,
    yearElevation: 15410,
    isAdmin: false,
  },
  {
    id: "seed-8",
    firstName: "Alba",
    lastName: "Cumbre",
    fullName: "Alba Cumbre",
    email: "alba@leonestrail.test",
    password: "felina2026",
    memberNumber: "L-030",
    gender: "women",
    city: "Cuenca",
    uploadPhoto: DEFAULT_AVATAR,
    stravaPhoto: DEFAULT_AVATAR,
    photoSource: "upload",
    stravaConnected: false,
    stravaAthleteId: null,
    yearKm: 820.2,
    yearElevation: 13120,
    isAdmin: false,
  },
];

export const seedRaceEvents: RaceEvent[] = [
  {
    id: "event-1",
    name: "Trans Sierra Rugiente",
    edition: "2026",
    createdAt: "2026-02-12T10:00:00.000Z",
    createdBy: "seed-1",
    modalities: [
      {
        id: "mode-1",
        name: "Trail 21K",
        distanceKm: 21.5,
        elevationGain: 1280,
        date: "2026-05-17",
        time: "09:00",
        order: 0,
      },
      {
        id: "mode-2",
        name: "Maraton 42K",
        distanceKm: 42.2,
        elevationGain: 2520,
        date: "2026-05-17",
        time: "08:00",
        order: 1,
      },
    ],
  },
  {
    id: "event-2",
    name: "Cumbres del Oso",
    edition: "2026",
    createdAt: "2026-03-08T12:30:00.000Z",
    createdBy: "seed-1",
    modalities: [
      {
        id: "mode-3",
        name: "Speed Trail 12K",
        distanceKm: 12.4,
        elevationGain: 640,
        date: "2026-06-21",
        time: "10:00",
        order: 0,
      },
    ],
  },
];

export const seedRaceClaims: RaceClaim[] = [
  {
    id: "claim-1",
    memberId: "seed-1",
    eventId: "event-1",
    modalityId: "mode-2",
    activityId: "98100001",
    activityUrl: "https://www.strava.com/activities/98100001",
    points: 292,
    verifiedAt: "2026-05-17T14:00:00.000Z",
  },
  {
    id: "claim-2",
    memberId: "seed-5",
    eventId: "event-2",
    modalityId: "mode-3",
    activityId: "98100002",
    activityUrl: "https://www.strava.com/activities/98100002",
    points: 72,
    verifiedAt: "2026-06-21T12:00:00.000Z",
  },
];
