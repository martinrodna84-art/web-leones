import { NextResponse } from "next/server";

import { getCurrentSessionMember } from "@/lib/member-service";
import { getStravaConfig, hasRealStravaConfig } from "@/lib/strava";

const STRAVA_STATE_COOKIE = "leones_strava_oauth_state";
const STRAVA_RETURN_TO_COOKIE = "leones_strava_return_to";

function withMessage(path: string, message: string) {
  const url = new URL(path, "http://localhost");
  url.searchParams.set("strava_message", message);
  return `${url.pathname}${url.search}`;
}

function normalizeReturnTo(value: string | null): string {
  if (!value || !value.startsWith("/")) {
    return "/liga-felina/registro";
  }

  return value;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const returnTo = normalizeReturnTo(url.searchParams.get("returnTo"));
  const member = await getCurrentSessionMember();

  if (!member) {
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
  const { clientId, redirectUri } = getStravaConfig();
  const effectiveRedirectUri = redirectUri || `${url.origin}/api/strava/callback`;
  const stravaUrl = new URL("https://www.strava.com/oauth/authorize");
  stravaUrl.searchParams.set("client_id", clientId);
  stravaUrl.searchParams.set("redirect_uri", effectiveRedirectUri);
  stravaUrl.searchParams.set("response_type", "code");
  stravaUrl.searchParams.set("approval_prompt", "auto");
  stravaUrl.searchParams.set("scope", "activity:read_all,profile:read_all");
  stravaUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(stravaUrl);
  const isSecure = url.protocol === "https:";

  response.cookies.set(STRAVA_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecure,
    path: "/",
    maxAge: 60 * 10,
  });
  response.cookies.set(STRAVA_RETURN_TO_COOKIE, returnTo, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecure,
    path: "/",
    maxAge: 60 * 10,
  });

  return response;
}
