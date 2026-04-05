import { failure, ok } from "@/lib/api";
import { getCurrentSessionMember } from "@/lib/member-service";
import { ensureStravaWebhookSubscription, listStravaWebhookSubscriptions } from "@/lib/strava-webhooks";

export async function GET() {
  try {
    const member = await getCurrentSessionMember();

    if (!member?.isAdmin) {
      return failure(new Error("Solo administracion puede consultar el webhook de Strava."), 403);
    }

    return ok(await listStravaWebhookSubscriptions());
  } catch (error) {
    return failure(error, 400);
  }
}

export async function POST() {
  try {
    const member = await getCurrentSessionMember();

    if (!member?.isAdmin) {
      return failure(new Error("Solo administracion puede configurar el webhook de Strava."), 403);
    }

    return ok(await ensureStravaWebhookSubscription());
  } catch (error) {
    return failure(error, 400);
  }
}
