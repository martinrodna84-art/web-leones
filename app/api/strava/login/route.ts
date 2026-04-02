import { NextResponse } from "next/server";

import { getSessionIdFromCookies } from "@/lib/api";
import { hasRealStravaConfig } from "@/lib/strava";
import { savePendingStravaState } from "@/lib/store";

function withMessage(path: string, message: string) {
  const url = new URL(path, "http://localhost");
  url.searchParams.set("strava_message", message);
  return `${url.pathname}${url.search}`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const returnTo = url.searchParams.get("returnTo") || "/liga-felina/registro";
  const sessionId = await getSessionIdFromCookies();

  if (!sessionId) {
    return NextResponse.redirect(new URL(withMessage(returnTo, "Inicia sesion primero para conectar Strava."), url));
  }

  if (!hasRealStravaConfig()) {
    return NextResponse.redirect(
      new URL(
        withMessage(returnTo, "Faltan STRAVA_CLIENT_ID y STRAVA_CLIENT_SECRET. Puedes usar la simulacion mientras tanto."),
        url,
      ),
    );
  }

  const state = crypto.randomUUID();
  savePendingStravaState(state, returnTo);

  const redirectUri = process.env.STRAVA_REDIRECT_URI || `${url.origin}/api/strava/callback`;
  const stravaUrl = new URL("https://www.strava.com/oauth/authorize");
  stravaUrl.searchParams.set("client_id", process.env.STRAVA_CLIENT_ID || "");
  stravaUrl.searchParams.set("redirect_uri", redirectUri);
  stravaUrl.searchParams.set("response_type", "code");
  stravaUrl.searchParams.set("approval_prompt", "auto");
  stravaUrl.searchParams.set("scope", "activity:read_all,profile:read_all");
  stravaUrl.searchParams.set("state", state);

  return NextResponse.redirect(stravaUrl);
}
