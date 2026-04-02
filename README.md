# Los Leones del Trail

Web del club y app de Liga Felina construida con Next.js, Supabase SSR y Strava.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase Auth + Postgres
- Strava OAuth + Webhooks

## Rutas principales

- `/` portada publica del club
- `/liga-felina` clasificaciones de la liga
- `/liga-felina/registro` registro, login y conexion con Strava
- `/bases` reglas de la liga

## Variables de entorno

El proyecto necesita, como minimo:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
STRAVA_CLIENT_ID=
STRAVA_CLIENT_SECRET=
STRAVA_REDIRECT_URI=http://localhost:3000/api/strava/callback
STRAVA_WEBHOOK_VERIFY_TOKEN=
```

## Setup de Strava

1. Crea o revisa tu app en https://www.strava.com/settings/api
2. Configura el `Authorization Callback Domain`
3. Usa como callback local `http://localhost:3000/api/strava/callback`
4. Copia `Client ID` y `Client Secret` a `.env.local`
5. Elige un valor largo para `STRAVA_WEBHOOK_VERIFY_TOKEN`

Scopes usados por la integracion:

- `profile:read_all`
- `activity:read_all`

## Setup de Supabase

Antes de probar Strava real, aplica las migraciones de `supabase/migrations/`.

La integracion de Strava usa:

- `member_profiles`
- `strava_connections`

## Flujo de Strava

1. El socio inicia sesion en la web
2. Pulsa "Conectar Strava"
3. Strava devuelve al callback OAuth
4. La app guarda tokens y enlaza el atleta con el socio
5. Se sincronizan foto, perfil, km del ano y desnivel del ano
6. La Liga Felina usa esos datos persistidos para las clasificaciones

## Webhooks

Rutas implementadas:

- `GET /api/strava/webhook`
- `POST /api/strava/webhook`

Para activarlos necesitas registrar la suscripcion webhook en Strava con una URL publica HTTPS y el mismo `STRAVA_WEBHOOK_VERIFY_TOKEN`.

## Notas

- Los eventos y validaciones de carreras siguen siendo in-memory en `lib/store.ts`
- La clasificacion de km y desnivel ya puede alimentarse desde Strava
- Antes de publicar la liga con datos reales, revisa el acuerdo de la API de Strava
