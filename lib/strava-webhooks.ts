import "server-only";

import { getStravaConfig } from "@/lib/strava";

export type StravaPushSubscription = {
  id: number;
  callback_url: string;
  created_at: string;
  updated_at: string;
};

export type EnsuredStravaWebhookSubscription = {
  callbackUrl: string;
  created: boolean;
  removedSubscriptionIds: number[];
  subscription: StravaPushSubscription;
};

function getWebhookManagementConfig() {
  const config = getStravaConfig();

  if (!config.clientId || !config.clientSecret) {
    throw new Error("Faltan STRAVA_CLIENT_ID y STRAVA_CLIENT_SECRET para configurar el webhook.");
  }

  if (!config.webhookVerifyToken) {
    throw new Error("Falta STRAVA_WEBHOOK_VERIFY_TOKEN para verificar el webhook.");
  }

  if (!config.webhookCallbackUrl) {
    throw new Error("Falta STRAVA_WEBHOOK_CALLBACK_URL con la URL publica HTTPS del callback.");
  }

  return config;
}

function normalizeCallbackUrl(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

async function readStravaWebhookError(response: Response, fallback: string): Promise<Error> {
  try {
    const payload = (await response.json()) as {
      message?: string;
      errors?: Array<{ field?: string; code?: string }>;
    };

    const detail = payload.errors?.length
      ? payload.errors
          .map((item) => `${item.field ?? "campo"}:${item.code ?? "error"}`)
          .join(", ")
      : "";
    const message = [payload.message, detail].filter(Boolean).join(" - ");

    return new Error(message || fallback);
  } catch {
    return new Error(fallback);
  }
}

export function getConfiguredStravaWebhookCallbackUrl(): string {
  return normalizeCallbackUrl(getWebhookManagementConfig().webhookCallbackUrl);
}

export async function listStravaWebhookSubscriptions(): Promise<StravaPushSubscription[]> {
  const { clientId, clientSecret } = getWebhookManagementConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
  });
  const response = await fetch(`https://www.strava.com/api/v3/push_subscriptions?${params.toString()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw await readStravaWebhookError(response, "No se pudo consultar la suscripcion webhook de Strava.");
  }

  return (await response.json()) as StravaPushSubscription[];
}

export async function createStravaWebhookSubscription(
  callbackUrl = getConfiguredStravaWebhookCallbackUrl(),
): Promise<StravaPushSubscription> {
  const { clientId, clientSecret, webhookVerifyToken } = getWebhookManagementConfig();
  const response = await fetch("https://www.strava.com/api/v3/push_subscriptions", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      callback_url: normalizeCallbackUrl(callbackUrl),
      verify_token: webhookVerifyToken,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw await readStravaWebhookError(response, "No se pudo crear la suscripcion webhook de Strava.");
  }

  return (await response.json()) as StravaPushSubscription;
}

export async function deleteStravaWebhookSubscription(subscriptionId: number): Promise<void> {
  const { clientId, clientSecret } = getWebhookManagementConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
  });
  const response = await fetch(
    `https://www.strava.com/api/v3/push_subscriptions/${subscriptionId}?${params.toString()}`,
    {
      method: "DELETE",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw await readStravaWebhookError(response, "No se pudo borrar una suscripcion webhook antigua de Strava.");
  }
}

export async function ensureStravaWebhookSubscription(): Promise<EnsuredStravaWebhookSubscription> {
  const callbackUrl = getConfiguredStravaWebhookCallbackUrl();
  const currentSubscriptions = await listStravaWebhookSubscriptions();
  const matchingSubscription = currentSubscriptions.find(
    (subscription) => normalizeCallbackUrl(subscription.callback_url) === callbackUrl,
  );
  const removedSubscriptionIds: number[] = [];

  for (const subscription of currentSubscriptions) {
    if (matchingSubscription && subscription.id === matchingSubscription.id) {
      continue;
    }

    await deleteStravaWebhookSubscription(subscription.id);
    removedSubscriptionIds.push(subscription.id);
  }

  if (matchingSubscription) {
    return {
      callbackUrl,
      created: false,
      removedSubscriptionIds,
      subscription: matchingSubscription,
    };
  }

  return {
    callbackUrl,
    created: true,
    removedSubscriptionIds,
    subscription: await createStravaWebhookSubscription(callbackUrl),
  };
}
