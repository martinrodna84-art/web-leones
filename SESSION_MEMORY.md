## Session Memory

### Project Snapshot
- Stack: Next.js `16.2.2`, React `19.2.4`, TypeScript, Tailwind CSS `4`, Supabase SSR, Supabase JS, Strava integration.
- Router: App Router only.
- Main routes:
  - `/` public club homepage.
  - `/liga-felina` league/ranking experience.
  - `/liga-felina/registro` member auth/profile area.
  - `/bases` league rules page.
- Important repo rule: before changing Next.js behavior, read the local docs under `node_modules/next/dist/docs/`.

### Architecture
- Public/member pages are rendered from `app/*` server entries and delegate UI to `components/*`.
- Session-aware server data flows through:
  - `lib/server-session.ts`
  - `lib/member-service.ts`
  - `lib/supabase/server.ts`
  - `lib/supabase/proxy.ts`
- `proxy.ts` refreshes Supabase auth cookies on matching requests.
- Member profiles are persisted in Supabase.
- Race events and race claims are not persisted yet; they live in an in-memory singleton store in `lib/store.ts`, seeded from `lib/mock-data.ts`.

### Domain Model
- `member_profiles` is the core persisted table.
- League ranking is computed from:
  - yearly km
  - yearly elevation gain
  - validated race claims
- Only members with `stravaConnected = true` appear in rankings.
- Race points formula:
  - `floor(km)`
  - `floor(elevation / 100) * 10`
  - total race points = both combined

### Supabase
- Required env keys detected in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_SECRET_KEY`
  - `STRAVA_CLIENT_ID`
  - `STRAVA_CLIENT_SECRET`
- Migration present:
  - `supabase/migrations/20260402133000_member_profiles_auth.sql`
- RPCs implemented:
  - `create_member_profile`
  - `update_current_member_profile`
  - `set_current_member_strava`
  - `clear_current_member_strava`
  - `find_member_profile_for_password_reset`
  - `list_member_profiles_for_league`

### Strava
- Real OAuth flow exists under `app/api/strava/*`.
- Fallback/mock Strava mode exists for local/demo flows.
- Stored Strava access tokens are currently held in the in-memory store, not durable storage.

### API Surface
- Member/auth:
  - `app/api/app/register/route.ts`
  - `app/api/app/auth/login/route.ts`
  - `app/api/app/auth/logout/route.ts`
  - `app/api/app/auth/password/route.ts`
  - `app/api/app/profile/route.ts`
  - `app/api/app/profile/strava/route.ts`
- League:
  - `app/api/app/race-events/route.ts`
  - `app/api/app/race-events/[eventId]/route.ts`
  - `app/api/app/race-claims/route.ts`
- Diagnostics:
  - `app/api/app/supabase/status/route.ts`
- Strava:
  - `app/api/strava/login/route.ts`
  - `app/api/strava/callback/route.ts`
  - `app/api/strava/logout/route.ts`
  - `app/api/strava/me/route.ts`
  - `app/api/strava/activity/route.ts`

### Current Risks / Observations
- Race events and claims reset on server restart because `lib/store.ts` is in-memory.
- Real Strava connection state also depends partly on in-memory data.
- Several UI strings show mojibake characters, suggesting encoding issues in source text.
- Many user-facing forms are functional, but the public contact form is only presentational.
- `README.md` is still the default create-next-app template and does not describe the real project.

### Environment Limitations During Analysis
- `rg`, `git`, `node`, and `npm` were not available in PATH in this session.
- Because of that, automated verification (`lint`, build, git status) could not be completed from this environment.

### Best Next Focus
- Persist race events and race claims in Supabase.
- Fix text encoding issues across UI copy.
- Replace the placeholder README with project-specific setup and architecture notes.
- Add automated validation once Node tooling is available in the environment.
