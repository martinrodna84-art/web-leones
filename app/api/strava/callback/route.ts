import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getCurrentSessionMember } from "@/lib/member-service";
import { completeCurrentMemberStravaAuthorization } from "@/lib/strava-sync";
import { hasRealStravaConfig } from "@/lib/strava";

const STRAVA_STATE_COOKIE = "leones_strava_oauth_state";
const STRAVA_RETURN_TO_COOKIE = "leones_strava_return_to";

function withMessage(path: string, message: string) {
  const url = new URL(path, "http://localhost");
  url.searchParams.set("strava_message", message);
  return `${url.pathname}${url.search}`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const grantedScope = url.searchParams.get("scope");
  const error = url.searchParams.get("error");
  const cookieStore = await cookies();
  const storedState = cookieStore.get(STRAVA_STATE_COOKIE)?.value ?? "";
  const returnTo = cookieStore.get(STRAVA_RETURN_TO_COOKIE)?.value || "/liga-felina/registro";
  const member = await getCurrentSessionMember();

  if (!member) {
    return NextResponse.redirect(new URL(withMessage(returnTo, "La sesion de socio ya no esta activa."), url));
  }

  if (!hasRealStravaConfig()) {
    return NextResponse.redirect(new URL(withMessage(returnTo, "La app todavia no tiene credenciales reales de Strava."), url));
  }

  const response = NextResponse.redirect(
    new URL(withMessage(returnTo, "La conexion con Strava ha fallado en el servidor."), url),
  );
  response.cookies.delete(STRAVA_STATE_COOKIE);
  response.cookies.delete(STRAVA_RETURN_TO_COOKIE);

  if (error || !code || !state || state !== storedState) {
    response.headers.set(
      "Location",
      new URL(withMessage(returnTo, "No se pudo completar la autorizacion con Strava."), url).toString(),
    );
    return response;
  }

  try {
    const updatedMember = await completeCurrentMemberStravaAuthorization(
      code,
      grantedScope,
    );
    response.headers.set(
      "Location",
      new URL(
        withMessage(
          returnTo,
          `Conectado con Strava como ${updatedMember.firstName} ${updatedMember.lastName}.`,
        ),
        url,
      ).toString(),
    );
    return response;
  } catch (authError) {
    response.headers.set(
      "Location",
      new URL(
        withMessage(
          returnTo,
          authError instanceof Error
            ? authError.message
            : "La conexion con Strava ha fallado en el servidor.",
        ),
        url,
      ).toString(),
    );
    return response;
  }
}
