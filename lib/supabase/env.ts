function readEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}.`);
  }

  return value;
}

function readOptionalEnv(name: string): string {
  return process.env[name]?.trim() ?? "";
}

export function getSupabasePublicEnv() {
  return {
    url: readEnv("NEXT_PUBLIC_SUPABASE_URL"),
    publishableKey: readEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  };
}

export function getSupabaseSecretEnv() {
  return {
    url: readEnv("NEXT_PUBLIC_SUPABASE_URL"),
    secretKey: readEnv("SUPABASE_SECRET_KEY"),
  };
}

export function getStravaEnv() {
  return {
    clientId: readOptionalEnv("STRAVA_CLIENT_ID"),
    clientSecret: readOptionalEnv("STRAVA_CLIENT_SECRET"),
    redirectUri: readOptionalEnv("STRAVA_REDIRECT_URI"),
    webhookVerifyToken: readOptionalEnv("STRAVA_WEBHOOK_VERIFY_TOKEN"),
  };
}
