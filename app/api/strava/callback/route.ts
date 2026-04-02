import { NextResponse } from "next/server";

import { getSessionIdFromCookies } from "@/lib/api";
import { exchangeStravaToken, fetchStravaAthlete, fetchYtdStats, hasRealStravaConfig } from "@/lib/strava";
import { consumePendingStravaState, setStravaConnection } from "@/lib/store";

function withMessage(path: string, message: string) {
  const url = new URL(path, "http://localhost");
  url.searchParams.set("strava_message", message);
  return `${url.pathname}${url.search}`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const pending = consumePendingStravaState(state);
  const sessionId = await getSessionIdFromCookies();
  const returnTo = pending?.returnTo || "/liga-felina/registro";

  if (!sessionId) {
    return NextResponse.redirect(new URL(withMessage(returnTo, "La sesion de socio ya no esta activa."), url));
  }

  if (error || !code || !pending) {
    return NextResponse.redirect(new URL(withMessage(returnTo, "No se pudo completar la autorizacion con Strava."), url));
  }

  if (!hasRealStravaConfig()) {
    return NextResponse.redirect(new URL(withMessage(returnTo, "La app todavia no tiene credenciales reales de Strava."), url));
  }

  try {
    const tokenPayload = await exchangeStravaToken(code);
    const athlete = await fetchStravaAthlete(String(tokenPayload.access_token));
    const stats = await fetchYtdStats(String(tokenPayload.access_token));

    setStravaConnection(
      sessionId,
      {
        ...athlete,
        ytdKm: stats.ytdKm,
        ytdElevation: stats.ytdElevation,
      },
      String(tokenPayload.access_token),
      Number(tokenPayload.expires_at || 0),
    );

    return NextResponse.redirect(new URL(withMessage(returnTo, `Conectado con Strava como ${athlete.firstname} ${athlete.lastname}.`), url));
  } catch {
    return NextResponse.redirect(new URL(withMessage(returnTo, "La conexion con Strava ha fallado en el servidor."), url));
  }
}
