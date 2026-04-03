# Project Context

## Stack

- Next.js `16.2.2`
- React `19.2.4`
- TypeScript
- Tailwind CSS `4`
- Supabase SSR and Supabase JS
- App Router only

## Main Routes

- `/` public club homepage
- `/contacto` public contact page for club enquiries
- `/liga-felina` league and ranking experience
- `/liga-felina/registro` member registration only
- `/liga-felina/acceso` member login and password recovery
- `/liga-felina/perfil` member dashboard / personal control panel
- `/liga-felina/perfil/editar` member profile editing, photo management, and Strava connection
- `/bases` league rules page

## Architecture

- `app/*` contains server entries, routes, and route handlers.
- `components/*` contains UI composition.
- Session-aware server data flows through `lib/server-session.ts`, `lib/member-service.ts`, `lib/supabase/server.ts`, and `lib/supabase/proxy.ts`.
- `proxy.ts` refreshes Supabase auth cookies on matching requests.
- `member_profiles` is the main persisted table.
- Race events and race claims currently live in `lib/store.ts` and are in-memory only.

## Domain Notes

- League ranking depends on yearly km, yearly elevation gain, and validated race claims.
- Only members with `stravaConnected = true` should appear in rankings.
- Race points formula: `floor(km) + floor(elevation / 100) * 10`.

## Operational Guidance

- Required environment keys are defined in `.env.local`.
- Real Strava OAuth routes live under `app/api/strava/*`.
- Preserve the current Supabase SSR patterns unless the task explicitly requires a migration.
- Be careful with changes around race events, claims, and Strava state because parts of that flow are still in-memory.
- Watch for existing text-encoding issues in user-facing copy when editing content.
