import { after } from "next/server";

import { failure, ok } from "@/lib/api";
import { getStravaConfig, hasStravaWebhookConfig } from "@/lib/strava";
import { handleStravaWebhookEvent } from "@/lib/strava-sync";
import type { StravaWebhookEvent } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const mode = url.searchParams.get("hub.mode");
    const verifyToken = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (!hasStravaWebhookConfig()) {
      return failure(new Error("Falta STRAVA_WEBHOOK_VERIFY_TOKEN."), 500);
    }

    if (mode !== "subscribe" || !challenge) {
      return failure(new Error("La verificacion del webhook no es valida."), 400);
    }

    if (verifyToken !== getStravaConfig().webhookVerifyToken) {
      return failure(new Error("El verify token de Strava no coincide."), 403);
    }

    return Response.json({ "hub.challenge": challenge });
  } catch (error) {
    return failure(error, 400);
  }
}

export async function POST(request: Request) {
  try {
    const event = (await request.json()) as StravaWebhookEvent;

    after(async () => {
      try {
        await handleStravaWebhookEvent(event);
      } catch {
        // Avoid failing the delivery after already acknowledging the webhook.
      }
    });

    return ok({ received: true });
  } catch (error) {
    return failure(error, 400);
  }
}
